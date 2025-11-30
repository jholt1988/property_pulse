import { BadRequestException, ForbiddenException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DocumentCategory, EsignEnvelope, EsignEnvelopeStatus, EsignParticipantStatus, EsignProvider, Prisma, Role } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateEnvelopeDto } from './dto/create-envelope.dto';
import { ProviderWebhookDto, ProviderWebhookDocumentDto } from './dto/provider-webhook.dto';
import { RecipientViewDto } from './dto/recipient-view.dto';

interface ProviderRecipient {
  email: string;
  recipientId?: string;
  status?: string;
}

interface ProviderEnvelopeResponse {
  envelopeId: string;
  status: EsignEnvelopeStatus;
  providerStatus: string;
  metadata: Record<string, unknown>;
  recipients: ProviderRecipient[];
}

@Injectable()
export class EsignatureService {
  private readonly logger = new Logger(EsignatureService.name);
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly documentsService: DocumentsService,
    private readonly notificationsService: NotificationsService,
  ) {
    const baseURL = this.configService.get<string>('ESIGN_PROVIDER_BASE_URL') || process.env.ESIGN_PROVIDER_BASE_URL;
    
    // Only create httpClient if baseURL is valid, otherwise it will be created on-demand
    if (baseURL && this.isValidUrl(baseURL)) {
      this.httpClient = axios.create({
        baseURL,
        timeout: 30000, // 30 second timeout
      });
    } else {
      // Create a dummy client that will fail gracefully
      this.httpClient = axios.create({
        baseURL: 'http://localhost', // Dummy URL, requests will fail and use fallback
        timeout: 1000, // Quick timeout for fallback
      });
      this.logger.warn('ESIGN_PROVIDER_BASE_URL not configured or invalid. Using mock mode for provider requests.');
    }
  }

  private isValidUrl(urlString: string): boolean {
    try {
      const url = new URL(urlString);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  async createEnvelope(leaseId: number, dto: CreateEnvelopeDto, actorId: number) {
    if (!dto.recipients?.length) {
      throw new BadRequestException('At least one recipient is required.');
    }

    const lease = await this.prisma.lease.findUnique({
      where: { id: leaseId },
      include: { tenant: true, unit: { include: { property: true } } },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found.');
    }

    const provider = dto.provider ?? (this.configService.get('ESIGN_PROVIDER') as EsignProvider) ?? EsignProvider.DOCUSIGN;
    const providerResponse = await this.dispatchProviderEnvelope(provider, dto, lease);

    const envelope = (await this.prisma.esignEnvelope.create({
      data: {
        leaseId,
        createdById: actorId,
        provider,
        providerEnvelopeId: providerResponse.envelopeId,
        status: providerResponse.status,
        providerStatus: providerResponse.providerStatus,
        providerMetadata: providerResponse.metadata as Prisma.JsonValue,
        participants: {
          create: dto.recipients.map((recipient) => ({
            name: recipient.name,
            email: recipient.email,
            phone: recipient.phone,
            role: recipient.role,
            userId: recipient.userId,
            status: EsignParticipantStatus.SENT,
            recipientId: providerResponse.recipients.find((entry) => entry.email === recipient.email)?.recipientId,
          })),
        },
      },
      include: { participants: true },
    })) as EsignEnvelope & { participants: { id: number; name: string; email: string; phone?: string | null; userId?: number | null; status: EsignParticipantStatus }[] };

    await Promise.all(
      envelope.participants.map((participant) =>
        this.notificationsService.sendSignatureAlert({
          event: 'REQUESTED',
          envelopeId: envelope.id,
          leaseId,
          participantName: participant.name,
          userId: participant.userId ?? undefined,
          email: participant.email,
          phone: participant.phone ?? undefined,
        }),
      ),
    );

    return envelope;
  }

  async listLeaseEnvelopes(leaseId: number, user: { userId: number; role: Role }) {
    const lease = await this.prisma.lease.findUnique({ where: { id: leaseId } });
    if (!lease) {
      throw new NotFoundException('Lease not found.');
    }

    if (user.role === Role.TENANT && lease.tenantId !== user.userId) {
      throw new ForbiddenException('You are not allowed to view this lease.');
    }

    return this.prisma.esignEnvelope.findMany({
      where: { leaseId },
      include: { participants: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getEnvelope(envelopeId: number, user: { userId: number; role: Role }) {
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: {
        participants: true,
        signedPdfDocument: true,
        auditTrailDocument: true,
        lease: {
          include: { tenant: true },
        },
        createdBy: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    // Authorization check
    if (user.role === Role.TENANT && envelope.lease.tenantId !== user.userId) {
      throw new ForbiddenException('You are not allowed to view this envelope.');
    }

    return envelope;
  }

  async voidEnvelope(envelopeId: number, reason: string | undefined, actorId: number) {
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: { participants: true },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    if (envelope.status === EsignEnvelopeStatus.COMPLETED) {
      throw new BadRequestException('Cannot void a completed envelope.');
    }

    if (envelope.status === EsignEnvelopeStatus.VOIDED) {
      throw new BadRequestException('Envelope is already voided.');
    }

    // Call provider API to void
    const baseURL = this.configService.get<string>('ESIGN_PROVIDER_BASE_URL') || process.env.ESIGN_PROVIDER_BASE_URL;
    
    if (baseURL && this.isValidUrl(baseURL)) {
      try {
        await this.httpClient.request({
          method: 'PATCH',
          url: `/envelopes/${envelope.providerEnvelopeId}/void`,
          data: { reason: reason || 'Voided by property manager' },
          headers: this.buildProviderHeaders(envelope.provider),
        });
        this.logger.log(`Successfully voided envelope ${envelope.providerEnvelopeId} on provider`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.logger.warn(`Failed to void envelope on provider, voiding locally. Error: ${errorMessage}`);
        // Continue with local void even if provider call fails
      }
    } else {
      this.logger.debug('No provider base URL configured, voiding locally only');
    }

    const existingMetadata = (envelope.providerMetadata as Record<string, unknown>) || {};

    // Update local status
    const updated = await this.prisma.esignEnvelope.update({
      where: { id: envelopeId },
      data: {
        status: EsignEnvelopeStatus.VOIDED,
        providerStatus: 'VOIDED',
        providerMetadata: {
          ...existingMetadata,
          voidedAt: new Date().toISOString(),
          voidedBy: actorId,
          voidReason: reason || 'Voided by property manager',
        } as Prisma.JsonValue,
      },
      include: { participants: true },
    });

    // Notify participants
    await Promise.all(
      envelope.participants.map((participant) =>
        this.notificationsService.sendSignatureAlert({
          event: 'VOIDED' as any, // Will add to notification service
          envelopeId: updated.id,
          leaseId: updated.leaseId,
          participantName: participant.name,
          userId: participant.userId ?? undefined,
          email: participant.email,
          phone: participant.phone ?? undefined,
        }),
      ),
    );

    return updated;
  }

  async refreshEnvelopeStatus(envelopeId: number, user: { userId: number; role: Role }) {
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: { participants: true },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    // Authorization check
    const lease = await this.prisma.lease.findUnique({
      where: { id: envelope.leaseId },
    });

    if (!lease) {
      throw new NotFoundException('Lease not found.');
    }

    if (user.role === Role.TENANT && lease.tenantId !== user.userId) {
      throw new ForbiddenException('You are not allowed to refresh this envelope.');
    }

    // Poll provider for current status
    const baseURL = this.configService.get<string>('ESIGN_PROVIDER_BASE_URL') || process.env.ESIGN_PROVIDER_BASE_URL;
    
    // If no baseURL configured, throw error
    if (!baseURL || !this.isValidUrl(baseURL)) {
      throw new BadRequestException('E-signature provider is not configured. Please contact support.');
    }

    try {
      const response = await this.httpClient.request<{
        envelopeId: string;
        status: string;
        recipients?: ProviderRecipient[];
      }>({
        method: 'GET',
        url: `/envelopes/${envelope.providerEnvelopeId}`,
        headers: this.buildProviderHeaders(envelope.provider),
      });

      const status = this.mapEnvelopeStatus(response.data.status);
      const updateData: Prisma.EsignEnvelopeUpdateInput = {
        providerStatus: response.data.status,
        providerMetadata: JSON.parse(JSON.stringify(response.data)) as Prisma.JsonValue,
        ...(status && { status }),
      };

      const updated = await this.prisma.esignEnvelope.update({
        where: { id: envelopeId },
        data: updateData,
        include: { participants: true },
      });

      // Update participant statuses if provided
      if (response.data.recipients?.length) {
        await Promise.all(
          response.data.recipients.map((recipient) =>
            this.prisma.esignParticipant.updateMany({
              where: { envelopeId, email: recipient.email },
              data: {
                status: this.mapParticipantStatus(recipient.status) ?? EsignParticipantStatus.SENT,
              },
            }),
          ),
        );
      }

      return updated;
    } catch (error) {
      this.logger.error(`Failed to refresh envelope status from provider: ${error}`);
      throw new BadRequestException('Failed to refresh envelope status. Please try again later.');
    }
  }

  async resendNotifications(envelopeId: number, actorId: number) {
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: { participants: true },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    if (envelope.status === EsignEnvelopeStatus.COMPLETED) {
      throw new BadRequestException('Cannot resend notifications for a completed envelope.');
    }

    if (envelope.status === EsignEnvelopeStatus.VOIDED) {
      throw new BadRequestException('Cannot resend notifications for a voided envelope.');
    }

    // Resend notifications to all participants who haven't signed
    const pendingParticipants = envelope.participants.filter(
      (p) => p.status !== EsignParticipantStatus.SIGNED && p.status !== EsignParticipantStatus.DECLINED,
    );

    await Promise.all(
      pendingParticipants.map((participant) =>
        this.notificationsService.sendSignatureAlert({
          event: 'REQUESTED',
          envelopeId: envelope.id,
          leaseId: envelope.leaseId,
          participantName: participant.name,
          userId: participant.userId ?? undefined,
          email: participant.email,
          phone: participant.phone ?? undefined,
        }),
      ),
    );

    // Update metadata to track reminder count
    const existingMetadata = (envelope.providerMetadata as Record<string, unknown>) || {};
    const reminderCount = ((existingMetadata.reminderCount as number) || 0) + 1;

    await this.prisma.esignEnvelope.update({
      where: { id: envelopeId },
      data: {
        providerMetadata: {
          ...existingMetadata,
          reminderCount,
          lastReminderAt: new Date().toISOString(),
          lastReminderBy: actorId,
        } as Prisma.JsonValue,
      },
    });

    return {
      success: true,
      participantsNotified: pendingParticipants.length,
      reminderCount,
    };
  }

  async getDocumentStream(envelopeId: number, documentType: 'signed' | 'certificate', user: { userId: number; role: Role }) {
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: {
        lease: { include: { tenant: true } },
        signedPdfDocument: documentType === 'signed',
        auditTrailDocument: documentType === 'certificate',
      },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    // Authorization check
    if (user.role === Role.TENANT && envelope.lease.tenantId !== user.userId) {
      throw new ForbiddenException('You are not allowed to access this document.');
    }

    const document = documentType === 'signed' ? envelope.signedPdfDocument : envelope.auditTrailDocument;

    if (!document) {
      throw new NotFoundException(`${documentType} document not available.`);
    }

    // Use DocumentsService to get the file stream with proper authorization
    return this.documentsService.getFileStream(document.id, user.userId);
  }

  async createRecipientView(envelopeId: number, user: { userId: number; role: Role; username?: string }, dto: RecipientViewDto) {
    // First, get the envelope to check lease ownership
    const envelope = await this.prisma.esignEnvelope.findUnique({
      where: { id: envelopeId },
      include: {
        lease: true,
        participants: true,
      },
    });

    if (!envelope) {
      throw new NotFoundException('Envelope not found.');
    }

    // Get user's username if not provided
    let userEmail = user.username;
    if (!userEmail) {
      const userRecord = await this.prisma.user.findUnique({
        where: { id: user.userId },
        select: { username: true },
      });
      userEmail = userRecord?.username;
    }

    // For tenants, check if they're the lease tenant OR a participant
    if (user.role === Role.TENANT) {
      const isLeaseTenant = envelope.lease.tenantId === user.userId;
      const isParticipant = envelope.participants.some(
        (p) => p.userId === user.userId || (userEmail && p.email === userEmail),
      );
      
      if (!isLeaseTenant && !isParticipant) {
        throw new ForbiddenException('You are not assigned to this envelope. Please contact support if you believe this is an error.');
      }
    }

    // Find participant by userId first, then fall back to email matching
    let participant = await this.prisma.esignParticipant.findFirst({
      where: { 
        envelopeId, 
        OR: [
          { userId: user.userId },
          ...(userEmail ? [{ email: userEmail }] : []), // Fallback: match by email if userId not set
        ],
      },
      include: { envelope: true },
    });

    // If still not found and user is tenant, try to find by lease tenant email
    if (!participant && user.role === Role.TENANT && envelope.lease.tenantId === user.userId && userEmail) {
      participant = await this.prisma.esignParticipant.findFirst({
        where: { 
          envelopeId,
          email: userEmail,
        },
        include: { envelope: true },
      });
    }

    if (!participant) {
      throw new ForbiddenException('You are not assigned to this envelope. Please contact support if you believe this is an error.');
    }

    const url = await this.requestRecipientView(participant.envelope, participant.recipientId, dto.returnUrl);

    await this.prisma.esignParticipant.update({
      where: { id: participant.id },
      data: { recipientUrl: url, status: EsignParticipantStatus.VIEWED },
    });

    return { url };
  }

  async handleProviderWebhook(payload: ProviderWebhookDto) {
    const envelope = await this.prisma.esignEnvelope.findFirst({
      where: { providerEnvelopeId: payload.envelopeId },
      include: { participants: true },
    });

    if (!envelope) {
      this.logger.warn(`Received webhook for unknown envelope ${payload.envelopeId}`);
      return { ignored: true };
    }

    const status = this.mapEnvelopeStatus(payload.status);
    const data: Prisma.EsignEnvelopeUpdateInput = {
      providerStatus: payload.status,
      providerMetadata: (payload.metadata ?? payload) as Prisma.JsonValue,
      ...(status && { status }),
    };

    const updated = await this.prisma.esignEnvelope.update({
      where: { id: envelope.id },
      data,
      include: { participants: true },
    });

    if (payload.participants?.length) {
      await Promise.all(
        payload.participants.map((participant) =>
          this.prisma.esignParticipant.updateMany({
            where: { envelopeId: envelope.id, email: participant.email },
            data: { status: this.mapParticipantStatus(participant.status) ?? EsignParticipantStatus.SENT },
          }),
        ),
      );
    }

    if (status === EsignEnvelopeStatus.COMPLETED && payload.documents?.length) {
      await this.attachFinalDocuments(updated, payload.documents);

      await Promise.all(
        updated.participants.map((participant) =>
          this.notificationsService.sendSignatureAlert({
            event: 'COMPLETED',
            envelopeId: updated.id,
            leaseId: updated.leaseId,
            participantName: participant.name,
            userId: participant.userId ?? undefined,
            email: participant.email,
            phone: participant.phone ?? undefined,
          }),
        ),
      );
    }

    return { success: true };
  }

  private async attachFinalDocuments(envelope: EsignEnvelope & { participants: { id: number }[] }, documents: ProviderWebhookDocumentDto[]) {
    const combined = documents.find((doc) => (doc.type ?? '').toLowerCase().includes('certificate') === false);
    const certificate = documents.find((doc) => (doc.type ?? '').toLowerCase().includes('certificate'));

    const updateData: Prisma.EsignEnvelopeUpdateInput = {};

    if (combined?.contentBase64) {
      const buffer = Buffer.from(combined.contentBase64, 'base64');
      const document = await this.documentsService.saveBuffer(buffer, {
        fileName: combined.name || `lease-${envelope.leaseId}-signed.pdf`,
        userId: envelope.createdById,
        category: DocumentCategory.LEASE,
        description: 'Signed lease PDF',
        leaseId: envelope.leaseId,
        mimeType: 'application/pdf',
      });
      updateData.signedPdfDocument = {
        connect: { id: document.id },
      };
    }

    if (certificate?.contentBase64) {
      const buffer = Buffer.from(certificate.contentBase64, 'base64');
      const document = await this.documentsService.saveBuffer(buffer, {
        fileName: certificate.name || `lease-${envelope.leaseId}-certificate.pdf`,
        userId: envelope.createdById,
        category: DocumentCategory.LEASE,
        description: 'Signature audit trail',
        leaseId: envelope.leaseId,
        mimeType: 'application/pdf',
      });
      updateData.auditTrailDocument = {
        connect: { id: document.id },
      };
    }

    if (Object.keys(updateData).length > 0) {
      await this.prisma.esignEnvelope.update({
        where: { id: envelope.id },
        data: updateData,
      });
    }
  }

  private async dispatchProviderEnvelope(
    provider: EsignProvider,
    dto: CreateEnvelopeDto,
    lease: any,
  ): Promise<ProviderEnvelopeResponse> {
    const payload = {
      templateId: dto.templateId,
      message: dto.message,
      lease: {
        id: lease.id,
        tenant: lease.tenant,
        unit: lease.unit,
      },
      recipients: dto.recipients,
    };

    const baseURL = this.configService.get<string>('ESIGN_PROVIDER_BASE_URL') || process.env.ESIGN_PROVIDER_BASE_URL;
    
    // If no baseURL configured, use mock mode immediately
    if (!baseURL || !this.isValidUrl(baseURL)) {
      this.logger.debug('No provider base URL configured, using mock envelope');
      return {
        envelopeId: randomUUID(),
        status: EsignEnvelopeStatus.SENT,
        providerStatus: 'SENT',
        recipients: dto.recipients.map((recipient, index) => ({
          email: recipient.email,
          recipientId: `recipient-${index}`,
        })),
        metadata: payload,
      };
    }

    try {
      const response = await this.httpClient.request<{ envelopeId: string; status: string; recipients?: ProviderRecipient[] }>({
        method: 'POST',
        url: '/envelopes',
        data: payload,
        headers: this.buildProviderHeaders(provider),
      });

      return {
        envelopeId: response.data.envelopeId,
        status: this.mapEnvelopeStatus(response.data.status) ?? EsignEnvelopeStatus.SENT,
        providerStatus: response.data.status,
        recipients: response.data.recipients ?? [],
        metadata: response.data as Record<string, unknown>,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logger.warn(`Provider request failed, using mock envelope. Error: ${errorMessage}`);
      return {
        envelopeId: randomUUID(),
        status: EsignEnvelopeStatus.SENT,
        providerStatus: 'SENT',
        recipients: dto.recipients.map((recipient, index) => ({
          email: recipient.email,
          recipientId: `recipient-${index}`,
        })),
        metadata: payload,
      };
    }
  }

  private async requestRecipientView(envelope: EsignEnvelope, recipientId: string | null | undefined, returnUrl: string) {
    // Always validate returnUrl first
    const safeReturnUrl = this.validateReturnUrl(returnUrl);
    
    if (!recipientId) {
      return `${safeReturnUrl}?envelope=${envelope.providerEnvelopeId}`;
    }

    const baseURL = this.configService.get<string>('ESIGN_PROVIDER_BASE_URL') || process.env.ESIGN_PROVIDER_BASE_URL;
    
    // If no baseURL configured, use fallback immediately (before any axios calls)
    if (!baseURL || !this.isValidUrl(baseURL)) {
      this.logger.debug('No provider base URL configured, using fallback URL');
      return `${safeReturnUrl}?envelope=${envelope.providerEnvelopeId}&recipient=${recipientId}`;
    }

    // Double-check that httpClient has a valid baseURL before making request
    if (!this.httpClient || !this.httpClient.defaults?.baseURL || !this.isValidUrl(this.httpClient.defaults.baseURL)) {
      this.logger.debug('HttpClient has invalid baseURL, using fallback URL');
      return `${safeReturnUrl}?envelope=${envelope.providerEnvelopeId}&recipient=${recipientId}`;
    }

    try {
      const response = await this.httpClient.request<{ url: string }>({
        method: 'POST',
        url: `/envelopes/${envelope.providerEnvelopeId}/views/recipient`,
        data: {
          recipientId,
          returnUrl: safeReturnUrl,
        },
        headers: this.buildProviderHeaders(envelope.provider),
      });
      
      // Validate the response URL
      if (response.data?.url && this.isValidUrl(response.data.url)) {
        return response.data.url;
      } else {
        throw new Error('Invalid URL received from provider');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      // Check if it's specifically an "Invalid URL" error from axios
      if (errorMessage.includes('Invalid URL') || errorMessage.includes('TypeError')) {
        this.logger.warn(`Invalid URL error when fetching recipient view. BaseURL: ${baseURL}, ReturnURL: ${returnUrl}. Using fallback.`);
      } else {
        this.logger.warn(`Failed to fetch recipient view URL from provider, using fallback. Error: ${errorMessage}`);
      }
      
      // Use fallback URL (already validated)
      return `${safeReturnUrl}?envelope=${envelope.providerEnvelopeId}&recipient=${recipientId}`;
    }
  }

  private validateReturnUrl(returnUrl: string): string {
    try {
      // Handle empty or null returnUrl
      if (!returnUrl || typeof returnUrl !== 'string' || returnUrl.trim() === '') {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        return `${frontendUrl}/my-lease`;
      }
      
      // Trim whitespace
      const trimmed = returnUrl.trim();
      
      // If it's already a valid absolute URL, return it
      if (this.isValidUrl(trimmed)) {
        return trimmed;
      }
      
      // If it's a relative path, make it absolute using frontend URL
      if (trimmed.startsWith('/')) {
        const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
        const fullUrl = `${frontendUrl}${trimmed}`;
        
        // Validate the constructed URL
        if (this.isValidUrl(fullUrl)) {
          return fullUrl;
        }
      }
      
      // If it's a protocol-relative URL (//example.com), add https:
      if (trimmed.startsWith('//')) {
        const httpsUrl = `https:${trimmed}`;
        if (this.isValidUrl(httpsUrl)) {
          return httpsUrl;
        }
      }
      
      // Fallback to a safe default
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      this.logger.debug(`Invalid returnUrl format: "${returnUrl}", using fallback: ${frontendUrl}/my-lease`);
      return `${frontendUrl}/my-lease`;
    } catch (error) {
      // Fallback to a safe default on any error
      const frontendUrl = this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
      this.logger.warn(`Error validating returnUrl: "${returnUrl}", using fallback: ${frontendUrl}/my-lease`, error);
      return `${frontendUrl}/my-lease`;
    }
  }

  private mapEnvelopeStatus(status?: string): EsignEnvelopeStatus | undefined {
    if (!status) {
      return undefined;
    }

    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'CREATED':
        return EsignEnvelopeStatus.CREATED;
      case 'SENT':
      case 'IN_PROGRESS':
        return EsignEnvelopeStatus.SENT;
      case 'DELIVERED':
        return EsignEnvelopeStatus.DELIVERED;
      case 'COMPLETED':
        return EsignEnvelopeStatus.COMPLETED;
      case 'DECLINED':
        return EsignEnvelopeStatus.DECLINED;
      case 'VOIDED':
        return EsignEnvelopeStatus.VOIDED;
      default:
        return EsignEnvelopeStatus.ERROR;
    }
  }

  private mapParticipantStatus(status?: string): EsignParticipantStatus | undefined {
    if (!status) {
      return undefined;
    }

    const normalized = status.toUpperCase();
    switch (normalized) {
      case 'CREATED':
        return EsignParticipantStatus.CREATED;
      case 'SENT':
      case 'DELIVERED':
        return EsignParticipantStatus.SENT;
      case 'COMPLETED':
      case 'SIGNED':
        return EsignParticipantStatus.SIGNED;
      case 'DECLINED':
        return EsignParticipantStatus.DECLINED;
      case 'VIEWED':
        return EsignParticipantStatus.VIEWED;
      default:
        return EsignParticipantStatus.ERROR;
    }
  }

  async sendRemindersForPendingEnvelopes() {
    const reminderIntervalDays = this.configService.get<number>('ESIGN_REMINDER_INTERVAL_DAYS', 3);
    const maxReminders = this.configService.get<number>('ESIGN_MAX_REMINDERS', 3);
    const enabled = this.configService.get<boolean>('ESIGN_REMINDER_ENABLED', true);

    if (!enabled) {
      this.logger.debug('E-signature reminders are disabled');
      return { sent: 0, skipped: 0 };
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - reminderIntervalDays);
    cutoffDate.setHours(0, 0, 0, 0);

    // Find pending envelopes that haven't been updated recently
    const pendingEnvelopes = await this.prisma.esignEnvelope.findMany({
      where: {
        status: {
          in: [EsignEnvelopeStatus.SENT, EsignEnvelopeStatus.DELIVERED],
        },
        updatedAt: {
          lte: cutoffDate,
        },
      },
      include: {
        participants: {
          where: {
            status: {
              notIn: [EsignParticipantStatus.SIGNED, EsignParticipantStatus.DECLINED],
            },
          },
        },
        lease: {
          include: { tenant: true },
        },
      },
    });

    let sentCount = 0;
    let skippedCount = 0;

    for (const envelope of pendingEnvelopes) {
      if (envelope.participants.length === 0) {
        continue; // No pending participants
      }

      const metadata = (envelope.providerMetadata as Record<string, unknown>) || {};
      const reminderCount = ((metadata.reminderCount as number) || 0);

      if (reminderCount >= maxReminders) {
        this.logger.debug(`Skipping envelope ${envelope.id} - max reminders (${maxReminders}) reached`);
        skippedCount++;
        continue;
      }

      // Send reminders to all pending participants
      for (const participant of envelope.participants) {
        try {
          await this.notificationsService.sendSignatureAlert({
            event: 'REQUESTED',
            envelopeId: envelope.id,
            leaseId: envelope.leaseId,
            participantName: participant.name,
            userId: participant.userId ?? undefined,
            email: participant.email,
            phone: participant.phone ?? undefined,
          });

          sentCount++;
        } catch (error) {
          this.logger.error(
            `Failed to send reminder to participant ${participant.id} for envelope ${envelope.id}: ${error}`,
          );
        }
      }

      // Update reminder count
      try {
        await this.prisma.esignEnvelope.update({
          where: { id: envelope.id },
          data: {
            providerMetadata: {
              ...metadata,
              reminderCount: reminderCount + 1,
              lastReminderAt: new Date().toISOString(),
            } as Prisma.JsonValue,
          },
        });
      } catch (error) {
        this.logger.error(`Failed to update reminder count for envelope ${envelope.id}: ${error}`);
      }
    }

    this.logger.log(
      `E-signature reminders: ${sentCount} sent, ${skippedCount} skipped (max reminders reached)`,
    );

    return { sent: sentCount, skipped: skippedCount };
  }

  private buildProviderHeaders(provider: EsignProvider) {
    const token = this.configService.get<string>('ESIGN_PROVIDER_API_KEY');
    const accountId = this.configService.get<string>('ESIGN_PROVIDER_ACCOUNT_ID');
    const headers: Record<string, string> = {};

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    if (accountId) {
      headers['X-Esign-Account'] = accountId;
    }

    headers['X-Esign-Provider'] = provider;

    return headers;
  }
}

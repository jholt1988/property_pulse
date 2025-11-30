# E-Signature Lifecycle Completion Plan

## Current Implementation Status

### ✅ **Backend - Fully Implemented**

#### Core Service Methods
- ✅ `createEnvelope()` - Creates envelope and sends to provider
- ✅ `listLeaseEnvelopes()` - Lists all envelopes for a lease
- ✅ `createRecipientView()` - Generates signing URL for recipients
- ✅ `handleProviderWebhook()` - Processes webhook updates from provider

#### API Endpoints
- ✅ `POST /api/esignature/leases/:leaseId/envelopes` - Create envelope (Property Manager only)
- ✅ `GET /api/esignature/leases/:leaseId/envelopes` - List envelopes (Property Manager & Tenant)
- ✅ `POST /api/esignature/envelopes/:envelopeId/recipient-view` - Get signing URL (Tenant only)
- ✅ `POST /webhooks/esignature` - Webhook endpoint (public, no auth)

#### Features
- ✅ Multi-provider support (DocuSign, HelloSign)
- ✅ Multiple recipients per envelope
- ✅ Status tracking (CREATED, SENT, DELIVERED, COMPLETED, DECLINED, VOIDED, ERROR)
- ✅ Participant status tracking (CREATED, SENT, VIEWED, SIGNED, DECLINED, ERROR)
- ✅ Automatic document attachment on completion
- ✅ Notification system (REQUESTED and COMPLETED events)
- ✅ Email and SMS notifications
- ✅ Sensitive data filtering
- ✅ Mock mode fallback for testing

### ✅ **Frontend - Partially Implemented**

#### Property Manager UI
- ✅ `LeaseEsignPanel` - Create and manage envelopes
- ✅ Template ID input
- ✅ Custom message support
- ✅ Multiple recipients support
- ✅ Envelope status display
- ✅ Participant status display

#### Tenant UI
- ✅ `MyLeasePage` - View pending envelopes
- ✅ Launch signing session (opens provider signing page)
- ✅ Envelope status display
- ✅ Participant status display

### ✅ **Database Schema**
- ✅ `EsignEnvelope` model with all required fields
- ✅ `EsignParticipant` model with all required fields
- ✅ Relationships to `Lease`, `User`, and `Document`
- ✅ Status enums properly defined

---

## ❌ **Missing Components for Complete Lifecycle**

### 🔴 **High Priority - Critical Missing Features**

#### 1. **Envelope Management Endpoints**

**Missing:**
- ❌ `GET /api/esignature/envelopes/:envelopeId` - Get single envelope details
- ❌ `PATCH /api/esignature/envelopes/:envelopeId/void` - Void/cancel envelope
- ❌ `POST /api/esignature/envelopes/:envelopeId/remind` - Resend notifications
- ❌ `POST /api/esignature/envelopes/:envelopeId/refresh` - Poll provider for status updates

**Why needed:**
- Property managers need to see detailed envelope information
- Need ability to cancel envelopes before completion
- Need to resend notifications if recipients don't respond
- Need manual status refresh for troubleshooting

#### 2. **Document Management**

**Missing:**
- ❌ `GET /api/esignature/envelopes/:envelopeId/documents` - List envelope documents
- ❌ `GET /api/esignature/envelopes/:envelopeId/documents/signed` - Download signed PDF
- ❌ `GET /api/esignature/envelopes/:envelopeId/documents/certificate` - Download audit trail

**Why needed:**
- Property managers need to download completed documents
- Tenants should be able to access signed documents
- Audit trail access for compliance

#### 3. **Declined/Voided Envelope Handling**

**Missing:**
- ❌ Notification when envelope is declined
- ❌ Notification when envelope is voided
- ❌ Automatic retry logic for declined envelopes
- ❌ UI feedback for declined/voided states

**Why needed:**
- Users need to know when signatures are declined
- Need process for handling declined envelopes
- Better error recovery

#### 4. **Reminder System**

**Missing:**
- ❌ Scheduled reminder notifications for pending signatures
- ❌ Configurable reminder intervals (e.g., after 3 days, 7 days)
- ❌ Max reminder count limit
- ❌ Reminder history tracking

**Why needed:**
- Increase signature completion rates
- Reduce manual follow-up work
- Professional communication

#### 5. **Status Refresh/Polling**

**Missing:**
- ❌ Manual status refresh from provider API
- ❌ Scheduled background job to sync envelope statuses
- ❌ Retry logic for failed webhooks

**Why needed:**
- Webhooks can fail or be delayed
- Need manual override for troubleshooting
- Ensure data consistency

### 🟡 **Medium Priority - Quality of Life**

#### 6. **Enhanced Frontend Features**

**Missing:**
- ❌ Download signed documents button (frontend)
- ❌ Envelope details modal/page
- ❌ Resend notification button (Property Manager)
- ❌ Void envelope button (Property Manager)
- ❌ Refresh status button
- ❌ Envelope history timeline

**Why needed:**
- Better user experience
- Reduced need to check provider dashboard
- Self-service capabilities

#### 7. **Error Handling & Edge Cases**

**Missing:**
- ❌ Better error messages for provider failures
- ❌ Retry logic with exponential backoff
- ❌ Dead letter queue for failed webhooks
- ❌ Provider connectivity health checks

**Why needed:**
- Improved reliability
- Better debugging
- Graceful degradation

#### 8. **Analytics & Reporting**

**Missing:**
- ❌ Average time to completion metrics
- ❌ Completion rate by lease
- ❌ Participant response time analytics
- ❌ Failed envelope reports

**Why needed:**
- Performance monitoring
- Identify bottlenecks
- Business insights

### 🟢 **Low Priority - Nice to Have**

#### 9. **Advanced Features**

**Missing:**
- ❌ Template management UI
- ❌ Bulk envelope creation
- ❌ Envelope scheduling (send at future date)
- ❌ Conditional routing (signer order)
- ❌ In-app signing (embedded provider signing)

**Why needed:**
- Advanced workflows
- Better user experience
- Competitive features

---

## Implementation Priority

### Phase 1: Critical Missing Features (Week 1)
1. Get single envelope endpoint
2. Void envelope endpoint
3. Document download endpoints
4. Declined/voided notification handling

### Phase 2: Management Features (Week 2)
5. Reminder notification system
6. Resend notification endpoint
7. Refresh status endpoint
8. Enhanced frontend UI for these features

### Phase 3: Reliability & Monitoring (Week 3)
9. Status sync background job
10. Enhanced error handling
11. Analytics endpoints
12. Health check improvements

### Phase 4: Advanced Features (Future)
13. Template management
14. Bulk operations
15. Scheduling features

---

## Detailed Implementation Tasks

### Task 1: Get Single Envelope Endpoint

**Backend:**
```typescript
// Add to EsignatureController
@Get('envelopes/:envelopeId')
@Roles(Role.PROPERTY_MANAGER, Role.TENANT)
async getEnvelope(
  @Param('envelopeId') envelopeId: string,
  @Request() req: AuthenticatedRequest,
) {
  return this.esignatureService.getEnvelope(Number(envelopeId), req.user);
}

// Add to EsignatureService
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
```

### Task 2: Void Envelope Endpoint

**Backend:**
```typescript
// Add to EsignatureController
@Patch('envelopes/:envelopeId/void')
@Roles(Role.PROPERTY_MANAGER)
async voidEnvelope(
  @Param('envelopeId') envelopeId: string,
  @Body() dto: { reason?: string },
  @Request() req: AuthenticatedRequest,
) {
  return this.esignatureService.voidEnvelope(Number(envelopeId), dto.reason, req.user.userId);
}

// Add to EsignatureService
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
  try {
    await this.httpClient.request({
      method: 'PATCH',
      url: `/envelopes/${envelope.providerEnvelopeId}/void`,
      data: { reason },
      headers: this.buildProviderHeaders(envelope.provider),
    });
  } catch (error) {
    this.logger.warn(`Failed to void envelope on provider, voiding locally. Error: ${error}`);
  }

  // Update local status
  const updated = await this.prisma.esignEnvelope.update({
    where: { id: envelopeId },
    data: {
      status: EsignEnvelopeStatus.VOIDED,
      providerStatus: 'VOIDED',
      providerMetadata: {
        ...(envelope.providerMetadata as Record<string, unknown> || {}),
        voidedAt: new Date().toISOString(),
        voidedBy: actorId,
        voidReason: reason,
      } as Prisma.JsonValue,
    },
    include: { participants: true },
  });

  // Notify participants
  await Promise.all(
    envelope.participants.map((participant) =>
      this.notificationsService.sendSignatureAlert({
        event: 'VOIDED', // Need to add this event type
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
```

### Task 3: Document Download Endpoints

**Backend:**
```typescript
// Add to EsignatureController
@Get('envelopes/:envelopeId/documents/signed')
@Roles(Role.PROPERTY_MANAGER, Role.TENANT)
async downloadSignedDocument(
  @Param('envelopeId') envelopeId: string,
  @Request() req: AuthenticatedRequest,
  @Res() res: Response,
) {
  return this.esignatureService.downloadDocument(
    Number(envelopeId),
    'signed',
    req.user,
    res,
  );
}

// Add to EsignatureService
async downloadDocument(
  envelopeId: number,
  type: 'signed' | 'certificate',
  user: { userId: number; role: Role },
  res: Response,
) {
  const envelope = await this.prisma.esignEnvelope.findUnique({
    where: { id: envelopeId },
    include: {
      lease: { include: { tenant: true } },
      signedPdfDocument: type === 'signed',
      auditTrailDocument: type === 'certificate',
    },
  });

  if (!envelope) {
    throw new NotFoundException('Envelope not found.');
  }

  // Authorization check
  if (user.role === Role.TENANT && envelope.lease.tenantId !== user.userId) {
    throw new ForbiddenException('You are not allowed to access this document.');
  }

  const document = type === 'signed' 
    ? envelope.signedPdfDocument 
    : envelope.auditTrailDocument;

  if (!document) {
    throw new NotFoundException(`${type} document not available.`);
  }

  // Stream file to response
  const filePath = document.filePath;
  res.setHeader('Content-Type', document.mimeType || 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${document.fileName}"`);
  
  // Use appropriate file streaming method
  // Implementation depends on your file storage system
}
```

### Task 4: Reminder Notification System

**Backend - New Service Method:**
```typescript
// Add to EsignatureService or create EsignatureReminderService
async sendReminders() {
  const pendingEnvelopes = await this.prisma.esignEnvelope.findMany({
    where: {
      status: {
        in: [EsignEnvelopeStatus.SENT, EsignEnvelopeStatus.DELIVERED],
      },
      updatedAt: {
        lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
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
    },
  });

  for (const envelope of pendingEnvelopes) {
    for (const participant of envelope.participants) {
      // Check reminder count in metadata
      const metadata = (envelope.providerMetadata as any) || {};
      const reminderCount = metadata.reminderCount || 0;
      
      if (reminderCount >= 3) {
        continue; // Max 3 reminders
      }

      await this.notificationsService.sendSignatureAlert({
        event: 'REMINDER',
        envelopeId: envelope.id,
        leaseId: envelope.leaseId,
        participantName: participant.name,
        userId: participant.userId ?? undefined,
        email: participant.email,
        phone: participant.phone ?? undefined,
      });

      // Update reminder count
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
    }
  }
}
```

**Scheduled Job:**
```typescript
// Add to jobs module
@Cron('0 10 * * *') // Daily at 10 AM
async handleReminderJob() {
  await this.esignatureService.sendReminders();
}
```

---

## Testing Checklist

### Backend Tests
- [ ] Get single envelope - success case
- [ ] Get single envelope - not found
- [ ] Get single envelope - unauthorized (tenant accessing other tenant's envelope)
- [ ] Void envelope - success case
- [ ] Void envelope - already voided
- [ ] Void envelope - completed envelope (should fail)
- [ ] Download signed document - success case
- [ ] Download signed document - not available
- [ ] Download audit trail - success case
- [ ] Reminder system - sends reminders correctly
- [ ] Reminder system - respects max reminder count
- [ ] Refresh status - updates from provider

### Frontend Tests
- [ ] Envelope details modal/page displays correctly
- [ ] Void button works and updates UI
- [ ] Download buttons work
- [ ] Remind button sends notification
- [ ] Refresh button updates status
- [ ] Error states display correctly

### Integration Tests
- [ ] Complete lifecycle: Create → Sign → Complete → Download
- [ ] Decline workflow: Create → Decline → Handle
- [ ] Void workflow: Create → Void → Verify
- [ ] Reminder workflow: Create → Wait → Reminder sent
- [ ] Webhook processing: All status updates

---

## Environment Variables Required

```env
# Already configured
ESIGN_PROVIDER=DOCUSIGN
ESIGN_PROVIDER_BASE_URL=https://api.docusign.com/restapi/v2.1
ESIGN_PROVIDER_API_KEY=your_api_key
ESIGN_PROVIDER_ACCOUNT_ID=your_account_id

# New variables for reminders
ESIGN_REMINDER_ENABLED=true
ESIGN_REMINDER_INTERVAL_DAYS=3
ESIGN_MAX_REMINDERS=3
ESIGN_STATUS_SYNC_ENABLED=true
ESIGN_STATUS_SYNC_INTERVAL_HOURS=1
```

---

## Next Steps

1. **Review and prioritize** this plan with the team
2. **Set up development environment** for testing with actual provider
3. **Implement Phase 1** features first (critical missing features)
4. **Test thoroughly** with real provider API (or mock extensively)
5. **Deploy incrementally** starting with read-only features
6. **Monitor and iterate** based on user feedback

---

## Questions to Resolve

1. Should reminders be configurable per envelope or globally?
2. What's the retention policy for signed documents?
3. Do we need to support multiple template providers?
4. Should we implement in-app signing or always redirect to provider?
5. What's the SLA for webhook delivery failures?
6. Do we need compliance/audit logging for envelope operations?


import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledJobsService } from './scheduled-jobs.service';
import { MaintenanceMonitoringService } from './maintenance-monitoring.service';
import { PrismaModule } from '../prisma/prisma.module';
import { MaintenanceModule } from '../maintenance/maintenance.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { PaymentsModule } from '../payments/payments.module';
import { EsignatureModule } from '../esignature/esignature.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    PrismaModule,
    MaintenanceModule,
    NotificationsModule,
    PaymentsModule,
    EsignatureModule,
  ],
  providers: [
    ScheduledJobsService,
    MaintenanceMonitoringService,
  ],
  exports: [ScheduledJobsService, MaintenanceMonitoringService],
})
export class JobsModule {}
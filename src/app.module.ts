import { Module, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule'; // Import ScheduleModule
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { MasterAgreementsModule } from './master-agreements/master-agreements.module';
import { MasterAgreementsService } from './master-agreements/master-agreements.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const uri = configService.get<string>('MONGO_URI');
        if (!uri) {
          throw new Error('MONGO_URI is not defined in the environment variables');
        }

        console.log('Connecting to MongoDB with URI:', uri); // Log MongoDB URI
        return { uri };
      },
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(), // Enable scheduling for periodic tasks
    UsersModule,
    AuthModule,
    ServiceRequestsModule,
    MasterAgreementsModule,
  ],
  providers: [Logger], // Provide Logger for consistent logging
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(private readonly masterAgreementsService: MasterAgreementsService) {}

  async onModuleInit() {
    this.logger.log('AppModule initialized');
    this.logger.log('Triggering initial sync for Master Agreements...');
    try {
      await this.masterAgreementsService.fetchAndStoreAll();
      this.logger.log('Initial sync for Master Agreements completed successfully');
    } catch (error) {
      this.logger.error('Initial sync for Master Agreements failed', error.stack);
    }
  }
}

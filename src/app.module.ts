import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { MasterAgreementsModule } from './master-agreements/master-agreements.module';

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

        // Log the MongoDB connection string (mask sensitive information if needed)
        console.log('Connecting to MongoDB with URI:', uri);

        return {
          uri,
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    ServiceRequestsModule,
    MasterAgreementsModule,
  ],
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  constructor() {
    this.logger.log('AppModule initialized');
  }
}

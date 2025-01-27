import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { OffersModule } from './offers/offers.module';

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
    UsersModule,
    AuthModule,
    ServiceRequestsModule,
    OffersModule,
  ],
  providers: [Logger], // Provide Logger for consistent logging
})
export class AppModule {
  private readonly logger = new Logger(AppModule.name);

  onModuleInit() {
    this.logger.log('AppModule initialized');
  }
}

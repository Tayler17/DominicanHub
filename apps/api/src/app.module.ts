import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { appConfig, validateConfig } from './common/config/app.config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { VendorsModule } from './modules/vendors/vendors.module';
import { ProductsModule } from './modules/products/products.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { LogisticsModule } from './logistics/logistics.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig],
      validate: validateConfig,
    }),
    BullModule.forRoot({
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    VendorsModule,
    ProductsModule,
    OrdersModule,
    ShipmentsModule,
    TrackingModule,
    NotificationsModule,
    AdminModule,
    PaymentsModule,
    LogisticsModule,
  ],
})
export class AppModule {}

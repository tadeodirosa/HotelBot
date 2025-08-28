import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './config/prisma.module';
import { AuthModule } from './auth/auth.module';
import { RoomTypesModule } from './room-types/room-types.module';
import { RoomsModule } from './rooms/rooms.module';
import { CustomersModule } from './customers/customers.module';
import { MealPlansModule } from './meal-plans/meal-plans.module';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    RoomTypesModule,
    RoomsModule,
    CustomersModule,
    MealPlansModule,
    ReservationsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

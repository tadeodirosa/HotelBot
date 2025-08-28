import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { PrismaModule } from '../config/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ReservationsController],
  providers: [
    ReservationsService,
    ReservationsRepository,
  ],
  exports: [
    ReservationsService,
    ReservationsRepository,
  ],
})
export class ReservationsModule {}

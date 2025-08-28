import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { RoomRepository } from './rooms.repository';
import { RoomTypesModule } from '../room-types/room-types.module';

@Module({
  imports: [RoomTypesModule],
  controllers: [RoomsController],
  providers: [RoomsService, RoomRepository],
  exports: [RoomsService, RoomRepository],
})
export class RoomsModule {}

import { Module } from '@nestjs/common';
import { RoomTypesService } from './room-types.service';
import { RoomTypesController } from './room-types.controller';
import { RoomTypeRepository } from './room-types.repository';

@Module({
  controllers: [RoomTypesController],
  providers: [RoomTypesService, RoomTypeRepository],
  exports: [RoomTypesService, RoomTypeRepository],
})
export class RoomTypesModule {}

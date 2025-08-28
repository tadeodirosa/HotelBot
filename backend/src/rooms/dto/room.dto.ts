import { IsString, IsNotEmpty, IsNumber, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum RoomStatus {
  AVAILABLE = 'available',
  OCCUPIED = 'occupied', 
  MAINTENANCE = 'maintenance',
  OUT_OF_ORDER = 'out_of_order',
}

export class CreateRoomDto {
  @ApiProperty({
    description: 'Nombre único de la habitación',
    example: '101',
    maxLength: 50,
  })
  @IsString({ message: 'El nombre de la habitación debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre de la habitación es obligatorio' })
  @MaxLength(50, { message: 'El nombre de la habitación no puede exceder 50 caracteres' })
  name: string;

  @ApiProperty({
    description: 'ID del tipo de habitación',
    example: 1,
  })
  @IsNumber({}, { message: 'El tipo de habitación debe ser un número válido' })
  @Type(() => Number)
  roomTypeId: number;

  @ApiProperty({
    description: 'Número de piso (opcional)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El piso debe ser un número válido' })
  @Type(() => Number)
  floor?: number;

  @ApiProperty({
    description: 'Estado inicial de la habitación',
    enum: RoomStatus,
    example: RoomStatus.AVAILABLE,
    required: false,
  })
  @IsOptional()
  @IsEnum(RoomStatus, { message: 'El estado debe ser uno de los valores permitidos: available, occupied, maintenance, out_of_order' })
  status?: RoomStatus;
}

export class UpdateRoomDto {
  @ApiProperty({
    description: 'Nombre único de la habitación',
    example: '101A',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la habitación debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre de la habitación no puede estar vacío' })
  @MaxLength(50, { message: 'El nombre de la habitación no puede exceder 50 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'ID del tipo de habitación',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El tipo de habitación debe ser un número válido' })
  @Type(() => Number)
  roomTypeId?: number;

  @ApiProperty({
    description: 'Número de piso',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'El piso debe ser un número válido' })
  @Type(() => Number)
  floor?: number;
}

export class UpdateRoomStatusDto {
  @ApiProperty({
    description: 'Nuevo estado de la habitación',
    enum: RoomStatus,
    example: RoomStatus.MAINTENANCE,
  })
  @IsEnum(RoomStatus, { message: 'El estado debe ser uno de los valores permitidos: available, occupied, maintenance, out_of_order' })
  status: RoomStatus;

  @ApiProperty({
    description: 'Motivo del cambio de estado (opcional)',
    example: 'Mantenimiento programado de aire acondicionado',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El motivo debe ser un texto válido' })
  reason?: string;
}

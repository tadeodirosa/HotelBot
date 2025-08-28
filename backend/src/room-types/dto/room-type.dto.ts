import { IsString, IsNotEmpty, IsNumber, IsOptional, Min, IsArray, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de habitación',
    example: 'Suite Presidencial',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre del tipo de habitación debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre del tipo de habitación es obligatorio' })
  @MaxLength(100, { message: 'El nombre del tipo de habitación no puede exceder 100 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 4,
    minimum: 1,
  })
  @IsNumber({}, { message: 'La capacidad debe ser un número válido' })
  @Min(1, { message: 'La capacidad debe ser al menos 1 persona' })
  @Type(() => Number)
  capacity: number;

  @ApiProperty({
    description: 'Precio base por noche en USD',
    example: 150.00,
    minimum: 0,
  })
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El precio base debe ser un valor positivo' })
  @Type(() => Number)
  basePrice: number;

  @ApiProperty({
    description: 'Descripción detallada del tipo de habitación',
    example: 'Amplia suite con vista al mar, jacuzzi privado y sala de estar',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  description?: string;

  @ApiProperty({
    description: 'Lista de amenidades incluidas',
    example: ['Wi-Fi', 'TV Smart', 'Minibar', 'Aire acondicionado'],
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las amenidades deben ser una lista de textos' })
  @IsString({ each: true, message: 'Cada amenidad debe ser un texto válido' })
  amenities?: string[];
}

export class UpdateRoomTypeDto {
  @ApiProperty({
    description: 'Nombre del tipo de habitación',
    example: 'Suite Presidencial Deluxe',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El nombre del tipo de habitación debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre del tipo de habitación no puede estar vacío' })
  @MaxLength(100, { message: 'El nombre del tipo de habitación no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Capacidad máxima de personas',
    example: 6,
    required: false,
  })
  @IsOptional()
  @IsNumber({}, { message: 'La capacidad debe ser un número válido' })
  @Min(1, { message: 'La capacidad debe ser al menos 1 persona' })
  @Type(() => Number)
  capacity?: number;

  @ApiProperty({
    description: 'Precio base por noche en USD',
    example: 200.00,
    required: false,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 }, { message: 'El precio base debe ser un número válido con máximo 2 decimales' })
  @Min(0, { message: 'El precio base debe ser un valor positivo' })
  @Type(() => Number)
  basePrice?: number;

  @ApiProperty({
    description: 'Descripción detallada del tipo de habitación',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La descripción debe ser un texto válido' })
  description?: string;

  @ApiProperty({
    description: 'Lista de amenidades incluidas',
    required: false,
    type: [String],
  })
  @IsOptional()
  @IsArray({ message: 'Las amenidades deben ser una lista de textos' })
  @IsString({ each: true, message: 'Cada amenidad debe ser un texto válido' })
  amenities?: string[];
}

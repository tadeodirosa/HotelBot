import { IsString, IsNotEmpty, IsEmail, IsOptional, IsDateString, MaxLength, MinLength, Matches } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nombre del cliente',
    example: 'Juan Carlos',
    maxLength: 100,
  })
  @IsString({ message: 'El nombre debe ser un texto válido' })
  @IsNotEmpty({ message: 'El nombre es obligatorio' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  firstName: string;

  @ApiProperty({
    description: 'Apellido del cliente',
    example: 'García López',
    maxLength: 100,
  })
  @IsString({ message: 'El apellido debe ser un texto válido' })
  @IsNotEmpty({ message: 'El apellido es obligatorio' })
  @MaxLength(100, { message: 'El apellido no puede exceder 100 caracteres' })
  lastName: string;

  @ApiProperty({
    description: 'Documento de identidad único',
    example: '12345678A',
    maxLength: 20,
  })
  @IsString({ message: 'El DNI debe ser un texto válido' })
  @IsNotEmpty({ message: 'El DNI es obligatorio' })
  @MaxLength(20, { message: 'El DNI no puede exceder 20 caracteres' })
  @MinLength(5, { message: 'El DNI debe tener al menos 5 caracteres' })
  dni: string;

  @ApiProperty({
    description: 'Correo electrónico del cliente',
    example: 'juan.garcia@email.com',
    maxLength: 255,
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es obligatorio' })
  @MaxLength(255, { message: 'El email no puede exceder 255 caracteres' })
  email: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente',
    example: '+34 666 123 456',
    maxLength: 20,
  })
  @IsString({ message: 'El teléfono debe ser un texto válido' })
  @IsNotEmpty({ message: 'El teléfono es obligatorio' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  @Matches(/^[\+]?[0-9\s\-\(\)]+$/, { message: 'El teléfono debe tener un formato válido' })
  phone: string;

  @ApiProperty({
    description: 'Fecha de nacimiento (opcional)',
    example: '1985-06-15',
    required: false,
  })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha de nacimiento debe tener un formato válido (YYYY-MM-DD)' })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Nacionalidad del cliente (opcional)',
    example: 'Española',
    maxLength: 50,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'La nacionalidad debe ser un texto válido' })
  @MaxLength(50, { message: 'La nacionalidad no puede exceder 50 caracteres' })
  nationality?: string;

  @ApiProperty({
    description: 'Preferencias del cliente en formato JSON (opcional)',
    example: {
      roomPreferences: {
        floor: 'high',
        view: 'sea',
        bedType: 'king'
      },
      dietaryRestrictions: ['vegetarian'],
      communicationLanguage: 'es'
    },
    required: false,
  })
  @IsOptional()
  preferences?: Record<string, any>;
}

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiProperty({
    description: 'Nombre del cliente (opcional)',
    example: 'Juan Carlos',
    maxLength: 100,
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'Apellido del cliente (opcional)',
    example: 'García López',
    maxLength: 100,
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'Documento de identidad único (opcional)',
    example: '12345678A',
    maxLength: 20,
    required: false,
  })
  dni?: string;

  @ApiProperty({
    description: 'Correo electrónico del cliente (opcional)',
    example: 'juan.garcia@email.com',
    maxLength: 255,
    required: false,
  })
  email?: string;

  @ApiProperty({
    description: 'Número de teléfono del cliente (opcional)',
    example: '+34 666 123 456',
    maxLength: 20,
    required: false,
  })
  phone?: string;
}

export class CustomerSearchDto {
  @ApiProperty({
    description: 'Buscar por nombre o apellido',
    example: 'Juan',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El término de búsqueda debe ser un texto válido' })
  @MaxLength(100, { message: 'El término de búsqueda no puede exceder 100 caracteres' })
  name?: string;

  @ApiProperty({
    description: 'Buscar por DNI',
    example: '12345678A',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'El DNI debe ser un texto válido' })
  @MaxLength(20, { message: 'El DNI no puede exceder 20 caracteres' })
  dni?: string;

  @ApiProperty({
    description: 'Buscar por email',
    example: 'juan@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  email?: string;

  @ApiProperty({
    description: 'Número de página (paginación)',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({
    description: 'Elementos por página (máximo 100)',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  limit?: number = 10;
}

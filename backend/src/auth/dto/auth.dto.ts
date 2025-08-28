import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Email del usuario',
    example: 'admin@hotelbot.com',
    format: 'email',
  })
  @IsEmail({}, { message: 'Debe proporcionar un email válido para iniciar sesión' })
  @IsNotEmpty({ message: 'El email es obligatorio para iniciar sesión' })
  email: string;

  @ApiProperty({
    description: 'Contraseña del usuario',
    example: 'password123',
    minLength: 6,
  })
  @IsString({ message: 'La contraseña debe ser un texto válido' })
  @IsNotEmpty({ message: 'La contraseña es obligatoria para iniciar sesión' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Token de refresco para obtener nuevo access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString({ message: 'El token de refresco debe ser un texto válido' })
  @IsNotEmpty({ message: 'El token de refresco es obligatorio' })
  refreshToken: string;
}

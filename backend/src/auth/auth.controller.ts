import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, TokenResponse } from './interfaces/auth.interface';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Iniciar sesión',
    description: 'Autenticar usuario y generar tokens JWT (access y refresh)'
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Inicio de sesión exitoso',
    schema: {
      example: {
        success: true,
        message: 'Inicio de sesión exitoso. Bienvenido al sistema HotelBot',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          user: {
            id: 1,
            email: 'admin@hotelbot.com',
            name: 'Administrador',
            roles: ['admin']
          }
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Credenciales inválidas',
    schema: {
      example: {
        success: false,
        message: 'Las credenciales proporcionadas son incorrectas. Verifique su email y contraseña',
        errors: ['Credenciales inválidas']
      }
    }
  })
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Renovar token de acceso',
    description: 'Generar nuevo access token usando el refresh token válido'
  })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Token renovado exitosamente',
    schema: {
      example: {
        success: true,
        message: 'Token renovado exitosamente',
        data: {
          accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
          refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
        }
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Token de refresco inválido',
    schema: {
      example: {
        success: false,
        message: 'El token de refresco es inválido o ha expirado. Por favor, inicie sesión nuevamente',
        errors: ['Token de refresco inválido']
      }
    }
  })
  async refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto, RefreshTokenDto } from './dto/auth.dto';
import { AuthResponse, JwtPayload, TokenResponse, UserProfile } from './interfaces/auth.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    // Validación temporal - en producción esto vendría de la base de datos
    const validCredentials = this.validateCredentials(loginDto.email, loginDto.password);
    
    if (!validCredentials) {
      throw new UnauthorizedException({
        success: false,
        message: 'Las credenciales proporcionadas son incorrectas. Verifique su email y contraseña',
        errors: ['Credenciales inválidas'],
      });
    }

    const user: UserProfile = {
      id: 1,
      email: loginDto.email,
      name: 'Administrador',
      roles: ['admin'],
    };

    const tokens = await this.generateTokens(user);

    return {
      success: true,
      message: 'Inicio de sesión exitoso. Bienvenido al sistema HotelBot',
      data: {
        ...tokens,
        user,
      },
    };
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<TokenResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      const user: UserProfile = {
        id: payload.sub,
        email: payload.email,
        name: payload.name || 'Usuario',
        roles: payload.roles || ['user'],
      };

      const tokens = await this.generateTokens(user);

      return {
        success: true,
        message: 'Token renovado exitosamente',
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException({
        success: false,
        message: 'El token de refresco es inválido o ha expirado. Por favor, inicie sesión nuevamente',
        errors: ['Token de refresco inválido'],
      });
    }
  }

  async validateUser(userId: number): Promise<UserProfile | null> {
    // En producción, esto consultaría la base de datos
    if (userId === 1) {
      return {
        id: 1,
        email: 'admin@hotelbot.com',
        name: 'Administrador',
        roles: ['admin'],
      };
    }
    return null;
  }

  private validateCredentials(email: string, password: string): boolean {
    // Validación temporal - en producción usar bcrypt para comparar hashes
    return email === 'admin@hotelbot.com' && password === 'admin123';
  }

  private async generateTokens(user: UserProfile) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return { accessToken, refreshToken };
  }
}

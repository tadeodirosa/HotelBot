import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { JwtPayload, UserProfile } from '../interfaces/auth.interface';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload): Promise<UserProfile> {
    const user = await this.authService.validateUser(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        success: false,
        message: 'Token de acceso inválido o usuario no encontrado en el sistema',
        errors: ['Usuario no autorizado'],
      });
    }
    return user;
  }
}

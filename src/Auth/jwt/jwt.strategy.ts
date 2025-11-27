import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    // Fetch the user from DB to get the latest data (roles, status, etc.)
    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Attach roles if available on DB user or fall back to token payload
    const roles = (user as any).roles ?? (user as any).role ? [(user as any).role] : payload.roles ?? [];

    // Return minimal user object to attach to request
    return {
      id: user.id,
      email: user.email,
      username: (user as any).username,
      roles,
    };
  }
}
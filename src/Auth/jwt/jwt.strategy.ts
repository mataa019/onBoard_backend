import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { JwtPayload } from './types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'fallback-secret-key',
    });
  }

  async validate(payload: JwtPayload) {
    // Fetch the user from DB to get the latest data (roles, status, etc.)
    const user = await this.prisma.user.findUnique({ 
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Use roles from JWT payload (set during login)
    // Once you add 'role' field to User model, fetch it here instead
    const roles = payload.roles ?? [];

    // Return minimal user object to attach to request
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      roles,
    };
  }
}
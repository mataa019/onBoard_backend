import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
    //Login, Register
      async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Login attempt for email: ${email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isPasswordValid) {
      throw new UnauthorizedException('Incorrect email or password');
    }
    // Include roles if present on the user (supports `role` or `roles` fields)
    const userRoles = [] as string[];
    if ((user as any).roles && Array.isArray((user as any).roles)) {
      userRoles.push(...(user as any).roles);
    } else if ((user as any).role) {
      userRoles.push((user as any).role);
    }

    const payload = { sub: user.id, email: user.email, username: (user as any).username, roles: userRoles };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`Login successful for: ${email} (ID: ${user.id})`);
    return {
      message: 'Login successful',
      accessToken,
    };
  }

}

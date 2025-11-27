import { Injectable, UnauthorizedException, Logger, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}
    //Login method
      async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    this.logger.log(`Login attempt for email: ${email}`);
    
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    const isPasswordValid = user ? await bcrypt.compare(password, user.password) : false;
    if (!user || !isPasswordValid) {
      this.logger.warn(`Login failed Incorrect email or password`);
      throw new UnauthorizedException('Incorrect email or password');
    }
    const userRoles = [user.role];  // Use role from user record
    const payload = { 
      sub: user.id, 
      email: user.email, 
      roles: userRoles 
    };
    const accessToken = this.jwtService.sign(payload);
    this.logger.log(`Login successful for: ${email} (ID: ${user.id})`);
    return {
      message: 'Login successful',
      accessToken,
    };
  }

  // Register method
  async register(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;
      const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with default role
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'user', // Default role
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      }
    });

    this.logger.log(`User registered successfully: ${email} (ID: ${user.id})`);

    // Generate JWT token
    const payload = { sub: user.id, email: user.email, roles: [user.role] };
    const accessToken = this.jwtService.sign(payload);
    return {
      message: 'Registration successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      }
    };
  }

  // Create admin user directly
  async createAdmin(registerDto: RegisterDto) {
    const { email, password, firstName, lastName } = registerDto;
    
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with admin role
    const admin = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        role: 'admin',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      }
    });

    this.logger.log(`Admin user created: ${email} (ID: ${admin.id})`);

    // Generate JWT token
    const payload = { sub: admin.id, email: admin.email, roles: [admin.role] };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Admin created successfully',
      accessToken,
      user: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role,
      }
    };
  }

}
import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';
import { AuthModule } from './Auth/auth.module';
import { AuthService } from './Auth/auth.service';


@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [],
  providers: [PrismaService, AuthService],
})
export class AppModule {}

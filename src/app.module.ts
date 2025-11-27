import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { AuthModule } from './Auth/auth.module';
import { AuthService } from './Auth/auth.service';
import { HomeModule } from './Home/home.module';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [jwtConfig],
    }),
    PrismaModule,
    AuthModule,
    HomeModule,
  ],
  controllers: [],
  providers: [PrismaService, AuthService],
})
export class AppModule {}

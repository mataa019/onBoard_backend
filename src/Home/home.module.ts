import { Module } from '@nestjs/common';
import { DashAngleController } from './dashAngle.controller';
import { DashAngleService } from './dashAngle.service';
import { PrismaModule } from 'prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [DashAngleController],
  providers: [DashAngleService],
  exports: [DashAngleService],
})
export class HomeModule {}

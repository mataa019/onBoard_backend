import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { DashAngleService } from './dashAngle.service';
import { JwtAuthGuard } from '../Auth/jwt/jwt-auth.guard';
import { User } from '../Auth/jwt/decorators/user.decorator';
import { CreateProjectDto, UpdateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class DashAngleController {
  constructor(private readonly dashAngleService: DashAngleService) {}

  @Get()
  getAll(@User() user: any) {
    return this.dashAngleService.getAllProjects(user.id);
  }

  @Post()
  create(@User() user: any, @Body() body: CreateProjectDto) {
    return this.dashAngleService.saveProject(user.id, body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @User() user: any, @Body() body: UpdateProjectDto) {
    return this.dashAngleService.saveProject(user.id, body, id);
  }

  @Delete(':id')
  delete(@Param('id') id: string, @User() user: any) {
    return this.dashAngleService.deleteProject(id, user.id);
  }
}

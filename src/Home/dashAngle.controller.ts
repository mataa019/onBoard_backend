import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    }),
  )
  create(@User() user: any, @Body() body: CreateProjectDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.dashAngleService.saveProject(user.id, body, files);
  }

  @Patch(':id')
  @UseInterceptors(
    FilesInterceptor('images', 4, {
      storage: diskStorage({
        destination: './uploads/projects',
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
      },
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  update(@Param('id') id: string, @User() user: any, @Body() body: UpdateProjectDto, @UploadedFiles() files: Express.Multer.File[]) {
    return this.dashAngleService.saveProject(user.id, body, files, id);
  }
  
  @Delete(':id')
  delete(@Param('id') id: string, @User() user: any) {
    return this.dashAngleService.deleteProject(id, user.id);
  }
}

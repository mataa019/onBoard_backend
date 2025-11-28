import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class DashAngleService {
  private readonly logger = new Logger(DashAngleService.name);

  constructor(private prisma: PrismaService) {}

  // Get all projects
  async getAllProjects(userId: string) {
    return this.prisma.project.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        description: true,
        githubLink: true,
        images: { select: { url: true, order: true }, orderBy: { order: 'asc' } },
        tags: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // Create or update project
  async saveProject(userId: string, data: any, projectId?: string) {
    const { name, description, githubUrl, tags, imageUrls } = data;

    if (projectId) {
      // Update existing
      const existing = await this.prisma.project.findUnique({ where: { id: projectId } });
      if (!existing || existing.userId !== userId) {
        throw new ForbiddenException('Access denied');
      }

      return this.prisma.project.update({
        where: { id: projectId },
        data: {
          name,
          description,
          githubLink: githubUrl,
          tags: tags ? { deleteMany: {}, create: tags.map((t: string) => ({ name: t })) } : undefined,
          images: imageUrls ? {
            deleteMany: {},
            create: imageUrls.map((url: string, index: number) => ({ url, order: index })),
          } : undefined,
        },
        select: {
          id: true,
          name: true,
          description: true,
          githubLink: true,
          images: { select: { url: true, order: true }, orderBy: { order: 'asc' } },
          tags: { select: { name: true } },
        },
      });
    }

    // Create new
    return this.prisma.project.create({
      data: {
        userId,
        name,
        description,
        githubLink: githubUrl,
        tags: tags ? { create: tags.map((t: string) => ({ name: t })) } : undefined,
        images: imageUrls ? {
          create: imageUrls.map((url: string, index: number) => ({ url, order: index })),
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        description: true,
        githubLink: true,
        images: { select: { url: true, order: true }, orderBy: { order: 'asc' } },
        tags: { select: { name: true } },
      },
    });
  }

  // Delete project
  async deleteProject(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({ where: { id: projectId } });
    if (!project || project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    await this.prisma.project.delete({ where: { id: projectId } });
    return { message: 'Project deleted' };
  }
}

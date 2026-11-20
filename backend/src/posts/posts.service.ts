import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private validateEmployee(employee: any) {
    if (employee.mustChangePassword) {
      throw new ForbiddenException(
        'Change your temporary password before accessing posts',
      );
    }
  }

  async create(employee: any, content: string) {
    this.validateEmployee(employee);

    return this.prisma.post.create({
      data: {
        content,
        authorId: employee.id,
        companyId: employee.companyId,
      },
      include: {
        author: {
          select: { id: true, name: true, loginId: true },
        },
      },
    });
  }

  async getFeed(companyId: string, page = 1) {
    const limit = 10;

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { companyId },
        include: {
          author: {
            select: { id: true, name: true, loginId: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({ where: { companyId } }),
    ]);

    return {
      posts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyPosts(employee: any) {
    this.validateEmployee(employee);

    return this.prisma.post.findMany({
      where: {
        authorId: employee.id,
        companyId: employee.companyId,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getOne(employee: any, id: string) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.findFirst({
      where: {
        id,
        companyId: employee.companyId,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            loginId: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  async update(employee: any, id: string, content: string) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.findFirst({
      where: {
        id,
        authorId: employee.id,
        companyId: employee.companyId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found or access denied');
    }

    return this.prisma.post.update({
      where: { id },
      data: { content },
    });
  }

  async deleteOwn(employee: any, id: string) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.findFirst({
      where: {
        id,
        authorId: employee.id,
        companyId: employee.companyId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found or access denied');
    }

    await this.prisma.post.delete({ where: { id } });

    return { message: 'Post deleted successfully' };
  }

  async adminFeed(companyId: string) {
    return this.prisma.post.findMany({
      where: { companyId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async adminDelete(companyId: string, id: string) {
    const post = await this.prisma.post.findFirst({
      where: { id, companyId },
    });

    if (!post) {
      throw new NotFoundException('Post not found in your company');
    }

    await this.prisma.post.delete({ where: { id } });

    return { message: 'Post moderated and deleted successfully' };
  }
}
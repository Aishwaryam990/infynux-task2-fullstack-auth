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

  private engagementInclude() {
    return {
      author: {
        select: { id: true, name: true, loginId: true },
      },
      likes: {
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              loginId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' as const },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    };
  }

  private formatPost(post: any, employeeId?: string) {
    return {
      ...post,
      likeCount: post._count?.likes ?? 0,
      commentCount: post._count?.comments ?? 0,
      isLiked: employeeId
        ? post.likes?.some(
            (like: any) => like.employeeId === employeeId,
          ) ?? false
        : false,
      likedBy: (post.likes ?? []).map((like: any) => ({
        id: like.employee.id,
        name: like.employee.name,
        loginId: like.employee.loginId,
        likedAt: like.createdAt,
      })),
    };
  }

  async create(employee: any, content: string) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.create({
      data: {
        content,
        authorId: employee.id,
        companyId: employee.companyId,
      },
      include: this.engagementInclude(),
    });

    return this.formatPost(post, employee.id);
  }

  async getFeed(employee: any, page = 1) {
    this.validateEmployee(employee);

    const limit = 10;
    const safePage = Math.max(1, page);

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { companyId: employee.companyId },
        include: this.engagementInclude(),
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * limit,
        take: limit,
      }),
      this.prisma.post.count({
        where: { companyId: employee.companyId },
      }),
    ]);

    return {
      posts: posts.map((post) =>
        this.formatPost(post, employee.id),
      ),
      total,
      page: safePage,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getMyPosts(employee: any) {
    this.validateEmployee(employee);

    const posts = await this.prisma.post.findMany({
      where: {
        authorId: employee.id,
        companyId: employee.companyId,
      },
      include: this.engagementInclude(),
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((post) =>
      this.formatPost(post, employee.id),
    );
  }

  async getOne(employee: any, id: string) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.findFirst({
      where: {
        id,
        companyId: employee.companyId,
      },
      include: this.engagementInclude(),
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.formatPost(post, employee.id);
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

    const updated = await this.prisma.post.update({
      where: { id },
      data: { content },
      include: this.engagementInclude(),
    });

    return this.formatPost(updated, employee.id);
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
    const posts = await this.prisma.post.findMany({
      where: { companyId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return posts.map((post) => ({
      ...post,
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    }));
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
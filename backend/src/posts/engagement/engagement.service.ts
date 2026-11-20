import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EngagementService {
  constructor(private readonly prisma: PrismaService) {}

  private validateEmployee(employee: any) {
    if (employee.mustChangePassword) {
      throw new ForbiddenException(
        'Change your temporary password before accessing posts',
      );
    }
  }

  private async validatePost(postId: string, employee: any) {
    this.validateEmployee(employee);

    const post = await this.prisma.post.findFirst({
      where: {
        id: postId,
        companyId: employee.companyId,
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found in your company');
    }

    return post;
  }

  // LIKE A POST
  async likePost(postId: string, employee: any) {
    await this.validatePost(postId, employee);

    try {
      await this.prisma.postLike.create({
        data: {
          postId,
          employeeId: employee.id,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('You have already liked this post');
      }

      throw error;
    }

    const likeCount = await this.prisma.postLike.count({
      where: { postId },
    });

    return {
      message: 'Post liked successfully',
      isLiked: true,
      likeCount,
    };
  }

  // UNLIKE A POST
  async unlikePost(postId: string, employee: any) {
    await this.validatePost(postId, employee);

    await this.prisma.postLike.deleteMany({
      where: {
        postId,
        employeeId: employee.id,
      },
    });

    const likeCount = await this.prisma.postLike.count({
      where: { postId },
    });

    return {
      message: 'Post unliked successfully',
      isLiked: false,
      likeCount,
    };
  }

  // GET PEOPLE WHO LIKED A POST
  async getLikes(postId: string, employee: any) {
    await this.validatePost(postId, employee);

    const likes = await this.prisma.postLike.findMany({
      where: { postId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            loginId: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      likeCount: likes.length,
      likes: likes.map((like) => ({
        employee: like.employee,
        createdAt: like.createdAt,
      })),
    };
  }

  // CREATE A COMMENT
  async createComment(
    postId: string,
    employee: any,
    content: string,
  ) {
    await this.validatePost(postId, employee);

    const comment = await this.prisma.comment.create({
      data: {
        content,
        postId,
        employeeId: employee.id,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            loginId: true,
          },
        },
      },
    });

    const commentCount = await this.prisma.comment.count({
      where: { postId },
    });

    return {
      message: 'Comment added successfully',
      comment,
      commentCount,
    };
  }

  // GET COMMENTS WITH PAGINATION
  async getComments(
    postId: string,
    employee: any,
    page = 1,
  ) {
    await this.validatePost(postId, employee);

    const limit = 10;
    const safePage = Math.max(1, page);

    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId },
        include: {
          employee: {
            select: {
              id: true,
              name: true,
              loginId: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (safePage - 1) * limit,
        take: limit,
      }),
      this.prisma.comment.count({
        where: { postId },
      }),
    ]);

    return {
      comments,
      total,
      page: safePage,
      totalPages: Math.ceil(total / limit),
    };
  }

  // EDIT OWN COMMENT
  async updateComment(
    postId: string,
    commentId: string,
    employee: any,
    content: string,
  ) {
    await this.validatePost(postId, employee);

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        employeeId: employee.id,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you cannot edit this comment',
      );
    }

    return this.prisma.comment.update({
      where: { id: commentId },
      data: { content },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            loginId: true,
          },
        },
      },
    });
  }

  // DELETE OWN COMMENT
  async deleteComment(
    postId: string,
    commentId: string,
    employee: any,
  ) {
    await this.validatePost(postId, employee);

    const comment = await this.prisma.comment.findFirst({
      where: {
        id: commentId,
        postId,
        employeeId: employee.id,
      },
    });

    if (!comment) {
      throw new NotFoundException(
        'Comment not found or you cannot delete this comment',
      );
    }

    await this.prisma.comment.delete({
      where: { id: commentId },
    });

    const commentCount = await this.prisma.comment.count({
      where: { postId },
    });

    return {
      message: 'Comment deleted successfully',
      commentCount,
    };
  }
}
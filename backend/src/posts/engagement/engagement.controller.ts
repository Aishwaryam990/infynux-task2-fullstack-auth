import {
  Controller,
  Post,
  Delete,
  Get,
  Patch,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeeAuthGuard } from '../../employees/employee-auth.guard';
import { EngagementService } from './engagement.service';
import { CreateCommentDto } from '../dto/create-comment.dto';

interface EmployeeRequest extends Request {
  employee: {
    id: string;
    companyId: string;
    name: string;
    mustChangePassword: boolean;
  };
}

@Controller('api/posts/:postId')
@UseGuards(EmployeeAuthGuard)
export class EngagementController {
  constructor(
    private readonly engagementService: EngagementService,
  ) {}

  @Post('like')
  like(
    @Param('postId') postId: string,
    @Req() req: EmployeeRequest,
  ) {
    return this.engagementService.likePost(
      postId,
      req.employee,
    );
  }

  @Delete('like')
  unlike(
    @Param('postId') postId: string,
    @Req() req: EmployeeRequest,
  ) {
    return this.engagementService.unlikePost(
      postId,
      req.employee,
    );
  }

  @Get('likes')
  getLikes(
    @Param('postId') postId: string,
    @Req() req: EmployeeRequest,
  ) {
    return this.engagementService.getLikes(
      postId,
      req.employee,
    );
  }

  @Post('comments')
  createComment(
    @Param('postId') postId: string,
    @Req() req: EmployeeRequest,
    @Body() dto: CreateCommentDto,
  ) {
    return this.engagementService.createComment(
      postId,
      req.employee,
      dto.content,
    );
  }

  @Get('comments')
  getComments(
    @Param('postId') postId: string,
    @Req() req: EmployeeRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe)
    page: number,
  ) {
    return this.engagementService.getComments(
      postId,
      req.employee,
      page,
    );
  }

  @Patch('comments/:commentId')
  updateComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Req() req: EmployeeRequest,
    @Body() dto: CreateCommentDto,
  ) {
    return this.engagementService.updateComment(
      postId,
      commentId,
      req.employee,
      dto.content,
    );
  }

  @Delete('comments/:commentId')
  deleteComment(
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
    @Req() req: EmployeeRequest,
  ) {
    return this.engagementService.deleteComment(
      postId,
      commentId,
      req.employee,
    );
  }
}
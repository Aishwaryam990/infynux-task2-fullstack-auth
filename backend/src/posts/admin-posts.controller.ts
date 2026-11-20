import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CompanyAuthGuard } from '../companies/company-auth.guard';
import { PostsService } from './posts.service';

interface CompanyRequest extends Request {
  company: {
    id: string;
    name: string;
  };
}

@Controller('api/admin/posts')
@UseGuards(CompanyAuthGuard)
export class AdminPostsController {
  constructor(private readonly postsService: PostsService) {}

  @Get()
  getPosts(@Req() req: CompanyRequest) {
    return this.postsService.adminFeed(req.company.id);
  }

  @Delete(':id')
  deletePost(@Req() req: CompanyRequest, @Param('id') id: string) {
    return this.postsService.adminDelete(req.company.id, id);
  }
}
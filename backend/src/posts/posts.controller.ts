import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeeAuthGuard } from '../employees/employee-auth.guard';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

interface EmployeeRequest extends Request {
  employee: {
    id: string;
    companyId: string;
    name: string;
    mustChangePassword: boolean;
  };
}

@Controller('api/posts')
@UseGuards(EmployeeAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  create(@Req() req: EmployeeRequest, @Body() dto: CreatePostDto) {
    return this.postsService.create(req.employee, dto.content);
  }

  @Get()
  feed(
    @Req() req: EmployeeRequest,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
  ) {
    return this.postsService.getFeed(req.employee.companyId, Math.max(1, page));
  }

  @Get('my')
  myPosts(@Req() req: EmployeeRequest) {
    return this.postsService.getMyPosts(req.employee);
  }

  @Patch(':id')
  update(
    @Req() req: EmployeeRequest,
    @Param('id') id: string,
    @Body() dto: CreatePostDto,
  ) {
    return this.postsService.update(req.employee, id, dto.content);
  }

  @Delete(':id')
  delete(@Req() req: EmployeeRequest, @Param('id') id: string) {
    return this.postsService.deleteOwn(req.employee, id);
  }
}
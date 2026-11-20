import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { CompanyAuthController } from './company-auth.controller';
import { CompanyAuthService } from './company-auth.service';
import { CompanyAuthGuard } from './company-auth.guard';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

import { EmployeeController } from '../employees/employee.controller';
import { EmployeeAuthService } from '../employees/employee-auth.service';
import { EmployeeAuthGuard } from '../employees/employee-auth.guard';
import { EmployeeManagementService } from '../employees/employee-management.service';

import { PostsController } from '../posts/posts.controller';
import { AdminPostsController } from '../posts/admin-posts.controller';
import { PostsService } from '../posts/posts.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [
    CompanyAuthController,
    CompanyController,
    EmployeeController,
    PostsController,
    AdminPostsController,
  ],
  providers: [
    CompanyAuthService,
    CompanyAuthGuard,
    CompanyService,
    EmployeeAuthService,
    EmployeeAuthGuard,
    EmployeeManagementService,
    PostsService,
  ],
})
export class CompanyAuthModule {}
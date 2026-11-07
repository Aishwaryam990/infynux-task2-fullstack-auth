import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { EmployeeAuthService } from './employee-auth.service';
import { EmployeeAuthGuard } from './employee-auth.guard';
import { EmployeeLoginDto } from './dto/employee-login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { EmployeeManagementService } from './employee-management.service';

interface EmployeeRequest extends Request {
  employee: {
    id: string;
    companyId: string;
    name: string;
    email: string;
    status: string;
    mustChangePassword: boolean;
  };
}

@Controller('api/employees')
export class EmployeeController {
  constructor(
    private readonly authService: EmployeeAuthService,
    private readonly managementService: EmployeeManagementService,
  ) {}

  @Post('auth/login')
  login(@Body() dto: EmployeeLoginDto) {
    return this.authService.login(dto.loginId, dto.password);
  }

  @Post('auth/change-password')
  @UseGuards(EmployeeAuthGuard)
  changePassword(
    @Req() request: EmployeeRequest,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(request.employee.id, dto);
  }

  @Get('me')
  @UseGuards(EmployeeAuthGuard)
  async getProfile(@Req() request: EmployeeRequest) {
    if (request.employee.mustChangePassword) {
      throw new BadRequestException(
        'Please change your temporary password before accessing your dashboard',
      );
    }

    return {
      message: 'Employee profile retrieved successfully',
      employee: await this.managementService.getEmployeeProfile(
        request.employee.id,
      ),
    };
  }
}
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Param,
} from '@nestjs/common';
import { Request } from 'express';
import { CompanyAuthGuard } from './company-auth.guard';
import { CompanyService } from './company.service';
import { EmployeeManagementService } from '../employees/employee-management.service';
import { CreateEmployeeDto } from '../employees/dto/create-employee.dto';

interface CompanyRequest extends Request {
  company: {
    id: string;
    name: string;
    email: string;
    username: string;
  };
}

@Controller('api/companies')
@UseGuards(CompanyAuthGuard)
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly employeeService: EmployeeManagementService,
  ) {}

  @Get('dashboard')
  getDashboard(@Req() request: CompanyRequest) {
    return this.companyService.getDashboard(request.company.id);
  }

  @Post('employees')
  createEmployee(
    @Req() request: CompanyRequest,
    @Body() dto: CreateEmployeeDto,
  ) {
    return this.employeeService.createEmployee(request.company.id, dto);
  }

  @Get('employees')
  getEmployees(@Req() request: CompanyRequest) {
    return this.employeeService.getEmployees(request.company.id);
  }

  @Post('employees/:loginId/reset-password')
  resetEmployeePassword(
    @Req() request: CompanyRequest,
    @Param('loginId') loginId: string,
  ) {
    return this.employeeService.resetEmployeePassword(
      request.company.id,
      loginId,
    );
  }
}
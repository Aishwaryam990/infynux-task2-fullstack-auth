import {
  Controller,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { CompanyAuthGuard } from './company-auth.guard';
import { CompanyService } from './company.service';

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
  constructor(private readonly companyService: CompanyService) {}

  @Get('dashboard')
  getDashboard(@Req() request: CompanyRequest) {
    return this.companyService.getDashboard(request.company.id);
  }
}
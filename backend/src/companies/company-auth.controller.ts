import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';

import { CompanyAuthService } from './company-auth.service';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';

@Controller('api/companies/auth')
export class CompanyAuthController {
  constructor(
    private readonly companyAuthService: CompanyAuthService,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CompanyRegisterDto) {
    return this.companyAuthService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: CompanyLoginDto) {
    return this.companyAuthService.login(dto);
  }
}
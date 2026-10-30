import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { CompanyRegisterDto } from './dto/company-register.dto';
import { CompanyLoginDto } from './dto/company-login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CompanyAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CompanyRegisterDto) {
    const name = dto.name.trim();
    const email = dto.email.trim().toLowerCase();
    const username = dto.username.trim().toLowerCase();

    const existingCompany = await this.prisma.company.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
      select: {
        email: true,
        username: true,
      },
    });

    if (existingCompany?.email === email) {
      throw new ConflictException('Email is already registered');
    }

    if (existingCompany?.username === username) {
      throw new ConflictException('Company username is already taken');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    try {
      const company = await this.prisma.company.create({
        data: {
          name,
          email,
          username,
          passwordHash,
        },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          createdAt: true,
        },
      });

      return {
        message: 'Company registration successful',
        company,
      };
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          'Company email or username is already registered',
        );
      }

      throw error;
    }
  }

  async login(dto: CompanyLoginDto) {
    const email = dto.email.trim().toLowerCase();

    const company = await this.prisma.company.findUnique({
      where: { email },
    });

    if (
      !company ||
      !(await bcrypt.compare(dto.password, company.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: company.id,
      email: company.email,
      type: 'company',
    });

    return {
      message: 'Company login successful',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        username: company.username,
        createdAt: company.createdAt,
      },
    };
  }
}
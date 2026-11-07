import {
  ConflictException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmployeeDto } from './dto/create-employee.dto';

@Injectable()
export class EmployeeManagementService {
  constructor(private readonly prisma: PrismaService) {}

  async createEmployee(companyId: string, dto: CreateEmployeeDto) {
    const email = dto.email.trim().toLowerCase();
    const name = dto.name.trim();

    const existing = await this.prisma.employee.findUnique({
      where: { companyId_email: { companyId, email } },
    });

    if (existing) {
      throw new ConflictException(
        'An employee with this email already exists in your company',
      );
    }

    const loginId = `EMP-${randomBytes(5).toString('hex').toUpperCase()}`;
    const temporaryPassword = randomBytes(12).toString('base64url');
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    try {
      const employee = await this.prisma.employee.create({
        data: {
          companyId,
          name,
          email,
          loginId,
          passwordHash,
          status: 'ACTIVE',
          mustChangePassword: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          loginId: true,
          status: true,
          createdAt: true,
        },
      });

      return {
        message: 'Employee account created successfully',
        employee,
        credentials: { loginId, temporaryPassword },
      };
    } catch (error) {
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Unable to create employee. Please retry.');
      }
      throw error;
    }
  }

  async resetEmployeePassword(companyId: string, loginId: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { companyId, loginId },
    });

    if (!employee) {
      throw new NotFoundException('Employee not found in your company');
    }

    const temporaryPassword = randomBytes(12).toString('base64url');
    const passwordHash = await bcrypt.hash(temporaryPassword, 12);

    await this.prisma.employee.update({
      where: { id: employee.id },
      data: {
        passwordHash,
        mustChangePassword: true,
      },
    });

    return {
      message: 'Employee password reset successfully',
      credentials: {
        loginId: employee.loginId,
        temporaryPassword,
      },
    };
  }

  async getEmployees(companyId: string) {
    const employees = await this.prisma.employee.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        loginId: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
      },
    });

    return { count: employees.length, employees };
  }

  async getEmployeeProfile(employeeId: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
      select: {
        id: true,
        name: true,
        email: true,
        loginId: true,
        status: true,
        mustChangePassword: true,
        createdAt: true,
        company: { select: { id: true, name: true } },
      },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Employee account is unavailable');
    }

    return employee;
  }
}
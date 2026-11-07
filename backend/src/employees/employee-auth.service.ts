import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class EmployeeAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginId: string, password: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { loginId: loginId.trim() },
    });

    if (
      !employee ||
      employee.status !== 'ACTIVE' ||
      !(await bcrypt.compare(password, employee.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid login ID or password');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: employee.id,
      companyId: employee.companyId,
      type: 'employee',
    });

    return {
      message: 'Employee login successful',
      accessToken,
      tokenType: 'Bearer',
      expiresIn: '15m',
      mustChangePassword: employee.mustChangePassword,
    };
  }

  async changePassword(
    employeeId: string,
    dto: ChangePasswordDto,
  ) {
    const employee = await this.prisma.employee.findUnique({
      where: { id: employeeId },
    });

    if (!employee || employee.status !== 'ACTIVE') {
      throw new UnauthorizedException('Employee account is unavailable');
    }

    const validPassword = await bcrypt.compare(
      dto.currentPassword,
      employee.passwordHash,
    );

    if (!validPassword) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    if (dto.currentPassword === dto.newPassword) {
      throw new BadRequestException(
        'New password must be different from current password',
      );
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.employee.update({
      where: { id: employeeId },
      data: {
        passwordHash,
        mustChangePassword: false,
      },
    });

    return {
      message: 'Password changed successfully. You can now access your dashboard.',
    };
  }
}
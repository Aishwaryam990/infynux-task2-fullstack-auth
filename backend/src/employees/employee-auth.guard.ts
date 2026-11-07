import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EmployeeAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Employee authentication required');
    }

    try {
      const token = authorization.substring(7);

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      if (payload.type !== 'employee' || typeof payload.sub !== 'string') {
        throw new UnauthorizedException('Invalid employee token');
      }

      const employee = await this.prisma.employee.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          companyId: true,
          name: true,
          email: true,
          status: true,
          mustChangePassword: true,
        },
      });

      if (!employee || employee.status !== 'ACTIVE') {
        throw new UnauthorizedException('Employee account unavailable');
      }

      request.employee = employee;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired employee token');
    }
  }
}
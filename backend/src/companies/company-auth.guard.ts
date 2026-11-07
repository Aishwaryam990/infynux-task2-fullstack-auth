import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompanyAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (
      typeof authorization !== 'string' ||
      !authorization.startsWith('Bearer ')
    ) {
      throw new UnauthorizedException(
        'Company authentication token is required',
      );
    }

    const token = authorization.slice(7).trim();

    if (!token) {
      throw new UnauthorizedException(
        'Company authentication token is required',
      );
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);

      if (
        typeof payload.sub !== 'string' ||
        payload.type !== 'company'
      ) {
        throw new Error('Invalid company token');
      }

      const company = await this.prisma.company.findUnique({
        where: { id: payload.sub },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
        },
      });

      if (!company) {
        throw new Error('Company no longer exists');
      }

      request.company = company;

      return true;
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired company authentication token',
      );
    }
  }
}
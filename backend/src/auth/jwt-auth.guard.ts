import {
CanActivate,
ExecutionContext,
Injectable,
UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
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
    'Authentication token is required',
  );
}

const token = authorization.slice(7).trim();

if (!token) {
  throw new UnauthorizedException(
    'Authentication token is required',
  );
}

try {
  const payload = await this.jwtService.verifyAsync(token);

  if (
    typeof payload.sub !== 'string' ||
    payload.sub.length === 0
  ) {
    throw new Error('Invalid token subject');
  }

  const user = await this.prisma.user.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
    },
  });

  if (!user) {
    throw new Error('User no longer exists');
  }

  request.user = {
    id: user.id,
    email: user.email,
  };

  return true;
} catch {
  throw new UnauthorizedException(
    'Invalid or expired authentication token',
  );
}

}
}

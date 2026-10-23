import {
CanActivate,
ExecutionContext,
Injectable,
UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard implements CanActivate {
constructor(private readonly jwtService: JwtService) {}

async canActivate(context: ExecutionContext): Promise<boolean> {
const request = context.switchToHttp().getRequest();
const authorization = request.headers.authorization;

if (!authorization || !authorization.startsWith('Bearer ')) {
  throw new UnauthorizedException('Authentication token is required');
}

const token = authorization.slice(7).trim();

if (!token) {
  throw new UnauthorizedException('Authentication token is required');
}

try {
  const payload = await this.jwtService.verifyAsync(token);

  if (!payload.sub || typeof payload.sub !== 'string') {
    throw new UnauthorizedException('Invalid authentication token');
  }

  request.user = {
    id: payload.sub,
    email: payload.email,
  };

  return true;
} catch {
  throw new UnauthorizedException(
    'Invalid or expired authentication token',
  );
}
}
}

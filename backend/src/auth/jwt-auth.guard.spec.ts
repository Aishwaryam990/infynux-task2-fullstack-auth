import {
ExecutionContext,
UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

describe('JwtAuthGuard', () => {
let guard: JwtAuthGuard;

const jwtMock = {
verifyAsync: jest.fn(),
};

const prismaMock = {
user: {
findUnique: jest.fn(),
},
};

const makeContext = (authorization?: string) => {
const request: any = {
headers: {},
user: undefined,
};

if (authorization !== undefined) {
  request.headers.authorization = authorization;
}

const context = {
  switchToHttp: () => ({
    getRequest: () => request,
  }),
} as ExecutionContext;

return { context, request };

};

beforeEach(async () => {
jest.clearAllMocks();

const module: TestingModule = await Test.createTestingModule({
  providers: [
    JwtAuthGuard,
    { provide: JwtService, useValue: jwtMock },
    { provide: PrismaService, useValue: prismaMock },
  ],
}).compile();

guard = module.get<JwtAuthGuard>(JwtAuthGuard);

});

it('rejects a missing authorization header', async () => {
const { context } = makeContext();

await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
  UnauthorizedException,
);

});

it('rejects a malformed authorization header', async () => {
const { context } = makeContext('Basic abc123');

await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
  UnauthorizedException,
);

});

it('rejects an invalid or expired token', async () => {
jwtMock.verifyAsync.mockRejectedValue(new Error('Token expired'));

const { context } = makeContext('Bearer invalid-token');

await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
  UnauthorizedException,
);

});

it('rejects a token when its user no longer exists', async () => {
jwtMock.verifyAsync.mockResolvedValue({
sub: 'deleted-user',
email: '[deleted@example.com](mailto:deleted@example.com)',
});

prismaMock.user.findUnique.mockResolvedValue(null);

const { context } = makeContext('Bearer valid-format-token');

await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
  UnauthorizedException,
);

});

it('accepts a valid token for an existing user', async () => {
jwtMock.verifyAsync.mockResolvedValue({
sub: 'user-1',
email: '[old@example.com](mailto:old@example.com)',
});

prismaMock.user.findUnique.mockResolvedValue({
  id: 'user-1',
  email: 'user@example.com',
});

const { context, request } = makeContext('Bearer valid-token');

await expect(guard.canActivate(context)).resolves.toBe(true);

expect(request.user).toEqual({
  id: 'user-1',
  email: 'user@example.com',
});

});
});

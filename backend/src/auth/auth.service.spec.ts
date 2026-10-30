import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
hash: jest.fn(),
compare: jest.fn(),
}));

describe('AuthService', () => {
let service: AuthService;

const prismaMock = {
user: {
findUnique: jest.fn(),
create: jest.fn(),
},
};

const jwtMock = {
signAsync: jest.fn(),
};

beforeEach(async () => {
jest.clearAllMocks();

const module: TestingModule = await Test.createTestingModule({
  providers: [
    AuthService,
    { provide: PrismaService, useValue: prismaMock },
    { provide: JwtService, useValue: jwtMock },
  ],
}).compile();

service = module.get<AuthService>(AuthService);

});

it('registers a user and hashes the password', async () => {
prismaMock.user.findUnique.mockResolvedValue(null);
(bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

const createdUser = {
  id: 'user-1',
  name: 'Aishwarya',
  email: 'aishwarya@example.com',
  createdAt: new Date(),
};

prismaMock.user.create.mockResolvedValue(createdUser);

const result = await service.register({
  name: ' Aishwarya ',
  email: ' AISHWARYA@example.com ',
  password: 'StrongPass1!',
});

expect(bcrypt.hash).toHaveBeenCalledWith('StrongPass1!', 12);
expect(prismaMock.user.create).toHaveBeenCalledWith(
  expect.objectContaining({
    data: {
      name: 'Aishwarya',
      email: 'aishwarya@example.com',
      passwordHash: 'hashed-password',
    },
  }),
);
expect(result.user).toEqual(createdUser);

});

it('rejects registration when the email already exists', async () => {
prismaMock.user.findUnique.mockResolvedValue({
id: 'existing-user',
});

await expect(
  service.register({
    name: 'Aishwarya',
    email: 'aishwarya@example.com',
    password: 'StrongPass1!',
  }),
).rejects.toBeInstanceOf(ConflictException);

expect(prismaMock.user.create).not.toHaveBeenCalled();

});

it('logs in successfully and returns an access token', async () => {
prismaMock.user.findUnique.mockResolvedValue({
id: 'user-1',
name: 'Aishwarya',
email: '[aishwarya@example.com](mailto:aishwarya@example.com)',
passwordHash: 'hashed-password',
createdAt: new Date(),
});

(bcrypt.compare as jest.Mock).mockResolvedValue(true);
jwtMock.signAsync.mockResolvedValue('test-access-token');

const result = await service.login({
  email: ' AISHWARYA@example.com ',
  password: 'StrongPass1!',
});

expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
  where: { email: 'aishwarya@example.com' },
});
expect(result.accessToken).toBe('test-access-token');
expect(result.expiresIn).toBe('15m');

});

it('rejects login when the email does not exist', async () => {
prismaMock.user.findUnique.mockResolvedValue(null);

await expect(
  service.login({
    email: 'unknown@example.com',
    password: 'StrongPass1!',
  }),
).rejects.toBeInstanceOf(UnauthorizedException);

expect(bcrypt.compare).not.toHaveBeenCalled();

});

it('rejects login when the password is incorrect', async () => {
prismaMock.user.findUnique.mockResolvedValue({
id: 'user-1',
email: '[aishwarya@example.com](mailto:aishwarya@example.com)',
passwordHash: 'hashed-password',
});

(bcrypt.compare as jest.Mock).mockResolvedValue(false);

await expect(
  service.login({
    email: 'aishwarya@example.com',
    password: 'WrongPass1!',
  }),
).rejects.toBeInstanceOf(UnauthorizedException);

});
});

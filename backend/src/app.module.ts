import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CompanyAuthModule } from './companies/company-auth.module';

function validateEnvironment(config: Record<string, unknown>) {
  const secret = config.JWT_SECRET;
  const databaseUrl = config.DATABASE_URL;

  if (typeof secret !== 'string' || secret.length < 32) {
    throw new Error(
      'JWT_SECRET must be configured and contain at least 32 characters.',
    );
  }

  if (typeof databaseUrl !== 'string' || !databaseUrl.trim()) {
    throw new Error('DATABASE_URL must be configured.');
  }

  return config;
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnvironment,
    }),

    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),

    PrismaModule,
    AuthModule,
    UsersModule,
    CompanyAuthModule,
  ],

  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
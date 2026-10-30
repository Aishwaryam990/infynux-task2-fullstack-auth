import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

import { PrismaModule } from '../prisma/prisma.module';

import { CompanyAuthController } from './company-auth.controller';
import { CompanyAuthService } from './company-auth.service';
import { CompanyAuthGuard } from './company-auth.guard';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: '15m',
        },
      }),
    }),
  ],
  controllers: [
    CompanyAuthController,
    CompanyController,
  ],
  providers: [
    CompanyAuthService,
    CompanyAuthGuard,
    CompanyService,
  ],
})
export class CompanyAuthModule {}
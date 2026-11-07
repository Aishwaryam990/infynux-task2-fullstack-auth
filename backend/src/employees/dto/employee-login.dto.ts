import { IsString, MinLength } from 'class-validator';

export class EmployeeLoginDto {
  @IsString()
  @MinLength(1)
  loginId: string;

  @IsString()
  @MinLength(1)
  password: string;
}
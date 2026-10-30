import {
IsEmail,
IsNotEmpty,
IsString,
MaxLength,
MinLength,
Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
@Transform(({ value }) =>
typeof value === 'string' ? value.trim() : value,
)
@IsString()
@IsNotEmpty()
@MaxLength(100)
name: string;

@Transform(({ value }) =>
typeof value === 'string' ? value.trim().toLowerCase() : value,
)
@IsEmail()
@IsNotEmpty()
@MaxLength(255)
email: string;

@IsString()
@MinLength(8)
@MaxLength(72)
@Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
message:
'Password must contain an uppercase letter, a lowercase letter, a number, and a special character',
})
password: string;
}

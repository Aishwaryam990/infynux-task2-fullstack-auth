import { Transform } from 'class-transformer';
import { IsString, Length } from 'class-validator';

export class CreateCommentDto {
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @Length(1, 1000)
  content: string;
}
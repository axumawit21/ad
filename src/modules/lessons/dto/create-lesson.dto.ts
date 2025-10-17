import { IsString, IsOptional, IsMongoId } from 'class-validator';

export class CreateLessonDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  user: string; // user ID who owns the lesson
}

import { IsString, IsEmail, MinLength } from 'class-validator';

export class UpdateUserDto {
    @IsString()
    name: string;

    @IsEmail()
    email: string;

    @MinLength(6)
    password: string;
}

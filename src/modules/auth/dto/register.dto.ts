import { IsEmail, IsEnum, IsNotEmpty, IsOptional, Matches, MaxLength, MinLength } from "class-validator";
import { UserRole } from "../../users/entities/user.entity";

export class RegisterDto {
    @IsOptional()
    @MinLength(3)
    @MaxLength(100)
    name?: string;

    @IsNotEmpty()
    @IsEmail()
    @MaxLength(100)
    email: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(100)
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, { message: 'Password too weak' })
    password: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;
}

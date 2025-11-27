import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto{
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  firstName?: string;

  @IsString()
  lastName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
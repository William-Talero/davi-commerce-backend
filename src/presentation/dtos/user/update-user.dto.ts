import { IsString, IsEmail, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../domain/entities/user.entity';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
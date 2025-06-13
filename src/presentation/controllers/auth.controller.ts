import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { LoginUserUseCase } from '../../domain/use-cases/auth/login-user.use-case';
import { RegisterUserUseCase, RegisterUserResponse } from '../../domain/use-cases/auth/register-user.use-case';
import { LoginDto } from '../dtos/auth/login.dto';
import { RegisterDto } from '../dtos/auth/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly registerUserUseCase: RegisterUserUseCase,
  ) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    try {
      const result = await this.loginUserUseCase.execute(loginDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Login failed',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto): Promise<{success: boolean, data: RegisterUserResponse}> {
    try {
      const result = await this.registerUserUseCase.execute(registerDto);
      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const status = error.status || HttpStatus.BAD_REQUEST;
      throw new HttpException(
        {
          success: false,
          message: error.message || 'Registration failed',
        },
        status,
      );
    }
  }
}
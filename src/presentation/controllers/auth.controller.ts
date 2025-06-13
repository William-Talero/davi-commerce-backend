import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { LoginUserUseCase } from '../../domain/use-cases/auth/login-user.use-case';
import { LoginDto } from '../dtos/auth/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUserUseCase: LoginUserUseCase) {}

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
}
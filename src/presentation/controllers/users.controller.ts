import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { INJECTION_TOKENS } from '../../shared/constants/injection-tokens';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { UpdateUserDto } from '../dtos/user/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
  ) {}

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async getAllUsers(@Request() req) {
    try {
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can view all users',
          HttpStatus.FORBIDDEN,
        );
      }

      return await this.userRepository.findAll();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getCurrentUser(@Request() req) {
    try {
      const user = await this.userRepository.findById(req.user.id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  async getUserById(@Param('id') id: string, @Request() req) {
    try {
      if (req.user.id !== id && req.user.role !== 'admin') {
        throw new HttpException(
          'Unauthorized access to user profile',
          HttpStatus.FORBIDDEN,
        );
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const { passwordHash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to fetch user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('me')
  @UseGuards(AuthGuard('jwt'))
  async updateCurrentUser(
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    try {
      if (updateUserDto.role && req.user.role !== 'admin') {
        throw new HttpException(
          'Users cannot change their own role',
          HttpStatus.FORBIDDEN,
        );
      }

      const updatedUser = await this.userRepository.update(
        req.user.id,
        updateUserDto,
      );

      if (!updatedUser) {
        throw new HttpException(
          'Failed to update user profile',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user profile',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'))
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req,
  ) {
    try {
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can update other users',
          HttpStatus.FORBIDDEN,
        );
      }

      const existingUser = await this.userRepository.findById(id);

      if (!existingUser) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const updatedUser = await this.userRepository.update(id, updateUserDto);

      if (!updatedUser) {
        throw new HttpException(
          'Failed to update user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      const { passwordHash, ...userWithoutPassword } = updatedUser;
      return userWithoutPassword;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to update user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  async deleteUser(@Param('id') id: string, @Request() req) {
    try {
      if (req.user.role !== 'admin') {
        throw new HttpException(
          'Only administrators can delete users',
          HttpStatus.FORBIDDEN,
        );
      }

      if (req.user.id === id) {
        throw new HttpException(
          'Administrators cannot delete themselves',
          HttpStatus.BAD_REQUEST,
        );
      }

      const user = await this.userRepository.findById(id);

      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      const deleted = await this.userRepository.delete(id);

      if (!deleted) {
        throw new HttpException(
          'Failed to delete user',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }

      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Failed to delete user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}

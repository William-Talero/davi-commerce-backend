import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUserUseCase } from '../../domain/use-cases/auth/login-user.use-case';
import { UnauthorizedException } from '@nestjs/common';
import { UserRole } from '../../domain/entities/user.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let loginUserUseCase: jest.Mocked<LoginUserUseCase>;

  const mockLoginUserUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUserUseCase,
          useValue: mockLoginUserUseCase,
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    loginUserUseCase = module.get(LoginUserUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should return user and access token on successful login', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: UserRole.CUSTOMER,
        },
        accessToken: 'jwt-token-123',
      };

      mockLoginUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(loginUserUseCase.execute).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      mockLoginUserUseCase.execute.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow();
      expect(loginUserUseCase.execute).toHaveBeenCalledWith(loginDto);
    });

    it('should handle admin user login', async () => {
      const loginDto = {
        email: 'admin@example.com',
        password: 'adminpassword',
      };

      const expectedResult = {
        user: {
          id: 'admin-123',
          email: 'admin@example.com',
          firstName: 'Admin',
          lastName: 'User',
          role: UserRole.ADMIN,
        },
        accessToken: 'admin-jwt-token-123',
      };

      mockLoginUserUseCase.execute.mockResolvedValue(expectedResult);

      const result = await authController.login(loginDto);

      expect(result.data.user.role).toBe(UserRole.ADMIN);
      expect(result).toEqual({
        success: true,
        data: expectedResult,
      });
    });

    it('should handle empty email', async () => {
      const loginDto = {
        email: '',
        password: 'password123',
      };

      mockLoginUserUseCase.execute.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow();
    });

    it('should handle empty password', async () => {
      const loginDto = {
        email: 'test@example.com',
        password: '',
      };

      mockLoginUserUseCase.execute.mockRejectedValue(
        new Error('Invalid credentials'),
      );

      await expect(authController.login(loginDto)).rejects.toThrow();
    });
  });
});
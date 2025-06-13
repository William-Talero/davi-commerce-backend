import { Test, TestingModule } from '@nestjs/testing';
import { LoginUserUseCase } from './login-user.use-case';
import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { IPasswordService } from '../../../shared/interfaces/password.service.interface';
import { IJwtService } from '../../../shared/interfaces/jwt.service.interface';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';
import { User, UserRole } from '../../entities/user.entity';

describe('LoginUserUseCase', () => {
  let loginUserUseCase: LoginUserUseCase;
  let userRepository: jest.Mocked<UserRepositoryInterface>;
  let passwordService: jest.Mocked<IPasswordService>;
  let jwtService: jest.Mocked<IJwtService>;

  const mockUser = new User(
    'user-123',
    'test@example.com',
    'John',
    'Doe',
    'hashedpassword123',
    UserRole.CUSTOMER,
    new Date(),
    new Date(),
  );

  beforeEach(async () => {
    const mockUserRepository = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
    };

    const mockPasswordService = {
      hash: jest.fn(),
      compare: jest.fn(),
    };

    const mockJwtService = {
      generateToken: jest.fn(),
      verifyToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginUserUseCase,
        {
          provide: INJECTION_TOKENS.USER_REPOSITORY,
          useValue: mockUserRepository,
        },
        {
          provide: INJECTION_TOKENS.PASSWORD_SERVICE,
          useValue: mockPasswordService,
        },
        {
          provide: INJECTION_TOKENS.JWT_SERVICE,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    loginUserUseCase = module.get<LoginUserUseCase>(LoginUserUseCase);
    userRepository = module.get(INJECTION_TOKENS.USER_REPOSITORY);
    passwordService = module.get(INJECTION_TOKENS.PASSWORD_SERVICE);
    jwtService = module.get(INJECTION_TOKENS.JWT_SERVICE);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';
      const expectedToken = 'jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(true);
      jwtService.generateToken.mockResolvedValue(expectedToken);

      const result = await loginUserUseCase.execute({ email, password });

      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(jwtService.generateToken).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
      expect(result).toEqual({
        user: mockUser,
        accessToken: expectedToken,
      });
    });

    it('should throw UnauthorizedException when user not found', async () => {
      const email = 'nonexistent@example.com';
      const password = 'password123';

      userRepository.findByEmail.mockResolvedValue(null);

      await expect(loginUserUseCase.execute({ email, password })).rejects.toThrow(
        Error,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.compare).not.toHaveBeenCalled();
      expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      userRepository.findByEmail.mockResolvedValue(mockUser);
      passwordService.compare.mockResolvedValue(false);

      await expect(loginUserUseCase.execute({ email, password })).rejects.toThrow(
        Error,
      );
      expect(userRepository.findByEmail).toHaveBeenCalledWith(email);
      expect(passwordService.compare).toHaveBeenCalledWith(password, mockUser.passwordHash);
      expect(jwtService.generateToken).not.toHaveBeenCalled();
    });

    it('should handle admin user login', async () => {
      const adminUser = new User(
        'admin-123',
        'admin@example.com',
        'Admin',
        'User',
        'hashedpassword123',
        UserRole.ADMIN,
        new Date(),
        new Date(),
      );
      const email = 'admin@example.com';
      const password = 'adminpassword';
      const expectedToken = 'admin-jwt-token-123';

      userRepository.findByEmail.mockResolvedValue(adminUser);
      passwordService.compare.mockResolvedValue(true);
      jwtService.generateToken.mockResolvedValue(expectedToken);

      const result = await loginUserUseCase.execute({ email, password });

      expect(result.user.role).toBe(UserRole.ADMIN);
      expect(jwtService.generateToken).toHaveBeenCalledWith({
        sub: adminUser.id,
        email: adminUser.email,
        role: UserRole.ADMIN,
      });
    });
  });
});
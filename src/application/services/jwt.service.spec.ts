import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtCustomService } from './jwt.service';

describe('JwtCustomService', () => {
  let jwtCustomService: JwtCustomService;
  let jwtService: JwtService;

  const mockJwtService = {
    signAsync: jest.fn(),
    verifyAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtCustomService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    jwtCustomService = module.get<JwtCustomService>(JwtCustomService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a token with correct payload', async () => {
      const payload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };
      const expectedToken = 'mock-jwt-token';

      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await jwtCustomService.generateToken(payload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });

    it('should handle admin role', async () => {
      const payload = {
        sub: 'admin-123',
        email: 'admin@example.com',
        role: 'admin',
      };
      const expectedToken = 'admin-jwt-token';

      mockJwtService.signAsync.mockResolvedValue(expectedToken);

      const result = await jwtCustomService.generateToken(payload);

      expect(mockJwtService.signAsync).toHaveBeenCalledWith(payload);
      expect(result).toBe(expectedToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', async () => {
      const token = 'valid-jwt-token';
      const expectedPayload = {
        sub: 'user-123',
        email: 'test@example.com',
        role: 'user',
      };

      mockJwtService.verifyAsync.mockResolvedValue(expectedPayload);

      const result = await jwtCustomService.verifyToken(token);

      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(token);
      expect(result).toEqual(expectedPayload);
    });

    it('should throw error for invalid token', async () => {
      const invalidToken = 'invalid-jwt-token';
      const error = new Error('Invalid token');

      mockJwtService.verifyAsync.mockRejectedValue(error);

      await expect(jwtCustomService.verifyToken(invalidToken)).rejects.toThrow('Invalid token');
      expect(mockJwtService.verifyAsync).toHaveBeenCalledWith(invalidToken);
    });
  });
});
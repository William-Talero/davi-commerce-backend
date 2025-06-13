import { PasswordService } from './password.service';

describe('PasswordService', () => {
  let passwordService: PasswordService;

  beforeEach(() => {
    passwordService = new PasswordService();
  });

  describe('hash', () => {
    it('should hash a password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await passwordService.hash(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testpassword123';
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('compare', () => {
    it('should return true for correct password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await passwordService.hash(password);

      const isValid = await passwordService.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'testpassword123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await passwordService.hash(password);

      const isValid = await passwordService.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });

    it('should return false for empty password', async () => {
      const password = 'testpassword123';
      const hashedPassword = await passwordService.hash(password);

      const isValid = await passwordService.compare('', hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});
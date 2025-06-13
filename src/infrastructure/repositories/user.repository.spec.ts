import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepository } from './user.repository';
import { UserEntity } from '../database/entities/user.entity';
import { User, UserRole } from '../../domain/entities/user.entity';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let typeormRepository: jest.Mocked<Repository<UserEntity>>;

  const mockUserEntity: UserEntity = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    passwordHash: 'hashedpassword123',
    role: UserRole.CUSTOMER,
    orders: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockTypeormRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockTypeormRepository,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    typeormRepository = module.get(getRepositoryToken(UserEntity));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await userRepository.findByEmail('test@example.com');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.email).toBe('test@example.com');
    });

    it('should return null when user not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user when found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(mockUserEntity);

      const result = await userRepository.findById('user-123');

      expect(typeormRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(result).toBeInstanceOf(User);
      expect(result?.id).toBe('user-123');
    });

    it('should return null when user not found', async () => {
      mockTypeormRepository.findOne.mockResolvedValue(null);

      const result = await userRepository.findById('nonexistent-id');

      expect(result).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return array of users', async () => {
      const mockUserEntities = [mockUserEntity];
      mockTypeormRepository.find.mockResolvedValue(mockUserEntities);

      const result = await userRepository.findAll();

      expect(typeormRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(User);
    });

    it('should return empty array when no users found', async () => {
      mockTypeormRepository.find.mockResolvedValue([]);

      const result = await userRepository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create and return new user', async () => {
      const userData = {
        email: 'new@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        passwordHash: 'newhashedpassword',
        role: UserRole.CUSTOMER,
      };

      mockTypeormRepository.create.mockReturnValue(mockUserEntity);
      mockTypeormRepository.save.mockResolvedValue(mockUserEntity);

      const userDomain = new User(
        'new-id',
        userData.email,
        userData.firstName,
        userData.lastName,
        userData.passwordHash,
        userData.role,
      );

      const result = await userRepository.create(userDomain);

      expect(typeormRepository.create).toHaveBeenCalledWith({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: userData.passwordHash,
        role: userData.role,
      });
      expect(typeormRepository.save).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const updatedEntity = { ...mockUserEntity, firstName: 'Updated' };
      mockTypeormRepository.save.mockResolvedValue(updatedEntity);

      const user = new User(
        'user-123',
        'test@example.com',
        'Updated',
        'Doe',
        'hashedpassword123',
        UserRole.CUSTOMER,
      );

      mockTypeormRepository.update.mockResolvedValue({ affected: 1, raw: {}, generatedMaps: [] });
      mockTypeormRepository.findOne.mockResolvedValue(updatedEntity);

      const result = await userRepository.update('user-123', {
        firstName: 'Updated',
      });

      expect(typeormRepository.update).toHaveBeenCalled();
      expect(typeormRepository.findOne).toHaveBeenCalled();
      expect(result).toBeInstanceOf(User);
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockTypeormRepository.delete.mockResolvedValue({ affected: 1, raw: {} });

      await userRepository.delete('user-123');

      expect(typeormRepository.delete).toHaveBeenCalledWith('user-123');
    });
  });
});
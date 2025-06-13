import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRepositoryInterface } from '../../domain/repositories/user.repository.interface';
import { User } from '../../domain/entities/user.entity';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class UserRepository implements UserRepositoryInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async create(user: User): Promise<User> {
    const userEntity = this.userRepository.create({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      role: user.role,
    });

    const savedUser = await this.userRepository.save(userEntity);
    return this.toDomain(savedUser);
  }

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { id } });
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({ where: { email } });
    return userEntity ? this.toDomain(userEntity) : null;
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const updateData: Partial<UserEntity> = {};
    
    if (user.firstName) updateData.firstName = user.firstName;
    if (user.lastName) updateData.lastName = user.lastName;
    if (user.email) updateData.email = user.email;
    if (user.role) updateData.role = user.role;

    await this.userRepository.update(id, updateData);
    
    const updatedUser = await this.userRepository.findOne({ where: { id } });
    return updatedUser ? this.toDomain(updatedUser) : null;
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  async findAll(): Promise<User[]> {
    const userEntities = await this.userRepository.find();
    return userEntities.map(user => this.toDomain(user));
  }

  private toDomain(userEntity: UserEntity): User {
    return new User(
      userEntity.id,
      userEntity.email,
      userEntity.firstName,
      userEntity.lastName,
      userEntity.passwordHash,
      userEntity.role,
      userEntity.createdAt,
      userEntity.updatedAt,
    );
  }
}
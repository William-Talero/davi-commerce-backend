import { Injectable, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { UserRole } from '../../../domain/entities/user.entity';
import { IPasswordService } from '../../../shared/interfaces/password.service.interface';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

@Injectable()
export class UserSeed {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @Inject(INJECTION_TOKENS.PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
  ) {}

  async run(): Promise<void> {
    const existingUsers = await this.userRepository.count();
    
    if (existingUsers > 0) {
      console.log('Users already exist, skipping seed...');
      return;
    }

    const users = [
      {
        email: 'admin@davicommerce.com',
        firstName: 'Admin',
        lastName: 'Administrator',
        password: 'Admin123!',
        role: UserRole.ADMIN,
      },
      {
        email: 'user@davicommerce.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'User123!',
        role: UserRole.CUSTOMER,
      },
      {
        email: 'customer@davicommerce.com',
        firstName: 'Customer',
        lastName: 'Test',
        password: 'Customer123!',
        role: UserRole.CUSTOMER,
      },
    ];

    for (const userData of users) {
      const hashedPassword = await this.passwordService.hash(userData.password);
      
      const user = this.userRepository.create({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        passwordHash: hashedPassword,
        role: userData.role,
      });

      await this.userRepository.save(user);
      console.log(`✅ Created user: ${userData.email} (${userData.role})`);
    }

    console.log('🎉 User seed completed successfully!');
  }
}
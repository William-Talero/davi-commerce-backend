import { Injectable, Inject } from '@nestjs/common';
import { UserRepositoryInterface } from '../../repositories/user.repository.interface';
import { IPasswordService } from '../../../shared/interfaces/password.service.interface';
import { IJwtService } from '../../../shared/interfaces/jwt.service.interface';
import { User } from '../../entities/user.entity';
import { INJECTION_TOKENS } from '../../../shared/constants/injection-tokens';

export interface LoginUserDto {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
}

@Injectable()
export class LoginUserUseCase {
  constructor(
    @Inject(INJECTION_TOKENS.USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(INJECTION_TOKENS.PASSWORD_SERVICE)
    private readonly passwordService: IPasswordService,
    @Inject(INJECTION_TOKENS.JWT_SERVICE)
    private readonly jwtService: IJwtService,
  ) {}

  async execute(dto: LoginUserDto): Promise<LoginResponse> {
    const { email, password } = dto;

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    const accessToken = await this.jwtService.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user,
      accessToken,
    };
  }
}
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { IPasswordService } from '../../shared/interfaces/password.service.interface';

@Injectable()
export class PasswordService implements IPasswordService {
  private readonly saltRounds = 10;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }
}
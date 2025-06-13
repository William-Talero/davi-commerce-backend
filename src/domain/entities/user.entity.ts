export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly passwordHash: string,
    public readonly role: UserRole = UserRole.CUSTOMER,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  public isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  public updateProfile(firstName: string, lastName: string): User {
    return new User(
      this.id,
      this.email,
      firstName,
      lastName,
      this.passwordHash,
      this.role,
      this.createdAt,
      new Date(),
    );
  }
}

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

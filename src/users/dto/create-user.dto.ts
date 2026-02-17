export class CreateUserDto {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  isVerified?: boolean;
}

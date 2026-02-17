export class RegisterAuthDto {
  username: string;
  email: string;
  password: string;
  createdAt?: Date;
  isVerified?: boolean;
}

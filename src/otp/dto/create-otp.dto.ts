export class CreateOtpDto {
  id: number;
  used: boolean;
  code: string;
  userId: number;
  createdAt: Date;
  expiresAt: Date;
}

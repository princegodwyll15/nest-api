// mail.interfaces.ts
export class MailModuleOptions {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    clientId?: string; // for OAuth2
    clientSecret?: string; // for OAuth2
    refreshToken?: string; // for OAuth2
    pass?: string; // for normal SMTP
  };
}

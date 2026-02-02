import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: Role;
      isOnboardingCompleted: boolean;
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role: Role;
    isOnboardingCompleted: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: Role;
  }
}

import { Role } from '@/entities/user';
import { AdapterUser as DefaultAdapterUser } from '@auth/core/adapters';
import { DefaultSession, DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user:
      | ({
          id: string;
          role: Role;
          isOnboardingCompleted: boolean;
        } & DefaultSession['user'])
      | null;
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

declare module '@auth/core/adapters' {
  interface AdapterUser extends DefaultAdapterUser {
    role: Role;
    isOnboardingCompleted: boolean;
  }
}

import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `auth`, `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      id: string;
      role: "USER" | "ADMIN";
      /**
       * By default, TypeScript expects the `user` to be `DefaultSession["user"]`.
       * We extend it here to include our custom properties.
       */
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role: "USER" | "ADMIN";
  }
}

// Extend the JWT type if using JWT sessions (though we are using database sessions here, it's good practice)
declare module "next-auth/jwt" {
  interface JWT {
    role: "USER" | "ADMIN";
  }
}

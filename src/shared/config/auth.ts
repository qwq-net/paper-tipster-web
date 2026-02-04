import { db } from '@/shared/db';
import * as schema from '@/shared/db/schema';
import { getClientIp } from '@/shared/utils/get-client-ip';
import { DrizzleAdapter } from '@auth/drizzle-adapter';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Discord from 'next-auth/providers/discord';
import { z } from 'zod';

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    verificationTokensTable: schema.verificationTokens,
  }),
  session: {
    strategy: 'jwt',
    maxAge: 6 * 60 * 60,
  },
  providers: [
    Discord({
      authorization: 'https://discord.com/api/oauth2/authorize?scope=identify',
      profile(profile) {
        if (profile.avatar === null) {
          const defaultAvatarNumber = parseInt(profile.discriminator) % 5;
          profile.image_url = `https://cdn.discordapp.com/embed/avatars/${defaultAvatarNumber}.png`;
        } else {
          const format = profile.avatar.startsWith('a_') ? 'gif' : 'png';
          profile.image_url = `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}.${format}`;
        }
        return {
          id: profile.id,
          name: (profile.global_name ?? profile.username).replace(
            /[^a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/g,
            ''
          ),
          image: profile.image_url,
          role: 'USER',
          isOnboardingCompleted: false,
        };
      },
    }),
    Credentials({
      credentials: {
        code: { label: 'Code', type: 'text' },
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        const parsed = z
          .object({
            code: z.string().optional(),
            username: z.string().min(1),
            password: z.string().refine((val) => [...val].length >= 3 && [...val].length <= 6),
          })
          .safeParse(credentials);

        if (!parsed.success) return null;
        const { code, username, password } = parsed.data;

        const ip = await getClientIp();
        const identifier = `IP:${ip}`;
        const now = new Date();

        const attemptRecord = await db.query.loginAttempts.findFirst({
          where: eq(schema.loginAttempts.identifier, identifier),
        });

        if (attemptRecord?.lockedUntil && attemptRecord.lockedUntil > now) {
          console.warn(`IP Limit Exceeded: ${identifier}`);
          throw new Error('RateLimitExceeded');
        }

        const recordFailure = async () => {
          const currentAttempts = (attemptRecord?.attempts || 0) + 1;
          const currentBlockLevel = attemptRecord?.blockLevel || 0;

          let lockedUntil: Date | null = null;
          let newBlockLevel = currentBlockLevel;
          let newAttempts = currentAttempts;

          if (currentAttempts >= 5) {
            const durations = [10, 60, 24 * 60];
            const durationMinutes = durations[Math.min(currentBlockLevel, durations.length - 1)];
            lockedUntil = new Date(Date.now() + durationMinutes * 60 * 1000);
            newBlockLevel = currentBlockLevel + 1;
            newAttempts = 0;
          }

          await db
            .insert(schema.loginAttempts)
            .values({
              identifier,
              attempts: newAttempts,
              blockLevel: newBlockLevel,
              lockedUntil,
              lastAttemptAt: new Date(),
            })
            .onConflictDoUpdate({
              target: schema.loginAttempts.identifier,
              set: {
                attempts: newAttempts,
                blockLevel: newBlockLevel,
                lockedUntil,
                lastAttemptAt: new Date(),
              },
            });
        };

        if (code) {
          const guestCode = await db.query.guestCodes.findFirst({
            where: eq(schema.guestCodes.code, code),
          });

          if (!guestCode || guestCode.disabledAt) {
            console.warn(`Invalid guest code attempt: ${code}`);
            await recordFailure();
            return null;
          }

          const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.name, username),
          });

          if (existingUser) {
            console.warn(`Username taken during signup: ${username}`);
            await recordFailure();
            return null;
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const [newUser] = await db
            .insert(schema.users)
            .values({
              name: username,
              role: 'GUEST',
              guestCodeId: code,
              password: hashedPassword,
              isOnboardingCompleted: true,
            })
            .returning();

          if (attemptRecord) {
            await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.identifier, identifier));
          }
          return newUser;
        } else {
          const existingUser = await db.query.users.findFirst({
            where: eq(schema.users.name, username),
          });

          if (!existingUser) {
            console.warn(`Login failed: user not found ${username}`);
            await recordFailure();
            return null;
          }

          if (!existingUser.password) {
            console.warn('User setup incomplete (no password)');
            await recordFailure();
            return null;
          }

          const isPasswordValid = await bcrypt.compare(password, existingUser.password);
          if (!isPasswordValid) {
            console.warn('Invalid password attempt');
            await recordFailure();
            return null;
          }

          if (existingUser.disabledAt) {
            console.warn('Disabled account attempt');
            return null;
          }

          if (attemptRecord) {
            await db.delete(schema.loginAttempts).where(eq(schema.loginAttempts.identifier, identifier));
          }
          return existingUser;
        }
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isOnboardingCompleted = user.isOnboardingCompleted;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        try {
          const freshUser = await db.query.users.findFirst({
            where: eq(schema.users.id, token.sub),
            columns: {
              id: true,
              role: true,
              disabledAt: true,
              isOnboardingCompleted: true,
              name: true,
              image: true,
            },
          });

          if (!freshUser || freshUser.disabledAt) {
            // @ts-expect-error Session user can be null if validation fails
            session.user = null;
            return session;
          }

          session.user.role = freshUser.role;
          session.user.id = freshUser.id;
          session.user.isOnboardingCompleted = freshUser.isOnboardingCompleted;
          session.user.name = freshUser.name;
          session.user.image = freshUser.image;
        } catch (e) {
          console.error('Session refresh failed', e);
        }
      }
      return session;
    },
  },
});

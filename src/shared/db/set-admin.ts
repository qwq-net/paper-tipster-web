import { asc, eq } from 'drizzle-orm';
import { createInterface } from 'readline/promises';
import { db } from './index';
import { users } from './schema';

async function main() {
  try {
    const allUsers = await db.query.users.findMany({
      orderBy: [asc(users.createdAt)],
    });

    if (allUsers.length === 0) {
      console.warn('No users found in the database. Please login once first.');
      process.exit(1);
    }

    console.log('\n--- Select a user to grant ADMIN role ---');
    allUsers.forEach((u, i) => {
      console.log(
        `${i + 1}. ${u.name || 'No Name'} (${u.email || 'No Email'}) [ID: ${u.id}] - Current Role: ${u.role}`
      );
    });

    const rl = createInterface({ input: process.stdin, output: process.stdout });

    try {
      const answer = await rl.question('\nEnter number (default 1): ');
      const index = answer.trim() === '' ? 0 : parseInt(answer, 10) - 1;

      if (isNaN(index) || index < 0 || index >= allUsers.length) {
        console.error('Invalid selection.');
        process.exit(1);
      }

      const targetUser = allUsers[index];

      await db.update(users).set({ role: 'ADMIN' }).where(eq(users.id, targetUser.id));

      console.log(`\nSuccessfully granted ADMIN role to user: ${targetUser.name} (ID: ${targetUser.id})`);
      console.log('--- Done ---');
    } finally {
      rl.close();
    }
  } catch (err) {
    console.error('Failed to grant ADMIN role:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();

import { sql } from 'drizzle-orm';
import { db } from './index';

async function main() {
  console.log('--- Resetting Database (Truncating all tables) ---');

  const tableNames = [
    'race_entry',
    'bet',
    'transaction',
    'wallet',
    'race',
    'horse',
    'event',
    'verificationToken',
    'session',
    'account',
    'user',
  ];

  try {
    for (const tableName of tableNames) {
      console.log(`Truncating ${tableName}...`);
      await db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`));
    }
    console.log('--- Database Reset Completed ---');
  } catch (err) {
    console.error('Reset failed:', err);
    process.exit(1);
  }

  process.exit(0);
}

main();

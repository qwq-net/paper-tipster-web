import { sql } from 'drizzle-orm';
import { db } from './index';

async function main() {
  console.log('--- Resetting Database (Truncating all tables) ---');

  const tableNames = [
    'payout_result',
    'race_odds',
    'race_entry',
    'bet',
    'horse_win',
    'horse_tag',
    'horse_tag_master',
    'race_instance',
    'race_definition',
    'venue',
    'transaction',
    'wallet',
    'horse',
    'event',
    'guest_code',
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

import 'dotenv/config';
import postgres from 'postgres';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    process.exit(1);
  }
  const sql = postgres(process.env.DATABASE_URL);
  try {
    console.log('Renaming "race" table to "race_instance"...');
    await sql`ALTER TABLE IF EXISTS "race" RENAME TO "race_instance"`;
    console.log('Success.');
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sql.end();
  }
}

main();

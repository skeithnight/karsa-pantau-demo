import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

async function runMigration() {
  const connectionString =
    process.env.DATABASE_URL ||
    'postgresql://karsa_user:karsa_local_password@localhost:5432/karsa_db?sslmode=disable';

  console.log(`Menjalankan migrasi database ke: ${connectionString.replace(/:[^:@]+@/, ':****@')}`);
  const pool = new Pool({ connectionString });

  try {
    const migrationsDir = path.join(__dirname, 'migrations');
    const files = fs.readdirSync(migrationsDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      console.log(`Menjalankan file migrasi: ${file}...`);
      const sqlPath = path.join(migrationsDir, file);
      const sql = fs.readFileSync(sqlPath, 'utf8');
      await pool.query(sql);
      console.log(`✓ Migrasi ${file} berhasil dijalankan!`);
    }
  } catch (error) {
    console.error('Gagal menjalankan migrasi:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();

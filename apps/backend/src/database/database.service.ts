import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;
  private readonly logger = new Logger(DatabaseService.name);

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      'postgresql://karsa_user:karsa_local_password@localhost:5432/karsa_db?sslmode=disable';

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });
  }

  async onModuleInit() {
    try {
      const client = await this.pool.connect();
      client.release();
      this.logger.log('Berhasil terhubung ke PostgreSQL.');
    } catch (err) {
      this.logger.warn(`Belum dapat terhubung ke PostgreSQL: ${(err as Error).message}. Mode offline/fallback siap.`);
    }
  }

  async onModuleDestroy() {
    await this.pool.end();
  }

  async query<T extends QueryResultRow = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params);
  }

  async getClient(): Promise<PoolClient> {
    return this.pool.connect();
  }

  async isHealthy(): Promise<boolean> {
    try {
      const res = await this.pool.query('SELECT 1 as ping');
      return res.rows[0]?.ping === 1;
    } catch {
      return false;
    }
  }
}

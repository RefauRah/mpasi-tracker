import type { Client } from '@libsql/client/web';

let clientInstance: Client | null = null;
let initialized = false;

export async function getDbClient(): Promise<Client | null> {
  const rawUrl = process.env.TURSO_DATABASE_URL || '';
  const authToken = process.env.TURSO_AUTH_TOKEN || '';

  if (!rawUrl) {
    return null;
  }

  if (!clientInstance) {
    const { createClient } = await import('@libsql/client/web');
    const url = rawUrl.replace(/^libsql:\/\//, 'https://');
    clientInstance = createClient({ url, authToken });
  }

  return clientInstance;
}

export async function initDb() {
  if (initialized) return;

  const db = await getDbClient();
  if (!db) return;

  try {
    await db.execute(`
      CREATE TABLE IF NOT EXISTS baby (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        birth_date TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        meal_type TEXT NOT NULL,
        input_text TEXT NOT NULL,
        foods_json TEXT NOT NULL,
        total_calories REAL DEFAULT 0,
        total_protein REAL DEFAULT 0,
        total_carbs REAL DEFAULT 0,
        total_fat REAL DEFAULT 0,
        total_fiber REAL DEFAULT 0,
        total_iron REAL DEFAULT 0,
        total_calcium REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const countRes = await db.execute('SELECT COUNT(*) as count FROM baby');
    const count = Number(countRes.rows[0]?.count || 0);

    if (count === 0) {
      const defaultBirth = new Date();
      defaultBirth.setMonth(defaultBirth.getMonth() - 8);
      const birthDateStr = defaultBirth.toISOString().split('T')[0];

      await db.execute({
        sql: 'INSERT INTO baby (name, birth_date) VALUES (?, ?)',
        args: ['Si Kecil', birthDateStr],
      });
    }

    initialized = true;
  } catch (err) {
    console.error('Error initializing Turso database:', err);
  }
}

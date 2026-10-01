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
        meal_time TEXT DEFAULT '08:00',
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

    // Ensure meal_time column exists if meals table was created earlier
    try {
      await db.execute("ALTER TABLE meals ADD COLUMN meal_time TEXT DEFAULT '08:00'");
    } catch {
      // Column already exists
    }

    await db.execute(`
      CREATE TABLE IF NOT EXISTS medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT NOT NULL,
        name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS growth_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id INTEGER NOT NULL,
        date TEXT NOT NULL,
        weight REAL NOT NULL,
        height REAL,
        head_circ REAL,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS tb_medications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        baby_id INTEGER NOT NULL DEFAULT 1,
        day_number INTEGER NOT NULL,
        date TEXT NOT NULL,
        time TEXT,
        medicine_name TEXT NOT NULL,
        dosage TEXT NOT NULL,
        method TEXT,
        status TEXT NOT NULL DEFAULT 'Selesai',
        notes TEXT,
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

    // Seed TB Medications if empty
    const tbCountRes = await db.execute('SELECT COUNT(*) as count FROM tb_medications');
    const tbCount = Number(tbCountRes.rows[0]?.count || 0);
    if (tbCount === 0) {
      const { initialTBSeedData } = await import('./tb-seed');
      for (const item of initialTBSeedData) {
        await db.execute({
          sql: `
            INSERT INTO tb_medications (baby_id, day_number, date, time, medicine_name, dosage, method, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            item.baby_id,
            item.day_number,
            item.date,
            item.time,
            item.medicine_name,
            item.dosage,
            item.method,
            item.status,
            item.notes || '',
          ],
        });
      }
    }

    // Parent Health & Nutrition Tables (Ayah & Ibu)
    await db.execute(`
      CREATE TABLE IF NOT EXISTS parent_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        role TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 34,
        gender TEXT NOT NULL,
        weight REAL DEFAULT 72.0,
        height REAL DEFAULT 172.0,
        target_calories INTEGER DEFAULT 2000,
        target_cholesterol_max INTEGER DEFAULT 200,
        target_purine_max INTEGER DEFAULT 400,
        target_fiber_min INTEGER DEFAULT 25,
        target_uric_acid_max REAL DEFAULT 6.5,
        target_cholesterol_lab_max REAL DEFAULT 190,
        special_condition TEXT DEFAULT 'none',
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure new columns exist on existing databases
    try {
      await db.execute("ALTER TABLE parent_profiles ADD COLUMN special_condition TEXT DEFAULT 'none'");
    } catch {}
    try {
      await db.execute('ALTER TABLE parent_profiles ADD COLUMN notes TEXT');
    } catch {}

    await db.execute(`
      CREATE TABLE IF NOT EXISTS parent_meals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_role TEXT NOT NULL,
        date TEXT NOT NULL,
        meal_time TEXT DEFAULT '08:00',
        meal_type TEXT NOT NULL,
        input_text TEXT NOT NULL,
        foods_json TEXT NOT NULL,
        total_calories REAL DEFAULT 0,
        total_protein REAL DEFAULT 0,
        total_carbs REAL DEFAULT 0,
        total_fat REAL DEFAULT 0,
        total_fiber REAL DEFAULT 0,
        total_cholesterol REAL DEFAULT 0,
        total_purine REAL DEFAULT 0,
        health_warning TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS parent_lab_checks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_role TEXT NOT NULL,
        date TEXT NOT NULL,
        uric_acid REAL NOT NULL,
        total_cholesterol REAL NOT NULL,
        ldl_cholesterol REAL,
        hdl_cholesterol REAL,
        triglycerides REAL,
        blood_pressure TEXT,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.execute(`
      CREATE TABLE IF NOT EXISTS parent_water_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_role TEXT NOT NULL,
        date TEXT NOT NULL,
        glasses INTEGER DEFAULT 0,
        UNIQUE(parent_role, date)
      );
    `);

    // Seed Parent Profiles if empty
    const profileCountRes = await db.execute('SELECT COUNT(*) as count FROM parent_profiles');
    const profileCount = Number(profileCountRes.rows[0]?.count || 0);
    if (profileCount === 0) {
      await db.execute({
        sql: `
          INSERT INTO parent_profiles (
            role, name, age, gender, weight, height,
            target_calories, target_cholesterol_max, target_purine_max, target_fiber_min,
            target_uric_acid_max, target_cholesterol_lab_max
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ayah', 'Ayah', 34, 'pria', 74.0, 173.0, 2000, 200, 400, 28, 6.5, 190],
      });

      await db.execute({
        sql: `
          INSERT INTO parent_profiles (
            role, name, age, gender, weight, height,
            target_calories, target_cholesterol_max, target_purine_max, target_fiber_min,
            target_uric_acid_max, target_cholesterol_lab_max
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ibu', 'Ibu', 32, 'wanita', 58.0, 160.0, 1700, 200, 350, 25, 5.5, 190],
      });

      // Sample initial lab record for Ayah & Ibu to populate charts immediately
      const today = new Date().toISOString().split('T')[0];
      const lastMonthDate = new Date();
      lastMonthDate.setDate(lastMonthDate.getDate() - 30);
      const lastMonth = lastMonthDate.toISOString().split('T')[0];

      await db.execute({
        sql: `
          INSERT INTO parent_lab_checks (parent_role, date, uric_acid, total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides, blood_pressure, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ayah', lastMonth, 7.8, 225, 140, 42, 180, '125/85', 'Hasil tes bulan lalu (kolesterol & asam urat agak tinggi).'],
      });

      await db.execute({
        sql: `
          INSERT INTO parent_lab_checks (parent_role, date, uric_acid, total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides, blood_pressure, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ayah', today, 6.7, 198, 118, 48, 145, '120/80', 'Alhamdulillah mengalami perbaikan setelah diet rendah purin.'],
      });

      await db.execute({
        sql: `
          INSERT INTO parent_lab_checks (parent_role, date, uric_acid, total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides, blood_pressure, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ibu', lastMonth, 6.2, 210, 130, 52, 135, '115/75', 'Kolesterol sedikit di atas batas normal.'],
      });

      await db.execute({
        sql: `
          INSERT INTO parent_lab_checks (parent_role, date, uric_acid, total_cholesterol, ldl_cholesterol, hdl_cholesterol, triglycerides, blood_pressure, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: ['ibu', today, 5.4, 188, 110, 56, 120, '110/70', 'Hasil membaik setelah perbanyak serat larut.'],
      });
    }

    initialized = true;
  } catch (err) {
    console.error('Error initializing Turso database:', err);
  }
}

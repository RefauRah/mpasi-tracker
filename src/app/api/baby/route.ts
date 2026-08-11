import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { Baby } from '@/lib/types';

export const dynamic = 'force-dynamic';

function getDefaultBaby(): Baby {
  const defaultBirth = new Date();
  defaultBirth.setMonth(defaultBirth.getMonth() - 8);
  return {
    id: 1,
    name: 'Si Kecil',
    birth_date: defaultBirth.toISOString().split('T')[0],
  };
}

export async function GET() {
  try {
    const db = await getDbClient();
    if (!db) {
      return NextResponse.json(getDefaultBaby());
    }

    await initDb();
    const res = await db.execute('SELECT * FROM baby ORDER BY id ASC LIMIT 1');
    const row = res.rows[0];

    if (!row) {
      return NextResponse.json(getDefaultBaby());
    }

    const baby: Baby = {
      id: Number(row.id),
      name: String(row.name),
      birth_date: String(row.birth_date),
      created_at: row.created_at ? String(row.created_at) : undefined,
    };

    return NextResponse.json(baby);
  } catch (error) {
    console.error('Error fetching baby:', error);
    return NextResponse.json(getDefaultBaby());
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { name, birth_date } = body;

    if (!name || !birth_date) {
      return NextResponse.json({ error: 'Name and birth_date are required' }, { status: 400 });
    }

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json({ id: 1, name, birth_date });
    }

    await initDb();
    const existingRes = await db.execute('SELECT id FROM baby LIMIT 1');
    const existing = existingRes.rows[0];

    if (existing) {
      await db.execute({
        sql: 'UPDATE baby SET name = ?, birth_date = ? WHERE id = ?',
        args: [name, birth_date, existing.id],
      });
    } else {
      await db.execute({
        sql: 'INSERT INTO baby (name, birth_date) VALUES (?, ?)',
        args: [name, birth_date],
      });
    }

    return NextResponse.json({ id: 1, name, birth_date });
  } catch (error) {
    console.error('Error updating baby:', error);
    return NextResponse.json({ error: 'Failed to update baby profile' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { MedicationLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();

    let res;
    if (date) {
      res = await db.execute({
        sql: 'SELECT * FROM medications WHERE date = ? ORDER BY time ASC, created_at ASC',
        args: [date],
      });
    } else {
      res = await db.execute('SELECT * FROM medications ORDER BY date DESC, time ASC LIMIT 50');
    }

    const logs: MedicationLog[] = res.rows.map((row) => ({
      id: Number(row.id),
      baby_id: Number(row.baby_id),
      date: String(row.date),
      time: String(row.time),
      name: String(row.name),
      dosage: String(row.dosage),
      notes: row.notes ? String(row.notes) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching medications:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, time, name, dosage, notes } = body;

    if (!name || !dosage) {
      return NextResponse.json({ error: 'Name and dosage are required' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];
    const logTime = time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let savedLog: MedicationLog = {
      id: Date.now(),
      baby_id: 1,
      date: logDate,
      time: logTime,
      name,
      dosage,
      notes,
    };

    const db = await getDbClient();
    if (db) {
      await initDb();
      const res = await db.execute({
        sql: 'INSERT INTO medications (baby_id, date, time, name, dosage, notes) VALUES (?, ?, ?, ?, ?, ?)',
        args: [1, logDate, logTime, name, dosage, notes || ''],
      });
      savedLog.id = Number(res.lastInsertRowid);
    }

    return NextResponse.json(savedLog);
  } catch (error) {
    console.error('Error saving medication:', error);
    return NextResponse.json({ error: 'Failed to save medication log' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: 'DELETE FROM medications WHERE id = ?',
        args: [id],
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting medication:', error);
    return NextResponse.json({ error: 'Failed to delete medication' }, { status: 500 });
  }
}

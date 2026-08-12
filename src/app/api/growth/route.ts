import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { GrowthLog } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();

    const res = await db.execute('SELECT * FROM growth_logs ORDER BY date ASC, created_at ASC');

    const logs: GrowthLog[] = res.rows.map((row) => ({
      id: Number(row.id),
      baby_id: Number(row.baby_id),
      date: String(row.date),
      weight: Number(row.weight),
      height: row.height ? Number(row.height) : undefined,
      head_circ: row.head_circ ? Number(row.head_circ) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching growth logs:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { date, weight, height, head_circ, notes } = body;

    if (weight === undefined || weight === null || isNaN(Number(weight))) {
      return NextResponse.json({ error: 'Weight is required' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    let savedLog: GrowthLog = {
      id: Date.now(),
      baby_id: 1,
      date: logDate,
      weight: Number(weight),
      height: height ? Number(height) : undefined,
      head_circ: head_circ ? Number(head_circ) : undefined,
      notes,
    };

    const db = await getDbClient();
    if (db) {
      await initDb();
      const res = await db.execute({
        sql: 'INSERT INTO growth_logs (baby_id, date, weight, height, head_circ, notes) VALUES (?, ?, ?, ?, ?, ?)',
        args: [1, logDate, Number(weight), height ? Number(height) : null, head_circ ? Number(head_circ) : null, notes || ''],
      });
      savedLog.id = Number(res.lastInsertRowid);
    }

    return NextResponse.json(savedLog);
  } catch (error) {
    console.error('Error saving growth log:', error);
    return NextResponse.json({ error: 'Failed to save growth log' }, { status: 500 });
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
        sql: 'DELETE FROM growth_logs WHERE id = ?',
        args: [id],
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting growth log:', error);
    return NextResponse.json({ error: 'Failed to delete growth log' }, { status: 500 });
  }
}

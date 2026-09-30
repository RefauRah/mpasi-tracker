import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json({ glasses: 0 });
    }

    await initDb();
    const res = await db.execute({
      sql: 'SELECT glasses FROM parent_water_logs WHERE parent_role = ? AND date = ?',
      args: [role, date],
    });

    const glasses = res.rows.length > 0 ? Number(res.rows[0].glasses) : 0;
    return NextResponse.json({ glasses });
  } catch (error) {
    console.error('Error fetching water log:', error);
    return NextResponse.json({ glasses: 0 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role = 'ayah', date, delta = 1 } = body;

    const logDate = date || new Date().toISOString().split('T')[0];
    const db = await getDbClient();

    let newCount = 1;
    if (db) {
      await initDb();
      const existing = await db.execute({
        sql: 'SELECT glasses FROM parent_water_logs WHERE parent_role = ? AND date = ?',
        args: [role, logDate],
      });

      if (existing.rows.length > 0) {
        newCount = Math.max(0, Number(existing.rows[0].glasses) + Number(delta));
        await db.execute({
          sql: 'UPDATE parent_water_logs SET glasses = ? WHERE parent_role = ? AND date = ?',
          args: [newCount, role, logDate],
        });
      } else {
        newCount = Math.max(0, Number(delta));
        await db.execute({
          sql: 'INSERT INTO parent_water_logs (parent_role, date, glasses) VALUES (?, ?, ?)',
          args: [role, logDate, newCount],
        });
      }
    }

    return NextResponse.json({ success: true, glasses: newCount });
  } catch (error) {
    console.error('Error updating water log:', error);
    return NextResponse.json({ error: 'Failed to update water log' }, { status: 500 });
  }
}

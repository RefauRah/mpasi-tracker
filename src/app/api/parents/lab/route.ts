import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentLabCheck, ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();
    const res = await db.execute({
      sql: 'SELECT * FROM parent_lab_checks WHERE parent_role = ? ORDER BY date ASC',
      args: [role],
    });

    const checks: ParentLabCheck[] = res.rows.map((row) => ({
      id: Number(row.id),
      parent_role: row.parent_role as ParentRole,
      date: String(row.date),
      uric_acid: Number(row.uric_acid),
      total_cholesterol: Number(row.total_cholesterol),
      ldl_cholesterol: row.ldl_cholesterol ? Number(row.ldl_cholesterol) : undefined,
      hdl_cholesterol: row.hdl_cholesterol ? Number(row.hdl_cholesterol) : undefined,
      triglycerides: row.triglycerides ? Number(row.triglycerides) : undefined,
      blood_pressure: row.blood_pressure ? String(row.blood_pressure) : undefined,
      notes: row.notes ? String(row.notes) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(checks);
  } catch (error) {
    console.error('Error fetching parent lab checks:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      parent_role = 'ayah',
      date,
      uric_acid,
      total_cholesterol,
      ldl_cholesterol,
      hdl_cholesterol,
      triglycerides,
      blood_pressure,
      notes,
    } = body;

    if (!uric_acid || !total_cholesterol) {
      return NextResponse.json({ error: 'Kadar Asam Urat & Kolesterol wajib diisi' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const db = await getDbClient();
    let savedId = Date.now();

    if (db) {
      await initDb();
      const res = await db.execute({
        sql: `
          INSERT INTO parent_lab_checks (
            parent_role, date, uric_acid, total_cholesterol,
            ldl_cholesterol, hdl_cholesterol, triglycerides, blood_pressure, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          parent_role,
          logDate,
          Number(uric_acid),
          Number(total_cholesterol),
          ldl_cholesterol ? Number(ldl_cholesterol) : null,
          hdl_cholesterol ? Number(hdl_cholesterol) : null,
          triglycerides ? Number(triglycerides) : null,
          blood_pressure || null,
          notes || '',
        ],
      });
      savedId = Number(res.lastInsertRowid);

      // Automatically compute AI-adjusted targets based on new lab test
      const maxUricNormal = parent_role === 'ayah' ? 7.0 : 6.0;
      let newPurineMax = parent_role === 'ayah' ? 400 : 350;
      if (Number(uric_acid) >= maxUricNormal + 0.8) {
        newPurineMax = 180;
      } else if (Number(uric_acid) > maxUricNormal) {
        newPurineMax = 280;
      }

      let newCholesterolMax = 200;
      let newFiberMin = parent_role === 'ayah' ? 28 : 25;
      if (Number(total_cholesterol) >= 240 || (ldl_cholesterol && Number(ldl_cholesterol) >= 160)) {
        newCholesterolMax = 120;
        newFiberMin = 32;
      } else if (Number(total_cholesterol) >= 200 || (ldl_cholesterol && Number(ldl_cholesterol) >= 130)) {
        newCholesterolMax = 160;
        newFiberMin = 28;
      }

      // Update parent_profiles target columns in database
      await db.execute({
        sql: `
          UPDATE parent_profiles
          SET target_purine_max = ?, target_cholesterol_max = ?, target_fiber_min = ?
          WHERE role = ?
        `,
        args: [newPurineMax, newCholesterolMax, newFiberMin, parent_role],
      });
    }

    return NextResponse.json({
      id: savedId,
      parent_role,
      date: logDate,
      uric_acid: Number(uric_acid),
      total_cholesterol: Number(total_cholesterol),
      notes,
      autoUpdatedTargets: true,
    });
  } catch (error) {
    console.error('Error saving parent lab check:', error);
    return NextResponse.json({ error: 'Failed to save lab check' }, { status: 500 });
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
        sql: 'DELETE FROM parent_lab_checks WHERE id = ?',
        args: [id],
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting lab check:', error);
    return NextResponse.json({ error: 'Failed to delete lab check' }, { status: 500 });
  }
}

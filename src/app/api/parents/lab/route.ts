import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentLabCheck, ParentRole } from '@/lib/types';
import { calculateLabAdjustedTargets } from '@/lib/nutrition-targets';

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

    if (uric_acid === undefined || uric_acid === null || total_cholesterol === undefined || total_cholesterol === null) {
      return NextResponse.json({ error: 'Kadar Asam Urat & Kolesterol wajib diisi' }, { status: 400 });
    }

    const logDate = date || new Date().toISOString().split('T')[0];

    const db = await getDbClient();
    let savedId = Date.now();
    let adjustedTargets: ReturnType<typeof calculateLabAdjustedTargets> | null = null;

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

      // Fetch profile to get special_condition if any
      const profileRes = await db.execute({
        sql: 'SELECT special_condition FROM parent_profiles WHERE role = ?',
        args: [parent_role],
      });
      const specialCondition = profileRes.rows.length > 0 ? (profileRes.rows[0].special_condition as any) : 'none';

      // Fetch latest lab test (order by date DESC, id DESC)
      const latestLabRes = await db.execute({
        sql: 'SELECT * FROM parent_lab_checks WHERE parent_role = ? ORDER BY date DESC, id DESC LIMIT 1',
        args: [parent_role],
      });

      let latestLab = null;
      if (latestLabRes.rows.length > 0) {
        const row = latestLabRes.rows[0];
        latestLab = {
          date: String(row.date),
          uric_acid: Number(row.uric_acid),
          total_cholesterol: Number(row.total_cholesterol),
          ldl_cholesterol: row.ldl_cholesterol ? Number(row.ldl_cholesterol) : undefined,
          hdl_cholesterol: row.hdl_cholesterol ? Number(row.hdl_cholesterol) : undefined,
          triglycerides: row.triglycerides ? Number(row.triglycerides) : undefined,
          blood_pressure: row.blood_pressure ? String(row.blood_pressure) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
        };
      }

      // Compute unified clinical lab adjusted targets
      adjustedTargets = calculateLabAdjustedTargets({
        role: parent_role,
        specialCondition,
        latestLab,
      });

      // Update parent_profiles targets in DB
      await db.execute({
        sql: `
          UPDATE parent_profiles
          SET target_purine_max = ?, target_cholesterol_max = ?, target_fiber_min = ?,
              target_uric_acid_max = ?, target_cholesterol_lab_max = ?
          WHERE role = ?
        `,
        args: [
          adjustedTargets.target_purine_max,
          adjustedTargets.target_cholesterol_max,
          adjustedTargets.target_fiber_min,
          adjustedTargets.target_uric_acid_lab_max,
          adjustedTargets.target_cholesterol_lab_max,
          parent_role,
        ],
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
      adjustedTargets,
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

      // Find role of the check being deleted
      const checkRes = await db.execute({
        sql: 'SELECT parent_role FROM parent_lab_checks WHERE id = ?',
        args: [id],
      });
      const role = checkRes.rows.length > 0 ? (checkRes.rows[0].parent_role as ParentRole) : 'ayah';

      await db.execute({
        sql: 'DELETE FROM parent_lab_checks WHERE id = ?',
        args: [id],
      });

      // Recalculate targets based on remaining latest lab check
      const profileRes = await db.execute({
        sql: 'SELECT special_condition FROM parent_profiles WHERE role = ?',
        args: [role],
      });
      const specialCondition = profileRes.rows.length > 0 ? (profileRes.rows[0].special_condition as any) : 'none';

      const latestLabRes = await db.execute({
        sql: 'SELECT * FROM parent_lab_checks WHERE parent_role = ? ORDER BY date DESC, id DESC LIMIT 1',
        args: [role],
      });

      let latestLab = null;
      if (latestLabRes.rows.length > 0) {
        const row = latestLabRes.rows[0];
        latestLab = {
          date: String(row.date),
          uric_acid: Number(row.uric_acid),
          total_cholesterol: Number(row.total_cholesterol),
          ldl_cholesterol: row.ldl_cholesterol ? Number(row.ldl_cholesterol) : undefined,
          hdl_cholesterol: row.hdl_cholesterol ? Number(row.hdl_cholesterol) : undefined,
          triglycerides: row.triglycerides ? Number(row.triglycerides) : undefined,
          blood_pressure: row.blood_pressure ? String(row.blood_pressure) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
        };
      }

      const adjustedTargets = calculateLabAdjustedTargets({
        role,
        specialCondition,
        latestLab,
      });

      await db.execute({
        sql: `
          UPDATE parent_profiles
          SET target_purine_max = ?, target_cholesterol_max = ?, target_fiber_min = ?,
              target_uric_acid_max = ?, target_cholesterol_lab_max = ?
          WHERE role = ?
        `,
        args: [
          adjustedTargets.target_purine_max,
          adjustedTargets.target_cholesterol_max,
          adjustedTargets.target_fiber_min,
          adjustedTargets.target_uric_acid_lab_max,
          adjustedTargets.target_cholesterol_lab_max,
          role,
        ],
      });

      return NextResponse.json({ success: true, deletedId: id, role, adjustedTargets });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting lab check:', error);
    return NextResponse.json({ error: 'Failed to delete lab check' }, { status: 500 });
  }
}


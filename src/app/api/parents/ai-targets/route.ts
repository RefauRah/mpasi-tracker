import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentLabCheck, ParentProfile, ParentRole } from '@/lib/types';
import { evaluateAITargetsFromLab } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;

    const db = await getDbClient();
    let profile: ParentProfile = {
      id: role === 'ayah' ? 1 : 2,
      role,
      name: role === 'ayah' ? 'Ayah' : 'Ibu',
      age: role === 'ayah' ? 34 : 32,
      gender: role === 'ayah' ? 'pria' : 'wanita',
      weight: role === 'ayah' ? 74 : 58,
      height: role === 'ayah' ? 173 : 160,
      target_calories: role === 'ayah' ? 2000 : 1700,
      target_cholesterol_max: 200,
      target_purine_max: role === 'ayah' ? 400 : 350,
      target_fiber_min: role === 'ayah' ? 28 : 25,
      target_uric_acid_max: role === 'ayah' ? 6.5 : 5.5,
      target_cholesterol_lab_max: 190,
    };

    let latestLab: ParentLabCheck | null = null;

    if (db) {
      await initDb();

      // 1. Fetch Profile
      const profileRes = await db.execute({
        sql: 'SELECT * FROM parent_profiles WHERE role = ?',
        args: [role],
      });
      if (profileRes.rows.length > 0) {
        const row = profileRes.rows[0];
        profile = {
          id: Number(row.id),
          role: row.role as ParentRole,
          name: String(row.name),
          age: Number(row.age || 34),
          gender: row.gender as 'pria' | 'wanita',
          weight: Number(row.weight || 70),
          height: Number(row.height || 170),
          target_calories: Number(row.target_calories || 2000),
          target_cholesterol_max: Number(row.target_cholesterol_max || 200),
          target_purine_max: Number(row.target_purine_max || 400),
          target_fiber_min: Number(row.target_fiber_min || 25),
          target_uric_acid_max: Number(row.target_uric_acid_max || 6.5),
          target_cholesterol_lab_max: Number(row.target_cholesterol_lab_max || 190),
        };
      }

      // 2. Fetch Latest Lab Check
      const labRes = await db.execute({
        sql: 'SELECT * FROM parent_lab_checks WHERE parent_role = ? ORDER BY date DESC, id DESC LIMIT 1',
        args: [role],
      });
      if (labRes.rows.length > 0) {
        const row = labRes.rows[0];
        latestLab = {
          id: Number(row.id),
          parent_role: row.parent_role as ParentRole,
          date: String(row.date),
          uric_acid: Number(row.uric_acid),
          total_cholesterol: Number(row.total_cholesterol),
          ldl_cholesterol: row.ldl_cholesterol !== null ? Number(row.ldl_cholesterol) : undefined,
          hdl_cholesterol: row.hdl_cholesterol !== null ? Number(row.hdl_cholesterol) : undefined,
          triglycerides: row.triglycerides !== null ? Number(row.triglycerides) : undefined,
          blood_pressure: row.blood_pressure ? String(row.blood_pressure) : undefined,
          notes: row.notes ? String(row.notes) : undefined,
        };
      }
    }

    const assessment = await evaluateAITargetsFromLab(role, profile, latestLab);
    return NextResponse.json(assessment);
  } catch (error) {
    console.error('Error assessing AI targets for parent:', error);
    return NextResponse.json({ error: 'Failed to assess AI targets' }, { status: 500 });
  }
}

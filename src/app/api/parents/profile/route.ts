import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentProfile, ParentRole } from '@/lib/types';
import { calculateParentIdealNutrition } from '@/lib/nutrition-targets';

export const dynamic = 'force-dynamic';

function getDefaultProfile(role: ParentRole): ParentProfile {
  const age = role === 'ayah' ? 34 : 32;
  const weight = role === 'ayah' ? 74 : 58;
  const height = role === 'ayah' ? 173 : 160;
  const special_condition = role === 'ibu' ? 'menyusui_eksklusif' : 'none';
  const ideal = calculateParentIdealNutrition({ role, weight, height, age, specialCondition: special_condition });

  return {
    id: role === 'ayah' ? 1 : 2,
    role,
    name: role === 'ayah' ? 'Ayah' : 'Ibu',
    age,
    gender: role === 'ayah' ? 'pria' : 'wanita',
    weight,
    height,
    target_calories: ideal.targetCalories,
    target_cholesterol_max: 200,
    target_purine_max: role === 'ayah' ? 400 : 350,
    target_fiber_min: role === 'ayah' ? 28 : 25,
    target_uric_acid_max: role === 'ayah' ? 6.5 : 5.5,
    target_cholesterol_lab_max: 190,
    special_condition,
    notes: role === 'ibu' ? 'Sedang dalam kondisi menyusui bayi (ASI Eksklusif)' : 'Kondisi fisik normal',
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json(getDefaultProfile(role));
    }

    await initDb();
    const res = await db.execute({
      sql: 'SELECT * FROM parent_profiles WHERE role = ?',
      args: [role],
    });

    if (res.rows.length === 0) {
      return NextResponse.json(getDefaultProfile(role));
    }

    const row = res.rows[0];
    const age = Number(row.age || (role === 'ayah' ? 34 : 32));
    const weight = Number(row.weight || (role === 'ayah' ? 74 : 58));
    const height = Number(row.height || (role === 'ayah' ? 173 : 160));
    const special_condition = (row.special_condition || (role === 'ibu' ? 'menyusui_eksklusif' : 'none')) as any;
    const notes = row.notes ? String(row.notes) : '';
    const ideal = calculateParentIdealNutrition({ role, weight, height, age, specialCondition: special_condition });

    const profile: ParentProfile = {
      id: Number(row.id),
      role: row.role as ParentRole,
      name: String(row.name),
      age,
      gender: row.gender as 'pria' | 'wanita',
      weight,
      height,
      target_calories: Number(row.target_calories) || ideal.targetCalories,
      target_cholesterol_max: Number(row.target_cholesterol_max || 200),
      target_purine_max: Number(row.target_purine_max || (role === 'ayah' ? 400 : 350)),
      target_fiber_min: Number(row.target_fiber_min || (role === 'ayah' ? 28 : 25)),
      target_uric_acid_max: Number(row.target_uric_acid_max || (role === 'ayah' ? 6.5 : 5.5)),
      target_cholesterol_lab_max: Number(row.target_cholesterol_lab_max || 190),
      special_condition,
      notes,
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    return NextResponse.json(getDefaultProfile('ayah'));
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      role = 'ayah',
      name,
      age,
      weight,
      height,
      target_calories,
      target_cholesterol_max,
      target_purine_max,
      target_fiber_min,
      target_uric_acid_max,
      target_cholesterol_lab_max,
      special_condition = 'none',
      notes = '',
    } = body;

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: `
          UPDATE parent_profiles
          SET name = ?, age = ?, weight = ?, height = ?, target_calories = ?,
              target_cholesterol_max = ?, target_purine_max = ?, target_fiber_min = ?,
              target_uric_acid_max = ?, target_cholesterol_lab_max = ?,
              special_condition = ?, notes = ?
          WHERE role = ?
        `,
        args: [
          name,
          Number(age),
          Number(weight),
          Number(height),
          Number(target_calories),
          Number(target_cholesterol_max),
          Number(target_purine_max),
          Number(target_fiber_min),
          Number(target_uric_acid_max),
          Number(target_cholesterol_lab_max),
          special_condition,
          notes,
          role,
        ],
      });
    }

    return NextResponse.json({ success: true, updatedRole: role });
  } catch (error) {
    console.error('Error updating parent profile:', error);
    return NextResponse.json({ error: 'Failed to update parent profile' }, { status: 500 });
  }
}

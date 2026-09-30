import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentProfile, ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

const defaultProfiles: Record<ParentRole, ParentProfile> = {
  ayah: {
    id: 1,
    role: 'ayah',
    name: 'Ayah',
    age: 34,
    gender: 'pria',
    weight: 74,
    height: 173,
    target_calories: 2000,
    target_cholesterol_max: 200,
    target_purine_max: 400,
    target_fiber_min: 28,
    target_uric_acid_max: 6.5,
    target_cholesterol_lab_max: 190,
  },
  ibu: {
    id: 2,
    role: 'ibu',
    name: 'Ibu',
    age: 32,
    gender: 'wanita',
    weight: 58,
    height: 160,
    target_calories: 1700,
    target_cholesterol_max: 200,
    target_purine_max: 350,
    target_fiber_min: 25,
    target_uric_acid_max: 5.5,
    target_cholesterol_lab_max: 190,
  },
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json(defaultProfiles[role] || defaultProfiles.ayah);
    }

    await initDb();
    const res = await db.execute({
      sql: 'SELECT * FROM parent_profiles WHERE role = ?',
      args: [role],
    });

    if (res.rows.length === 0) {
      return NextResponse.json(defaultProfiles[role] || defaultProfiles.ayah);
    }

    const row = res.rows[0];
    const profile: ParentProfile = {
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

    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching parent profile:', error);
    return NextResponse.json(defaultProfiles.ayah);
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
    } = body;

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: `
          UPDATE parent_profiles
          SET name = ?, age = ?, weight = ?, height = ?, target_calories = ?,
              target_cholesterol_max = ?, target_purine_max = ?, target_fiber_min = ?,
              target_uric_acid_max = ?, target_cholesterol_lab_max = ?
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

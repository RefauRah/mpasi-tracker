import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentMeal, ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;
    const date = searchParams.get('date');

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();
    let res;

    if (date) {
      res = await db.execute({
        sql: 'SELECT * FROM parent_meals WHERE parent_role = ? AND date = ? ORDER BY meal_time ASC, created_at ASC',
        args: [role, date],
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      res = await db.execute({
        sql: 'SELECT * FROM parent_meals WHERE parent_role = ? AND date = ? ORDER BY meal_time ASC, created_at ASC',
        args: [role, today],
      });
    }

    const meals: ParentMeal[] = res.rows.map((row) => ({
      id: Number(row.id),
      parent_role: row.parent_role as ParentRole,
      date: String(row.date),
      meal_time: row.meal_time ? String(row.meal_time) : '08:00',
      meal_type: row.meal_type as any,
      input_text: String(row.input_text),
      foods: JSON.parse(String(row.foods_json || '[]')),
      total_calories: Number(row.total_calories || 0),
      total_protein: Number(row.total_protein || 0),
      total_carbs: Number(row.total_carbs || 0),
      total_fat: Number(row.total_fat || 0),
      total_fiber: Number(row.total_fiber || 0),
      total_cholesterol: Number(row.total_cholesterol || 0),
      total_purine: Number(row.total_purine || 0),
      health_warning: row.health_warning ? String(row.health_warning) : undefined,
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching parent meals:', error);
    return NextResponse.json([]);
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Meal ID is required' }, { status: 400 });
    }

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: 'DELETE FROM parent_meals WHERE id = ?',
        args: [id],
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting parent meal:', error);
    return NextResponse.json({ error: 'Failed to delete parent meal' }, { status: 500 });
  }
}

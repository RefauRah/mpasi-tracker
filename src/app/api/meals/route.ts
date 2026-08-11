import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let res;

    if (date) {
      res = await db.execute({
        sql: 'SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC',
        args: [date],
      });
    } else if (startDate && endDate) {
      res = await db.execute({
        sql: 'SELECT * FROM meals WHERE date >= ? AND date <= ? ORDER BY date ASC, created_at ASC',
        args: [startDate, endDate],
      });
    } else {
      const today = new Date().toISOString().split('T')[0];
      res = await db.execute({
        sql: 'SELECT * FROM meals WHERE date = ? ORDER BY created_at ASC',
        args: [today],
      });
    }

    const meals = res.rows.map((row) => ({
      id: Number(row.id),
      baby_id: Number(row.baby_id),
      date: String(row.date),
      meal_type: String(row.meal_type),
      input_text: String(row.input_text),
      foods: JSON.parse(String(row.foods_json || '[]')),
      total_calories: Number(row.total_calories || 0),
      total_protein: Number(row.total_protein || 0),
      total_carbs: Number(row.total_carbs || 0),
      total_fat: Number(row.total_fat || 0),
      total_fiber: Number(row.total_fiber || 0),
      total_iron: Number(row.total_iron || 0),
      total_calcium: Number(row.total_calcium || 0),
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(meals);
  } catch (error) {
    console.error('Error fetching meals:', error);
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
        sql: 'DELETE FROM meals WHERE id = ?',
        args: [id],
      });
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting meal:', error);
    return NextResponse.json({ error: 'Failed to delete meal' }, { status: 500 });
  }
}

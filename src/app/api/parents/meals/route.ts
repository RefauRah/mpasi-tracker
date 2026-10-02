import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentMeal, ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;
    const date = searchParams.get('date');
    const month = searchParams.get('month');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const search = searchParams.get('search');
    const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json([]);
    }

    await initDb();
    let query = 'SELECT * FROM parent_meals WHERE parent_role = ?';
    const args: any[] = [role];

    if (date && date !== 'all') {
      query += ' AND date = ?';
      args.push(date);
    } else if (month) {
      query += ' AND date LIKE ?';
      args.push(`${month}%`);
    } else if (startDate && endDate) {
      query += ' AND date >= ? AND date <= ?';
      args.push(startDate, endDate);
    } else if (!date) {
      // Default to today if no date or filter provided
      const today = new Date().toISOString().split('T')[0];
      query += ' AND date = ?';
      args.push(today);
    }

    if (search && search.trim()) {
      query += ' AND (input_text LIKE ? OR foods_json LIKE ?)';
      const s = `%${search.trim()}%`;
      args.push(s, s);
    }

    query += ' ORDER BY date DESC, meal_time DESC, id DESC';

    if (limit) {
      query += ' LIMIT ?';
      args.push(limit);
    }

    const res = await db.execute({ sql: query, args });

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

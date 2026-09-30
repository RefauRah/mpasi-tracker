import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const role = (searchParams.get('role') || 'ayah') as ParentRole;
    const monthParam = searchParams.get('month'); // '2026-09'
    const daysParam = parseInt(searchParams.get('days') || '7', 10);
    const days = isNaN(daysParam) ? 7 : daysParam;

    let startDate: Date;
    let endDate: Date;

    if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
      const [y, m] = monthParam.split('-').map(Number);
      startDate = new Date(y, m - 1, 1);
      endDate = new Date(y, m, 0);
    } else {
      endDate = new Date();
      startDate = new Date();
      startDate.setDate(startDate.getDate() - (days - 1));
    }

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    const dateMap = new Map<string, any>();
    const db = await getDbClient();

    if (db) {
      await initDb();
      const statsRes = await db.execute({
        sql: `
          SELECT 
            date,
            SUM(total_calories) as calories,
            SUM(total_protein) as protein,
            SUM(total_carbs) as carbs,
            SUM(total_fat) as fat,
            SUM(total_fiber) as fiber,
            SUM(total_cholesterol) as cholesterol,
            SUM(total_purine) as purine
          FROM parent_meals
          WHERE parent_role = ? AND date >= ? AND date <= ?
          GROUP BY date
          ORDER BY date ASC
        `,
        args: [role, startStr, endStr],
      });

      statsRes.rows.forEach((r) => dateMap.set(String(r.date), r));
    }

    const result = [];
    const curr = new Date(startDate);
    while (curr <= endDate) {
      const dStr = curr.toISOString().split('T')[0];
      const dateObj = new Date(curr);
      const dayLabel = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      if (dateMap.has(dStr)) {
        const item = dateMap.get(dStr);
        result.push({
          date: dStr,
          label: dayLabel,
          calories: Math.round(Number(item.calories || 0)),
          protein: Number((Number(item.protein || 0)).toFixed(1)),
          carbs: Number((Number(item.carbs || 0)).toFixed(1)),
          fat: Number((Number(item.fat || 0)).toFixed(1)),
          fiber: Number((Number(item.fiber || 0)).toFixed(1)),
          cholesterol: Math.round(Number(item.cholesterol || 0)),
          purine: Math.round(Number(item.purine || 0)),
        });
      } else {
        result.push({
          date: dStr,
          label: dayLabel,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          fiber: 0,
          cholesterol: 0,
          purine: 0,
        });
      }
      curr.setDate(curr.getDate() + 1);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching parent stats:', error);
    return NextResponse.json([]);
  }
}

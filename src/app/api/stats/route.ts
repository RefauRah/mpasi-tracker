import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const daysParam = parseInt(searchParams.get('days') || '7', 10);
    const days = isNaN(daysParam) ? 7 : daysParam;

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));

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
            SUM(total_iron) as iron,
            SUM(total_calcium) as calcium
          FROM meals
          WHERE date >= ? AND date <= ?
          GROUP BY date
          ORDER BY date ASC
        `,
        args: [startStr, endStr],
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
          iron: Number((Number(item.iron || 0)).toFixed(1)),
          calcium: Math.round(Number(item.calcium || 0)),
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
          iron: 0,
          calcium: 0,
        });
      }
      curr.setDate(curr.getDate() + 1);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json([]);
  }
}

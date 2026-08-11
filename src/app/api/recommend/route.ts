import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { getRecommendationsWithGemini } from '@/lib/gemini';
import { calculateAgeInMonths, getNutritionTarget } from '@/lib/nutrition-targets';
import { NutritionSummary } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const current: NutritionSummary = body.current || {
      calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0,
    };

    let ageInMonths = 8;
    const db = await getDbClient();

    if (db) {
      await initDb();
      const babyRes = await db.execute('SELECT * FROM baby ORDER BY id ASC LIMIT 1');
      const babyRow = babyRes.rows[0];
      if (babyRow) {
        ageInMonths = calculateAgeInMonths(String(babyRow.birth_date));
      }
    }

    const target = getNutritionTarget(ageInMonths);
    const recommendations = await getRecommendationsWithGemini(current, target, ageInMonths);

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return NextResponse.json({ error: 'Failed to generate recommendations' }, { status: 500 });
  }
}

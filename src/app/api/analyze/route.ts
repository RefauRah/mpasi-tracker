import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { analyzeFoodWithGemini } from '@/lib/gemini';
import { calculateAgeInMonths } from '@/lib/nutrition-targets';
import { MealType } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input_text, meal_type, date, meal_time } = body;

    if (!input_text || typeof input_text !== 'string' || !input_text.trim()) {
      return NextResponse.json({ error: 'Input text is required' }, { status: 400 });
    }

    const mealType: MealType = meal_type || 'sarapan';
    const mealDate = date || new Date().toISOString().split('T')[0];
    const timeVal = meal_time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

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

    // Analyze with Gemini
    const result = await analyzeFoodWithGemini(input_text, ageInMonths);

    let savedMeal: any = {
      id: Date.now(),
      baby_id: 1,
      date: mealDate,
      meal_time: timeVal,
      meal_type: mealType,
      input_text,
      foods: result.foods,
      total_calories: result.total.calories,
      total_protein: result.total.protein,
      total_carbs: result.total.carbs,
      total_fat: result.total.fat,
      total_fiber: result.total.fiber,
      total_iron: result.total.iron,
      total_calcium: result.total.calcium,
      created_at: new Date().toISOString(),
    };

    if (db) {
      const insertRes = await db.execute({
        sql: `
          INSERT INTO meals (
            baby_id, date, meal_time, meal_type, input_text, foods_json,
            total_calories, total_protein, total_carbs, total_fat, total_fiber, total_iron, total_calcium
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          1,
          mealDate,
          timeVal,
          mealType,
          input_text,
          JSON.stringify(result.foods),
          result.total.calories,
          result.total.protein,
          result.total.carbs,
          result.total.fat,
          result.total.fiber,
          result.total.iron,
          result.total.calcium,
        ],
      });

      savedMeal.id = Number(insertRes.lastInsertRowid);
    }

    return NextResponse.json({
      meal: savedMeal,
      analysis: result,
    });
  } catch (error) {
    console.error('Error analyzing meal:', error);
    return NextResponse.json({ error: 'Failed to analyze meal' }, { status: 500 });
  }
}

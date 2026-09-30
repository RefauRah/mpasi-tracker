import { NextResponse } from 'next/server';
import { analyzeParentFoodWithGemini } from '@/lib/gemini';
import { getDbClient, initDb } from '@/lib/db';
import { ParentMeal, ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { input_text, parent_role = 'ayah', meal_type = 'makan_siang', date, meal_time } = body;

    if (!input_text || typeof input_text !== 'string' || !input_text.trim()) {
      return NextResponse.json({ error: 'Input makanan tidak boleh kosong' }, { status: 400 });
    }

    const mealDate = date || new Date().toISOString().split('T')[0];
    const mealTime = meal_time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // Analyze with AI
    const analysis = await analyzeParentFoodWithGemini(input_text, parent_role as ParentRole);

    let savedMeal: ParentMeal = {
      id: Date.now(),
      parent_role: parent_role as ParentRole,
      date: mealDate,
      meal_time: mealTime,
      meal_type,
      input_text,
      foods: analysis.foods,
      total_calories: analysis.total.calories,
      total_protein: analysis.total.protein,
      total_carbs: analysis.total.carbs,
      total_fat: analysis.total.fat,
      total_fiber: analysis.total.fiber,
      total_cholesterol: analysis.total.cholesterol,
      total_purine: analysis.total.purine_mg,
      health_warning: analysis.health_evaluation,
      created_at: new Date().toISOString(),
    };

    const db = await getDbClient();
    if (db) {
      await initDb();
      const res = await db.execute({
        sql: `
          INSERT INTO parent_meals (
            parent_role, date, meal_time, meal_type, input_text, foods_json,
            total_calories, total_protein, total_carbs, total_fat, total_fiber,
            total_cholesterol, total_purine, health_warning
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          parent_role,
          mealDate,
          mealTime,
          meal_type,
          input_text,
          JSON.stringify(analysis.foods),
          analysis.total.calories,
          analysis.total.protein,
          analysis.total.carbs,
          analysis.total.fat,
          analysis.total.fiber,
          analysis.total.cholesterol,
          analysis.total.purine_mg,
          analysis.health_evaluation,
        ],
      });

      savedMeal.id = Number(res.lastInsertRowid);
    }

    return NextResponse.json({
      meal: savedMeal,
      analysis,
    });
  } catch (error) {
    console.error('Error analyzing parent meal:', error);
    return NextResponse.json({ error: 'Gagal menganalisis makanan' }, { status: 500 });
  }
}

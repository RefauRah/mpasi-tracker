import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { analyzeFoodWithGemini } from '@/lib/gemini';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'meals';

    if (!file) {
      return NextResponse.json({ error: 'CSV file is required' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length <= 1) {
      return NextResponse.json({ error: 'CSV file is empty or only contains header' }, { status: 400 });
    }

    const db = await getDbClient();
    if (!db) {
      return NextResponse.json({ success: true, count: lines.length - 1, note: 'Mock import completed' });
    }

    await initDb();
    let importedCount = 0;

    // Skip header line (index 0)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Helper CSV line parser supporting quoted fields
      const cols = parseCsvLine(line);
      if (cols.length === 0) continue;

      if (type === 'meals') {
        const date = cols[0] || new Date().toISOString().split('T')[0];
        const time = cols[1] || '08:00';
        const mealType = cols[2] || 'sarapan';
        const inputText = cols[3] || 'MPASI';
        const calories = Number(cols[4] || 50);
        const protein = Number(cols[5] || 1);
        const carbs = Number(cols[6] || 8);
        const fat = Number(cols[7] || 1);
        const fiber = Number(cols[8] || 0.5);
        const iron = Number(cols[9] || 0.5);
        const calcium = Number(cols[10] || 5);

        await db.execute({
          sql: `
            INSERT INTO meals (
              baby_id, date, meal_time, meal_type, input_text, foods_json,
              total_calories, total_protein, total_carbs, total_fat, total_fiber, total_iron, total_calcium
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `,
          args: [
            1,
            date,
            time,
            mealType,
            inputText,
            JSON.stringify([{ name: inputText, quantity: '1 porsi', estimated_grams: 50, calories, protein, carbs, fat, fiber, iron, calcium }]),
            calories,
            protein,
            carbs,
            fat,
            fiber,
            iron,
            calcium,
          ],
        });
        importedCount++;
      } else if (type === 'medications') {
        const date = cols[0] || new Date().toISOString().split('T')[0];
        const time = cols[1] || '08:00';
        const name = cols[2] || 'Obat/Vitamin';
        const dosage = cols[3] || '1 dosis';
        const notes = cols[4] || '';

        await db.execute({
          sql: 'INSERT INTO medications (baby_id, date, time, name, dosage, notes) VALUES (?, ?, ?, ?, ?, ?)',
          args: [1, date, time, name, dosage, notes],
        });
        importedCount++;
      } else if (type === 'growth') {
        const date = cols[0] || new Date().toISOString().split('T')[0];
        const weight = Number(cols[1] || 7.0);
        const height = cols[2] ? Number(cols[2]) : null;
        const head_circ = cols[3] ? Number(cols[3]) : null;
        const notes = cols[4] || '';

        await db.execute({
          sql: 'INSERT INTO growth_logs (baby_id, date, weight, height, head_circ, notes) VALUES (?, ?, ?, ?, ?, ?)',
          args: [1, date, weight, height, head_circ, notes],
        });
        importedCount++;
      }
    }

    return NextResponse.json({ success: true, count: importedCount });
  } catch (error) {
    console.error('Error importing CSV:', error);
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
  }
}

function parseCsvLine(text: string): string[] {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
}

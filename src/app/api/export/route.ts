import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'meals';

    const db = await getDbClient();
    if (!db) {
      return new NextResponse('Tanggal,Waktu,Tipe,Input Makanan,Kalori,Protein,Karbo,Lemak\n', {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="mpasi_${type}_export.csv"`,
        },
      });
    }

    await initDb();
    let csvString = '';

    if (type === 'meals') {
      const res = await db.execute('SELECT * FROM meals ORDER BY date DESC, meal_time ASC');
      csvString += 'Tanggal,Waktu,Jenis Makan,Input Makanan,Total Kalori (kkal),Protein (g),Karbohidrat (g),Lemak (g),Serat (g),Zat Besi (mg),Kalsium (mg)\n';
      res.rows.forEach((r) => {
        const inputEsc = `"${String(r.input_text || '').replace(/"/g, '""')}"`;
        csvString += `${r.date},${r.meal_time || '08:00'},${r.meal_type},${inputEsc},${r.total_calories},${r.total_protein},${r.total_carbs},${r.total_fat},${r.total_fiber},${r.total_iron},${r.total_calcium}\n`;
      });
    } else if (type === 'medications') {
      const res = await db.execute('SELECT * FROM medications ORDER BY date DESC, time ASC');
      csvString += 'Tanggal,Waktu,Nama Obat/Vitamin,Dosis,Catatan\n';
      res.rows.forEach((r) => {
        const nameEsc = `"${String(r.name || '').replace(/"/g, '""')}"`;
        const doseEsc = `"${String(r.dosage || '').replace(/"/g, '""')}"`;
        const noteEsc = `"${String(r.notes || '').replace(/"/g, '""')}"`;
        csvString += `${r.date},${r.time},${nameEsc},${doseEsc},${noteEsc}\n`;
      });
    } else if (type === 'growth') {
      const res = await db.execute('SELECT * FROM growth_logs ORDER BY date ASC');
      csvString += 'Tanggal,Berat Badan (kg),Tinggi Badan (cm),Lingkar Kepala (cm),Catatan\n';
      res.rows.forEach((r) => {
        const noteEsc = `"${String(r.notes || '').replace(/"/g, '""')}"`;
        csvString += `${r.date},${r.weight},${r.height || ''},${r.head_circ || ''},${noteEsc}\n`;
      });
    }

    return new NextResponse(csvString, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="mpasi_${type}_${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting CSV:', error);
    return NextResponse.json({ error: 'Failed to export CSV' }, { status: 500 });
  }
}

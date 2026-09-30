import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { formatISOToDate } from '@/lib/tb-seed';
import { getLocalTBStore } from '../route';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    let rows: any[] = [];
    const db = await getDbClient();
    
    if (db) {
      await initDb();
      const res = await db.execute('SELECT * FROM tb_medications ORDER BY day_number ASC');
      rows = res.rows.map((r) => ({
        day_number: r.day_number,
        date: r.date,
        time: r.time,
        medicine_name: r.medicine_name,
        dosage: r.dosage,
        method: r.method,
        status: r.status,
        notes: r.notes,
      }));
    } else {
      const store = getLocalTBStore();
      rows = [...store].sort((a, b) => a.day_number - b.day_number);
    }

    let csv = '"Hari Ke","Tanggal","Jam Minum","Nama Obat","Dosis","Metode Pemberian","Status","Catatan Khusus"\n';

    rows.forEach((r) => {
      const dayEsc = `"${r.day_number || ''}"`;
      const dateFormatted = r.date ? formatISOToDate(String(r.date)) : '';
      const dateEsc = `"${dateFormatted}"`;
      const timeEsc = `"${r.time || ''}"`;
      const nameEsc = `"${String(r.medicine_name || '').replace(/"/g, '""')}"`;
      const dosageEsc = `"${String(r.dosage || '').replace(/"/g, '""')}"`;
      const methodEsc = `"${String(r.method || '').replace(/"/g, '""')}"`;
      const statusEsc = `"${String(r.status || '').replace(/"/g, '""')}"`;
      const notesEsc = `"${String(r.notes || '').replace(/"/g, '""')}"`;

      csv += `${dayEsc},${dateEsc},${timeEsc},${nameEsc},${dosageEsc},${methodEsc},${statusEsc},${notesEsc}\n`;
    });

    const exportDateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jurnal_minum_obat_tb_${exportDateStr}.csv"`,
      },
    });
  } catch (error) {
    console.error('Error exporting TB medications:', error);
    return NextResponse.json({ error: 'Failed to export TB medications' }, { status: 500 });
  }
}

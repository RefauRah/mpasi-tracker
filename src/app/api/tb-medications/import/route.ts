import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { parseDateToISO } from '@/lib/tb-seed';
import { TBMedicationLog } from '@/lib/types';
import { getLocalTBStore, setLocalTBStore } from '../route';

export const dynamic = 'force-dynamic';

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'File CSV diperlukan' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

    if (lines.length <= 1) {
      return NextResponse.json({ error: 'File CSV kosong atau hanya berisi header' }, { status: 400 });
    }

    const db = await getDbClient();
    if (db) {
      await initDb();
    }

    const parsedLogs: TBMedicationLog[] = [];
    let importedCount = 0;

    // Determine column indices from header
    const headerCols = parseCsvLine(lines[0]).map((h) => h.toLowerCase().replace(/["']/g, '').trim());
    
    let dayIdx = headerCols.findIndex((h) => h.includes('hari'));
    let dateIdx = headerCols.findIndex((h) => h.includes('tanggal') || h.includes('tgl') || h.includes('date'));
    let timeIdx = headerCols.findIndex((h) => h.includes('jam') || h.includes('waktu') || h.includes('time'));
    let nameIdx = headerCols.findIndex((h) => h.includes('nama') || h.includes('obat') || h.includes('med'));
    let dosageIdx = headerCols.findIndex((h) => h.includes('dosis') || h.includes('dose'));
    let methodIdx = headerCols.findIndex((h) => h.includes('metode') || h.includes('cara') || h.includes('method'));
    let statusIdx = headerCols.findIndex((h) => h.includes('status'));
    let notesIdx = headerCols.findIndex((h) => h.includes('catatan') || h.includes('note') || h.includes('khusus'));

    // Fallbacks if header didn't match perfectly
    if (dayIdx === -1) dayIdx = 0;
    if (dateIdx === -1) dateIdx = 1;
    if (timeIdx === -1) timeIdx = 2;
    if (nameIdx === -1) nameIdx = 3;
    if (dosageIdx === -1) dosageIdx = 4;
    if (methodIdx === -1) methodIdx = 5;
    if (statusIdx === -1) statusIdx = 6;
    if (notesIdx === -1) notesIdx = 7;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const cols = parseCsvLine(line);
      if (cols.length === 0) continue;

      const rawDay = cols[dayIdx] || '';
      const rawDate = cols[dateIdx] || '';
      const rawTime = cols[timeIdx] || '';
      const rawName = cols[nameIdx] || 'OAT KDT Anak';
      const rawDosage = cols[dosageIdx] || '2 Tablet';
      const rawMethod = cols[methodIdx] || 'Spuit + air putih';
      const rawStatus = cols[statusIdx] || (rawDate ? 'Selesai' : '-');
      const rawNotes = cols[notesIdx] || '';

      const dayNumber = parseInt(rawDay.replace(/\D/g, ''), 10) || i;
      const isoDate = parseDateToISO(rawDate);

      // Skip row if it has neither date nor actual status
      if (!rawDate && (!rawStatus || rawStatus === '-')) {
        continue;
      }

      const logItem: TBMedicationLog = {
        id: Date.now() + i,
        baby_id: 1,
        day_number: dayNumber,
        date: isoDate || new Date().toISOString().split('T')[0],
        time: rawTime || '06:00',
        medicine_name: rawName || 'OAT KDT Anak',
        dosage: rawDosage || '2 Tablet',
        method: rawMethod || 'Spuit + air putih',
        status: rawStatus && rawStatus !== '-' ? rawStatus : 'Selesai',
        notes: rawNotes && rawNotes !== '-' ? rawNotes : '',
        created_at: new Date().toISOString(),
      };

      if (db) {
        // Upsert by day_number
        const existing = await db.execute({
          sql: 'SELECT id FROM tb_medications WHERE day_number = ?',
          args: [dayNumber],
        });

        if (existing.rows.length > 0) {
          const id = existing.rows[0].id;
          await db.execute({
            sql: `
              UPDATE tb_medications
              SET date = ?, time = ?, medicine_name = ?, dosage = ?, method = ?, status = ?, notes = ?
              WHERE id = ?
            `,
            args: [
              logItem.date,
              logItem.time,
              logItem.medicine_name,
              logItem.dosage,
              logItem.method,
              logItem.status,
              logItem.notes || '',
              id,
            ],
          });
        } else {
          await db.execute({
            sql: `
              INSERT INTO tb_medications (baby_id, day_number, date, time, medicine_name, dosage, method, status, notes)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            args: [
              1,
              dayNumber,
              logItem.date,
              logItem.time,
              logItem.medicine_name,
              logItem.dosage,
              logItem.method,
              logItem.status,
              logItem.notes || '',
            ],
          });
        }
      }

      parsedLogs.push(logItem);
      importedCount++;
    }

    if (!db) {
      // Update in-memory local store
      const currentStore = [...getLocalTBStore()];
      parsedLogs.forEach((newLog) => {
        const existingIdx = currentStore.findIndex((x) => x.day_number === newLog.day_number);
        if (existingIdx >= 0) {
          currentStore[existingIdx] = newLog;
        } else {
          currentStore.push(newLog);
        }
      });
      setLocalTBStore(currentStore);
    }

    return NextResponse.json({
      success: true,
      count: importedCount,
      message: `Berhasil mengimpor ${importedCount} catatan obat TB.`,
    });
  } catch (error: any) {
    console.error('Error importing TB CSV:', error);
    return NextResponse.json({ error: error.message || 'Gagal mengimpor file CSV TB' }, { status: 500 });
  }
}

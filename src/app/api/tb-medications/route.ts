import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { TBMedicationLog } from '@/lib/types';
import { initialTBSeedData, parseDateToISO } from '@/lib/tb-seed';

export const dynamic = 'force-dynamic';

// In-memory fallback if Turso is not configured
let localTBStore: TBMedicationLog[] = initialTBSeedData.map((item, idx) => ({
  ...item,
  id: idx + 1,
  created_at: new Date().toISOString(),
}));

export function getLocalTBStore() {
  return localTBStore;
}

export function setLocalTBStore(data: TBMedicationLog[]) {
  localTBStore = data;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const status = searchParams.get('status');
    const sort = searchParams.get('sort') || 'day_desc'; // 'day_desc' | 'day_asc' | 'date_desc'

    const db = await getDbClient();
    if (!db) {
      let filtered = [...localTBStore];
      if (date) {
        const iso = parseDateToISO(date);
        filtered = filtered.filter((x) => x.date === iso);
      }
      if (status) {
        filtered = filtered.filter((x) => x.status.toLowerCase() === status.toLowerCase());
      }
      if (sort === 'day_asc') {
        filtered.sort((a, b) => a.day_number - b.day_number);
      } else {
        filtered.sort((a, b) => b.day_number - a.day_number);
      }
      return NextResponse.json(filtered);
    }

    await initDb();

    let sql = 'SELECT * FROM tb_medications WHERE 1=1';
    const args: any[] = [];

    if (date) {
      const iso = parseDateToISO(date);
      sql += ' AND date = ?';
      args.push(iso);
    }
    if (status) {
      sql += ' AND LOWER(status) = LOWER(?)';
      args.push(status);
    }

    if (sort === 'day_asc') {
      sql += ' ORDER BY day_number ASC, date ASC';
    } else {
      sql += ' ORDER BY day_number DESC, date DESC';
    }

    const res = await db.execute({ sql, args });
    const logs: TBMedicationLog[] = res.rows.map((row) => ({
      id: Number(row.id),
      baby_id: Number(row.baby_id || 1),
      day_number: Number(row.day_number),
      date: String(row.date),
      time: String(row.time || ''),
      medicine_name: String(row.medicine_name || 'OAT KDT Anak'),
      dosage: String(row.dosage || '2 Tablet'),
      method: String(row.method || 'Spuit + air putih'),
      status: String(row.status || 'Selesai'),
      notes: row.notes ? String(row.notes) : '',
      created_at: row.created_at ? String(row.created_at) : undefined,
    }));

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching TB medications:', error);
    return NextResponse.json(localTBStore);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      day_number,
      date,
      time,
      medicine_name = 'OAT KDT Anak',
      dosage = '2 Tablet',
      method = 'Spuit + air putih',
      status = 'Selesai',
      notes = '',
    } = body;

    const parsedDate = parseDateToISO(date) || new Date().toISOString().split('T')[0];
    const parsedTime = time || new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let finalDayNumber = Number(day_number);
    if (!finalDayNumber || isNaN(finalDayNumber)) {
      // Auto compute next day number
      const db = await getDbClient();
      if (db) {
        const maxRes = await db.execute('SELECT MAX(day_number) as max_day FROM tb_medications');
        finalDayNumber = (Number(maxRes.rows[0]?.max_day) || 0) + 1;
      } else {
        const maxDay = localTBStore.reduce((max, item) => Math.max(max, item.day_number), 0);
        finalDayNumber = maxDay + 1;
      }
    }

    const newLog: TBMedicationLog = {
      id: Date.now(),
      baby_id: 1,
      day_number: finalDayNumber,
      date: parsedDate,
      time: parsedTime,
      medicine_name,
      dosage,
      method,
      status,
      notes,
      created_at: new Date().toISOString(),
    };

    const db = await getDbClient();
    if (db) {
      await initDb();
      const res = await db.execute({
        sql: `
          INSERT INTO tb_medications (baby_id, day_number, date, time, medicine_name, dosage, method, status, notes)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [1, finalDayNumber, parsedDate, parsedTime, medicine_name, dosage, method, status, notes],
      });
      newLog.id = Number(res.lastInsertRowid);
    } else {
      // Check if day_number or id exists in local store
      const existingIdx = localTBStore.findIndex((x) => x.day_number === finalDayNumber);
      if (existingIdx >= 0) {
        localTBStore[existingIdx] = newLog;
      } else {
        localTBStore.push(newLog);
      }
    }

    return NextResponse.json(newLog);
  } catch (error) {
    console.error('Error creating TB medication log:', error);
    return NextResponse.json({ error: 'Failed to save TB medication log' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      day_number,
      date,
      time,
      medicine_name,
      dosage,
      method,
      status,
      notes,
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const parsedDate = parseDateToISO(date);

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: `
          UPDATE tb_medications
          SET day_number = ?, date = ?, time = ?, medicine_name = ?, dosage = ?, method = ?, status = ?, notes = ?
          WHERE id = ?
        `,
        args: [Number(day_number), parsedDate, time, medicine_name, dosage, method, status, notes || '', id],
      });
    } else {
      const idx = localTBStore.findIndex((x) => x.id === Number(id));
      if (idx >= 0) {
        localTBStore[idx] = {
          ...localTBStore[idx],
          day_number: Number(day_number),
          date: parsedDate,
          time,
          medicine_name,
          dosage,
          method,
          status,
          notes: notes || '',
        };
      }
    }

    return NextResponse.json({ success: true, updatedId: id });
  } catch (error) {
    console.error('Error updating TB medication log:', error);
    return NextResponse.json({ error: 'Failed to update TB medication log' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const db = await getDbClient();
    if (db) {
      await initDb();
      await db.execute({
        sql: 'DELETE FROM tb_medications WHERE id = ?',
        args: [id],
      });
    } else {
      localTBStore = localTBStore.filter((x) => x.id !== Number(id));
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error) {
    console.error('Error deleting TB medication log:', error);
    return NextResponse.json({ error: 'Failed to delete TB medication log' }, { status: 500 });
  }
}

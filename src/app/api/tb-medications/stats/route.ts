import { NextResponse } from 'next/server';
import { getDbClient, initDb } from '@/lib/db';
import { TBMedicationLog, TBMedicationStats } from '@/lib/types';
import { getLocalTBStore } from '../route';

export const dynamic = 'force-dynamic';

function extractPercentage(note: string): number {
  if (!note) return 100;
  const match = note.match(/(\d+)\s*%/);
  if (match) {
    return parseInt(match[1], 10);
  }
  if (note.includes('<50')) return 40;
  if (note.includes('~50')) return 50;
  if (note.includes('~80')) return 80;
  if (note.includes('~90')) return 90;
  if (note.includes('100')) return 100;
  return 100;
}

export async function GET() {
  try {
    let logs: TBMedicationLog[] = [];
    const db = await getDbClient();

    if (db) {
      await initDb();
      const res = await db.execute('SELECT * FROM tb_medications ORDER BY day_number ASC');
      logs = res.rows.map((row) => ({
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
    } else {
      logs = [...getLocalTBStore()].sort((a, b) => a.day_number - b.day_number);
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const targetDays = 180; // 6 months standard pediatric TB regimen
    const totalLoggedDays = logs.length;
    
    const completedLogs = logs.filter(
      (l) => l.status.toLowerCase() === 'selesai' || l.status.toLowerCase().includes('selesai')
    );
    const missedLogs = logs.filter(
      (l) => l.status.toLowerCase() === 'terlewat' || l.status.toLowerCase() === 'lewat' || l.status.toLowerCase() === 'muntah'
    );

    const completedDays = completedLogs.length;
    const missedDays = missedLogs.length;
    const completionRate = totalLoggedDays > 0 ? Math.round((completedDays / totalLoggedDays) * 100) : 0;

    // Calculate average absorption %
    let totalPercentage = 0;
    let percentageCount = 0;
    logs.forEach((l) => {
      if (l.notes) {
        const pct = extractPercentage(l.notes);
        totalPercentage += pct;
        percentageCount++;
      } else if (l.status.toLowerCase() === 'selesai') {
        totalPercentage += 100;
        percentageCount++;
      }
    });

    const avgAbsorption = percentageCount > 0 ? Math.round(totalPercentage / percentageCount) : 100;

    // Calculate current streak
    let currentStreak = 0;
    for (let i = logs.length - 1; i >= 0; i--) {
      if (logs[i].status.toLowerCase() === 'selesai') {
        currentStreak++;
      } else {
        break;
      }
    }

    const latestDay = logs.length > 0 ? Math.max(...logs.map((l) => l.day_number)) : 0;
    const todayLog = logs.find((l) => l.date === todayStr);
    const todayLogged = Boolean(todayLog);

    // Chart timeline points
    const timelineData = logs.map((l) => {
      const percentage = extractPercentage(l.notes || '');
      return {
        day_number: l.day_number,
        date: l.date,
        time: l.time || '-',
        status: l.status,
        percentage,
        notes: l.notes || `${percentage}%`,
        method: l.method,
      };
    });

    // Method Distribution Breakdown
    const methodCounts: Record<string, number> = {};
    logs.forEach((l) => {
      const m = l.method || 'Lainnya';
      methodCounts[m] = (methodCounts[m] || 0) + 1;
    });

    const methodStats = Object.entries(methodCounts).map(([name, count]) => ({
      name,
      count,
    }));

    // Time Distribution Breakdown
    const timeDistribution: Record<string, number> = {
      'Sebelum 06:00': 0,
      '06:00 - 06:30': 0,
      '06:30 - 07:00': 0,
      'Setelah 07:00': 0,
    };

    logs.forEach((l) => {
      if (!l.time) return;
      const [h, m] = l.time.split(':').map(Number);
      if (isNaN(h)) return;
      const totalMinutes = h * 60 + (m || 0);

      if (totalMinutes < 6 * 60) {
        timeDistribution['Sebelum 06:00']++;
      } else if (totalMinutes <= 6 * 60 + 30) {
        timeDistribution['06:00 - 06:30']++;
      } else if (totalMinutes <= 7 * 60) {
        timeDistribution['06:30 - 07:00']++;
      } else {
        timeDistribution['Setelah 07:00']++;
      }
    });

    const timeStats = Object.entries(timeDistribution).map(([label, count]) => ({
      label,
      count,
    }));

    const stats: TBMedicationStats = {
      totalLoggedDays,
      completedDays,
      missedDays,
      targetDays,
      completionRate,
      streakDays: currentStreak,
      avgAbsorption,
      latestDay,
      todayLogged,
      todayLog,
    };

    return NextResponse.json({
      stats,
      timelineData,
      methodStats,
      timeStats,
    });
  } catch (error) {
    console.error('Error calculating TB stats:', error);
    return NextResponse.json({ error: 'Failed to calculate TB stats' }, { status: 500 });
  }
}

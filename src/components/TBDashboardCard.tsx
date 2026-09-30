'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { TBMedicationStats } from '@/lib/types';
import { Pill, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function TBDashboardCard() {
  const [stats, setStats] = useState<TBMedicationStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/tb-medications/stats');
      const data = await res.json();
      if (data?.stats) {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleQuickLogToday = async () => {
    const nextDay = (stats?.latestDay || 0) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    try {
      const res = await fetch('/api/tb-medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: nextDay,
          date: todayStr,
          time: nowTime,
          medicine_name: 'OAT KDT Anak',
          dosage: '2 Tablet',
          method: 'Spuit + air putih',
          status: 'Selesai',
          notes: '~100%',
        }),
      });

      if (res.ok) {
        fetchStats();
      }
    } catch (err) {
      console.error('Error quick logging today:', err);
    }
  };

  const progressPercent = stats ? Math.min(100, Math.round((stats.completedDays / 180) * 100)) : 0;
  const nextDay = (stats?.latestDay || 0) + 1;

  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-[var(--radius-lg)] p-4 border border-amber-300/40 shadow-sm space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
            <Pill size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[var(--text-main)]">Terapi Minum Obat TB</h3>
              <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-800">
                Hari Ke-{stats?.latestDay || 0}
              </span>
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              {stats?.todayLogged
                ? '✅ Sudah minum obat hari ini'
                : '⚠️ Belum tercatat minum obat hari ini'}
            </p>
          </div>
        </div>

        <Link
          href="/obat-tb"
          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 bg-amber-100 hover:bg-amber-200 px-2.5 py-1.5 rounded-xl transition-colors"
        >
          <span>Menu TB</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {/* Progress towards 180 Days */}
      <div className="space-y-1.5 bg-[var(--bg-card)] p-3 rounded-xl border border-[var(--border-color)]">
        <div className="flex justify-between items-center text-[11px] font-semibold">
          <span className="text-[var(--text-muted)]">Progres Menuju 180 Hari:</span>
          <span className="font-bold text-[var(--text-main)]">
            {stats?.completedDays || 0} / 180 Hari ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-[var(--bg-secondary)] h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-amber-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-600" />
            Kepatuhan: <b>{stats?.completionRate || 0}%</b>
          </span>
          <span className="flex items-center gap-1">
            <Flame size={11} className="text-amber-500" />
            Streak: <b>{stats?.streakDays || 0} Hari</b>
          </span>
        </div>
      </div>

      {/* Quick Action Button if not logged yet */}
      {!stats?.todayLogged && (
        <button
          onClick={handleQuickLogToday}
          className="w-full py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <CheckCircle2 size={15} />
          <span>Catat Selesai Hari Ini (Hari Ke-{nextDay})</span>
        </button>
      )}
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import NutritionChart from '@/components/NutritionChart';
import { Baby } from '@/lib/types';
import { calculateAgeInMonths, getNutritionTarget } from '@/lib/nutrition-targets';
import { BarChart3, TrendingUp, Target, Award } from 'lucide-react';

export default function GraphPage() {
  const [days, setDays] = useState<number>(7);
  const [statsData, setStatsData] = useState<any[]>([]);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, babyRes] = await Promise.all([
        fetch(`/api/stats?days=${days}`),
        fetch('/api/baby'),
      ]);
      const stats = await statsRes.json();
      const babyData = await babyRes.json();

      setStatsData(Array.isArray(stats) ? stats : []);
      setBaby(babyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const ageMonths = baby ? calculateAgeInMonths(baby.birth_date) : 8;
  const target = getNutritionTarget(ageMonths);

  // Stats calculation
  const totalCal = statsData.reduce((acc, curr) => acc + curr.calories, 0);
  const avgCal = statsData.length > 0 ? Math.round(totalCal / statsData.length) : 0;
  const daysTargetMet = statsData.filter((d) => d.calories >= target.calories * 0.8).length;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--accent-gold-light)] rounded-xl text-[var(--accent-gold)]">
            <BarChart3 size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-main)]">Grafik & Tren Nutrisi</h1>
            <p className="text-xs text-[var(--text-muted)]">Analisis asupan nutrisi MPASI si kecil dari waktu ke waktu</p>
          </div>
        </div>

        {/* Days Filter */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl">
          {[
            { label: '7 Hari', value: 7 },
            { label: '14 Hari', value: 14 },
            { label: '30 Hari', value: 30 },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setDays(item.value)}
              className={`py-2 text-xs font-bold rounded-xl transition-all ${
                days === item.value
                  ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <TrendingUp size={14} className="text-[var(--accent-gold)]" />
            <span>Rata-Rata Kalori</span>
          </div>
          <p className="text-xl font-extrabold text-[var(--text-main)]">
            {avgCal} <span className="text-xs font-normal text-[var(--text-muted)]">kkal/hari</span>
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
            <Target size={14} className="text-[var(--accent-sage)]" />
            <span>Pencapaian Target</span>
          </div>
          <p className="text-xl font-extrabold text-[var(--text-main)]">
            {daysTargetMet} / {statsData.length} <span className="text-xs font-normal text-[var(--text-muted)]">hari</span>
          </p>
        </div>
      </div>

      {/* Recharts Component */}
      {loading ? (
        <div className="py-16 text-center text-xs text-[var(--text-muted)]">
          Memuat data grafik...
        </div>
      ) : (
        <NutritionChart data={statsData} targetCalories={target.calories} />
      )}
    </div>
  );
}

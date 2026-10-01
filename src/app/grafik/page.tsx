'use client';

import { useState, useEffect, useCallback } from 'react';
import MPASISubNav from '@/components/MPASISubNav';
import NutritionChart from '@/components/NutritionChart';
import { Baby, GrowthLog } from '@/lib/types';
import { calculateAgeInMonths, getNutritionTarget } from '@/lib/nutrition-targets';
import { BarChart3, TrendingUp, Target, Scale, Calendar, Filter } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function GraphPage() {
  const [filterType, setFilterType] = useState<'days' | 'month'>('days');
  const [days, setDays] = useState<number>(7);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [statsData, setStatsData] = useState<any[]>([]);
  const [growthData, setGrowthData] = useState<GrowthLog[]>([]);
  const [baby, setBaby] = useState<Baby | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const statsUrl = filterType === 'month'
        ? `/api/stats?month=${selectedMonth}`
        : `/api/stats?days=${days}`;

      const [statsRes, babyRes, growthRes] = await Promise.all([
        fetch(statsUrl),
        fetch('/api/baby'),
        fetch('/api/growth'),
      ]);
      const stats = await statsRes.json();
      const babyData = await babyRes.json();
      const growth = await growthRes.json();

      setStatsData(Array.isArray(stats) ? stats : []);
      setBaby(babyData);
      setGrowthData(Array.isArray(growth) ? growth : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [filterType, days, selectedMonth]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const ageMonths = baby ? calculateAgeInMonths(baby.birth_date) : 8;
  const target = getNutritionTarget(ageMonths);

  // Stats calculation
  const totalCal = statsData.reduce((acc, curr) => acc + curr.calories, 0);
  const avgCal = statsData.length > 0 ? Math.round(totalCal / statsData.length) : 0;
  const daysTargetMet = statsData.filter((d) => d.calories >= target.calories * 0.8).length;

  const latestWeight = growthData.length > 0 ? growthData[growthData.length - 1].weight : '-';

  // Format month name for title
  const monthTitle = new Date(`${selectedMonth}-01`).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* MPASI Module Navigation */}
      <MPASISubNav />

      {/* Header */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[var(--accent-gold-light)] rounded-xl text-[var(--accent-gold)]">
              <BarChart3 size={20} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[var(--text-main)]">Grafik & Tren Nutrisi</h1>
              <p className="text-xs text-[var(--text-muted)]">Analisis asupan nutrisi MPASI & berat badan si kecil</p>
            </div>
          </div>
        </div>

        {/* Filter Mode Switcher */}
        <div className="space-y-2 pt-1 border-t border-[var(--border-color)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1">
              <Filter size={13} />
              Tipe Filter:
            </span>
            <div className="flex p-0.5 bg-[var(--bg-secondary)] rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilterType('days')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'days'
                    ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Rentang Hari
              </button>
              <button
                type="button"
                onClick={() => setFilterType('month')}
                className={`px-3 py-1 rounded-lg transition-all ${
                  filterType === 'month'
                    ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm font-bold'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                Per-Bulan
              </button>
            </div>
          </div>

          {filterType === 'days' ? (
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
          ) : (
            <div className="flex items-center gap-2 p-2 bg-[var(--bg-secondary)] rounded-2xl">
              <Calendar size={16} className="text-[var(--accent-gold)] shrink-0 ml-1" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              />
              <span className="text-xs font-bold text-[var(--accent-gold)] whitespace-nowrap px-2">
                {monthTitle}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]">
            <TrendingUp size={12} className="text-[var(--accent-gold)]" />
            <span>Rata-Rata</span>
          </div>
          <p className="text-base font-extrabold text-[var(--text-main)]">
            {avgCal} <span className="text-[10px] font-normal text-[var(--text-muted)]">kkal</span>
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]">
            <Target size={12} className="text-[var(--accent-sage)]" />
            <span>Target Harian</span>
          </div>
          <p className="text-base font-extrabold text-[var(--text-main)]">
            {daysTargetMet}/{statsData.length} <span className="text-[10px] font-normal text-[var(--text-muted)]">hari</span>
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-0.5">
          <div className="flex items-center justify-center gap-1 text-[10px] text-[var(--text-muted)]">
            <Scale size={12} className="text-blue-600" />
            <span>BB Terakhir</span>
          </div>
          <p className="text-base font-extrabold text-[var(--text-main)]">
            {latestWeight} <span className="text-[10px] font-normal text-[var(--text-muted)]">kg</span>
          </p>
        </div>
      </div>

      {/* Recharts Nutrition Component */}
      {loading ? (
        <div className="bg-[var(--bg-card)] p-8 rounded-[var(--radius-lg)] border border-[var(--border-color)]">
          <LoadingSpinner text="Memuat data grafik nutrisi..." />
        </div>
      ) : (
        <NutritionChart data={statsData} targetCalories={target.calories} />
      )}

      {/* Growth Chart (Weight over time) */}
      {growthData.length > 0 && (
        <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <Scale size={16} className="text-blue-600" />
                <span>Tren Pertumbuhan Berat Badan (kg)</span>
              </h3>
              <p className="text-xs text-[var(--text-muted)]">Perkembangan berat badan si kecil dari waktu ke waktu</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={growthData} margin={{ top: 15, right: 15, left: -15, bottom: 15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7C6E60' }} dy={5} />
                <YAxis tick={{ fontSize: 11, fill: '#7C6E60' }} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    border: '1px solid #E8DFD1',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    fontSize: '12px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  name="Berat Badan (kg)"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ r: 5, fill: '#2563EB' }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

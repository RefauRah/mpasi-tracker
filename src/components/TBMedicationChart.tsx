'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { TrendingUp, Clock, Award, Activity, Calendar, Filter } from 'lucide-react';

interface TimelinePoint {
  day_number: number;
  date: string;
  time: string;
  status: string;
  percentage: number;
  notes: string;
  method: string;
}

interface TBChartProps {
  timelineData: TimelinePoint[];
  timeStats: { label: string; count: number }[];
  methodStats: { name: string; count: number }[];
}

export default function TBMedicationChart({ timelineData, timeStats: initialTimeStats, methodStats: initialMethodStats }: TBChartProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'time' | 'method'>('timeline');
  const [filterMode, setFilterMode] = useState<'range' | 'month'>('range');
  const [rangeFilter, setRangeFilter] = useState<number>(30); // 14, 30, 60, 0 (all)
  const [selectedMonth, setSelectedMonth] = useState<string>('all');

  // Extract unique available months from timeline data
  const availableMonths = Array.from(
    new Set(
      timelineData
        .map((d) => d.date?.slice(0, 7))
        .filter((m) => m && /^\d{4}-\d{2}$/.test(m))
    )
  ).sort();

  // Filtered timeline data
  let filteredTimeline = timelineData;
  if (filterMode === 'month' && selectedMonth !== 'all') {
    filteredTimeline = timelineData.filter((d) => d.date?.startsWith(selectedMonth));
  } else if (filterMode === 'range' && rangeFilter > 0) {
    filteredTimeline = timelineData.slice(-rangeFilter);
  }

  // Dynamic time stats based on filtered data
  const dynamicTimeStats = (() => {
    if (filterMode === 'range' && rangeFilter === 0) return initialTimeStats;
    const timeDistribution: Record<string, number> = {
      'Sebelum 06:00': 0,
      '06:00 - 06:30': 0,
      '06:30 - 07:00': 0,
      'Setelah 07:00': 0,
    };
    filteredTimeline.forEach((l) => {
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
    return Object.entries(timeDistribution).map(([label, count]) => ({ label, count }));
  })();

  // Dynamic method stats based on filtered data
  const dynamicMethodStats = (() => {
    if (filterMode === 'range' && rangeFilter === 0) return initialMethodStats;
    const methodCounts: Record<string, number> = {};
    filteredTimeline.forEach((l) => {
      const m = l.method || 'Lainnya';
      methodCounts[m] = (methodCounts[m] || 0) + 1;
    });
    return Object.entries(methodCounts).map(([name, count]) => ({ name, count }));
  })();

  const formatMonthName = (mStr: string) => {
    if (mStr === 'all') return 'Semua Bulan';
    try {
      const d = new Date(`${mStr}-01`);
      return d.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    } catch {
      return mStr;
    }
  };

  const colors = ['#D97706', '#2563EB', '#059669', '#7C3AED', '#DC2626'];

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      {/* Chart Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
            <Activity size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Grafik & Tren Pengobatan TB</h3>
            <p className="text-xs text-[var(--text-muted)]">Visualisasi efektivitas & kedisiplinan minum OAT</p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-[var(--bg-secondary)] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'timeline'
                ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <TrendingUp size={13} />
            <span>Tren % Dosis</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('time')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'time'
                ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Clock size={13} />
            <span>Jam Minum</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('method')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${
              activeTab === 'method'
                ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Award size={13} />
            <span>Metode</span>
          </button>
        </div>
      </div>

      {/* Filter Mode & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-[var(--bg-primary)] p-2.5 rounded-2xl border border-[var(--border-color)]">
        <div className="flex items-center gap-1.5 font-semibold text-[var(--text-muted)]">
          <Filter size={13} className="text-[var(--accent-gold)]" />
          <span>Filter Grafik:</span>
          <div className="flex p-0.5 bg-[var(--bg-secondary)] rounded-lg text-[11px] ml-1">
            <button
              type="button"
              onClick={() => setFilterMode('range')}
              className={`px-2 py-0.5 rounded transition-all ${
                filterMode === 'range'
                  ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] font-bold shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Hari
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('month')}
              className={`px-2 py-0.5 rounded transition-all ${
                filterMode === 'month'
                  ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] font-bold shadow-xs'
                  : 'text-[var(--text-muted)]'
              }`}
            >
              Per-Bulan
            </button>
          </div>
        </div>

        {filterMode === 'range' ? (
          <div className="flex gap-1.5">
            {[
              { label: '14 Hari', val: 14 },
              { label: '30 Hari', val: 30 },
              { label: '60 Hari', val: 60 },
              { label: 'Semua', val: 0 },
            ].map((item) => (
              <button
                key={item.val}
                type="button"
                onClick={() => setRangeFilter(item.val)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                  rangeFilter === item.val
                    ? 'bg-[var(--accent-gold-light)] text-[var(--accent-gold)] border border-[var(--accent-gold)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-[var(--accent-gold)] shrink-0" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1 px-2.5 text-xs font-bold rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            >
              <option value="all">Semua Bulan</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {formatMonthName(m)}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-1">
        {activeTab === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTbPct" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D97706" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#D97706" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" vertical={false} />
              <XAxis
                dataKey="day_number"
                tickFormatter={(val) => `H${val}`}
                tick={{ fontSize: 10, fill: '#7C6E60' }}
                dy={6}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fontSize: 10, fill: '#7C6E60' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload as TimelinePoint;
                    return (
                      <div className="bg-white p-3 rounded-xl border border-[var(--border-color)] shadow-lg text-xs space-y-1">
                        <div className="flex items-center justify-between gap-3 border-b border-gray-100 pb-1">
                          <span className="font-extrabold text-[var(--text-main)]">Hari Ke-{data.day_number}</span>
                          <span className="font-semibold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                            {data.notes || `${data.percentage}%`}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)]">Tanggal: {data.date}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Jam Minum: {data.time || '-'}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Metode: {data.method}</p>
                        <p className="text-[11px] text-[var(--text-muted)]">Status: {data.status}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="percentage"
                name="Persentase Masuk"
                stroke="#D97706"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorTbPct)"
                dot={{ r: 3, fill: '#D97706' }}
                activeDot={{ r: 6, fill: '#B45309' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'time' && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dynamicTimeStats} margin={{ top: 15, right: 15, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7C6E60' }} interval={0} dy={5} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: '#7C6E60' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DFD1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" name="Jumlah Hari" radius={[8, 8, 0, 0]}>
                {dynamicTimeStats.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === 'method' && (
          <div className="h-full flex flex-col justify-center space-y-3 px-2">
            {dynamicMethodStats.map((item, idx) => {
              const total = dynamicMethodStats.reduce((a, b) => a + b.count, 0) || 1;
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-[var(--text-main)]">{item.name}</span>
                    <span className="text-[var(--text-muted)]">
                      {item.count} hari ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[var(--bg-secondary)] h-3 rounded-full overflow-hidden border border-[var(--border-color)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: colors[idx % colors.length],
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span>💡 Disarankan minum OAT pagi hari saat perut kosong (1 jam sebelum makan).</span>
      </div>
    </div>
  );
}

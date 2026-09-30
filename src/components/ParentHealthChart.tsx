'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import { ParentLabCheck, ParentRole } from '@/lib/types';
import { BarChart3, TrendingDown, Activity, Heart, Calendar, Filter } from 'lucide-react';

interface ParentHealthChartProps {
  intakeData: any[];
  labData: ParentLabCheck[];
  role: ParentRole;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  days: number;
  onDaysChange: (d: number) => void;
  filterMode: 'days' | 'month';
  onFilterModeChange: (mode: 'days' | 'month') => void;
}

export default function ParentHealthChart({
  intakeData,
  labData,
  role,
  selectedMonth,
  onMonthChange,
  days,
  onDaysChange,
  filterMode,
  onFilterModeChange,
}: ParentHealthChartProps) {
  const [activeTab, setActiveTab] = useState<'intake' | 'lab'>('intake');

  const maxUricAcidNormal = role === 'ayah' ? 7.0 : 6.0;
  const monthTitle = new Date(`${selectedMonth}-01`).toLocaleDateString('id-ID', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <BarChart3 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Grafik & Analisis Diet {role === 'ayah' ? 'Ayah' : 'Ibu'}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Tren asupan harian vs hasil pemeriksaan kadar darah
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-[var(--bg-secondary)] rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('intake')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'intake'
                ? 'bg-[var(--bg-card)] text-emerald-700 shadow-sm font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <Activity size={13} />
            <span>Asupan Kolest & Purin</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lab')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'lab'
                ? 'bg-[var(--bg-card)] text-indigo-700 shadow-sm font-bold'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <TrendingDown size={13} />
            <span>Tren Hasil Lab</span>
          </button>
        </div>
      </div>

      {/* Filter Mode & Controls (Only for Intake Tab) */}
      {activeTab === 'intake' && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs bg-[var(--bg-primary)] p-2.5 rounded-2xl border border-[var(--border-color)]">
          <div className="flex items-center gap-1.5 font-semibold text-[var(--text-muted)]">
            <Filter size={13} className="text-emerald-600" />
            <span>Filter Rentang:</span>
            <div className="flex p-0.5 bg-[var(--bg-secondary)] rounded-lg text-[11px] ml-1">
              <button
                type="button"
                onClick={() => onFilterModeChange('days')}
                className={`px-2 py-0.5 rounded transition-all ${
                  filterMode === 'days'
                    ? 'bg-[var(--bg-card)] text-emerald-700 font-bold shadow-xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Hari
              </button>
              <button
                type="button"
                onClick={() => onFilterModeChange('month')}
                className={`px-2 py-0.5 rounded transition-all ${
                  filterMode === 'month'
                    ? 'bg-[var(--bg-card)] text-emerald-700 font-bold shadow-xs'
                    : 'text-[var(--text-muted)]'
                }`}
              >
                Per-Bulan
              </button>
            </div>
          </div>

          {filterMode === 'days' ? (
            <div className="flex gap-1.5">
              {[
                { label: '7 Hari', val: 7 },
                { label: '14 Hari', val: 14 },
                { label: '30 Hari', val: 30 },
              ].map((item) => (
                <button
                  key={item.val}
                  type="button"
                  onClick={() => onDaysChange(item.val)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                    days === item.val
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border-color)]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-emerald-600 shrink-0" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="py-1 px-2.5 text-xs font-bold rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
              <span className="text-[11px] font-bold text-emerald-700 whitespace-nowrap">
                {monthTitle}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Chart Canvas */}
      <div className="h-64 w-full pt-2">
        {activeTab === 'intake' ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={intakeData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorChol" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E11D48" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E11D48" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorPurine" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563EB" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#7C6E60' }} dy={5} />
              <YAxis tick={{ fontSize: 10, fill: '#7C6E60' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DFD1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine y={200} stroke="#E11D48" strokeDasharray="3 3" label={{ value: 'Batas Kolest (200mg)', fill: '#E11D48', fontSize: 9 }} />
              <Area
                type="monotone"
                dataKey="cholesterol"
                name="Kolesterol (mg)"
                stroke="#E11D48"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorChol)"
                dot={{ r: 3, fill: '#E11D48' }}
              />
              <Area
                type="monotone"
                dataKey="purine"
                name="Purin (mg)"
                stroke="#2563EB"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorPurine)"
                dot={{ r: 3, fill: '#2563EB' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={labData} margin={{ top: 15, right: 15, left: -20, bottom: 15 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#7C6E60' }} dy={5} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: '#7C6E60' }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: '#7C6E60' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DFD1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine yAxisId="left" y={maxUricAcidNormal} stroke="#2563EB" strokeDasharray="3 3" label={{ value: `Maks Asam Urat (${maxUricAcidNormal})`, fill: '#2563EB', fontSize: 9 }} />
              <ReferenceLine yAxisId="right" y={200} stroke="#E11D48" strokeDasharray="3 3" label={{ value: 'Maks Kolest (200)', fill: '#E11D48', fontSize: 9 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="uric_acid"
                name="Asam Urat (mg/dL)"
                stroke="#2563EB"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563EB' }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="total_cholesterol"
                name="Kolesterol Total (mg/dL)"
                stroke="#E11D48"
                strokeWidth={3}
                dot={{ r: 5, fill: '#E11D48' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Kolesterol (Maks 200mg/hari)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" /> Purin (Maks 400mg/hari)
        </span>
      </div>
    </div>
  );
}

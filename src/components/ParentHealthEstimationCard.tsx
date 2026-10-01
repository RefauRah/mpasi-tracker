'use client';

import { ParentDailyHealthEstimation } from '@/lib/types';
import {
  TrendingDown,
  TrendingUp,
  Minus,
  Sparkles,
  Activity,
  Heart,
  Droplets,
  Leaf,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';

interface ParentHealthEstimationCardProps {
  estimation: ParentDailyHealthEstimation;
  role: 'ayah' | 'ibu';
}

export default function ParentHealthEstimationCard({
  estimation,
  role,
}: ParentHealthEstimationCardProps) {
  const { uric_acid, cholesterol, hasLabBaseline, baselineDate, advice } = estimation;

  const renderTrendBadge = (trend: 'turun' | 'naik' | 'stabil', pct: number) => {
    if (trend === 'turun') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 animate-pulse">
          <TrendingDown size={14} className="text-emerald-700" />
          <span>Turun {Math.abs(pct)}%</span>
        </span>
      );
    }
    if (trend === 'naik') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
          <TrendingUp size={14} className="text-rose-700" />
          <span>Naik +{pct}%</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
        <Minus size={14} className="text-blue-600" />
        <span>Stabil ({pct}%)</span>
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 text-white rounded-[var(--radius-lg)] p-5 shadow-lg border border-indigo-700/50 space-y-4 animate-fade-in relative overflow-hidden">
      {/* Decorative background flare */}
      <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950 rounded-2xl shadow-md font-bold shrink-0">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-white tracking-wide flex items-center gap-1.5">
                <span>Estimasi & Proyeksi Dampak Asupan Hari Ini</span>
              </h3>
            </div>
            <p className="text-[11px] text-indigo-200 font-medium">
              {hasLabBaseline
                ? `Diproyeksikan dari hasil cek lab terakhir (${baselineDate}) & makanan hari ini`
                : `Simulasi dampak makanan hari ini terhadap nilai dasar kesehatan ${role === 'ayah' ? 'Ayah' : 'Ibu'}`}
            </p>
          </div>
        </div>

        <span className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-white/10 text-indigo-200 backdrop-blur-xs shrink-0 border border-white/10">
          ⚡ Real-time AI
        </span>
      </div>

      {/* Two Metric Estimation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
        {/* 1. ASAM URAT ESTIMATION */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2.5 transition-all hover:bg-white/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
              <Activity size={16} className="text-amber-400" />
              <span>Estimasi Asam Urat</span>
            </span>
            {renderTrendBadge(uric_acid.trend, uric_acid.change_pct)}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {uric_acid.estimated}
                </span>
                <span className="text-xs font-medium text-indigo-200">mg/dL</span>
              </div>
              <span className="text-[10px] text-indigo-300 block">
                Baseline:{' '}
                <strong className="text-white">
                  {uric_acid.baseline} mg/dL
                </strong>
                {uric_acid.diff !== 0 && (
                  <span className={uric_acid.diff < 0 ? ' text-emerald-300 font-bold ml-1' : ' text-rose-300 font-bold ml-1'}>
                    ({uric_acid.diff > 0 ? `+${uric_acid.diff}` : uric_acid.diff})
                  </span>
                )}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  uric_acid.status === 'normal'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : uric_acid.status === 'waspada'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                    : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                }`}
              >
                {uric_acid.status === 'normal' ? '✅ Aman' : uric_acid.status === 'waspada' ? '⚠️ Waspada' : '🚨 Tinggi'}
              </span>
              <span className="text-[9px] text-indigo-300 block mt-1">
                Batas Aman: &le; {role === 'ayah' ? '7.0' : '6.0'} mg/dL
              </span>
            </div>
          </div>

          <p className="text-[11px] text-indigo-100/90 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5">
            {uric_acid.reason}
          </p>
        </div>

        {/* 2. KOLESTEROL ESTIMATION */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 space-y-2.5 transition-all hover:bg-white/15">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-100 flex items-center gap-1.5">
              <Heart size={16} className="text-rose-400" />
              <span>Estimasi Kolesterol Total</span>
            </span>
            {renderTrendBadge(cholesterol.trend, cholesterol.change_pct)}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white tracking-tight">
                  {cholesterol.estimated}
                </span>
                <span className="text-xs font-medium text-indigo-200">mg/dL</span>
              </div>
              <span className="text-[10px] text-indigo-300 block">
                Baseline:{' '}
                <strong className="text-white">
                  {cholesterol.baseline} mg/dL
                </strong>
                {cholesterol.diff !== 0 && (
                  <span className={cholesterol.diff < 0 ? ' text-emerald-300 font-bold ml-1' : ' text-rose-300 font-bold ml-1'}>
                    ({cholesterol.diff > 0 ? `+${cholesterol.diff}` : cholesterol.diff})
                  </span>
                )}
              </span>
            </div>

            <div className="text-right">
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                  cholesterol.status === 'normal'
                    ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                    : cholesterol.status === 'waspada'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                    : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                }`}
              >
                {cholesterol.status === 'normal' ? '✅ Ideal' : cholesterol.status === 'waspada' ? '⚠️ Batas Tinggi' : '🚨 Tinggi'}
              </span>
              <span className="text-[9px] text-indigo-300 block mt-1">
                Batas Aman: &lt; 200 mg/dL
              </span>
            </div>
          </div>

          <p className="text-[11px] text-indigo-100/90 leading-relaxed bg-black/20 p-2 rounded-xl border border-white/5">
            {cholesterol.reason}
          </p>
        </div>
      </div>

      {/* Advice Summary Bar */}
      <div className="p-3 bg-emerald-950/60 rounded-xl border border-emerald-500/30 flex items-start gap-2.5 text-xs text-emerald-200 relative z-10">
        <Info size={16} className="text-emerald-400 shrink-0 mt-0.5" />
        <p className="text-[11px] leading-relaxed">
          <strong className="text-white">Rekomendasi Klinis:</strong> {advice}
        </p>
      </div>
    </div>
  );
}

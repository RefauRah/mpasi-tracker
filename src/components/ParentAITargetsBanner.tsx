'use client';

import { useState } from 'react';
import { AITargetAssessment } from '@/lib/types';
import {
  Brain,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Flame,
  Droplets,
  Apple,
  ChevronDown,
  ChevronUp,
  Activity,
  Calendar,
} from 'lucide-react';

interface ParentAITargetsBannerProps {
  assessment: AITargetAssessment | null;
  loading?: boolean;
  onManualSync?: () => void;
  isSyncing?: boolean;
}

export default function ParentAITargetsBanner({
  assessment,
  loading,
  onManualSync,
  isSyncing = false,
}: ParentAITargetsBannerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (loading) {
    return (
      <div className="p-4 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-sm animate-pulse space-y-2">
        <div className="h-4 bg-[var(--bg-secondary)] rounded w-1/3"></div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-2/3"></div>
      </div>
    );
  }

  if (!assessment) return null;

  const isStrict = assessment.phase === 'pemulihan_ketat';
  const isCaution = assessment.phase === 'pencegahan_waspada';

  const badgeBg = isStrict
    ? 'bg-red-500 text-white'
    : isCaution
    ? 'bg-amber-500 text-white'
    : 'bg-emerald-600 text-white';

  const containerBorder = isStrict
    ? 'border-red-300 bg-gradient-to-br from-red-50/70 via-amber-50/50 to-white'
    : isCaution
    ? 'border-amber-300 bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white'
    : 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white';

  return (
    <div className={`rounded-[var(--radius-lg)] p-4 border ${containerBorder} shadow-sm space-y-3.5 transition-all`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-2.5 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-2xl shadow-sm shrink-0">
            <Brain size={20} />
          </div>
          <div className="space-y-0.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <h3 className="text-xs font-black text-[var(--text-main)] flex items-center gap-1">
                <Sparkles size={13} className="text-amber-500" />
                <span>Target Harian AI (Otomatis dari Cek Darah)</span>
              </h3>
              <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${badgeBg}`}>
                {isStrict ? '🚨 Fase Penurunan Ketat' : isCaution ? '⚠️ Fase Waspada' : '✅ Pemeliharaan'}
              </span>
            </div>

            <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
              {assessment.summary}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {onManualSync && (
            <button
              type="button"
              onClick={onManualSync}
              disabled={isSyncing}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-extrabold flex items-center gap-1 transition-all shadow-xs disabled:opacity-50"
              title="Analisis & Sinkronkan Target AI dari Lab Terbaru"
            >
              <Sparkles size={12} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Menganalisis...' : 'Sinkronkan AI'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors shrink-0"
            title="Detail Penyesuaian AI"
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Target Metrics Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
        {/* Purin Limit */}
        <div className="bg-[var(--bg-card)]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[var(--border-color)] shadow-2xs space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold">
            <span>Batas Purin AI</span>
            {assessment.uricAcidStatus === 'tinggi' ? (
              <Flame size={13} className="text-red-500" />
            ) : assessment.uricAcidStatus === 'waspada' ? (
              <Flame size={13} className="text-amber-500" />
            ) : (
              <CheckCircle2 size={13} className="text-emerald-600" />
            )}
          </div>
          <p className="text-sm font-black text-[var(--text-main)]">
            &le; {assessment.adjusted_purine_max} <span className="text-[10px] font-normal text-[var(--text-muted)]">mg/hari</span>
          </p>
          <span
            className={`text-[9px] font-semibold block ${
              assessment.uricAcidStatus === 'tinggi'
                ? 'text-red-600 font-bold'
                : assessment.uricAcidStatus === 'waspada'
                ? 'text-amber-700 font-bold'
                : 'text-emerald-700'
            }`}
          >
            Lab: {assessment.uricAcid !== null ? `${assessment.uricAcid} mg/dL (${assessment.uricAcidStatus === 'tinggi' ? 'Tinggi' : assessment.uricAcidStatus === 'waspada' ? 'Waspada' : 'Normal'})` : 'Belum dicek'}
          </span>
        </div>

        {/* Kolesterol Limit */}
        <div className="bg-[var(--bg-card)]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[var(--border-color)] shadow-2xs space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold">
            <span>Batas Kolesterol AI</span>
            {assessment.cholesterolStatus === 'tinggi' ? (
              <ShieldAlert size={13} className="text-red-500" />
            ) : assessment.cholesterolStatus === 'waspada' ? (
              <ShieldAlert size={13} className="text-amber-500" />
            ) : (
              <CheckCircle2 size={13} className="text-emerald-600" />
            )}
          </div>
          <p className="text-sm font-black text-[var(--text-main)]">
            &le; {assessment.adjusted_cholesterol_max} <span className="text-[10px] font-normal text-[var(--text-muted)]">mg/hari</span>
          </p>
          <span
            className={`text-[9px] font-semibold block ${
              assessment.cholesterolStatus === 'tinggi'
                ? 'text-red-600 font-bold'
                : assessment.cholesterolStatus === 'waspada'
                ? 'text-amber-700 font-bold'
                : 'text-emerald-700'
            }`}
          >
            Lab: {assessment.totalCholesterol !== null ? `${assessment.totalCholesterol} mg/dL (${assessment.cholesterolStatus === 'tinggi' ? 'Tinggi' : assessment.cholesterolStatus === 'waspada' ? 'Waspada' : 'Normal'})` : 'Belum dicek'}
          </span>
        </div>

        {/* Serat Min */}
        <div className="bg-[var(--bg-card)]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[var(--border-color)] shadow-2xs space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold">
            <span>Target Serat AI</span>
            <Apple size={12} className="text-emerald-600" />
          </div>
          <p className="text-sm font-black text-[var(--text-main)]">
            &ge; {assessment.adjusted_fiber_min} <span className="text-[10px] font-normal text-[var(--text-muted)]">g/hari</span>
          </p>
          <span className="text-[9px] text-[var(--text-muted)] block">Serat Pengikat Kolesterol</span>
        </div>

        {/* Air Minum */}
        <div className="bg-[var(--bg-card)]/90 backdrop-blur-sm p-2.5 rounded-xl border border-[var(--border-color)] shadow-2xs space-y-0.5">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-semibold">
            <span>Target Air Minum</span>
            <Droplets size={12} className="text-blue-500" />
          </div>
          <p className="text-sm font-black text-[var(--text-main)]">
            {assessment.adjusted_water_glasses} <span className="text-[10px] font-normal text-[var(--text-muted)]">gelas ({((assessment.adjusted_water_glasses || 8) * 0.25).toFixed(1)}L)</span>
          </p>
          <span className="text-[9px] text-[var(--text-muted)] block">Pelarut Asam Urat</span>
        </div>
      </div>

      {/* Expandable Directives and Recommendations */}
      {isExpanded && (
        <div className="space-y-3 pt-2 border-t border-[var(--border-color)] animate-fade-in text-xs">
          {assessment.directives && assessment.directives.length > 0 && (
            <div className="space-y-1">
              <h4 className="font-bold text-[var(--text-main)] flex items-center gap-1 text-[11px]">
                <Activity size={12} className="text-indigo-600" />
                <span>Instruksi Klinis Pola Makan:</span>
              </h4>
              <ul className="space-y-1 pl-4 list-disc text-[var(--text-main)]">
                {assessment.directives.map((dir, idx) => (
                  <li key={idx} className="text-[11px] leading-relaxed">
                    {dir}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {assessment.recommendations && assessment.recommendations.length > 0 && (
            <div className="p-2.5 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] space-y-1">
              <h4 className="font-bold text-emerald-800 flex items-center gap-1 text-[11px]">
                <CheckCircle2 size={12} className="text-emerald-600" />
                <span>Pilihan Bahan Makanan Sangat Dianjurkan:</span>
              </h4>
              <p className="text-[11px] text-[var(--text-muted)]">
                {assessment.recommendations.join(', ')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

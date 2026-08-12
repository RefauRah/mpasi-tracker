'use client';

import { useState } from 'react';
import { NutritionSummary, NutritionTarget } from '@/lib/types';
import { getNutritionTarget } from '@/lib/nutrition-targets';
import { Flame, BicepsFlexed, Wheat, Droplet, Leaf, ShieldAlert, Sparkles, SlidersHorizontal } from 'lucide-react';

interface NutritionProgressProps {
  summary: NutritionSummary;
  target: NutritionTarget;
  ageMonths: number;
}

export default function NutritionProgress({ summary, target: initialTarget, ageMonths }: NutritionProgressProps) {
  const [targetMode, setTargetMode] = useState<'mpasi_only' | 'akg_total'>('mpasi_only');

  const activeTarget = getNutritionTarget(ageMonths, targetMode);

  const calPercent = activeTarget.calories > 0 ? Math.min(100, Math.round((summary.calories / activeTarget.calories) * 100)) : 0;

  const nutrients = [
    { key: 'protein', label: 'Protein', current: summary.protein, target: activeTarget.protein, unit: 'g', icon: BicepsFlexed, color: 'bg-amber-500' },
    { key: 'carbs', label: 'Karbohidrat', current: summary.carbs, target: activeTarget.carbs, unit: 'g', icon: Wheat, color: 'bg-orange-400' },
    { key: 'fat', label: 'Lemak', current: summary.fat, target: activeTarget.fat, unit: 'g', icon: Droplet, color: 'bg-yellow-500' },
    { key: 'fiber', label: 'Serat', current: summary.fiber, target: activeTarget.fiber, unit: 'g', icon: Leaf, color: 'bg-emerald-500' },
    { key: 'iron', label: 'Zat Besi', current: summary.iron, target: activeTarget.iron, unit: 'mg', icon: ShieldAlert, color: 'bg-red-400' },
    { key: 'calcium', label: 'Kalsium', current: summary.calcium, target: activeTarget.calcium, unit: 'mg', icon: Sparkles, color: 'bg-teal-500' },
  ];

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      {/* Top Header & Mode Toggle */}
      <div className="flex justify-between items-start border-b border-[var(--border-color)] pb-3">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-bold">Target Gizi Harian</span>
          <h3 className="text-sm font-extrabold text-[var(--text-main)]">{activeTarget.ageLabel}</h3>
        </div>

        {/* Mode Selector Toggle */}
        <div className="flex bg-[var(--bg-primary)] p-0.5 rounded-xl border border-[var(--border-color)]">
          <button
            type="button"
            onClick={() => setTargetMode('mpasi_only')}
            className={`py-1 px-2 text-[10px] font-bold rounded-lg transition-all ${
              targetMode === 'mpasi_only'
                ? 'bg-[var(--accent-gold)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="Target Khusus Dari Makanan MPASI Saja"
          >
            MPASI Saja
          </button>
          <button
            type="button"
            onClick={() => setTargetMode('akg_total')}
            className={`py-1 px-2 text-[10px] font-bold rounded-lg transition-all ${
              targetMode === 'akg_total'
                ? 'bg-[var(--accent-gold)] text-white shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            title="AKG Kemenkes RI Total Harian (Termasuk ASI & Makanan)"
          >
            AKG Total RI
          </button>
        </div>
      </div>

      {/* Main Calories Card */}
      <div className="flex items-center justify-between bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)]">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-[var(--accent-terracotta)] font-bold text-sm">
            <Flame size={18} />
            <span>Total Kalori Makanan</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-[var(--text-main)]">{summary.calories}</span>
            <span className="text-sm font-medium text-[var(--text-muted)]">/ {activeTarget.calories} kkal</span>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            {calPercent >= 100
              ? '🎉 Target kalori hari ini telah tercapai!'
              : `Butuh ${(activeTarget.calories - summary.calories > 0 ? activeTarget.calories - summary.calories : 0)} kkal lagi (${targetMode === 'mpasi_only' ? 'dari MPASI' : 'dari Makanan+ASI'}).`}
          </p>
        </div>

        {/* Circular Progress Gauge */}
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path
              className="text-[var(--border-color)]"
              strokeWidth="3.5"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-[var(--accent-terracotta)] transition-all duration-700 ease-out"
              strokeDasharray={`${calPercent}, 100`}
              strokeWidth="3.5"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-sm font-extrabold text-[var(--text-main)]">{calPercent}%</span>
          </div>
        </div>
      </div>

      {/* Nutrients Progress Grid */}
      <div className="grid grid-cols-2 gap-3">
        {nutrients.map((item) => {
          const Icon = item.icon;
          const pct = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0;
          return (
            <div key={item.key} className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-[var(--text-main)]">
                  <Icon size={14} className="text-[var(--text-muted)]" />
                  {item.label}
                </span>
                <span className="font-bold text-[var(--text-muted)]">{pct}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-[var(--border-color)] h-2 rounded-full overflow-hidden mb-1">
                <div
                  className={`h-full ${item.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                <span>{item.current} {item.unit}</span>
                <span>/ {item.target} {item.unit}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

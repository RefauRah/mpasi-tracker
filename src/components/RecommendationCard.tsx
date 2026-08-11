'use client';

import { useState } from 'react';
import { MenuRecommendation } from '@/lib/types';
import { Sparkles, Plus, Check } from 'lucide-react';

interface RecommendationCardProps {
  recommendations: MenuRecommendation[];
  onAddMeal: (title: string) => Promise<void>;
  loading?: boolean;
}

export default function RecommendationCard({
  recommendations,
  onAddMeal,
  loading,
}: RecommendationCardProps) {
  const [addingIdx, setAddingIdx] = useState<number | null>(null);
  const [addedIdxs, setAddedIdxs] = useState<number[]>([]);

  const handleQuickAdd = async (rec: MenuRecommendation, idx: number) => {
    setAddingIdx(idx);
    try {
      await onAddMeal(rec.title);
      setAddedIdxs((prev) => [...prev, idx]);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingIdx(null);
    }
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-[var(--accent-sage-light)] rounded-xl text-[var(--accent-sage)]">
          <Sparkles size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Rekomendasi Menu AI</h3>
          <p className="text-xs text-[var(--text-muted)]">Disesuaikan untuk kebutuhan gizi si kecil hari ini</p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-xs text-[var(--text-muted)] flex flex-col items-center gap-2">
          <Sparkles size={24} className="animate-spin text-[var(--accent-gold)]" />
          <span>AI sedang meracik ide menu MPASI...</span>
        </div>
      ) : recommendations.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-2">
          Belum ada rekomendasi menu. Tekan tombol "Minta Rekomendasi AI" untuk mendapatkan ide menu.
        </p>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec, idx) => {
            const isAdded = addedIdxs.includes(idx);
            const isAdding = addingIdx === idx;

            return (
              <div
                key={idx}
                className="p-3.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] flex justify-between items-start gap-3 hover:border-[var(--accent-sage)] transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-[var(--text-main)]">{rec.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-sage-light)] text-[var(--accent-sage)]">
                      ~{rec.estimatedCalories} kkal
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {rec.description}
                  </p>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {rec.nutrientsProvided.map((nut, nIdx) => (
                      <span
                        key={nIdx}
                        className="text-[10px] px-2 py-0.5 rounded-md bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] font-medium"
                      >
                        ✓ {nut}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickAdd(rec, idx)}
                  disabled={isAdded || isAdding}
                  className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0 ${
                    isAdded
                      ? 'bg-emerald-100 text-emerald-700 cursor-default'
                      : 'bg-[var(--accent-sage)] text-white hover:opacity-90 shadow-sm'
                  }`}
                  title="Tambah ke Log Hari Ini"
                >
                  {isAdded ? (
                    <>
                      <Check size={16} />
                      <span className="hidden sm:inline">Tersimpan</span>
                    </>
                  ) : isAdding ? (
                    <Sparkles size={16} className="animate-spin" />
                  ) : (
                    <>
                      <Plus size={16} />
                      <span className="hidden sm:inline">Tambah</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

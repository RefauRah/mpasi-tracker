'use client';

import { ParentRecommendation } from '@/lib/types';
import { Sparkles, Plus, CheckCircle2, ShieldCheck, Heart, Leaf } from 'lucide-react';

interface ParentRecommendationCardProps {
  recommendations: ParentRecommendation[];
  onAddMeal: (title: string) => void;
  loading: boolean;
}

export default function ParentRecommendationCard({
  recommendations,
  onAddMeal,
  loading,
}: ParentRecommendationCardProps) {
  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] text-center text-xs text-[var(--text-muted)] space-y-2">
        <Sparkles size={20} className="animate-spin mx-auto text-emerald-600" />
        <p>AI sedang merancang menu sehat ramah asam urat & kolesterol...</p>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4 animate-fade-in">
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <Sparkles size={18} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">
            Rekomendasi Menu Rendah Purin & Kolesterol
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Saran menu bergizi seimbang khusus untuk mempercepat pemulihan
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {recommendations.map((rec, idx) => (
          <div
            key={idx}
            className="p-3.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] hover:border-emerald-400 transition-all flex flex-col justify-between space-y-2.5"
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {rec.category || 'Menu Sehat'}
                </span>
                <span className="text-xs font-bold text-[var(--text-muted)]">
                  ~{rec.estimated_calories} kkal
                </span>
              </div>

              <h4 className="font-bold text-xs text-[var(--text-main)] leading-snug">{rec.title}</h4>
              <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">{rec.description}</p>

              <div className="flex flex-wrap gap-1 pt-1">
                {rec.benefits?.map((b, bIdx) => (
                  <span
                    key={bIdx}
                    className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white border border-[var(--border-color)] text-emerald-800"
                  >
                    ✓ {b}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => onAddMeal(rec.title)}
              className="w-full py-2 px-3 bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1 mt-2"
            >
              <Plus size={13} />
              <span>+ Catat Menu Ini</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

'use client';

import { ParentMeal } from '@/lib/types';
import { Trash2, Clock, AlertCircle, Heart, Activity, Leaf } from 'lucide-react';

interface ParentFoodCardProps {
  meal: ParentMeal;
  onDelete: (id: number) => void;
}

export default function ParentFoodCard({ meal, onDelete }: ParentFoodCardProps) {
  const getMealTypeBadge = (type: string) => {
    switch (type) {
      case 'sarapan':
        return { label: 'Sarapan', bg: 'bg-amber-100 text-amber-800' };
      case 'makan_siang':
        return { label: 'Makan Siang', bg: 'bg-orange-100 text-orange-800' };
      case 'makan_malam':
        return { label: 'Makan Malam', bg: 'bg-indigo-100 text-indigo-800' };
      default:
        return { label: 'Snack Sehat', bg: 'bg-emerald-100 text-emerald-800' };
    }
  };

  const badge = getMealTypeBadge(meal.meal_type);

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-4 border border-[var(--border-color)] shadow-[var(--shadow-sm)] hover:shadow-md transition-all space-y-3">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-2.5">
        <div className="flex items-center gap-2">
          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-lg ${badge.bg}`}>
            {badge.label}
          </span>
          <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 font-medium">
            <Clock size={12} /> {meal.meal_time || '08:00'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
            {meal.total_calories} kkal
          </span>
          <button
            onClick={() => onDelete(meal.id)}
            className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-lg transition-colors"
            title="Hapus Makanan"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Input Text Title */}
      <div>
        <p className="text-xs font-bold text-[var(--text-main)] leading-snug">{meal.input_text}</p>
      </div>

      {/* Food Items Pills with Purine & Cholesterol Badges */}
      <div className="space-y-1.5">
        {meal.foods?.map((f, idx) => (
          <div
            key={idx}
            className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
          >
            <div className="space-y-0.5">
              <span className="font-semibold text-[var(--text-main)] block">{f.name}</span>
              <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                <span>{f.calories} kkal</span>
                <span>• Serat: {f.fiber}g</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[10px] font-bold">
              {f.purine_mg > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    f.purine_level === 'tinggi' || f.purine_level === 'sangat_tinggi'
                      ? 'bg-red-100 text-red-800'
                      : f.purine_level === 'sedang'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-blue-50 text-blue-700'
                  }`}
                  title={`Kadar Purin: ${f.purine_mg} mg`}
                >
                  Purin {f.purine_mg}mg
                </span>
              )}
              {f.cholesterol > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded ${
                    f.cholesterol > 100
                      ? 'bg-red-100 text-red-800'
                      : 'bg-amber-50 text-amber-800'
                  }`}
                  title={`Kolesterol: ${f.cholesterol} mg`}
                >
                  Kolest {f.cholesterol}mg
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Health Warning / Advice if any */}
      {meal.health_warning && (
        <div className="p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] text-amber-900 flex items-start gap-1.5">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span className="leading-tight">{meal.health_warning}</span>
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)] font-medium">
        <span className="flex items-center gap-1">
          <Heart size={11} className="text-rose-500" /> Kolesterol: <b>{meal.total_cholesterol} mg</b>
        </span>
        <span className="flex items-center gap-1">
          <Activity size={11} className="text-blue-500" /> Purin: <b>{meal.total_purine} mg</b>
        </span>
        <span className="flex items-center gap-1">
          <Leaf size={11} className="text-emerald-500" /> Serat: <b>{meal.total_fiber} g</b>
        </span>
      </div>
    </div>
  );
}

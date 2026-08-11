'use client';

import { useState } from 'react';
import { Meal } from '@/lib/types';
import { Trash2, ChevronDown, ChevronUp, Clock, Scale } from 'lucide-react';

interface FoodCardProps {
  meal: Meal;
  onDelete?: (id: number) => void;
}

export default function FoodCard({ meal, onDelete }: FoodCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const mealTypeBadges: Record<string, { label: string; bg: string; text: string }> = {
    sarapan: { label: 'Sarapan', bg: 'bg-amber-100', text: 'text-amber-800' },
    makan_siang: { label: 'Makan Siang', bg: 'bg-orange-100', text: 'text-orange-800' },
    makan_malam: { label: 'Makan Malam', bg: 'bg-indigo-100', text: 'text-indigo-800' },
    snack: { label: 'Snack / Camilan', bg: 'bg-emerald-100', text: 'text-emerald-800' },
  };

  const badge = mealTypeBadges[meal.meal_type] || { label: meal.meal_type, bg: 'bg-gray-100', text: 'text-gray-800' };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Apakah Anda yakin ingin menghapus catatan makanan ini?')) return;

    setDeleting(true);
    try {
      await onDelete(meal.id);
    } catch (err) {
      console.error(err);
      setDeleting(false);
    }
  };

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return '';
    try {
      const d = new Date(timeStr);
      return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] p-4 transition-all hover:shadow-[var(--shadow-md)]">
      {/* Card Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${badge.bg} ${badge.text}`}>
            {badge.label}
          </span>
          {meal.created_at && (
            <span className="text-[11px] text-[var(--text-muted)] flex items-center gap-1">
              <Clock size={12} />
              {formatTime(meal.created_at)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <span className="text-sm font-black text-[var(--accent-terracotta)]">
            +{meal.total_calories} kkal
          </span>
          {onDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1"
              title="Hapus"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Input Text Title */}
      <p className="text-sm font-semibold text-[var(--text-main)] mt-2.5">
        "{meal.input_text}"
      </p>

      {/* Quick Nutrients Summary Pill */}
      <div className="flex flex-wrap gap-2 mt-2 text-[11px] text-[var(--text-muted)]">
        <span>Protein: <strong className="text-[var(--text-main)]">{meal.total_protein}g</strong></span>
        <span>•</span>
        <span>Karbo: <strong className="text-[var(--text-main)]">{meal.total_carbs}g</strong></span>
        <span>•</span>
        <span>Lemak: <strong className="text-[var(--text-main)]">{meal.total_fat}g</strong></span>
        <span>•</span>
        <span>Zat Besi: <strong className="text-[var(--text-main)]">{meal.total_iron}mg</strong></span>
      </div>

      {/* Expand / Collapse Button */}
      {meal.foods && meal.foods.length > 0 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 text-xs font-medium text-[var(--accent-gold)] hover:underline flex items-center gap-1"
        >
          <span>{expanded ? 'Sembunyikan Rincian AI' : `Lihat ${meal.foods.length} Bahan & Rincian Nutrisi`}</span>
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      )}

      {/* Detailed AI Food Breakdown */}
      {expanded && meal.foods && (
        <div className="mt-3 pt-3 border-t border-[var(--border-color)] space-y-2 animate-fade-in">
          {meal.foods.map((food, idx) => (
            <div key={idx} className="p-2.5 bg-[var(--bg-primary)] rounded-xl text-xs space-y-1">
              <div className="flex justify-between font-bold text-[var(--text-main)]">
                <span>{food.name}</span>
                <span className="text-[var(--accent-gold)]">{food.calories} kkal</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                <Scale size={12} />
                <span>Input: {food.quantity} (~{food.estimated_grams}g)</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] text-[var(--text-muted)] border-t border-[var(--border-color)]">
                <span>Prot: {food.protein}g</span>
                <span>Karbo: {food.carbs}g</span>
                <span>Lemak: {food.fat}g</span>
                <span>Serat: {food.fiber}g</span>
                <span>Fe: {food.iron}mg</span>
                <span>Ca: {food.calcium}mg</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

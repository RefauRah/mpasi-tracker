'use client';

import { useState, useEffect, useCallback } from 'react';
import FoodCard from '@/components/FoodCard';
import MedicationSection from '@/components/MedicationSection';
import { Meal, NutritionSummary } from '@/lib/types';
import { Calendar as CalendarIcon, History } from 'lucide-react';

export default function HistoryPage() {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/meals?date=${selectedDate}`);
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDeleteMeal = async (id: number) => {
    const res = await fetch(`/api/meals?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchHistory();
    }
  };

  const daySummary: NutritionSummary = meals.reduce(
    (acc, m) => ({
      calories: Math.round(acc.calories + (m.total_calories || 0)),
      protein: Number((acc.protein + (m.total_protein || 0)).toFixed(1)),
      carbs: Number((acc.carbs + (m.total_carbs || 0)).toFixed(1)),
      fat: Number((acc.fat + (m.total_fat || 0)).toFixed(1)),
      fiber: Number((acc.fiber + (m.total_fiber || 0)).toFixed(1)),
      iron: Number((acc.iron + (m.total_iron || 0)).toFixed(1)),
      calcium: Math.round(acc.calcium + (m.total_calcium || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0 }
  );

  const formattedDateTitle = new Date(selectedDate).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--accent-gold-light)] rounded-xl text-[var(--accent-gold)]">
            <History size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-main)]">Riwayat MPASI & Kesehatan</h1>
            <p className="text-xs text-[var(--text-muted)]">Lihat kembali catatan makanan & obat per tanggal</p>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-color)]">
          <CalendarIcon size={18} className="text-[var(--text-muted)] shrink-0" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
          />
        </div>
      </div>

      {/* Day Summary Card */}
      <div className="bg-gradient-to-r from-[var(--bg-secondary)] to-[var(--bg-primary)] p-4 rounded-2xl border border-[var(--border-color)] space-y-2">
        <div className="flex justify-between items-center text-xs text-[var(--text-muted)] font-medium">
          <span>Ringkasan {formattedDateTitle}:</span>
          <span className="font-bold text-[var(--accent-terracotta)]">{daySummary.calories} kkal</span>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
          <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Protein</span>
            <span className="font-bold text-[var(--text-main)]">{daySummary.protein}g</span>
          </div>
          <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Karbo</span>
            <span className="font-bold text-[var(--text-main)]">{daySummary.carbs}g</span>
          </div>
          <div className="bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-color)]">
            <span className="text-[10px] text-[var(--text-muted)] block">Lemak</span>
            <span className="font-bold text-[var(--text-main)]">{daySummary.fat}g</span>
          </div>
        </div>
      </div>

      {/* Meals List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-[var(--text-main)]">Daftar Makanan ({meals.length})</h3>
        {loading ? (
          <div className="py-8 text-center text-xs text-[var(--text-muted)]">
            Memuat riwayat makanan...
          </div>
        ) : meals.length === 0 ? (
          <div className="p-8 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Tidak ada riwayat makanan yang tercatat pada tanggal ini.
          </div>
        ) : (
          meals.map((meal) => (
            <FoodCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
          ))
        )}
      </div>

      {/* Medications List */}
      <MedicationSection date={selectedDate} />
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import MPASISubNav from '@/components/MPASISubNav';
import FoodCard from '@/components/FoodCard';
import MedicationSection from '@/components/MedicationSection';
import Pagination from '@/components/Pagination';
import ParentMealHistory from '@/components/ParentMealHistory';
import { Meal, NutritionSummary, ParentRole } from '@/lib/types';
import { Calendar as CalendarIcon, History, Baby, User } from 'lucide-react';
import LoadingSpinner, { SkeletonList } from '@/components/LoadingSpinner';

export default function HistoryPage() {
  const [activeTab, setActiveTab] = useState<'anak' | ParentRole>('anak');
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination for meals
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchHistory = useCallback(async () => {
    if (activeTab !== 'anak') return;
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
  }, [selectedDate, activeTab]);

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

  // Reset page when date changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedDate]);

  const totalPages = Math.ceil(meals.length / pageSize) || 1;
  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return meals.slice(start, start + pageSize);
  }, [meals, currentPage, pageSize]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Role Switcher Tabs */}
      <div className="flex bg-[var(--bg-secondary)] p-1 rounded-2xl border border-[var(--border-color)]">
        <button
          onClick={() => setActiveTab('anak')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'anak'
              ? 'bg-[var(--bg-card)] text-[var(--accent-terracotta)] shadow-[var(--shadow-sm)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Baby size={16} />
          <span>MPASI Anak</span>
        </button>
        <button
          onClick={() => setActiveTab('ayah')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ayah'
              ? 'bg-[var(--bg-card)] text-blue-500 shadow-[var(--shadow-sm)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <User size={16} />
          <span>Riwayat Ayah</span>
        </button>
        <button
          onClick={() => setActiveTab('ibu')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'ibu'
              ? 'bg-[var(--bg-card)] text-pink-500 shadow-[var(--shadow-sm)]'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <User size={16} />
          <span>Riwayat Ibu</span>
        </button>
      </div>

      {activeTab === 'anak' ? (
        <div className="space-y-5">
          {/* MPASI Module Navigation */}
          <MPASISubNav />

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
              <div className="space-y-3">
                <LoadingSpinner text="Memuat riwayat makanan..." size="sm" />
                <SkeletonList count={3} />
              </div>
            ) : meals.length === 0 ? (
              <div className="p-8 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
                Tidak ada riwayat makanan yang tercatat pada tanggal ini.
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedMeals.map((meal) => (
                  <FoodCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
                ))}

                {meals.length > pageSize && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={meals.length}
                    pageSize={pageSize}
                    onPageChange={setCurrentPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[5, 10, 20]}
                  />
                )}
              </div>
            )}
          </div>

          {/* Medications List */}
          <MedicationSection date={selectedDate} />
        </div>
      ) : (
        <div className="space-y-5">
          <ParentMealHistory role={activeTab} />
        </div>
      )}
    </div>
  );
}

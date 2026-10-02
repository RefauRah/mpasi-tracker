'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { ParentMeal, ParentRole } from '@/lib/types';
import ParentFoodCard from './ParentFoodCard';
import Pagination from './Pagination';
import LoadingSpinner, { SkeletonList } from './LoadingSpinner';
import {
  History,
  Calendar,
  Search,
  Filter,
  Flame,
  Heart,
  Activity,
  Leaf,
  Clock,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';

interface ParentMealHistoryProps {
  role: ParentRole;
  onMealDeleted?: () => void;
  title?: string;
  initialDate?: string;
}

export default function ParentMealHistory({
  role,
  onMealDeleted,
  title,
  initialDate,
}: ParentMealHistoryProps) {
  const [filterType, setFilterType] = useState<'all' | 'date' | '7days' | '30days' | 'month'>(
    initialDate ? 'date' : 'all'
  );
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDate || new Date().toISOString().split('T')[0]
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [mealTypeFilter, setMealTypeFilter] = useState<string>('all');
  const [meals, setMeals] = useState<ParentMeal[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchMeals = useCallback(async () => {
    setLoading(true);
    try {
      let url = `/api/parents/meals?role=${role}`;

      if (filterType === 'date') {
        url += `&date=${selectedDate}`;
      } else if (filterType === 'month') {
        url += `&month=${selectedMonth}`;
      } else if (filterType === '7days') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 6);
        url += `&startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`;
      } else if (filterType === '30days') {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        url += `&startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`;
      } else {
        // 'all'
        url += '&date=all';
      }

      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching parent meal history:', err);
    } finally {
      setLoading(false);
    }
  }, [role, filterType, selectedDate, selectedMonth, searchQuery]);

  useEffect(() => {
    fetchMeals();
  }, [fetchMeals]);

  // Reset pagination when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [role, filterType, selectedDate, selectedMonth, searchQuery, mealTypeFilter]);

  const handleDelete = async (id: number) => {
    const res = await fetch(`/api/parents/meals?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchMeals();
      if (onMealDeleted) onMealDeleted();
    }
  };

  // Client-side meal type filter
  const filteredMeals = useMemo(() => {
    if (mealTypeFilter === 'all') return meals;
    return meals.filter((m) => m.meal_type === mealTypeFilter);
  }, [meals, mealTypeFilter]);

  // Summary statistics for the filtered dataset
  const historyStats = useMemo(() => {
    const totalCount = filteredMeals.length;
    if (totalCount === 0) {
      return { totalCal: 0, totalPurine: 0, totalChol: 0, totalFiber: 0, avgCal: 0 };
    }
    const totalCal = filteredMeals.reduce((acc, m) => acc + (m.total_calories || 0), 0);
    const totalPurine = filteredMeals.reduce((acc, m) => acc + (m.total_purine || 0), 0);
    const totalChol = filteredMeals.reduce((acc, m) => acc + (m.total_cholesterol || 0), 0);
    const totalFiber = Number(filteredMeals.reduce((acc, m) => acc + (m.total_fiber || 0), 0).toFixed(1));

    return {
      totalCal: Math.round(totalCal),
      totalPurine: Math.round(totalPurine),
      totalChol: Math.round(totalChol),
      totalFiber,
      avgCal: Math.round(totalCal / totalCount),
    };
  }, [filteredMeals]);

  // Group meals by date for clarity
  const paginatedMeals = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMeals.slice(start, start + pageSize);
  }, [filteredMeals, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredMeals.length / pageSize) || 1;

  const formatDateHeader = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-');
      const d = new Date(Number(year), Number(month) - 1, Number(day));
      return d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header & Filter Card */}
      <div className="bg-[var(--bg-card)] p-4 sm:p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <History size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[var(--text-main)]">
                {title || `Riwayat Makanan ${role === 'ayah' ? 'Ayah' : 'Ibu'}`}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)]">
                Pantau kembali catatan asupan harian, kadar purin, dan kolesterol
              </p>
            </div>
          </div>

          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
            {filteredMeals.length} Total Tercatat
          </span>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            Semua Riwayat
          </button>
          <button
            type="button"
            onClick={() => setFilterType('7days')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === '7days'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => setFilterType('30days')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === '30days'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            30 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => setFilterType('date')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
              filterType === 'date'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            <Calendar size={13} />
            <span>Pilih Tanggal</span>
          </button>
          <button
            type="button"
            onClick={() => setFilterType('month')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
              filterType === 'month'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)]'
            }`}
          >
            Pilih Bulan
          </button>
        </div>

        {/* Date & Search Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
          {filterType === 'date' && (
            <div className="sm:col-span-4 relative">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          {filterType === 'month' && (
            <div className="sm:col-span-4 relative">
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className={filterType === 'date' || filterType === 'month' ? 'sm:col-span-5' : 'sm:col-span-8'}>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                placeholder="Cari makanan (misal: ayam, tempe, oatmeal)..."
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className={filterType === 'date' || filterType === 'month' ? 'sm:col-span-3' : 'sm:col-span-4'}>
            <select
              value={mealTypeFilter}
              onChange={(e) => setMealTypeFilter(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Waktu Makan</option>
              <option value="sarapan">Sarapan</option>
              <option value="makan_siang">Makan Siang</option>
              <option value="makan_malam">Makan Malam</option>
              <option value="snack">Snack Sehat</option>
            </select>
          </div>
        </div>

        {/* Aggregate Stats Card for the filtered data */}
        {filteredMeals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--border-color)] text-xs">
            <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                <Flame size={12} className="text-orange-500" />
                <span>Total Kalori:</span>
              </span>
              <strong className="text-xs font-extrabold text-[var(--text-main)] block mt-0.5">
                {historyStats.totalCal} kkal
              </strong>
              <span className="text-[9px] text-[var(--text-muted)]">Rata-rata: {historyStats.avgCal} kkal/makan</span>
            </div>

            <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                <Activity size={12} className="text-blue-500" />
                <span>Total Purin:</span>
              </span>
              <strong className="text-xs font-extrabold text-blue-700 block mt-0.5">
                {historyStats.totalPurine} mg
              </strong>
              <span className="text-[9px] text-[var(--text-muted)]">Asam Urat</span>
            </div>

            <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                <Heart size={12} className="text-rose-500" />
                <span>Total Kolesterol:</span>
              </span>
              <strong className="text-xs font-extrabold text-rose-700 block mt-0.5">
                {historyStats.totalChol} mg
              </strong>
              <span className="text-[9px] text-[var(--text-muted)]">Kolesterol Makanan</span>
            </div>

            <div className="p-2 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1 font-medium">
                <Leaf size={12} className="text-emerald-600" />
                <span>Total Serat:</span>
              </span>
              <strong className="text-xs font-extrabold text-emerald-700 block mt-0.5">
                {historyStats.totalFiber} g
              </strong>
              <span className="text-[9px] text-[var(--text-muted)]">Serat Peluruh</span>
            </div>
          </div>
        )}
      </div>

      {/* Meals History List */}
      <div className="space-y-3">
        {loading ? (
          <div className="space-y-3">
            <LoadingSpinner text={`Memuat riwayat makanan ${role === 'ayah' ? 'Ayah' : 'Ibu'}...`} size="sm" />
            <SkeletonList count={3} />
          </div>
        ) : filteredMeals.length === 0 ? (
          <div className="p-8 bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-1">
            <p className="font-semibold text-[var(--text-main)]">Tidak ada riwayat makanan ditemukan</p>
            <p>Cobalah mengganti filter tanggal, rentang waktu, atau kata kunci pencarian di atas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedMeals.map((meal) => (
              <div key={meal.id} className="space-y-1">
                {/* Date sub-header if filtered by multiple dates */}
                {filterType !== 'date' && (
                  <div className="flex items-center gap-2 px-1 pt-1">
                    <Calendar size={12} className="text-emerald-600" />
                    <span className="text-[11px] font-black text-[var(--text-main)]">
                      {formatDateHeader(meal.date)}
                    </span>
                  </div>
                )}
                <ParentFoodCard meal={meal} onDelete={handleDelete} />
              </div>
            ))}

            {filteredMeals.length > pageSize && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredMeals.length}
                pageSize={pageSize}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

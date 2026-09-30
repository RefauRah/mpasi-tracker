'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ParentMealInput from '@/components/ParentMealInput';
import ParentNutritionProgress from '@/components/ParentNutritionProgress';
import ParentFoodCard from '@/components/ParentFoodCard';
import ParentLabSection from '@/components/ParentLabSection';
import ParentHealthChart from '@/components/ParentHealthChart';
import ParentRecommendationCard from '@/components/ParentRecommendationCard';
import Pagination from '@/components/Pagination';
import {
  ParentMeal,
  ParentProfile,
  ParentRole,
  ParentRecommendation,
  ParentLabCheck,
} from '@/lib/types';
import {
  Users,
  Heart,
  Activity,
  Sparkles,
  Calendar as CalendarIcon,
  RefreshCw,
  Plus,
  ShieldAlert,
  Flame,
  User,
} from 'lucide-react';

export default function OrangTuaDashboard() {
  const [role, setRole] = useState<ParentRole>('ayah');
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [todayMeals, setTodayMeals] = useState<ParentMeal[]>([]);
  const [labData, setLabData] = useState<ParentLabCheck[]>([]);
  const [intakeStats, setIntakeStats] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<ParentRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loading, setLoading] = useState(true);

  // Pagination for meals
  const [mealsPage, setMealsPage] = useState(1);
  const [mealsPageSize, setMealsPageSize] = useState(5);

  // Chart filters
  const [filterMode, setFilterMode] = useState<'days' | 'month'>('days');
  const [days, setDays] = useState<number>(7);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const statsUrl =
        filterMode === 'month'
          ? `/api/parents/stats?role=${role}&month=${selectedMonth}`
          : `/api/parents/stats?role=${role}&days=${days}`;

      const [profileRes, mealsRes, labRes, statsRes] = await Promise.all([
        fetch(`/api/parents/profile?role=${role}`),
        fetch(`/api/parents/meals?role=${role}&date=${todayStr}`),
        fetch(`/api/parents/lab?role=${role}`),
        fetch(statsUrl),
      ]);

      const profileData = await profileRes.json();
      const mealsData = await mealsRes.json();
      const labDataRes = await labRes.json();
      const statsData = await statsRes.json();

      setProfile(profileData);
      setTodayMeals(Array.isArray(mealsData) ? mealsData : []);
      setLabData(Array.isArray(labDataRes) ? labDataRes : []);
      setIntakeStats(Array.isArray(statsData) ? statsData : []);
    } catch (err) {
      console.error('Error fetching parent data:', err);
    } finally {
      setLoading(false);
    }
  }, [role, todayStr, filterMode, days, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Reset meals page when meals change or role changes
  useEffect(() => {
    setMealsPage(1);
  }, [role, todayMeals.length]);

  const mealsTotalPages = Math.ceil(todayMeals.length / mealsPageSize) || 1;
  const paginatedMeals = useMemo(() => {
    const start = (mealsPage - 1) * mealsPageSize;
    return todayMeals.slice(start, start + mealsPageSize);
  }, [todayMeals, mealsPage, mealsPageSize]);

  // Sum up today's nutrition
  const summary = todayMeals.reduce(
    (acc, m) => ({
      calories: Math.round(acc.calories + (m.total_calories || 0)),
      protein: Number((acc.protein + (m.total_protein || 0)).toFixed(1)),
      carbs: Number((acc.carbs + (m.total_carbs || 0)).toFixed(1)),
      fat: Number((acc.fat + (m.total_fat || 0)).toFixed(1)),
      fiber: Number((acc.fiber + (m.total_fiber || 0)).toFixed(1)),
      cholesterol: Math.round(acc.cholesterol + (m.total_cholesterol || 0)),
      purine: Math.round(acc.purine + (m.total_purine || 0)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, cholesterol: 0, purine: 0 }
  );

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/parents/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          currentCholesterol: summary.cholesterol,
          currentPurine: summary.purine,
        }),
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setRecommendations(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRecs(false);
    }
  };

  const handleQuickAddRecommendation = async (menuTitle: string) => {
    const res = await fetch('/api/parents/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input_text: menuTitle,
        parent_role: role,
        meal_type: 'snack',
        date: todayStr,
      }),
    });

    if (res.ok) {
      fetchData();
    }
  };

  const handleDeleteMeal = async (id: number) => {
    const res = await fetch(`/api/parents/meals?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchData();
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Profile & Role Switcher */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-xl shadow-md">
              {role === 'ayah' ? '👨' : '👩'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold text-[var(--text-main)]">
                  Jurnal Kesehatan {profile?.name || (role === 'ayah' ? 'Ayah' : 'Ibu')}
                </h1>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {profile?.age || 34} Tahun
                </span>
              </div>
              <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                <CalendarIcon size={12} />
                <span>{todayFormatted}</span>
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Big Role Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--bg-secondary)] rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('ayah')}
            className={`py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === 'ayah'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>👨 Profil Ayah</span>
            {role === 'ayah' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>
          <button
            type="button"
            onClick={() => setRole('ibu')}
            className={`py-2.5 px-4 text-xs font-extrabold rounded-xl transition-all flex items-center justify-center gap-2 ${
              role === 'ibu'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            <span>👩 Profil Ibu</span>
            {role === 'ibu' && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Input Meal Form */}
      <ParentMealInput role={role} onMealAdded={fetchData} />

      {/* Daily Progress Bars & Meters */}
      {profile && (
        <ParentNutritionProgress summary={summary} profile={profile} role={role} />
      )}

      {/* Today's Meals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Heart size={16} className="text-rose-500" />
            <span>Makanan Terdaftar Hari Ini ({todayMeals.length})</span>
          </h3>
        </div>

        {todayMeals.length === 0 ? (
          <div className="p-6 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Belum ada makanan yang dicatat untuk {profile?.name || (role === 'ayah' ? 'Ayah' : 'Ibu')} hari ini.
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedMeals.map((meal) => (
              <ParentFoodCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))}

            {todayMeals.length > mealsPageSize && (
              <Pagination
                currentPage={mealsPage}
                totalPages={mealsTotalPages}
                totalItems={todayMeals.length}
                pageSize={mealsPageSize}
                onPageChange={setMealsPage}
                onPageSizeChange={setMealsPageSize}
                pageSizeOptions={[5, 10, 20]}
              />
            )}
          </div>
        )}
      </div>

      {/* Blood Lab Checks (Kolesterol & Asam Urat) */}
      {profile && <ParentLabSection role={role} profile={profile} />}

      {/* Interactive Charts (Intake vs Lab Check Trends) */}
      <ParentHealthChart
        intakeData={intakeStats}
        labData={labData}
        role={role}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        days={days}
        onDaysChange={setDays}
        filterMode={filterMode}
        onFilterModeChange={setFilterMode}
      />

      {/* AI Recommendations for Low-Purine & Low-Cholesterol Foods */}
      <div className="space-y-3 pt-2">
        <button
          type="button"
          onClick={fetchRecommendations}
          disabled={loadingRecs}
          className="w-full py-3 px-4 rounded-2xl bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles size={16} />
          <span>{recommendations.length > 0 ? 'Perbarui Rekomendasi Menu AI' : 'Minta Rekomendasi Menu Penurun Kolesterol & Asam Urat'}</span>
        </button>

        {(recommendations.length > 0 || loadingRecs) && (
          <ParentRecommendationCard
            recommendations={recommendations}
            onAddMeal={handleQuickAddRecommendation}
            loading={loadingRecs}
          />
        )}
      </div>
    </div>
  );
}

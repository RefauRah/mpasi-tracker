'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import ParentMealInput from '@/components/ParentMealInput';
import ParentNutritionProgress from '@/components/ParentNutritionProgress';
import ParentAITargetsBanner from '@/components/ParentAITargetsBanner';
import ParentFoodCard from '@/components/ParentFoodCard';
import ParentMealHistory from '@/components/ParentMealHistory';
import ParentLabSection from '@/components/ParentLabSection';
import ParentHealthChart from '@/components/ParentHealthChart';
import ParentRecommendationCard from '@/components/ParentRecommendationCard';
import Pagination from '@/components/Pagination';
import { calculateParentIdealNutrition } from '@/lib/nutrition-targets';
import {
  ParentMeal,
  ParentProfile,
  ParentRole,
  ParentRecommendation,
  ParentLabCheck,
  AITargetAssessment,
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
  Scale,
  Target,
  ArrowUpRight,
  TrendingDown,
  TrendingUp,
  History,
  Utensils,
} from 'lucide-react';
import LoadingSpinner, { SkeletonList } from '@/components/LoadingSpinner';

export default function OrangTuaDashboard() {
  const [role, setRole] = useState<ParentRole>('ayah');
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [todayMeals, setTodayMeals] = useState<ParentMeal[]>([]);
  const [labData, setLabData] = useState<ParentLabCheck[]>([]);
  const [intakeStats, setIntakeStats] = useState<any[]>([]);
  const [aiAssessment, setAiAssessment] = useState<AITargetAssessment | null>(null);
  const [recommendations, setRecommendations] = useState<ParentRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAiSyncing, setIsAiSyncing] = useState(false);
  const [mealViewMode, setMealViewMode] = useState<'today' | 'history'>('today');

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

      const [profileRes, mealsRes, labRes, statsRes, aiTargetsRes] = await Promise.all([
        fetch(`/api/parents/profile?role=${role}`),
        fetch(`/api/parents/meals?role=${role}&date=${todayStr}`),
        fetch(`/api/parents/lab?role=${role}`),
        fetch(statsUrl),
        fetch(`/api/parents/ai-targets?role=${role}`),
      ]);

      const profileData = await profileRes.json();
      const mealsData = await mealsRes.json();
      const labDataRes = await labRes.json();
      const statsData = await statsRes.json();
      const aiTargetsData = await aiTargetsRes.json();

      setProfile(profileData);
      setTodayMeals(Array.isArray(mealsData) ? mealsData : []);
      setLabData(Array.isArray(labDataRes) ? labDataRes : []);
      setIntakeStats(Array.isArray(statsData) ? statsData : []);
      setAiAssessment(aiTargetsData && !aiTargetsData.error ? aiTargetsData : null);
    } catch (err) {
      console.error('Error fetching parent data:', err);
    } finally {
      setLoading(false);
    }
  }, [role, todayStr, filterMode, days, selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate clinical BMI and Broca Ideal Weight synchronized with Profil & Special Condition
  const parentIdeal = useMemo(() => {
    return calculateParentIdealNutrition({
      role,
      weight: profile?.weight || (role === 'ayah' ? 74 : 58),
      height: profile?.height || (role === 'ayah' ? 173 : 160),
      age: profile?.age || (role === 'ayah' ? 34 : 32),
      specialCondition: profile?.special_condition,
      notes: profile?.notes,
    });
  }, [role, profile?.weight, profile?.height, profile?.age, profile?.special_condition, profile?.notes]);

  // Manual trigger for AI Target sync on explicit user request
  const handleManualAISync = async () => {
    setIsAiSyncing(true);
    try {
      const res = await fetch(`/api/parents/ai-targets?role=${role}&force=true`);
      const data = await res.json();
      if (data && !data.error) {
        setAiAssessment(data);
      }
    } catch (err) {
      console.error('Error manual AI sync:', err);
    } finally {
      setIsAiSyncing(false);
    }
  };

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

          <div className="flex items-center gap-2">
            <Link
              href={`/profil?tab=${role}`}
              className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors flex items-center gap-1 text-xs font-bold"
              title="Kelola Profil & Pengaturan"
            >
              <span>Ubah Profil</span>
              <ArrowUpRight size={14} />
            </Link>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
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

        {/* Physical Body Status & Clinical BMI / Broca Ideal Weight Card */}
        <div className="p-3.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-2.5">
          <div className="flex items-center justify-between border-b border-[var(--border-color)]/60 pb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-main)]">
              <Scale size={15} className="text-emerald-600" />
              <span>Status Fisik & Target Berat Badan Ideal</span>
            </div>
            <span
              className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                parentIdeal.bmiCategory === 'ideal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : parentIdeal.bmiCategory === 'kelebihan'
                  ? 'bg-amber-100 text-amber-800'
                  : parentIdeal.bmiCategory === 'obesitas'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {parentIdeal.bmiCategory === 'ideal'
                ? '✅ BMI Ideal'
                : parentIdeal.bmiCategory === 'kelebihan'
                ? '⚠️ Kelebihan Berat Badan'
                : parentIdeal.bmiCategory === 'obesitas'
                ? '🚨 Obesitas'
                : 'ℹ️ Kurang Berat Badan'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Fisik & BMI:</span>
              <strong className="text-xs font-extrabold text-[var(--text-main)] block">
                {profile?.weight || (role === 'ayah' ? 74 : 58)} kg • {profile?.height || (role === 'ayah' ? 173 : 160)} cm
              </strong>
              <span className="text-[10px] font-bold text-[var(--accent-gold)]">
                {parentIdeal.bmi} BMI (Asia-Pasifik)
              </span>
            </div>

            <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">BBI (Formula Broca):</span>
              <strong className="text-xs font-extrabold text-emerald-700 block">
                {parentIdeal.idealWeightBroca} kg
              </strong>
              <span className="text-[10px] text-[var(--text-muted)]">
                Rentang: {parentIdeal.idealWeightRange.min}-{parentIdeal.idealWeightRange.max} kg
              </span>
            </div>

            <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Selisih Berat:</span>
              <strong
                className={`text-xs font-extrabold block ${
                  parentIdeal.weightDifference > 0
                    ? 'text-amber-700'
                    : parentIdeal.weightDifference < 0
                    ? 'text-blue-700'
                    : 'text-emerald-700'
                }`}
              >
                {parentIdeal.weightDifference > 0
                  ? `+${parentIdeal.weightDifference} kg`
                  : parentIdeal.weightDifference < 0
                  ? `${parentIdeal.weightDifference} kg`
                  : '0.0 kg (Ideal)'}
              </strong>
              <span className="text-[10px] text-[var(--text-muted)]">
                {parentIdeal.weightDifference > 0 ? 'Perlu penurunan aman' : parentIdeal.weightDifference < 0 ? 'Perlu kenaikan bertahap' : 'Pertahankan'}
              </span>
            </div>

            <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              <span className="text-[10px] text-[var(--text-muted)] block">Target Kalori AI:</span>
              <strong className="text-xs font-extrabold text-orange-600 block">
                {parentIdeal.targetCalories} kkal/hari
              </strong>
              <span className="text-[10px] font-bold text-amber-700">
                {parentIdeal.calorieAdjustment !== 0
                  ? `${parentIdeal.calorieAdjustment > 0 ? `+${parentIdeal.calorieAdjustment}` : parentIdeal.calorieAdjustment} kkal (Roadmap)`
                  : 'Maintenance TDEE'}
              </span>
            </div>
          </div>

          {profile?.special_condition && profile.special_condition !== 'none' && (
            <div className="p-2.5 bg-rose-50/80 rounded-xl border border-rose-200/80 flex items-center justify-between text-xs text-rose-900">
              <div className="flex items-center gap-1.5 font-bold">
                <span>🤱</span>
                <span>Kondisi Khusus: {parentIdeal.conditionAdjustmentLabel || profile.special_condition}</span>
              </div>
              {profile.notes && (
                <span className="text-[10px] text-rose-700 italic truncate max-w-[200px]">
                  &quot;{profile.notes}&quot;
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* AI Dynamic Target Assessment Banner (Automatic from Blood Lab Results with manual trigger) */}
      <ParentAITargetsBanner
        assessment={aiAssessment}
        loading={loading}
        onManualSync={handleManualAISync}
        isSyncing={isAiSyncing}
      />

      {/* Input Meal Form */}
      <ParentMealInput role={role} onMealAdded={fetchData} />

      {/* Daily Progress Bars & Meters with AI Target & Health Estimation Integration */}
      {profile && (
        <ParentNutritionProgress
          summary={summary}
          profile={profile}
          role={role}
          aiAssessment={aiAssessment}
          latestLab={labData.length > 0 ? labData[labData.length - 1] : null}
        />
      )}

      {/* Meals & History Section */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl self-start">
            <button
              type="button"
              onClick={() => setMealViewMode('today')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mealViewMode === 'today'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <Heart size={14} />
              <span>Hari Ini ({todayMeals.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setMealViewMode('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                mealViewMode === 'history'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <History size={14} />
              <span>Riwayat Makanan</span>
            </button>
          </div>
        </div>

        {mealViewMode === 'today' ? (
          <div>
            {loading ? (
              <div className="space-y-2">
                <LoadingSpinner text={`Memuat data makanan ${role === 'ayah' ? 'Ayah' : 'Ibu'} hari ini...`} size="sm" />
                <SkeletonList count={2} />
              </div>
            ) : todayMeals.length === 0 ? (
              <div className="p-6 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-2">
                <p>Belum ada makanan yang dicatat untuk {profile?.name || (role === 'ayah' ? 'Ayah' : 'Ibu')} hari ini.</p>
                <button
                  type="button"
                  onClick={() => setMealViewMode('history')}
                  className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1 text-[11px]"
                >
                  <History size={12} />
                  <span>Lihat Riwayat Makanan Lampau</span>
                </button>
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
        ) : (
          <ParentMealHistory
            role={role}
            onMealDeleted={fetchData}
            title={`Riwayat Makanan Lengkap: ${profile?.name || (role === 'ayah' ? 'Ayah' : 'Ibu')}`}
          />
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

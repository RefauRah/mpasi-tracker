'use client';

import { useState, useEffect, useCallback } from 'react';
import MealInput from '@/components/MealInput';
import NutritionProgress from '@/components/NutritionProgress';
import FoodCard from '@/components/FoodCard';
import RecommendationCard from '@/components/RecommendationCard';
import MedicationSection from '@/components/MedicationSection';
import GrowthSection from '@/components/GrowthSection';
import TBDashboardCard from '@/components/TBDashboardCard';
import { Baby, Meal, MenuRecommendation, NutritionSummary, NutritionTarget } from '@/lib/types';
import { calculateAgeInMonths, formatAge, getNutritionTarget } from '@/lib/nutrition-targets';
import { Sparkles, Calendar as CalendarIcon, RefreshCw, Heart } from 'lucide-react';

export default function DashboardPage() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<MenuRecommendation[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];

  const fetchBabyAndMeals = useCallback(async () => {
    try {
      setLoading(true);
      const [babyRes, mealsRes] = await Promise.all([
        fetch('/api/baby'),
        fetch(`/api/meals?date=${todayStr}`),
      ]);

      const babyData = await babyRes.json();
      const mealsData = await mealsRes.json();

      setBaby(babyData);
      setTodayMeals(Array.isArray(mealsData) ? mealsData : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [todayStr]);

  useEffect(() => {
    fetchBabyAndMeals();
  }, [fetchBabyAndMeals]);

  // Calculate age & targets
  const ageMonths = baby ? calculateAgeInMonths(baby.birth_date) : 8;
  const ageText = baby ? formatAge(ageMonths) : '8 Bulan';
  const target: NutritionTarget = getNutritionTarget(ageMonths);

  // Sum up today's nutrition
  const summary: NutritionSummary = todayMeals.reduce(
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

  const fetchRecommendations = async () => {
    setLoadingRecs(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current: summary }),
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
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input_text: menuTitle,
        meal_type: 'snack',
        date: todayStr,
      }),
    });

    if (res.ok) {
      fetchBabyAndMeals();
    }
  };

  const handleDeleteMeal = async (id: number) => {
    const res = await fetch(`/api/meals?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      fetchBabyAndMeals();
    }
  };

  const todayFormatted = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* App Header */}
      <div className="flex items-center justify-between bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--accent-gold)] to-[var(--accent-terracotta)] flex items-center justify-center text-white font-black text-xl shadow-md">
            👶
          </div>
          <div>
            <h1 className="text-base font-extrabold text-[var(--text-main)] flex items-center gap-1.5">
              <span>{baby?.name || 'Si Kecil'}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[var(--accent-gold-light)] text-[var(--accent-gold)]">
                {ageText}
              </span>
            </h1>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <CalendarIcon size={12} />
              <span>{todayFormatted}</span>
            </p>
          </div>
        </div>

        <button
          onClick={fetchBabyAndMeals}
          disabled={loading}
          className="p-2.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-color)] transition-colors"
          title="Refresh Data"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Input Meal Form */}
      <MealInput onMealAdded={fetchBabyAndMeals} />

      {/* Daily Progress Bars */}
      <NutritionProgress summary={summary} target={target} ageMonths={ageMonths} />

      {/* Today's Meals Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Heart size={16} className="text-[var(--accent-terracotta)]" />
            <span>Makanan Terdaftar Hari Ini ({todayMeals.length})</span>
          </h3>
        </div>

        {todayMeals.length === 0 ? (
          <div className="p-6 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)]">
            Belum ada makanan yang dicatat hari ini. Yuk ketik makanan pertama si kecil di atas!
          </div>
        ) : (
          <div className="space-y-3">
            {todayMeals.map((meal) => (
              <FoodCard key={meal.id} meal={meal} onDelete={handleDeleteMeal} />
            ))}
          </div>
        )}
      </div>

      {/* TB Medication Tracking Widget */}
      <TBDashboardCard />

      {/* Medication & Vitamin Logging Section */}
      <MedicationSection date={todayStr} />

      {/* Growth (Weight/Height) Tracking Section */}
      <GrowthSection />

      {/* AI Menu Recommendations */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={fetchRecommendations}
            disabled={loadingRecs}
            className="w-full py-3 px-4 rounded-2xl bg-[var(--accent-sage-light)] text-[var(--accent-sage)] font-bold text-xs border border-[var(--border-color)] hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>{recommendations.length > 0 ? 'Perbarui Rekomendasi Menu AI' : 'Minta Rekomendasi Menu AI Hari Ini'}</span>
          </button>
        </div>

        {(recommendations.length > 0 || loadingRecs) && (
          <RecommendationCard
            recommendations={recommendations}
            onAddMeal={handleQuickAddRecommendation}
            loading={loadingRecs}
          />
        )}
      </div>
    </div>
  );
}

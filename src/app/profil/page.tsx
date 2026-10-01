'use client';

import { useState, useEffect } from 'react';
import DataTransferModal from '@/components/DataTransferModal';
import { Baby, ParentProfile, ParentRole, AITargetAssessment } from '@/lib/types';
import { calculateAgeInMonths, formatAge, calculateParentIdealNutrition } from '@/lib/nutrition-targets';
import {
  Baby as BabyIcon,
  User,
  Save,
  Info,
  CheckCircle2,
  HeartPulse,
  Scale,
  Activity,
  Flame,
  ShieldAlert,
  Database,
  Users,
  Brain,
  Sparkles,
  Zap,
  RefreshCw,
  Droplets,
  Apple,
  Loader2,
  Lock,
  TrendingDown,
  TrendingUp,
  Target,
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'anak' | 'ayah' | 'ibu' | 'backup'>('anak');

  // Baby Profile State
  const [baby, setBaby] = useState<Baby | null>(null);
  const [babyName, setBabyName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
  const [babyLoading, setBabyLoading] = useState(true);
  const [babySaving, setBabySaving] = useState(false);
  const [babyMsg, setBabyMsg] = useState('');

  // Parent Profile State (Ayah & Ibu)
  const [parentRole, setParentRole] = useState<ParentRole>('ayah');
  const [parentProfile, setParentProfile] = useState<ParentProfile | null>(null);
  const [parentName, setParentName] = useState('');
  const [parentAge, setParentAge] = useState<number>(30);
  const [parentWeight, setParentWeight] = useState<number>(70);
  const [parentHeight, setParentHeight] = useState<number>(170);
  const [parentCalories, setParentCalories] = useState<number>(2000);
  const [parentCholesterolMax, setParentCholesterolMax] = useState<number>(200);
  const [parentPurineMax, setParentPurineMax] = useState<number>(400);
  const [parentFiberMin, setParentFiberMin] = useState<number>(25);
  const [parentUricAcidLabMax, setParentUricAcidLabMax] = useState<number>(6.5);
  const [parentCholesterolLabMax, setParentCholesterolLabMax] = useState<number>(190);
  const [parentSaving, setParentSaving] = useState(false);
  const [parentMsg, setParentMsg] = useState('');
  const [aiAssessment, setAiAssessment] = useState<AITargetAssessment | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch Baby
  useEffect(() => {
    setBabyLoading(true);
    fetch('/api/baby')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBaby(data);
          setBabyName(data.name || '');
          setBabyBirthDate(data.birth_date || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setBabyLoading(false));
  }, []);

  // Fetch Parent when tab changes or role changes
  const fetchParentProfile = async (role: ParentRole) => {
    try {
      setAiLoading(true);
      const [profileRes, aiRes] = await Promise.all([
        fetch(`/api/parents/profile?role=${role}`),
        fetch(`/api/parents/ai-targets?role=${role}`),
      ]);

      const profileData: ParentProfile = await profileRes.json();
      const aiData: AITargetAssessment = await aiRes.json();

      setAiAssessment(aiData);

      if (profileData) {
        setParentProfile(profileData);
        setParentName(profileData.name || (role === 'ayah' ? 'Ayah' : 'Ibu'));
        const ageVal = profileData.age || (role === 'ayah' ? 34 : 32);
        const weightVal = profileData.weight || (role === 'ayah' ? 74 : 58);
        const heightVal = profileData.height || (role === 'ayah' ? 173 : 160);
        setParentAge(ageVal);
        setParentWeight(weightVal);
        setParentHeight(heightVal);

        const idealNutr = calculateParentIdealNutrition({ role, weight: weightVal, height: heightVal, age: ageVal });
        setParentCalories(idealNutr.targetCalories);
        
        // If AI assessment has lab data, prioritize the AI adjusted targets
        if (aiData && aiData.hasLabData) {
          setParentCholesterolMax(aiData.adjusted_cholesterol_max);
          setParentPurineMax(aiData.adjusted_purine_max);
          setParentFiberMin(aiData.adjusted_fiber_min);
        } else {
          setParentCholesterolMax(profileData.target_cholesterol_max || 200);
          setParentPurineMax(profileData.target_purine_max || (role === 'ayah' ? 400 : 350));
          setParentFiberMin(profileData.target_fiber_min || (role === 'ayah' ? 28 : 25));
        }

        setParentUricAcidLabMax(role === 'ayah' ? 6.5 : 5.5);
        setParentCholesterolLabMax(190);
      }
    } catch (err) {
      console.error('Error loading parent profile or AI targets:', err);
    } finally {
      setAiLoading(false);
    }
  };

  const applyAITargets = () => {
    if (!aiAssessment) return;
    setParentPurineMax(aiAssessment.adjusted_purine_max);
    setParentCholesterolMax(aiAssessment.adjusted_cholesterol_max);
    setParentFiberMin(aiAssessment.adjusted_fiber_min);
    setParentMsg('Target harian berhasil disesuaikan dengan kalkulasi AI!');
    setTimeout(() => setParentMsg(''), 3000);
  };

  useEffect(() => {
    if (activeTab === 'ayah') {
      setParentRole('ayah');
      fetchParentProfile('ayah');
    } else if (activeTab === 'ibu') {
      setParentRole('ibu');
      fetchParentProfile('ibu');
    }
  }, [activeTab]);

  // Save Baby Profile
  const handleSaveBaby = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!babyName.trim() || !babyBirthDate) return;

    setBabySaving(true);
    setBabyMsg('');

    try {
      const res = await fetch('/api/baby', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: babyName, birth_date: babyBirthDate }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBaby(updated);
        setBabyMsg('Profil anak berhasil diperbarui!');
        setTimeout(() => setBabyMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBabySaving(false);
    }
  };

  // Save Parent Profile
  const handleSaveParent = async (e: React.FormEvent) => {
    e.preventDefault();
    setParentSaving(true);
    setParentMsg('');

    try {
      const res = await fetch('/api/parents/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: parentRole,
          name: parentName,
          age: Number(parentAge),
          weight: Number(parentWeight),
          height: Number(parentHeight),
          target_calories: Number(parentCalories),
          target_cholesterol_max: Number(parentCholesterolMax),
          target_purine_max: Number(parentPurineMax),
          target_fiber_min: Number(parentFiberMin),
          target_uric_acid_max: Number(parentUricAcidLabMax),
          target_cholesterol_lab_max: Number(parentCholesterolLabMax),
        }),
      });

      if (res.ok) {
        setParentMsg(`Profil ${parentRole === 'ayah' ? 'Ayah' : 'Ibu'} berhasil disimpan!`);
        setTimeout(() => setParentMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setParentSaving(false);
    }
  };

  const ageMonths = babyBirthDate ? calculateAgeInMonths(babyBirthDate) : 8;
  const ageText = formatAge(ageMonths);

  // BMI and Ideal Nutrition Calculation for parents
  const parentIdealNutrition = calculateParentIdealNutrition({
    role: parentRole,
    weight: Number(parentWeight),
    height: Number(parentHeight),
    age: Number(parentAge),
  });

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-sm)] space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--accent-gold-light)] rounded-2xl text-[var(--accent-gold)]">
            <Users size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-main)]">Kelola Profil Keluarga</h1>
            <p className="text-xs text-[var(--text-muted)]">
              Atur data & target kesehatan untuk Anak, Ayah, dan Ibu
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-secondary)] rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('anak')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'anak'
                ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[#b57a38] text-white shadow-md scale-[1.02]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <BabyIcon size={14} />
            <span>Anak</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ayah')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ayah'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md scale-[1.02]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <User size={14} />
            <span>Ayah</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ibu')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'ibu'
                ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-md scale-[1.02]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <User size={14} />
            <span>Ibu</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`py-2 px-1 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md scale-[1.02]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <Database size={14} />
            <span>Backup</span>
          </button>
        </div>
      </div>

      {/* 1. Tab Anak (Bayi) */}
      {activeTab === 'anak' && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
              <BabyIcon size={20} className="text-[var(--accent-gold)]" />
              <h2 className="text-sm font-bold text-[var(--text-main)]">Profil Anak (MPASI)</h2>
            </div>

            {babyLoading ? (
              <LoadingSpinner text="Memuat data profil anak..." />
            ) : (
              <form onSubmit={handleSaveBaby} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Nama Panggilan Bayi / Anak:
                  </label>
                  <input
                    type="text"
                    value={babyName}
                    onChange={(e) => setBabyName(e.target.value)}
                    placeholder="Contoh: Kirana"
                    required
                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Tanggal Lahir:
                  </label>
                  <input
                    type="date"
                    value={babyBirthDate}
                    onChange={(e) => setBabyBirthDate(e.target.value)}
                    required
                    className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                  />
                </div>

                {/* Computed Age Info Box */}
                <div className="p-3.5 bg-[var(--accent-gold-light)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs">
                  <span className="text-[var(--text-muted)] font-medium">Usia Terkalkulasi:</span>
                  <span className="font-bold text-[var(--accent-gold)] text-sm">{ageText}</span>
                </div>

                {babyMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 size={16} />
                    <span>{babyMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={babySaving}
                  className="w-full py-3 px-4 bg-[var(--accent-gold)] hover:bg-[#b07839] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  {babySaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  <span>{babySaving ? 'Menyimpan...' : 'Simpan Profil Anak'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Standar WHO Reference Table */}
          <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-3">
            <div className="flex items-center gap-2">
              <Info size={18} className="text-[var(--accent-gold)]" />
              <h3 className="text-xs font-bold text-[var(--text-main)]">
                Standar Target Nutrisi MPASI (WHO)
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border-color)] text-[var(--text-muted)]">
                    <th className="py-2 pr-2">Kategori Usia</th>
                    <th className="py-2 px-2 text-right">Kalori</th>
                    <th className="py-2 px-2 text-right">Protein</th>
                    <th className="py-2 pl-2 text-right">Zat Besi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-color)]">
                  <tr
                    className={
                      ageMonths >= 6 && ageMonths <= 8 ? 'bg-[var(--accent-gold-light)] font-bold' : ''
                    }
                  >
                    <td className="py-2.5 pr-2">6 - 8 Bulan</td>
                    <td className="py-2.5 px-2 text-right">200 kkal</td>
                    <td className="py-2.5 px-2 text-right">15 g</td>
                    <td className="py-2.5 pl-2 text-right">10 mg</td>
                  </tr>
                  <tr
                    className={
                      ageMonths >= 9 && ageMonths <= 11 ? 'bg-[var(--accent-gold-light)] font-bold' : ''
                    }
                  >
                    <td className="py-2.5 pr-2">9 - 11 Bulan</td>
                    <td className="py-2.5 px-2 text-right">300 kkal</td>
                    <td className="py-2.5 px-2 text-right">18 g</td>
                    <td className="py-2.5 pl-2 text-right">10 mg</td>
                  </tr>
                  <tr className={ageMonths >= 12 ? 'bg-[var(--accent-gold-light)] font-bold' : ''}>
                    <td className="py-2.5 pr-2">12 - 23 Bulan</td>
                    <td className="py-2.5 px-2 text-right">550 kkal</td>
                    <td className="py-2.5 px-2 text-right">20 g</td>
                    <td className="py-2.5 pl-2 text-right">7 mg</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2 & 3. Tab Ayah / Ibu */}
      {(activeTab === 'ayah' || activeTab === 'ibu') && (
        <div className="space-y-4">
          <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <HeartPulse
                  size={20}
                  className={activeTab === 'ayah' ? 'text-blue-600' : 'text-rose-600'}
                />
                <h2 className="text-sm font-bold text-[var(--text-main)]">
                  Profil & Target Kesehatan {activeTab === 'ayah' ? 'Ayah' : 'Ibu'}
                </h2>
              </div>
              <span
                className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
                  activeTab === 'ayah'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-rose-100 text-rose-700'
                }`}
              >
                {activeTab === 'ayah' ? '👨 Profil Ayah' : '👩 Profil Ibu'}
              </span>
            </div>

            {aiLoading ? (
              <LoadingSpinner text={`Memuat profil & evaluasi target AI untuk ${activeTab === 'ayah' ? 'Ayah' : 'Ibu'}...`} />
            ) : (
              <form onSubmit={handleSaveParent} className="space-y-4">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Nama:
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    required
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                    Usia (Tahun):
                  </label>
                  <input
                    type="number"
                    value={parentAge}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setParentAge(val);
                      const ideal = calculateParentIdealNutrition({
                        role: parentRole,
                        weight: parentWeight,
                        height: parentHeight,
                        age: val,
                      });
                      setParentCalories(ideal.targetCalories);
                    }}
                    required
                    min="18"
                    max="100"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                  />
                </div>
              </div>

              {/* Physical Info & Clinical BMI / Ideal Body Weight */}
              <div className="space-y-2 p-3 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                      Berat Badan (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={parentWeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setParentWeight(val);
                        const ideal = calculateParentIdealNutrition({
                          role: parentRole,
                          weight: val,
                          height: parentHeight,
                          age: parentAge,
                        });
                        setParentCalories(ideal.targetCalories);
                      }}
                      className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                      Tinggi Badan (cm)
                    </label>
                    <input
                      type="number"
                      value={parentHeight}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setParentHeight(val);
                        const ideal = calculateParentIdealNutrition({
                          role: parentRole,
                          weight: parentWeight,
                          height: val,
                          age: parentAge,
                        });
                        setParentCalories(ideal.targetCalories);
                      }}
                      className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-main)]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                      Indeks Massa Tubuh
                    </label>
                    <div className="p-1.5 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] text-center">
                      <span className="text-xs font-black text-[var(--accent-gold)] block">
                        {parentIdealNutrition.bmi} BMI
                      </span>
                      <span
                        className={`text-[9px] font-extrabold px-1 rounded block truncate ${
                          parentIdealNutrition.bmiCategory === 'ideal'
                            ? 'text-emerald-700 bg-emerald-50'
                            : parentIdealNutrition.bmiCategory === 'kelebihan'
                            ? 'text-amber-700 bg-amber-50'
                            : parentIdealNutrition.bmiCategory === 'obesitas'
                            ? 'text-red-700 bg-red-50'
                            : 'text-blue-700 bg-blue-50'
                        }`}
                      >
                        {parentIdealNutrition.bmiCategory === 'ideal'
                          ? 'Ideal'
                          : parentIdealNutrition.bmiCategory === 'kelebihan'
                          ? 'Kelebihan BB'
                          : parentIdealNutrition.bmiCategory === 'obesitas'
                          ? 'Obesitas'
                          : 'Kurus'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ideal Body Weight Row */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[var(--border-color)] text-xs">
                  <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Berat Badan Ideal (BBI Broca):</span>
                    <strong className="text-emerald-700 font-extrabold text-xs">
                      {parentIdealNutrition.idealWeightBroca} kg{' '}
                      <span className="text-[10px] font-normal text-[var(--text-muted)]">
                        ({parentIdealNutrition.idealWeightRange.min}-{parentIdealNutrition.idealWeightRange.max} kg)
                      </span>
                    </strong>
                  </div>
                  <div className="p-2 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
                    <span className="text-[10px] text-[var(--text-muted)] block">Status Selisih Berat:</span>
                    <strong
                      className={`font-extrabold text-xs ${
                        parentIdealNutrition.weightDifference > 0
                          ? 'text-amber-700'
                          : parentIdealNutrition.weightDifference < 0
                          ? 'text-blue-700'
                          : 'text-emerald-700'
                      }`}
                    >
                      {parentIdealNutrition.weightDifference > 0
                        ? `+${parentIdealNutrition.weightDifference} kg (Kelebihan)`
                        : parentIdealNutrition.weightDifference < 0
                        ? `${parentIdealNutrition.weightDifference} kg (Kurang)`
                        : '0.0 kg (Sudah Ideal)'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* AI Auto-Target Recommendation Banner */}
              {aiAssessment && aiAssessment.hasLabData ? (
                <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-blue-50/80 border border-indigo-200/80 rounded-2xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Brain size={16} className="text-indigo-600" />
                      <span className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                        <Sparkles size={12} className="text-amber-500" />
                        Target Otomatis AI (Dari Cek Darah Terakhir: {aiAssessment.labDate})
                      </span>
                    </div>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        aiAssessment.phase === 'pemulihan_ketat'
                          ? 'bg-red-500 text-white'
                          : aiAssessment.phase === 'pencegahan_waspada'
                          ? 'bg-amber-500 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {aiAssessment.phase === 'pemulihan_ketat'
                        ? '🚨 Restriksi Ketat'
                        : aiAssessment.phase === 'pencegahan_waspada'
                        ? '⚠️ Waspada'
                        : '✅ Normal'}
                    </span>
                  </div>

                  <p className="text-[11px] text-indigo-900 leading-relaxed">
                    Berdasarkan Lab Asam Urat (<strong>{aiAssessment.uricAcid} mg/dL</strong>) & Kolesterol (<strong>{aiAssessment.totalCholesterol} mg/dL</strong>), AI telah menyetel target harian di bawah secara otomatis.
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Max Purin AI:</span>
                      <strong className="text-amber-700 text-xs">{aiAssessment.adjusted_purine_max} mg</strong>
                    </div>
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Max Kolesterol AI:</span>
                      <strong className="text-rose-700 text-xs">{aiAssessment.adjusted_cholesterol_max} mg</strong>
                    </div>
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Min Serat AI:</span>
                      <strong className="text-emerald-700 text-xs">{aiAssessment.adjusted_fiber_min} g</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-2 text-[11px] text-amber-900">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Belum ada riwayat hasil cek darah untuk {activeTab === 'ayah' ? 'Ayah' : 'Ibu'}. Target di bawah menggunakan batas standar. Begitu hasil cek lab dimasukkan di menu Orang Tua, AI akan otomatis menghitung dan menyesuaikan batas purin serta kolesterol di sini.
                  </p>
                </div>
              )}

              {/* Daily Nutrition Intake Targets (AI-managed & Locked) */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-600" />
                    <span>Target Asupan Makanan Harian Menuju Ideal</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 flex items-center gap-1 border border-indigo-200">
                    <Lock size={11} className="text-indigo-600" />
                    <span>Otomatis AI (Terkunci)</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        Target Kalori Ideal:
                      </label>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                        <Target size={10} /> {parentIdealNutrition.calorieAdjustment !== 0 ? `${parentIdealNutrition.calorieAdjustment > 0 ? `+${parentIdealNutrition.calorieAdjustment}` : parentIdealNutrition.calorieAdjustment} kkal` : 'Ideal'}
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={parentCalories}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                      {parentIdealNutrition.calorieStrategy}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        Min. Target Serat:
                      </label>
                      <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded flex items-center gap-0.5">
                        <Brain size={10} /> AI Serat
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={parentFiberMin}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-0.5 block">
                      Target AI: &ge; {parentFiberMin} g/hari
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        Batas Max Kolesterol:
                      </label>
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-50 px-1 rounded flex items-center gap-0.5">
                        <Brain size={10} /> AI Lab
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={parentCholesterolMax}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-rose-700 font-semibold mt-0.5 block">
                      Batas Aman AI: &le; {parentCholesterolMax} mg/hari
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-semibold text-[var(--text-muted)]">
                        Batas Max Purin:
                      </label>
                      <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded flex items-center gap-0.5">
                        <Brain size={10} /> AI Lab
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        value={parentPurineMax}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-amber-700 font-semibold mt-0.5 block">
                      Batas Aman AI: &le; {parentPurineMax} mg/hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Lab Blood Targets (Locked Standard) */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Activity size={14} className="text-rose-600" />
                    <span>Batas Aman Target Hasil Lab Darah</span>
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 flex items-center gap-1 border border-slate-200">
                    <Lock size={11} /> Standar Medis
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Target Asam Urat (&le; mg/dL):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        value={parentUricAcidLabMax}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                      {activeTab === 'ayah' ? 'Standar Pria: < 7.0 mg/dL' : 'Standar Wanita: < 6.0 mg/dL'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Target Kolesterol Total (&le; mg/dL):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={parentCholesterolLabMax}
                        readOnly
                        className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-secondary)]/70 text-xs font-black text-[var(--text-main)] cursor-not-allowed select-none"
                      />
                      <Lock size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] opacity-60" />
                    </div>
                    <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block">
                      Standar Ideal: &lt; 200 mg/dL
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center gap-2 text-[11px] text-indigo-900">
                  <Lock size={14} className="text-indigo-600 shrink-0" />
                  <span>
                    Semua target gizi & batas lab di atas <strong>diisi dan dikunci secara otomatis oleh AI</strong> berdasarkan data fisik dan riwayat tes lab darah.
                  </span>
                </div>
              </div>

              {parentMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 size={16} />
                  <span>{parentMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={parentSaving}
                className="w-full py-3 px-4 bg-[var(--accent-gold)] hover:bg-[#b07839] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {parentSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>
                  {parentSaving
                    ? 'Menyimpan...'
                    : `Simpan Profil ${activeTab === 'ayah' ? 'Ayah' : 'Ibu'}`}
                </span>
              </button>
            </form>
            )}
          </div>
        </div>
      )}

      {/* 4. Tab Backup & Data Transfer */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <DataTransferModal />
        </div>
      )}
    </div>
  );
}

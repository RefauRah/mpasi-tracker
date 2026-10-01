'use client';

import { useState, useEffect } from 'react';
import DataTransferModal from '@/components/DataTransferModal';
import { Baby, ParentProfile, ParentRole, AITargetAssessment } from '@/lib/types';
import { calculateAgeInMonths, formatAge } from '@/lib/nutrition-targets';
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
} from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'anak' | 'ayah' | 'ibu' | 'backup'>('anak');

  // Baby Profile State
  const [baby, setBaby] = useState<Baby | null>(null);
  const [babyName, setBabyName] = useState('');
  const [babyBirthDate, setBabyBirthDate] = useState('');
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
    fetch('/api/baby')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBaby(data);
          setBabyName(data.name || '');
          setBabyBirthDate(data.birth_date || '');
        }
      })
      .catch((err) => console.error(err));
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
        setParentAge(profileData.age || (role === 'ayah' ? 34 : 32));
        setParentWeight(profileData.weight || (role === 'ayah' ? 74 : 58));
        setParentHeight(profileData.height || (role === 'ayah' ? 173 : 160));
        setParentCalories(profileData.target_calories || (role === 'ayah' ? 2000 : 1700));
        
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

        setParentUricAcidLabMax(profileData.target_uric_acid_max || (role === 'ayah' ? 6.5 : 5.5));
        setParentCholesterolLabMax(profileData.target_cholesterol_lab_max || 190);
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

  // BMI Calculation for parents
  const heightM = parentHeight / 100;
  const bmi = heightM > 0 ? (parentWeight / (heightM * heightM)).toFixed(1) : '-';

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
                <Save size={16} />
                <span>{babySaving ? 'Menyimpan...' : 'Simpan Profil Anak'}</span>
              </button>
            </form>
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
                    onChange={(e) => setParentAge(Number(e.target.value))}
                    required
                    min="18"
                    max="100"
                    className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs text-[var(--text-main)] font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                  />
                </div>
              </div>

              {/* Physical Info */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                    Berat Badan (kg)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={parentWeight}
                    onChange={(e) => setParentWeight(Number(e.target.value))}
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
                    onChange={(e) => setParentHeight(Number(e.target.value))}
                    className="w-full p-2 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-xs font-bold text-[var(--text-main)]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[var(--text-muted)] font-medium mb-1">
                    Indeks Massa Tubuh
                  </label>
                  <div className="p-2 bg-[var(--bg-card)] rounded-lg border border-[var(--border-color)] text-xs font-bold text-[var(--accent-gold)] text-center">
                    {bmi} BMI
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
                    Berdasarkan Lab Asam Urat (<strong>{aiAssessment.uricAcid} mg/dL</strong>) & Kolesterol (<strong>{aiAssessment.totalCholesterol} mg/dL</strong>), AI merekomendasikan batas target otomatis:
                  </p>

                  <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Max Purin:</span>
                      <strong className="text-amber-700 text-xs">{aiAssessment.adjusted_purine_max} mg</strong>
                    </div>
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Max Kolesterol:</span>
                      <strong className="text-rose-700 text-xs">{aiAssessment.adjusted_cholesterol_max} mg</strong>
                    </div>
                    <div className="p-1.5 bg-white/90 rounded-xl border border-indigo-100 font-medium">
                      <span className="text-[var(--text-muted)] block text-[9px]">Min Serat:</span>
                      <strong className="text-emerald-700 text-xs">{aiAssessment.adjusted_fiber_min} g</strong>
                    </div>
                  </div>

                  {(parentPurineMax !== aiAssessment.adjusted_purine_max ||
                    parentCholesterolMax !== aiAssessment.adjusted_cholesterol_max ||
                    parentFiberMin !== aiAssessment.adjusted_fiber_min) && (
                    <button
                      type="button"
                      onClick={applyAITargets}
                      className="w-full py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <Zap size={13} className="text-amber-300" />
                      <span>⚡ Terapkan Rekomendasi Target AI ke Form</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-2xl flex items-start gap-2 text-[11px] text-amber-900">
                  <Info size={16} className="text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Belum ada riwayat hasil cek darah untuk {activeTab === 'ayah' ? 'Ayah' : 'Ibu'}. Target di bawah menggunakan batas standar. Begitu hasil cek lab dimasukkan di menu Orang Tua, AI akan otomatis menghitung dan menyesuaikan batas purin serta kolesterol di sini.
                  </p>
                </div>
              )}

              {/* Daily Nutrition Intake Targets */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                    <Flame size={14} className="text-amber-600" />
                    <span>Target Asupan Makanan Harian</span>
                  </h3>
                  {aiAssessment?.hasLabData && (
                    <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                      <Sparkles size={11} className="text-amber-500" />
                      Tersinkron AI
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Target Kalori (kkal/hari):
                    </label>
                    <input
                      type="number"
                      value={parentCalories}
                      onChange={(e) => setParentCalories(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Min. Target Serat (g/hari):
                    </label>
                    <input
                      type="number"
                      value={parentFiberMin}
                      onChange={(e) => setParentFiberMin(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                    <span className="text-[10px] text-emerald-700 font-medium">
                      {aiAssessment?.hasLabData ? `Rekomendasi AI: ≥ ${aiAssessment.adjusted_fiber_min} g` : 'Standar: ≥ 25 g'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Batas Max Kolesterol (mg/hari):
                    </label>
                    <input
                      type="number"
                      value={parentCholesterolMax}
                      onChange={(e) => setParentCholesterolMax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                    <span className="text-[10px] text-rose-700 font-medium">
                      {aiAssessment?.hasLabData ? `Batas Aman AI: ≤ ${aiAssessment.adjusted_cholesterol_max} mg` : 'Aman: < 200 mg'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Batas Max Purin (mg/hari):
                    </label>
                    <input
                      type="number"
                      value={parentPurineMax}
                      onChange={(e) => setParentPurineMax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                    <span className="text-[10px] text-amber-700 font-medium">
                      {aiAssessment?.hasLabData ? `Batas Aman AI: ≤ ${aiAssessment.adjusted_purine_max} mg` : 'Aman: < 400 mg'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lab Blood Targets */}
              <div className="space-y-3 pt-2 border-t border-[var(--border-color)]">
                <h3 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                  <Activity size={14} className="text-rose-600" />
                  <span>Batas Aman Target Hasil Lab Darah</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Target Asam Urat (&le; mg/dL):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={parentUricAcidLabMax}
                      onChange={(e) => setParentUricAcidLabMax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {activeTab === 'ayah' ? 'Pria: < 7.0 mg/dL' : 'Wanita: < 6.0 mg/dL'}
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                      Target Kolesterol Total (&le; mg/dL):
                    </label>
                    <input
                      type="number"
                      value={parentCholesterolLabMax}
                      onChange={(e) => setParentCholesterolLabMax(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-bold text-[var(--text-main)]"
                    />
                    <span className="text-[10px] text-[var(--text-muted)]">Ideal: &lt; 200 mg/dL</span>
                  </div>
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
                <Save size={16} />
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

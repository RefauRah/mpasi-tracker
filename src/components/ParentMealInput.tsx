'use client';

import { useState } from 'react';
import { ParentAnalyzeResult, ParentRole } from '@/lib/types';
import { Sparkles, Utensils, AlertTriangle, CheckCircle2, ShieldCheck } from 'lucide-react';

interface ParentMealInputProps {
  role: ParentRole;
  onMealAdded: () => void;
}

export default function ParentMealInput({ role, onMealAdded }: ParentMealInputProps) {
  const [inputText, setInputText] = useState('');
  const [mealType, setMealType] = useState<'sarapan' | 'makan_siang' | 'makan_malam' | 'snack'>('makan_siang');
  const [loading, setLoading] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<ParentAnalyzeResult | null>(null);
  const [error, setError] = useState('');

  const quickPresets = [
    'Nasi merah 1 centong + Dada ayam panggang + Sayur bayam bening',
    'Oatmeal 4 sdm + Pisang 1 buah + Chia seed 1 sdt',
    'Ikan nila kukus jahe + Tumis buncis wortel + Buah pepaya',
    'Tahu kukus 2 potong + Sayur lodeh tanpa santan + Jeruk',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');
    setLastAnalysis(null);

    try {
      const res = await fetch('/api/parents/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_text: inputText,
          parent_role: role,
          meal_type: mealType,
          date: new Date().toISOString().split('T')[0],
          meal_time: new Date().toTimeString().slice(0, 5),
        }),
      });

      const data = await res.json();
      if (res.ok && data.meal) {
        setLastAnalysis(data.analysis);
        setInputText('');
        onMealAdded();
      } else {
        throw new Error(data.error || 'Gagal menganalisis makanan.');
      }
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const roleLabel = role === 'ayah' ? 'Ayah' : 'Ibu';

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
            <Utensils size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Catat Menu Makanan {roleLabel}
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              AI otomatis menghitung Kalori, Purin (Asam Urat), & Kolesterol
            </p>
          </div>
        </div>
      </div>

      {/* Meal Type Selector */}
      <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl">
        {[
          { key: 'sarapan', label: '🌅 Sarapan' },
          { key: 'makan_siang', label: '☀️ Siang' },
          { key: 'makan_malam', label: '🌙 Malam' },
          { key: 'snack', label: '🍎 Snack' },
        ].map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setMealType(t.key as any)}
            className={`py-2 text-xs font-bold rounded-xl transition-all ${
              mealType === t.key
                ? 'bg-[var(--bg-card)] text-emerald-700 shadow-sm'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Quick Presets */}
      <div>
        <span className="text-[11px] font-semibold text-[var(--text-muted)] block mb-1.5">
          Pilihan Menu Ramah Asam Urat & Kolesterol:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {quickPresets.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(preset)}
              className="text-[10px] px-2.5 py-1 rounded-xl bg-[var(--bg-primary)] hover:bg-emerald-50 text-[var(--text-main)] border border-[var(--border-color)] hover:border-emerald-400 transition-colors text-left"
            >
              + {preset.slice(0, 38)}...
            </button>
          ))}
        </div>
      </div>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            rows={3}
            placeholder={`Ketik apa yang dimakan ${roleLabel}... (contoh: Nasi merah 1 centong, dada ayam kukus, tumis wortel labu siam, es jeruk tanpa gula)`}
            required
            className="w-full p-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs sm:text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all resize-none leading-relaxed"
          />
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl border border-red-200">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
        >
          <Sparkles size={16} className={loading ? 'animate-spin' : ''} />
          <span>{loading ? 'AI Sedang Menganalisis Purin & Kolesterol...' : `Analisis & Catat Makanan ${roleLabel}`}</span>
        </button>
      </form>

      {/* Live AI Analysis Result Toast/Card */}
      {lastAnalysis && (
        <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200 text-xs space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
            <span className="font-extrabold text-emerald-900 flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              Hasil Analisis Makanan ({lastAnalysis.total.calories} kkal)
            </span>
            <div className="flex gap-1.5">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                lastAnalysis.purine_status === 'aman' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                Purin: {lastAnalysis.total.purine_mg}mg ({lastAnalysis.purine_status})
              </span>
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                lastAnalysis.cholesterol_status === 'aman' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
              }`}>
                Kolesterol: {lastAnalysis.total.cholesterol}mg
              </span>
            </div>
          </div>

          <p className="text-[11px] text-emerald-800 leading-relaxed">
            {lastAnalysis.health_evaluation}
          </p>
        </div>
      )}
    </div>
  );
}

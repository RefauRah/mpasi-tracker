'use client';

import { useState } from 'react';
import { Sparkles, Utensils, AlertCircle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { MealType } from '@/lib/types';

interface MealInputProps {
  onMealAdded: () => void;
}

export default function MealInput({ onMealAdded }: MealInputProps) {
  const [inputText, setInputText] = useState('');
  const [mealType, setMealType] = useState<MealType>('sarapan');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [mealTime, setMealTime] = useState(() => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // "HH:mm"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const quickTemplates = [
    'Bubur beras merah 3 sdm, hati ayam 1 sdm, bayam 1 sdt, EVOO 1 sdt',
    'Nasi tim salmon 4 sdm, brokoli 2 sdt, mentega 1/2 sdt',
    'Puree alpukat 2 sdm, santan 1 sdt',
    'Bubur nasi 3 sdm, telur puyuh 2 butir, wortel 1 bola pingpong',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input_text: inputText,
          meal_type: mealType,
          date,
          meal_time: mealTime,
        }),
      });

      if (!res.ok) {
        throw new Error('Gagal menganalisis makanan');
      }

      setInputText('');
      onMealAdded();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Terjadi kesalahan saat memproses AI.');
    } finally {
      setLoading(false);
    }
  };

  const mealTypeLabels: { key: MealType; label: string; icon: string }[] = [
    { key: 'sarapan', label: 'Sarapan', icon: '🌅' },
    { key: 'makan_siang', label: 'Makan Siang', icon: '☀️' },
    { key: 'makan_malam', label: 'Makan Malam', icon: '🌙' },
    { key: 'snack', label: 'Snack', icon: '🍎' },
  ];

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-[var(--accent-gold-light)] rounded-xl text-[var(--accent-gold)]">
            <Utensils size={20} />
          </div>
          <h2 className="text-lg font-bold text-[var(--text-main)]">Catat MPASI</h2>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Date & Time Input Row */}
        <div className="grid grid-cols-2 gap-2 p-2 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)]">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon size={12} /> Tanggal Makan
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1">
              <Clock size={12} /> Jam Makan
            </label>
            <input
              type="time"
              value={mealTime}
              onChange={(e) => setMealTime(e.target.value)}
              className="w-full p-2 text-xs font-bold rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            />
          </div>
        </div>

        {/* Meal Type Selection */}
        <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-2xl">
          {mealTypeLabels.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setMealType(item.key)}
              className={`py-2 px-1 text-xs font-semibold rounded-xl transition-all flex flex-col items-center gap-0.5 ${
                mealType === item.key
                  ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Input Text Area */}
        <div>
          <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
            Ketik makanan & porsi (bebas pakai satuan: sdm, sdt, gram, potong, bola pingpong):
          </label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Contoh: bubur nasi 3 sdm, hati ayam 1 sdm, wortel 1 bola pingpong, EVOO 1 sdt"
            rows={3}
            className="w-full p-3.5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)] text-sm resize-none"
          />
        </div>

        {/* Quick Suggestion Chips */}
        <div>
          <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1.5">
            💡 Contoh / Templat Cepat:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {quickTemplates.map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInputText(template)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] hover:bg-[var(--accent-gold-light)] hover:text-[var(--accent-gold)] transition-colors border border-[var(--border-color)] text-left truncate max-w-[280px]"
              >
                + {template}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-[var(--accent-terracotta-light)] text-[var(--accent-terracotta)] text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-[var(--accent-gold)] to-[#b07839] hover:opacity-95 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Sparkles size={18} className="animate-spin" />
              <span>AI Sedang Menganalisis Kalori & Gizi...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Analisis & Simpan dengan AI</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { GrowthLog } from '@/lib/types';
import { Scale, Ruler, Plus, Calendar as CalendarIcon, CheckCircle2, TrendingUp } from 'lucide-react';

export default function GrowthSection() {
  const [logs, setLogs] = useState<GrowthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [headCirc, setHeadCirc] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchGrowthLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/growth');
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGrowthLogs();
  }, [fetchGrowthLogs]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/growth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          weight: parseFloat(weight),
          height: height ? parseFloat(height) : undefined,
          head_circ: headCirc ? parseFloat(headCirc) : undefined,
          notes,
        }),
      });

      if (res.ok) {
        setWeight('');
        setHeight('');
        setHeadCirc('');
        setNotes('');
        setShowForm(false);
        fetchGrowthLogs();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const latestLog = logs.length > 0 ? logs[logs.length - 1] : null;

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
            <Scale size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Pertumbuhan BB & TB</h3>
            <p className="text-xs text-[var(--text-muted)]">Catat berat dan tinggi badan si kecil</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--accent-gold-light)] text-[var(--text-main)] rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-[var(--border-color)]"
        >
          <Plus size={16} />
          <span>{showForm ? 'Batal' : 'Update BB/TB'}</span>
        </button>
      </div>

      {/* Latest Stats Summary Display */}
      {latestLog && (
        <div className="grid grid-cols-2 gap-3 p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <Scale size={13} /> Berat Badan Terakhir
            </span>
            <p className="text-xl font-black text-[var(--text-main)]">
              {latestLog.weight} <span className="text-xs font-bold text-[var(--text-muted)]">kg</span>
            </p>
            <span className="text-[10px] text-[var(--text-muted)] block">
              Tgl: {latestLog.date}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-blue-700 flex items-center gap-1">
              <Ruler size={13} /> Tinggi Badan Terakhir
            </span>
            <p className="text-xl font-black text-[var(--text-main)]">
              {latestLog.height ? `${latestLog.height} cm` : '-'}
            </p>
            <span className="text-[10px] text-[var(--text-muted)] block">
              {latestLog.head_circ ? `LK: ${latestLog.head_circ} cm` : 'Lingkar kepala -'}
            </span>
          </div>
        </div>
      )}

      {/* Add Growth Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Tanggal Penimbangan:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Berat Badan (kg):
              </label>
              <input
                type="number"
                step="0.01"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="misal: 7.5"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Tinggi Badan (cm):
              </label>
              <input
                type="number"
                step="0.1"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="misal: 68.5"
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Lingkar Kepala (cm):
              </label>
              <input
                type="number"
                step="0.1"
                value={headCirc}
                onChange={(e) => setHeadCirc(e.target.value)}
                placeholder="misal: 43.0"
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Catatan (Opsional):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Penimbangan Posyandu"
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !weight}
            className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Data Pertumbuhan'}</span>
          </button>
        </form>
      )}
    </div>
  );
}

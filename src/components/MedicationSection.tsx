'use client';

import { useState, useEffect, useCallback } from 'react';
import { MedicationLog } from '@/lib/types';
import { Pill, Plus, Trash2, Clock, CheckCircle2 } from 'lucide-react';

interface MedicationSectionProps {
  date?: string;
}

export default function MedicationSection({ date }: MedicationSectionProps) {
  const selectedDate = date || new Date().toISOString().split('T')[0];

  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState(() => new Date().toTimeString().slice(0, 5));
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchMedications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/medications?date=${selectedDate}`);
      const data = await res.json();
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMedications();
  }, [fetchMedications]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          time,
          name,
          dosage,
          notes,
        }),
      });

      if (res.ok) {
        setName('');
        setDosage('');
        setNotes('');
        setShowAddForm(false);
        fetchMedications();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus catatan obat/vitamin ini?')) return;
    try {
      const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchMedications();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const commonMeds = ['Vitamin D3', 'Zat Besi Drop', 'Paracetamol', 'Probiotik', 'Multivitamin'];

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-purple-100 text-purple-700 rounded-xl">
            <Pill size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">Catatan Obat & Vitamin</h3>
            <p className="text-xs text-[var(--text-muted)]">Log suplemen & vitamin harian si kecil</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-[var(--bg-secondary)] hover:bg-[var(--accent-gold-light)] text-[var(--text-main)] rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-[var(--border-color)]"
        >
          <Plus size={16} />
          <span>{showAddForm ? 'Batal' : 'Catat Obat'}</span>
        </button>
      </div>

      {/* Add Medication Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-3 animate-fade-in">
          <div>
            <span className="text-[11px] font-medium text-[var(--text-muted)] block mb-1">
              Pilihan Cepat:
            </span>
            <div className="flex flex-wrap gap-1">
              {commonMeds.map((med, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setName(med);
                    if (med === 'Vitamin D3') setDosage('400 IU (1 drop)');
                    if (med === 'Zat Besi Drop') setDosage('1 ml');
                  }}
                  className="text-[10px] px-2.5 py-1 rounded-full bg-[var(--bg-card)] text-[var(--text-main)] border border-[var(--border-color)] hover:border-[var(--accent-gold)]"
                >
                  + {med}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Nama Obat / Vitamin:
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Vitamin D3"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Dosis / Porsi:
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="misal: 1 drop / 2.5 ml"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Waktu Minum:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
                Catatan (Opsional):
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Sesudah makan"
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !name.trim() || !dosage.trim()}
            className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Catatan Obat'}</span>
          </button>
        </form>
      )}

      {/* Medication List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-[var(--text-muted)]">
          Memuat catatan obat...
        </div>
      ) : logs.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-1">
          Belum ada catatan minum obat/vitamin untuk tanggal ini.
        </p>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-main)]">{log.name}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">
                    {log.dosage}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> {log.time}
                  </span>
                  {log.notes && <span>• {log.notes}</span>}
                </div>
              </div>

              <button
                onClick={() => handleDelete(log.id)}
                className="p-1.5 text-[var(--text-muted)] hover:text-red-600 rounded-lg transition-colors"
                title="Hapus"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

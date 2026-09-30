'use client';

import { useState, useEffect } from 'react';
import { TBMedicationLog } from '@/lib/types';
import { X, CheckCircle2, Clock, Calendar, Pill, ShieldAlert } from 'lucide-react';

interface TBInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  initialData?: TBMedicationLog | null;
  nextSuggestedDay?: number;
}

export default function TBInputModal({
  isOpen,
  onClose,
  onSaved,
  initialData,
  nextSuggestedDay = 1,
}: TBInputModalProps) {
  const [dayNumber, setDayNumber] = useState<number>(nextSuggestedDay);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [medicineName, setMedicineName] = useState<string>('OAT KDT Anak');
  const [dosage, setDosage] = useState<string>('2 Tablet');
  const [method, setMethod] = useState<string>('Spuit + air putih');
  const [status, setStatus] = useState<string>('Selesai');
  const [notes, setNotes] = useState<string>('~90%');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setDayNumber(initialData.day_number);
      setDate(initialData.date);
      setTime(initialData.time || '06:00');
      setMedicineName(initialData.medicine_name);
      setDosage(initialData.dosage);
      setMethod(initialData.method);
      setStatus(initialData.status);
      setNotes(initialData.notes || '');
    } else {
      setDayNumber(nextSuggestedDay);
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setMedicineName('OAT KDT Anak');
      setDosage('2 Tablet');
      setMethod('Spuit + air putih');
      setStatus('Selesai');
      setNotes('~90%');
    }
    setError('');
  }, [initialData, nextSuggestedDay, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayNumber || !date || !medicineName.trim() || !dosage.trim()) {
      setError('Mohon lengkapi data wajib (Hari Ke, Tanggal, Nama Obat, Dosis).');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        id: initialData?.id,
        day_number: Number(dayNumber),
        date,
        time,
        medicine_name: medicineName.trim(),
        dosage: dosage.trim(),
        method: method.trim(),
        status,
        notes: notes.trim(),
      };

      const res = await fetch('/api/tb-medications', {
        method: initialData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan catatan obat TB');
      }

      onSaved();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan');
    } finally {
      setSubmitting(false);
    }
  };

  const medicinePresets = ['OAT KDT Anak', 'Rifampisin + INH', 'Pirazinamid', 'Etambutol'];
  const dosagePresets = ['1 Tablet', '1.5 Tablet', '2 Tablet', '3 Tablet', '5 ml Sirup'];
  const methodPresets = [
    'Spuit + air putih',
    'Cup feeder + air putih + sirplus',
    'Spuit + ASI / Air hangat',
    'Sendok takar',
  ];
  const percentagePresets = ['~100%', '~90%', '~80%', '~50%', '<50%'];
  const statusPresets = ['Selesai', 'Sebagian', 'Terlewat', 'Muntah'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-card)] w-full max-w-lg rounded-3xl border border-[var(--border-color)] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-amber-500/10 to-orange-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
              <Pill size={22} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-main)]">
                {initialData ? 'Edit Catatan Minum Obat TB' : 'Catat Minum Obat TB'}
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                {initialData ? `Perbarui data Hari Ke-${initialData.day_number}` : 'Input harian jurnal terapi OAT'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2 border border-red-200">
              <ShieldAlert size={16} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Day Number and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Hari Ke (1 - 180): <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="365"
                value={dayNumber}
                onChange={(e) => setDayNumber(parseInt(e.target.value, 10) || 1)}
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm font-bold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Tanggal: <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
                />
              </div>
            </div>
          </div>

          {/* Time and Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Jam Minum:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Status:
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              >
                {statusPresets.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Medicine Name with Presets */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              Nama Obat: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              placeholder="e.g. OAT KDT Anak"
              required
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {medicinePresets.map((med) => (
                <button
                  key={med}
                  type="button"
                  onClick={() => setMedicineName(med)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    medicineName === med
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-amber-400'
                  }`}
                >
                  {med}
                </button>
              ))}
            </div>
          </div>

          {/* Dosage with Presets */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              Dosis: <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g. 2 Tablet"
              required
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {dosagePresets.map((ds) => (
                <button
                  key={ds}
                  type="button"
                  onClick={() => setDosage(ds)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    dosage === ds
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-amber-400'
                  }`}
                >
                  {ds}
                </button>
              ))}
            </div>
          </div>

          {/* Method with Presets */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              Metode Pemberian:
            </label>
            <input
              type="text"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="e.g. Spuit + air putih"
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {methodPresets.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    method === m
                      ? 'bg-amber-100 text-amber-800 border-amber-300 font-bold'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-amber-400'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Notes and Percentage */}
          <div>
            <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
              Catatan Khusus (% Terminum / Efek Samping):
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. ~90% atau diminum lancar"
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {percentagePresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setNotes(pct)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    notes.includes(pct)
                      ? 'bg-amber-500 text-white font-bold border-amber-600'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-amber-400'
                  }`}
                >
                  {pct}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-[var(--border-color)] flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 bg-[var(--bg-secondary)] hover:bg-gray-200 text-[var(--text-main)] font-bold text-xs rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-2 py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Menyimpan...' : initialData ? 'Perbarui Catatan' : 'Simpan Catatan TB'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

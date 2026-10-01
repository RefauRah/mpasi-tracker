'use client';

import { useState, useEffect } from 'react';
import { Pill, CheckCircle2, ShieldAlert, Plus, ChevronDown, ChevronUp, Clock, Calendar, Sparkles } from 'lucide-react';

interface TBManualInputFormProps {
  onSaved: () => void;
  nextSuggestedDay: number;
  isOpenDefault?: boolean;
}

export default function TBManualInputForm({
  onSaved,
  nextSuggestedDay = 1,
  isOpenDefault = false,
}: TBManualInputFormProps) {
  const [isOpen, setIsOpen] = useState(isOpenDefault);
  const [dayNumber, setDayNumber] = useState<number>(nextSuggestedDay);
  const [date, setDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));
  const [medicineName, setMedicineName] = useState<string>('OAT KDT Anak');
  const [dosage, setDosage] = useState<string>('2 Tablet');
  const [method, setMethod] = useState<string>('Spuit + air putih');
  const [status, setStatus] = useState<string>('Selesai');
  const [notes, setNotes] = useState<string>('~100%');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setDayNumber(nextSuggestedDay);
  }, [nextSuggestedDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dayNumber || !date || !medicineName.trim() || !dosage.trim()) {
      setMessage({
        text: 'Mohon lengkapi data wajib (Hari Ke, Tanggal, Nama Obat, Dosis).',
        type: 'error',
      });
      return;
    }

    setSubmitting(true);
    setMessage(null);

    try {
      const payload = {
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
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Gagal menyimpan catatan obat TB');
      }

      setMessage({
        text: `Catatan Hari Ke-${dayNumber} berhasil disimpan!`,
        type: 'success',
      });

      // Auto update next suggested day
      setDayNumber((prev) => Number(prev) + 1);
      onSaved();

      setTimeout(() => {
        setMessage(null);
      }, 3500);
    } catch (err: any) {
      setMessage({
        text: err.message || 'Terjadi kesalahan saat menyimpan catatan.',
        type: 'error',
      });
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
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] overflow-hidden transition-all">
      {/* Header / Toggle Accordion */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent flex items-center justify-between cursor-pointer select-none hover:bg-amber-500/15 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-500 text-white rounded-xl shadow-sm">
            <Pill size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-main)] flex items-center gap-1.5">
              <span>Form Input Manual Obat TB</span>
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Hari Ke-{dayNumber}
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {isOpen ? 'Isi detail minum obat di bawah ini' : 'Klik untuk membuka formulir pencatatan harian OAT'}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="p-1.5 rounded-xl bg-[var(--bg-primary)] text-[var(--text-main)] border border-[var(--border-color)]"
        >
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {/* Form Content */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="p-5 space-y-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] animate-fade-in">
          {message && (
            <div
              className={`p-3 text-xs rounded-xl flex items-center gap-2 border ${
                message.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              ) : (
                <ShieldAlert size={16} className="shrink-0 text-red-600" />
              )}
              <span>{message.text}</span>
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
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
              />
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
              placeholder="e.g. ~100% atau diminum lancar"
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {percentagePresets.map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => setNotes(pct)}
                  className={`text-[10px] px-2 py-0.5 rounded-lg border transition-colors ${
                    notes === pct
                      ? 'bg-amber-500 text-white font-bold border-amber-600'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] border-[var(--border-color)] hover:border-amber-400'
                  }`}
                >
                  {pct}
                </button>
              ))}
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 size={16} />
              <span>{submitting ? 'Menyimpan Catatan...' : `Simpan Catatan Hari Ke-${dayNumber}`}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

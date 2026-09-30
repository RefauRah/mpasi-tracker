'use client';

import { useState, useEffect, useCallback } from 'react';
import { ParentLabCheck, ParentProfile, ParentRole } from '@/lib/types';
import { TestTube2, Plus, Trash2, Calendar, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

interface ParentLabSectionProps {
  role: ParentRole;
  profile: ParentProfile;
}

export default function ParentLabSection({ role, profile }: ParentLabSectionProps) {
  const [checks, setChecks] = useState<ParentLabCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [uricAcid, setUricAcid] = useState('');
  const [cholesterol, setCholesterol] = useState('');
  const [ldl, setLdl] = useState('');
  const [hdl, setHdl] = useState('');
  const [triglycerides, setTriglycerides] = useState('');
  const [bloodPressure, setBloodPressure] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchLabChecks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/parents/lab?role=${role}`);
      const data = await res.json();
      setChecks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => {
    fetchLabChecks();
  }, [fetchLabChecks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uricAcid || !cholesterol) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/parents/lab', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_role: role,
          date,
          uric_acid: parseFloat(uricAcid),
          total_cholesterol: parseFloat(cholesterol),
          ldl_cholesterol: ldl ? parseFloat(ldl) : null,
          hdl_cholesterol: hdl ? parseFloat(hdl) : null,
          triglycerides: triglycerides ? parseFloat(triglycerides) : null,
          blood_pressure: bloodPressure || null,
          notes,
        }),
      });

      if (res.ok) {
        setUricAcid('');
        setCholesterol('');
        setLdl('');
        setHdl('');
        setTriglycerides('');
        setBloodPressure('');
        setNotes('');
        setShowForm(false);
        fetchLabChecks();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus riwayat tes lab ini?')) return;
    try {
      const res = await fetch(`/api/parents/lab?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchLabChecks();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Normal thresholds
  const maxUricAcidNormal = role === 'ayah' ? 7.0 : 6.0;
  const maxCholesterolNormal = 200;

  const latestCheck = checks.length > 0 ? checks[checks.length - 1] : null;

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
            <TestTube2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)]">
              Hasil Cek Darah / Lab ({role === 'ayah' ? 'Ayah' : 'Ibu'})
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              Pantau penurunan kadar Asam Urat (mg/dL) & Kolesterol Total (mg/dL)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="p-2 bg-[var(--bg-secondary)] hover:bg-indigo-50 text-[var(--text-main)] rounded-xl text-xs font-bold transition-all flex items-center gap-1 border border-[var(--border-color)]"
        >
          <Plus size={15} />
          <span>{showForm ? 'Tutup' : 'Catat Hasil Cek'}</span>
        </button>
      </div>

      {/* Latest Status Glance */}
      {latestCheck && (
        <div className="grid grid-cols-2 gap-2.5">
          <div className={`p-3 rounded-2xl border ${
            latestCheck.uric_acid <= maxUricAcidNormal
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-red-50/70 border-red-200 text-red-950'
          }`}>
            <span className="text-[10px] font-bold text-[var(--text-muted)] block">Asam Urat Terakhir ({latestCheck.date})</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black">{latestCheck.uric_acid}</span>
              <span className="text-[10px]">mg/dL</span>
            </div>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded mt-1 inline-block ${
              latestCheck.uric_acid <= maxUricAcidNormal ? 'bg-emerald-200 text-emerald-900' : 'bg-red-200 text-red-900'
            }`}>
              {latestCheck.uric_acid <= maxUricAcidNormal ? '✅ Normal' : '⚠️ Tinggi (> ' + maxUricAcidNormal + ')'}
            </span>
          </div>

          <div className={`p-3 rounded-2xl border ${
            latestCheck.total_cholesterol < maxCholesterolNormal
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-amber-50/70 border-amber-200 text-amber-950'
          }`}>
            <span className="text-[10px] font-bold text-[var(--text-muted)] block">Kolesterol Total ({latestCheck.date})</span>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-black">{latestCheck.total_cholesterol}</span>
              <span className="text-[10px]">mg/dL</span>
            </div>
            <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded mt-1 inline-block ${
              latestCheck.total_cholesterol < maxCholesterolNormal ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'
            }`}>
              {latestCheck.total_cholesterol < maxCholesterolNormal ? '✅ Normal (< 200)' : '⚠️ Batas Waspada'}
            </span>
          </div>
        </div>
      )}

      {/* Add Lab Check Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-3 animate-fade-in">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Tanggal Tes:
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Tekanan Darah (Opsional):
              </label>
              <input
                type="text"
                value={bloodPressure}
                onChange={(e) => setBloodPressure(e.target.value)}
                placeholder="misal: 120/80"
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Asam Urat (mg/dL): <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                step="0.1"
                value={uricAcid}
                onChange={(e) => setUricAcid(e.target.value)}
                placeholder="Normal: 3.4 - 7.0"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Kolesterol Total (mg/dL): <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={cholesterol}
                onChange={(e) => setCholesterol(e.target.value)}
                placeholder="Normal: < 200"
                required
                className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                LDL (Opsional):
              </label>
              <input
                type="number"
                value={ldl}
                onChange={(e) => setLdl(e.target.value)}
                placeholder="< 100"
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                HDL (Opsional):
              </label>
              <input
                type="number"
                value={hdl}
                onChange={(e) => setHdl(e.target.value)}
                placeholder="> 40"
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
                Trigliserida:
              </label>
              <input
                type="number"
                value={triglycerides}
                onChange={(e) => setTriglycerides(e.target.value)}
                placeholder="< 150"
                className="w-full p-2 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Catatan Dokter / Kondisi:
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="misal: Setelah puasa 10 jam / asam urat jempol kaki mereda"
              className="w-full p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] text-xs"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 size={16} />
            <span>{submitting ? 'Menyimpan...' : 'Simpan Hasil Cek Lab'}</span>
          </button>
        </form>
      )}

      {/* History List */}
      {loading ? (
        <div className="py-4 text-center text-xs text-[var(--text-muted)]">
          Memuat riwayat cek lab...
        </div>
      ) : checks.length === 0 ? (
        <p className="text-xs text-[var(--text-muted)] italic py-1">
          Belum ada riwayat hasil cek lab darah. Klik "Catat Hasil Cek" di atas untuk mencatat.
        </p>
      ) : (
        <div className="space-y-2">
          {checks.map((chk) => (
            <div
              key={chk.id}
              className="p-3 bg-[var(--bg-primary)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[var(--text-main)] flex items-center gap-1">
                    <Calendar size={12} className="text-[var(--text-muted)]" /> {chk.date}
                  </span>
                  {chk.blood_pressure && (
                    <span className="text-[10px] bg-[var(--bg-card)] px-1.5 py-0.5 rounded border border-[var(--border-color)]">
                      TD: {chk.blood_pressure}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 text-[11px]">
                  <span className={`font-semibold ${chk.uric_acid <= maxUricAcidNormal ? 'text-emerald-700' : 'text-red-600 font-bold'}`}>
                    Asam Urat: <b>{chk.uric_acid} mg/dL</b>
                  </span>
                  <span>•</span>
                  <span className={`font-semibold ${chk.total_cholesterol < maxCholesterolNormal ? 'text-emerald-700' : 'text-amber-700 font-bold'}`}>
                    Kolesterol: <b>{chk.total_cholesterol} mg/dL</b>
                  </span>
                  {chk.ldl_cholesterol && <span>• LDL: {chk.ldl_cholesterol}</span>}
                </div>

                {chk.notes && <p className="text-[10px] text-[var(--text-muted)] italic">{chk.notes}</p>}
              </div>

              <button
                onClick={() => handleDelete(chk.id)}
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

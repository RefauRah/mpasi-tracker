'use client';

import { useState, useEffect } from 'react';
import DataTransferModal from '@/components/DataTransferModal';
import { Baby } from '@/lib/types';
import { calculateAgeInMonths, formatAge, getNutritionTarget } from '@/lib/nutrition-targets';
import { Baby as BabyIcon, Save, Info, CheckCircle2 } from 'lucide-react';

export default function ProfilePage() {
  const [baby, setBaby] = useState<Baby | null>(null);
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/api/baby')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setBaby(data);
          setName(data.name || '');
          setBirthDate(data.birth_date || '');
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !birthDate) return;

    setSaving(true);
    setMessage('');

    try {
      const res = await fetch('/api/baby', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, birth_date: birthDate }),
      });

      if (res.ok) {
        const updated = await res.json();
        setBaby(updated);
        setMessage('Profil bayi berhasil diperbarui!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const ageMonths = birthDate ? calculateAgeInMonths(birthDate) : 8;
  const ageText = formatAge(ageMonths);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Form Card */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[var(--accent-gold-light)] rounded-2xl text-[var(--accent-gold)]">
            <BabyIcon size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[var(--text-main)]">Profil Bayi</h1>
            <p className="text-xs text-[var(--text-muted)]">Informasi usia menentukan target nutrisi & porsi MPASI</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1">
              Nama Bayi:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full p-3 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-sm text-[var(--text-main)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-gold)]"
            />
          </div>

          {/* Computed Age Info Box */}
          <div className="p-3.5 bg-[var(--accent-gold-light)] rounded-xl border border-[var(--border-color)] flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)] font-medium">Usia Terkalkulasi:</span>
            <span className="font-bold text-[var(--accent-gold)] text-sm">{ageText}</span>
          </div>

          {message && (
            <div className="p-3 bg-emerald-50 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{message}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-[var(--accent-gold)] hover:bg-[#b07839] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
          >
            <Save size={16} />
            <span>{saving ? 'Menyimpan...' : 'Simpan Profil'}</span>
          </button>
        </form>
      </div>

      {/* Data Export / Import Section */}
      <DataTransferModal />

      {/* Recommended Nutrition Reference Table */}
      <div className="bg-[var(--bg-card)] p-5 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-3 mb-6">
        <div className="flex items-center gap-2">
          <Info size={18} className="text-[var(--accent-gold)]" />
          <h3 className="text-sm font-bold text-[var(--text-main)]">Standar Target Nutrisi MPASI (WHO)</h3>
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
              <tr className={ageMonths >= 6 && ageMonths <= 8 ? 'bg-[var(--accent-gold-light)] font-bold' : ''}>
                <td className="py-2.5 pr-2">6 - 8 Bulan</td>
                <td className="py-2.5 px-2 text-right">200 kkal</td>
                <td className="py-2.5 px-2 text-right">15 g</td>
                <td className="py-2.5 pl-2 text-right">10 mg</td>
              </tr>
              <tr className={ageMonths >= 9 && ageMonths <= 11 ? 'bg-[var(--accent-gold-light)] font-bold' : ''}>
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
  );
}

'use client';

import { useState } from 'react';
import {
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Pill,
  Baby,
  HeartPulse,
  Scale,
  FileText,
  X,
} from 'lucide-react';

export default function DataTransferModal() {
  const [importType, setImportType] = useState<'tb' | 'meals' | 'medications' | 'growth'>('tb');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleExport = (type: 'meals' | 'medications' | 'growth' | 'tb') => {
    if (type === 'tb') {
      window.open('/api/tb-medications/export', '_blank');
      return;
    }
    window.open(`/api/export?type=${type}`, '_blank');
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    setStatusMessage(null);

    try {
      if (importType === 'tb') {
        const formData = new FormData();
        formData.append('file', importFile);
        const res = await fetch('/api/tb-medications/import', { method: 'POST', body: formData });
        const data = await res.json();
        if (res.ok && data.success) {
          setStatusMessage({ text: `Berhasil mengimpor ${data.count} catatan Obat TB!`, type: 'success' });
          setImportFile(null);
        } else {
          throw new Error(data.error || 'Gagal mengimpor CSV Obat TB');
        }
        return;
      }

      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('type', importType);

      const res = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({
          text: `Berhasil mengimpor ${data.count} baris data ${importType}!`,
          type: 'success',
        });
        setImportFile(null);
      } else {
        throw new Error(data.error || 'Gagal mengimpor CSV');
      }
    } catch (err: any) {
      setStatusMessage({
        text: err.message || 'Terjadi kesalahan saat mengunggah file.',
        type: 'error',
      });
    } finally {
      setImporting(false);
    }
  };

  const exportCards = [
    {
      type: 'tb' as const,
      title: 'Obat TB (OAT)',
      subtitle: 'Log Terapi 180 Hari',
      icon: Pill,
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200/80',
      iconBg: 'bg-amber-500 text-white',
    },
    {
      type: 'meals' as const,
      title: 'Makanan MPASI',
      subtitle: 'Jurnal Nutrisi Bayi',
      icon: Baby,
      badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300 hover:bg-emerald-200/80',
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      type: 'medications' as const,
      title: 'Vitamin & Suplemen',
      subtitle: 'Catatan Suplemen Bayi',
      icon: HeartPulse,
      badgeColor: 'bg-purple-100 text-purple-900 border-purple-300 hover:bg-purple-200/80',
      iconBg: 'bg-purple-600 text-white',
    },
    {
      type: 'growth' as const,
      title: 'Pertumbuhan BB/TB',
      subtitle: 'Grafik Berat & Tinggi',
      icon: Scale,
      badgeColor: 'bg-blue-100 text-blue-900 border-blue-300 hover:bg-blue-200/80',
      iconBg: 'bg-blue-600 text-white',
    },
  ];

  const importOptions = [
    { key: 'tb', label: 'Obat TB', icon: Pill },
    { key: 'meals', label: 'Makanan', icon: Baby },
    { key: 'medications', label: 'Vitamin', icon: HeartPulse },
    { key: 'growth', label: 'BB/TB', icon: Scale },
  ];

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-[var(--border-color)] pb-4">
        <div className="p-3 bg-emerald-100 text-emerald-700 rounded-2xl shadow-sm">
          <FileSpreadsheet size={22} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Export & Import Data Excel/CSV</h3>
          <p className="text-xs text-[var(--text-muted)]">Cadangkan data atau impor catatan MPASI & Obat TB masal</p>
        </div>
      </div>

      {/* 1. Export Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
            <Download size={15} className="text-emerald-600" />
            <span>Export Data (Unduh File CSV / Spreadsheet)</span>
          </h4>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {exportCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.type}
                type="button"
                onClick={() => handleExport(card.type)}
                className={`p-3 rounded-2xl border transition-all duration-200 text-left flex items-center gap-2.5 shadow-sm group ${card.badgeColor}`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${card.iconBg}`}>
                  <Icon size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-[var(--text-main)] truncate group-hover:underline">
                    {card.title}
                  </span>
                  <span className="block text-[10px] text-[var(--text-muted)] truncate">
                    {card.subtitle}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Import Section */}
      <div className="space-y-3 pt-3 border-t border-[var(--border-color)]">
        <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Upload size={15} className="text-blue-600" />
          <span>Import Data dari File CSV</span>
        </h4>

        <form onSubmit={handleImportSubmit} className="p-4 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-4">
          {/* Target Selection Pill Tabs */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
              Pilih Kategori Data:
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">
              {importOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = importType === opt.key;
                return (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setImportType(opt.key as any)}
                    className={`py-2 px-1 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-[var(--accent-gold)] text-white shadow-sm'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                    }`}
                  >
                    <Icon size={13} />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clean File Picker Card */}
          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1.5">
              Pilih File CSV:
            </label>

            <div className="relative border-2 border-dashed border-[var(--border-color)] hover:border-[var(--accent-gold)] rounded-2xl p-4 bg-[var(--bg-card)] transition-colors text-center">
              <input
                type="file"
                accept=".csv"
                id="csv-file-input"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <FileText size={24} className={importFile ? 'text-emerald-600' : 'text-[var(--text-muted)]'} />
                {importFile ? (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-emerald-700 truncate max-w-xs">{importFile.name}</p>
                    <p className="text-[10px] text-[var(--text-muted)]">{(importFile.size / 1024).toFixed(1)} KB • Klik untuk mengganti</p>
                  </div>
                ) : (
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-[var(--text-main)]">Pilih file CSV dari perangkat Anda</p>
                    <p className="text-[10px] text-[var(--text-muted)]">Format berkas .csv dengan pemisah koma</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status Alert */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 border ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-800 border-red-200'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              ) : (
                <AlertCircle size={16} className="shrink-0 text-red-600" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={importing || !importFile}
            className="w-full py-3 px-4 bg-gradient-to-r from-[var(--accent-gold)] to-[#b57a38] hover:from-[#b57a38] hover:to-[var(--accent-gold)] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Upload size={15} />
            <span>{importing ? 'Sedang Mengimpor Data...' : 'Unggah & Impor File CSV'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Download, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function DataTransferModal() {
  const [importType, setImportType] = useState<'meals' | 'medications' | 'growth' | 'tb'>('meals');
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

  return (
    <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-5">
      <div className="flex items-center gap-2 border-b border-[var(--border-color)] pb-3">
        <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
          <FileSpreadsheet size={20} />
        </div>
        <div>
          <h3 className="text-base font-bold text-[var(--text-main)]">Export & Import Data Excel/CSV</h3>
          <p className="text-xs text-[var(--text-muted)]">Cadangkan data atau impor catatan MPASI & Obat TB masal</p>
        </div>
      </div>

      {/* Export Section */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Download size={14} className="text-emerald-600" />
          <span>Export Data (Unduh CSV/Excel)</span>
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            type="button"
            onClick={() => handleExport('tb')}
            className="p-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-xl text-xs font-bold border border-amber-200 transition-colors text-center"
          >
            💊 Obat TB (OAT)
          </button>
          <button
            type="button"
            onClick={() => handleExport('meals')}
            className="p-2.5 bg-[var(--bg-primary)] hover:bg-emerald-50 text-[var(--text-main)] rounded-xl text-xs font-semibold border border-[var(--border-color)] transition-colors text-center"
          >
            📊 Makanan MPASI
          </button>
          <button
            type="button"
            onClick={() => handleExport('medications')}
            className="p-2.5 bg-[var(--bg-primary)] hover:bg-purple-50 text-[var(--text-main)] rounded-xl text-xs font-semibold border border-[var(--border-color)] transition-colors text-center"
          >
            🩹 Suplemen/Vitamin
          </button>
          <button
            type="button"
            onClick={() => handleExport('growth')}
            className="p-2.5 bg-[var(--bg-primary)] hover:bg-blue-50 text-[var(--text-main)] rounded-xl text-xs font-semibold border border-[var(--border-color)] transition-colors text-center"
          >
            ⚖️ Data BB/TB
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="space-y-2 pt-2 border-t border-[var(--border-color)]">
        <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
          <Upload size={14} className="text-blue-600" />
          <span>Import Data dari File CSV</span>
        </h4>

        <form onSubmit={handleImportSubmit} className="p-3.5 bg-[var(--bg-primary)] rounded-2xl border border-[var(--border-color)] space-y-3">
          <div className="grid grid-cols-4 gap-1.5 p-1 bg-[var(--bg-secondary)] rounded-xl">
            {[
              { key: 'tb', label: 'Obat TB' },
              { key: 'meals', label: 'Makanan' },
              { key: 'medications', label: 'Vitamin' },
              { key: 'growth', label: 'BB/TB' },
            ].map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setImportType(t.key as any)}
                className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                  importType === t.key
                    ? 'bg-[var(--bg-card)] text-[var(--accent-gold)] shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1">
              Pilih File CSV:
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              required
              className="w-full text-xs text-[var(--text-main)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[var(--accent-gold-light)] file:text-[var(--accent-gold)] hover:file:bg-amber-200 cursor-pointer"
            />
          </div>

          {statusMessage && (
            <div
              className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-700'
              }`}
            >
              {statusMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{statusMessage.text}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={importing || !importFile}
            className="w-full py-2 px-3 bg-[var(--accent-gold)] hover:bg-[#b07839] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Upload size={14} />
            <span>{importing ? 'Mengimpor...' : 'Unggah & Impor CSV'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

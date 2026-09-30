'use client';

import { useState } from 'react';
import { Upload, FileSpreadsheet, Download, CheckCircle2, AlertCircle, X } from 'lucide-react';

interface TBImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

export default function TBImportModal({ isOpen, onClose, onImportSuccess }: TBImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [status, setStatus] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    window.open('/api/tb-medications/template', '_blank');
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setImporting(true);
    setStatus(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/tb-medications/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatus({
          text: `Berhasil mengimpor ${data.count} catatan pengobatan TB!`,
          type: 'success',
        });
        setFile(null);
        setTimeout(() => {
          onImportSuccess();
          onClose();
        }, 1200);
      } else {
        throw new Error(data.error || 'Gagal mengimpor file CSV');
      }
    } catch (err: any) {
      setStatus({
        text: err.message || 'Terjadi kesalahan saat mengunggah file CSV.',
        type: 'error',
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--bg-card)] w-full max-w-md rounded-3xl border border-[var(--border-color)] shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border-color)] flex items-center justify-between bg-gradient-to-r from-blue-500/10 to-indigo-500/10">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-500 text-white rounded-2xl shadow-sm">
              <Upload size={20} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[var(--text-main)]">Import Catatan Obat TB</h2>
              <p className="text-xs text-[var(--text-muted)]">Unggah file CSV dari Google Sheet / Excel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] rounded-full hover:bg-[var(--bg-secondary)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Template Info Card */}
          <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold flex items-center gap-1.5">
                <FileSpreadsheet size={15} />
                Format Kolom Spreadsheet
              </span>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-[11px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 underline underline-offset-2"
              >
                <Download size={12} />
                Unduh Template
              </button>
            </div>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Pastikan file CSV memiliki kolom: <code>Hari Ke</code>, <code>Tanggal</code>, <code>Jam Minum</code>, <code>Nama Obat</code>, <code>Dosis</code>, <code>Metode Pemberian</code>, <code>Status</code>, <code>Catatan Khusus</code>.
            </p>
          </div>

          {/* Upload Form */}
          <form onSubmit={handleImport} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[var(--text-main)] mb-1">
                Pilih File CSV (.csv):
              </label>
              <div className="border-2 border-dashed border-[var(--border-color)] hover:border-amber-500 rounded-2xl p-4 text-center transition-colors bg-[var(--bg-primary)]">
                <input
                  type="file"
                  accept=".csv"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                  className="w-full text-xs text-[var(--text-main)] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
                />
                {file && (
                  <p className="mt-2 text-xs font-semibold text-emerald-600">
                    File terpilih: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </p>
                )}
              </div>
            </div>

            {status && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  status.type === 'success'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0" />
                ) : (
                  <AlertCircle size={16} className="shrink-0" />
                )}
                <span>{status.text}</span>
              </div>
            )}

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 px-4 bg-[var(--bg-secondary)] hover:bg-gray-200 text-[var(--text-main)] font-bold text-xs rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={importing || !file}
                className="flex-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                <Upload size={16} />
                <span>{importing ? 'Mengimpor...' : 'Mulai Import Data'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

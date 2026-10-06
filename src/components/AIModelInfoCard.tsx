'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Cpu,
  Settings2,
  Info,
} from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface AvailableModel {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  tag: string;
}

interface AIInfoData {
  activeModel: string;
  hasApiKey: boolean;
  provider: string;
  availableModels: AvailableModel[];
}

export default function AIModelInfoCard() {
  const [data, setData] = useState<AIInfoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [copiedModel, setCopiedModel] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ai-info')
      .then((res) => res.json())
      .then((resData) => setData(resData))
      .catch((err) => console.error('Error fetching AI info:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedModel(id);
    setTimeout(() => setCopiedModel(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm">
        <LoadingSpinner text="Memeriksa konfigurasi AI Gemini..." size="sm" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-color)] shadow-sm overflow-hidden transition-all">
      {/* Top Banner / Active Status */}
      <div className="p-4 bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-blue-500/10 border-b border-[var(--border-color)] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-purple-600 text-white rounded-xl shadow-sm">
            <Brain size={18} />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs font-bold text-[var(--text-main)]">Mesin AI: Google Gemini</h3>
              <span className="px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                Active
              </span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5 flex-wrap">
              <Cpu size={12} className="text-purple-500 shrink-0" />
              <span>Model yang dipakai: </span>
              <strong className="text-purple-700 dark:text-purple-300 font-mono font-bold">
                {data.activeModel}
              </strong>
              {!data.availableModels.some((m) => m.id === data.activeModel) && (
                <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">
                  (⚠️ Model tidak standar Google, otomatis dialihkan ke gemini-2.0-flash)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API Key Connection Badge */}
        <div className="text-right">
          {data.hasApiKey ? (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 size={12} />
              API Key Terhubung
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              <AlertTriangle size={12} />
              Mock Fallback Mode
            </span>
          )}
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Aplikasi menggunakan model AI Gemini untuk analisis nutrisi MPASI, rekomendasi menu, evaluasi kesehatan, dan kalkulasi target gizi ayah & ibu.
          </p>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-700 shrink-0 ml-3 py-1 px-2.5 rounded-lg hover:bg-purple-50 transition-colors"
          >
            <span>{showGuide ? 'Tutup Panduan' : 'Pilihan Model & Cara Ubah'}</span>
            {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {/* Expandable Guide & Supported Models */}
        {showGuide && (
          <div className="space-y-3 pt-2 border-t border-[var(--border-color)] animate-fade-in">
            <div className="p-3 bg-[var(--bg-secondary)] rounded-xl border border-[var(--border-color)] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)]">
                <Settings2 size={15} className="text-purple-600" />
                <span>Format Penulisan Override di <code className="bg-[var(--bg-primary)] px-1.5 py-0.5 rounded text-purple-600 border border-[var(--border-color)]">.env.local</code> / Host:</span>
              </div>
              <p className="text-[11px] text-[var(--text-muted)]">
                Tambahkan baris variabel <code className="font-mono font-bold text-purple-700 dark:text-purple-300">GEMINI_MODEL=&quot;&lt;id_model&gt;&quot;</code> pada file konfigurasi environment Anda:
              </p>
              <div className="p-2.5 bg-slate-900 text-slate-100 font-mono text-[11px] rounded-lg flex items-center justify-between select-all">
                <code>GEMINI_MODEL=&quot;{data.activeModel}&quot;</code>
                <button
                  type="button"
                  onClick={() => handleCopy(`GEMINI_MODEL="${data.activeModel}"`, 'current-env')}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition-colors"
                  title="Salin ke clipboard"
                >
                  {copiedModel === 'current-env' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* List of Models */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5">
                <Sparkles size={14} className="text-[var(--accent-gold)]" />
                <span>Daftar Model Gemini yang Didukung:</span>
              </h4>

              <div className="grid grid-cols-1 gap-2">
                {data.availableModels.map((m) => {
                  const isActive = m.id === data.activeModel;
                  return (
                    <div
                      key={m.id}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-purple-300 bg-purple-50/50 dark:bg-purple-950/20 shadow-sm'
                          : 'border-[var(--border-color)] bg-[var(--bg-primary)] hover:border-purple-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-bold text-[var(--text-main)]">
                              {m.id}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                              {m.tag}
                            </span>
                            {isActive && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                                Sedang Digunakan
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--text-muted)] mt-1">
                            {m.description}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleCopy(`GEMINI_MODEL="${m.id}"`, m.id)}
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-bold border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--bg-secondary)] text-[var(--text-main)] transition-colors shrink-0"
                          title="Salin variabel env"
                        >
                          {copiedModel === m.id ? (
                            <>
                              <Check size={12} className="text-emerald-500" />
                              <span className="text-emerald-500">Tersalin</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Salin Env</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-[11px] text-blue-900">
              <Info size={14} className="text-blue-600 shrink-0 mt-0.5" />
              <span>
                Setelah mengubah nilai <code className="font-mono font-bold">GEMINI_MODEL</code> di file <code className="font-mono font-bold">.env.local</code> atau panel hosting, restart server aplikasi (<code className="font-mono font-bold">npm run dev</code>) agar perubahan model diterapkan.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

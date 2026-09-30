'use client';

import { useState, useEffect, useCallback } from 'react';
import { TBMedicationLog, TBMedicationStats } from '@/lib/types';
import TBMedicationChart from '@/components/TBMedicationChart';
import TBInputModal from '@/components/TBInputModal';
import TBImportModal from '@/components/TBImportModal';
import {
  Pill,
  Plus,
  Download,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Clock,
  Search,
  Filter,
  Trash2,
  Edit2,
  ShieldCheck,
  Flame,
  Percent,
  RefreshCw,
  Award,
} from 'lucide-react';

export default function TBTrackerPage() {
  const [logs, setLogs] = useState<TBMedicationLog[]>([]);
  const [stats, setStats] = useState<TBMedicationStats | null>(null);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [timeStats, setTimeStats] = useState<any[]>([]);
  const [methodStats, setMethodStats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Semua');

  // Modals state
  const [isInputModalOpen, setIsInputModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<TBMedicationLog | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch('/api/tb-medications?sort=day_desc'),
        fetch('/api/tb-medications/stats'),
      ]);

      const logsData = await logsRes.json();
      const statsData = await statsRes.json();

      setLogs(Array.isArray(logsData) ? logsData : []);
      if (statsData?.stats) {
        setStats(statsData.stats);
        setTimelineData(statsData.timelineData || []);
        setTimeStats(statsData.timeStats || []);
        setMethodStats(statsData.methodStats || []);
      }
    } catch (err) {
      console.error('Error fetching TB data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleExport = () => {
    window.open('/api/tb-medications/export', '_blank');
  };

  const handleDownloadTemplate = () => {
    window.open('/api/tb-medications/template', '_blank');
  };

  const handleDelete = async (id: number, dayNumber: number) => {
    if (!confirm(`Hapus catatan Hari Ke-${dayNumber}?`)) return;
    try {
      const res = await fetch(`/api/tb-medications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickLogToday = async () => {
    const nextDay = (stats?.latestDay || 0) + 1;
    const todayStr = new Date().toISOString().split('T')[0];
    const nowTime = new Date().toTimeString().slice(0, 5);

    try {
      const res = await fetch('/api/tb-medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          day_number: nextDay,
          date: todayStr,
          time: nowTime,
          medicine_name: 'OAT KDT Anak',
          dosage: '2 Tablet',
          method: 'Spuit + air putih',
          status: 'Selesai',
          notes: '~100%',
        }),
      });

      if (res.ok) {
        fetchData();
      }
    } catch (err) {
      console.error('Error quick logging today:', err);
    }
  };

  const handleEdit = (log: TBMedicationLog) => {
    setEditingLog(log);
    setIsInputModalOpen(true);
  };

  const handleOpenNewInput = () => {
    setEditingLog(null);
    setIsInputModalOpen(true);
  };

  // Filtered Logs
  const filteredLogs = logs.filter((log) => {
    const matchSearch =
      searchTerm === '' ||
      log.day_number.toString().includes(searchTerm) ||
      log.date.includes(searchTerm) ||
      log.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.method?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      statusFilter === 'Semua' || log.status.toLowerCase() === statusFilter.toLowerCase();

    return matchSearch && matchStatus;
  });

  const nextSuggestedDay = (stats?.latestDay || 0) + 1;
  const progressPercent = stats ? Math.min(100, Math.round((stats.completedDays / 180) * 100)) : 0;
  const isIntensivePhase = (stats?.latestDay || 0) <= 60;

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 rounded-[var(--radius-lg)] p-5 text-white shadow-lg space-y-4 relative overflow-hidden">
        <div className="absolute right-[-20px] top-[-20px] opacity-10 pointer-events-none">
          <Pill size={160} />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
              💊
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight">Jurnal Minum Obat TB (OAT)</h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white">
                  {isIntensivePhase ? 'Fase Intensif (2 Bln)' : 'Fase Lanjutan (4 Bln)'}
                </span>
              </div>
              <p className="text-xs text-amber-100 mt-0.5">
                Target terapi 6 bulan (180 hari) tanpa terputus
              </p>
            </div>
          </div>

          <button
            onClick={fetchData}
            disabled={loading}
            className="self-start sm:self-auto p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Progress Bar & Quick Status */}
        <div className="bg-black/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 space-y-2.5 relative z-10">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Award size={15} className="text-amber-200" />
              Progres Terapi: Hari Ke-{stats?.latestDay || 0} / 180 Hari
            </span>
            <span className="bg-white/25 px-2 py-0.5 rounded-lg text-[11px]">{progressPercent}%</span>
          </div>

          <div className="w-full bg-black/20 h-3 rounded-full overflow-hidden p-0.5">
            <div
              className="bg-gradient-to-r from-amber-200 to-white h-full rounded-full transition-all duration-700 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex justify-between items-center text-[11px] text-amber-100 pt-1">
            <span>Fase Intensif (H1-H60)</span>
            <span>Fase Lanjutan (H61-H180)</span>
          </div>
        </div>

        {/* Quick Log Today Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 relative z-10">
          <div className="text-xs font-semibold flex items-center gap-1.5">
            {stats?.todayLogged ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-300" />
                <span className="text-emerald-100">Hari ini sudah minum obat (Hari {stats.todayLog?.day_number}).</span>
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-400 animate-ping" />
                <span>Hari ini belum tercatat minum obat.</span>
              </>
            )}
          </div>

          {!stats?.todayLogged && (
            <button
              onClick={handleQuickLogToday}
              className="w-full sm:w-auto py-2 px-3.5 bg-white hover:bg-amber-50 text-amber-800 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span>Catat Selesai Hari Ini (Hari {nextSuggestedDay})</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Kepatuhan</span>
          </div>
          <p className="text-xl font-black text-[var(--text-main)]">
            {stats?.completionRate || 0}%
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">
            {stats?.completedDays || 0} dari {stats?.totalLoggedDays || 0} hari sukses
          </p>
        </div>

        <div className="bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold">
            <Flame size={14} className="text-amber-500" />
            <span>Streak / Runtun</span>
          </div>
          <p className="text-xl font-black text-[var(--text-main)]">
            {stats?.streakDays || 0} <span className="text-xs font-normal text-[var(--text-muted)]">Hari</span>
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Tanpa terputus</p>
        </div>

        <div className="bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold">
            <Percent size={14} className="text-blue-600" />
            <span>Rata-Rata Dosis</span>
          </div>
          <p className="text-xl font-black text-[var(--text-main)]">
            ~{stats?.avgAbsorption || 0}%
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Penyerapan obat masuk</p>
        </div>

        <div className="bg-[var(--bg-card)] p-3.5 rounded-2xl border border-[var(--border-color)] shadow-sm space-y-1">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-semibold">
            <Calendar size={14} className="text-purple-600" />
            <span>Sisa Terapi</span>
          </div>
          <p className="text-xl font-black text-[var(--text-main)]">
            {Math.max(0, 180 - (stats?.completedDays || 0))}{' '}
            <span className="text-xs font-normal text-[var(--text-muted)]">Hari</span>
          </p>
          <p className="text-[10px] text-[var(--text-muted)]">Menuju tuntas 180 hari</p>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="bg-[var(--bg-card)] p-4 rounded-[var(--radius-lg)] border border-[var(--border-color)] shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={handleOpenNewInput}
            className="flex-1 sm:flex-none py-2.5 px-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Plus size={16} />
            <span>+ Catat Manual (Hari Ke-{nextSuggestedDay})</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleDownloadTemplate}
              className="flex-1 sm:flex-none py-2.5 px-3 bg-[var(--bg-primary)] hover:bg-amber-50 text-[var(--text-main)] font-semibold text-xs rounded-xl border border-[var(--border-color)] transition-colors flex items-center justify-center gap-1.5"
              title="Download Template CSV Spreadsheet"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Unduh Template</span>
            </button>

            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 sm:flex-none py-2.5 px-3 bg-[var(--bg-primary)] hover:bg-blue-50 text-[var(--text-main)] font-semibold text-xs rounded-xl border border-[var(--border-color)] transition-colors flex items-center justify-center gap-1.5"
              title="Import Data dari CSV"
            >
              <Upload size={15} className="text-blue-600" />
              <span>Import CSV</span>
            </button>

            <button
              onClick={handleExport}
              className="flex-1 sm:flex-none py-2.5 px-3 bg-[var(--bg-primary)] hover:bg-emerald-50 text-[var(--text-main)] font-semibold text-xs rounded-xl border border-[var(--border-color)] transition-colors flex items-center justify-center gap-1.5"
              title="Export Seluruh Data ke CSV"
            >
              <Download size={15} className="text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section */}
      <TBMedicationChart
        timelineData={timelineData}
        timeStats={timeStats}
        methodStats={methodStats}
      />

      {/* Diary / History Logs Table */}
      <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)] pb-3">
          <div>
            <h3 className="text-base font-bold text-[var(--text-main)] flex items-center gap-2">
              <span>Riwayat Harian Minum Obat TB</span>
              <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                {filteredLogs.length} Catatan
              </span>
            </h3>
            <p className="text-xs text-[var(--text-muted)]">Daftar lengkap log terapi dari hari ke hari</p>
          </div>

          {/* Search & Status Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Cari hari / tgl / catatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="py-1.5 px-3 text-xs rounded-xl bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)]"
            >
              <option value="Semua">Semua Status</option>
              <option value="Selesai">Selesai</option>
              <option value="Terlewat">Terlewat</option>
              <option value="Muntah">Muntah</option>
              <option value="Sebagian">Sebagian</option>
            </select>
          </div>
        </div>

        {/* List Content */}
        {loading ? (
          <div className="py-12 text-center text-xs text-[var(--text-muted)]">
            Memuat data pengobatan TB...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 bg-[var(--bg-primary)] rounded-2xl border border-dashed border-[var(--border-color)] text-center text-xs text-[var(--text-muted)] space-y-2">
            <p>Belum ada catatan yang cocok dengan filter pencarian.</p>
            <button
              onClick={handleOpenNewInput}
              className="text-xs font-bold text-amber-600 hover:underline"
            >
              + Tambah Catatan Hari Ini
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredLogs.map((log) => {
              const isDone = log.status.toLowerCase() === 'selesai';
              return (
                <div
                  key={log.id}
                  className="p-3.5 bg-[var(--bg-primary)] hover:bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start gap-3">
                    {/* Day Badge */}
                    <div className="w-12 h-12 rounded-xl bg-amber-500 text-white font-black flex flex-col items-center justify-center shrink-0 shadow-sm">
                      <span className="text-[9px] uppercase tracking-wider font-semibold opacity-90">Hari</span>
                      <span className="text-base leading-none">{log.day_number}</span>
                    </div>

                    {/* Main Details */}
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-main)]">{log.medicine_name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                          {log.dosage}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isDone ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {log.status}
                        </span>
                        {log.notes && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                            {log.notes}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-[var(--text-muted)]">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar size={12} /> {log.date}
                        </span>
                        {log.time && (
                          <span className="flex items-center gap-1 font-medium">
                            <Clock size={12} /> {log.time}
                          </span>
                        )}
                        {log.method && <span>Metode: {log.method}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 self-end sm:self-center">
                    <button
                      onClick={() => handleEdit(log)}
                      className="p-2 text-[var(--text-muted)] hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors"
                      title="Edit Catatan"
                    >
                      <Edit2 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(log.id, log.day_number)}
                      className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Hapus Catatan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Input Modal */}
      <TBInputModal
        isOpen={isInputModalOpen}
        onClose={() => setIsInputModalOpen(false)}
        onSaved={fetchData}
        initialData={editingLog}
        nextSuggestedDay={nextSuggestedDay}
      />

      {/* Import Modal */}
      <TBImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImportSuccess={fetchData}
      />
    </div>
  );
}

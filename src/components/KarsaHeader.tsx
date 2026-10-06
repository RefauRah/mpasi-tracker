'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';

export default function KarsaHeader() {
  const pathname = usePathname();

  const getModuleBadge = () => {
    if (pathname.startsWith('/orang-tua')) return 'Jurnal Orang Tua';
    if (pathname.startsWith('/obat-tb')) return 'Terapi Obat TB';
    if (pathname.startsWith('/profil')) return 'Pengaturan & Profil';
    return 'Nutrisi MPASI Bayi';
  };

  return (
    <header className="sticky top-0 z-30 bg-[var(--bg-card)]/90 backdrop-blur-md border-b border-[var(--border-color)] px-4 py-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] transition-all">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-emerald-700 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
            <svg viewBox="0 0 512 512" className="w-5 h-5 fill-current">
              <path
                d="M168 128 C168 114.7 178.7 104 192 104 C205.3 104 216 114.7 216 128 L216 384 C216 397.3 205.3 408 192 408 C178.7 408 168 397.3 168 384 Z"
                fill="#FFFFFF"
              />
              <path
                d="M208 260 L318 140 C327.4 129.7 343.3 129.2 353.4 138.9 C363.3 148.4 363.3 164.2 353.6 173.8 L264 262 L360 364 C369.6 374.2 368.9 390.2 358.5 399.5 C348.3 408.8 332.3 408 323 397.7 L208 274 Z"
                fill="#FFFFFF"
              />
              <path
                d="M296 232 C296 232 350 178 390 206 C426 231 398 288 348 316 C314 335 284 316 284 316 C284 316 270 286 284 256 C290 243 296 232 296 232 Z"
                fill="#FCD34D"
              />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base font-black tracking-tight text-[var(--text-main)] group-hover:text-emerald-700 transition-colors">
                Karsa
              </span>
              <span className="text-[9.5px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                AI Health
              </span>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] font-medium leading-none mt-0.5">
              Jurnal Kesehatan & Nutrisi Keluarga
            </p>
          </div>
        </Link>

        {/* Active Module Tag */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border-color)] flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            <span>{getModuleBadge()}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

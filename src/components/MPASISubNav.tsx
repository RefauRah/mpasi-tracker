'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, History, BarChart3 } from 'lucide-react';

export default function MPASISubNav() {
  const pathname = usePathname();

  const tabs = [
    { href: '/', label: 'Hari Ini', icon: Utensils },
    { href: '/riwayat', label: 'Riwayat', icon: History },
    { href: '/grafik', label: 'Grafik & Tren', icon: BarChart3 },
  ];

  return (
    <div className="bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border-color)] shadow-sm flex items-center justify-between gap-1 mb-4">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              isActive
                ? 'bg-[var(--accent-gold)] text-white shadow-sm scale-[1.02]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]'
            }`}
          >
            <Icon size={15} />
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, History, BarChart3, Baby } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Beranda', icon: LayoutDashboard },
    { href: '/riwayat', label: 'Riwayat', icon: History },
    { href: '/grafik', label: 'Grafik', icon: BarChart3 },
    { href: '/profil', label: 'Profil Bayi', icon: Baby },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)] border-t border-[var(--border-color)] shadow-[var(--shadow-lg)] px-4 py-2">
      <div className="max-w-lg mx-auto flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-2xl transition-all duration-200 ${
                isActive
                  ? 'text-[var(--accent-gold)] font-bold scale-105'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  isActive ? 'bg-[var(--accent-gold-light)]' : 'bg-transparent'
                }`}
              >
                <Icon size={22} />
              </div>
              <span className="text-[11px] mt-0.5 tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

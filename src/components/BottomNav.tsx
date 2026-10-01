'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Baby, Pill, HeartPulse, UserCog } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      href: '/',
      label: 'MPASI Bayi',
      icon: Baby,
      isActive: pathname === '/' || pathname === '/riwayat' || pathname === '/grafik',
    },
    {
      href: '/obat-tb',
      label: 'Obat TB',
      icon: Pill,
      isActive: pathname.startsWith('/obat-tb'),
    },
    {
      href: '/orang-tua',
      label: 'Ayah & Ibu',
      icon: HeartPulse,
      isActive: pathname.startsWith('/orang-tua'),
    },
    {
      href: '/profil',
      label: 'Profil',
      icon: UserCog,
      isActive: pathname.startsWith('/profil'),
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card)]/90 backdrop-blur-md border-t border-[var(--border-color)] shadow-[0_-4px_20px_rgba(54,42,32,0.06)] px-3 py-2">
      <div className="max-w-lg mx-auto grid grid-cols-4 gap-1 items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-2xl transition-all duration-200 ${
                active
                  ? 'text-[var(--accent-gold)] font-bold scale-[1.03]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-primary)]/50'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all duration-200 ${
                  active
                    ? 'bg-[var(--accent-gold-light)] shadow-inner text-[var(--accent-gold)]'
                    : 'bg-transparent'
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="text-[10.5px] mt-0.5 tracking-tight font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

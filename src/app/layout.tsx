import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';
import KarsaHeader from '@/components/KarsaHeader';

export const metadata: Metadata = {
  title: 'Karsa — Jurnal Nutrisi & Kesehatan Keluarga',
  description: 'Karsa — Aplikasi cerdas pemantau nutrisi MPASI bayi, pengingat minum obat TB, dan jurnal kesehatan orang tua berbasis AI.',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/icon.svg',
  },
  applicationName: 'Karsa',
  appleWebApp: {
    title: 'Karsa',
    statusBarStyle: 'default',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-[var(--bg-primary)] text-[var(--text-main)] antialiased min-h-screen pb-20 font-sans">
        <div className="max-w-lg mx-auto min-h-screen flex flex-col bg-[var(--bg-primary)] border-x border-[var(--border-color)] shadow-sm">
          <KarsaHeader />
          <main className="flex-1 p-4 sm:p-5 pb-28 sm:pb-32">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}


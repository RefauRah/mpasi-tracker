import type { Metadata } from 'next';
import './globals.css';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'MPASI Tracker — Hitung Kalori & Nutrisi Bayi dengan AI',
  description: 'Aplikasi pelacak MPASI bayi cerdas berbasis AI untuk menganalisis kalori, protein, lemak, dan nutrisi harian.',
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
          <main className="flex-1 p-4 sm:p-5 pb-28 sm:pb-32">{children}</main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}

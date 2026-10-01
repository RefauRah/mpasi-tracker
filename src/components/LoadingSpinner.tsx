'use client';

import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  text?: string;
  size?: 'sm' | 'md' | 'lg';
  fullHeight?: boolean;
}

export default function LoadingSpinner({
  text = 'Memuat data...',
  size = 'md',
  fullHeight = false,
}: LoadingSpinnerProps) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  return (
    <div
      className={`flex flex-col items-center justify-center gap-2.5 p-6 rounded-2xl ${
        fullHeight ? 'min-h-[200px]' : 'py-8'
      } text-[var(--text-muted)] animate-fade-in`}
    >
      <div className="relative flex items-center justify-center">
        <Loader2 className={`${sizeClass} animate-spin text-[var(--accent-gold)]`} />
      </div>
      {text && <p className="text-xs font-semibold text-[var(--text-muted)] tracking-wide">{text}</p>}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="p-4 bg-[var(--bg-card)] rounded-[var(--radius-md)] border border-[var(--border-color)] shadow-xs animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-[var(--bg-secondary)] rounded-md w-1/3"></div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded-full w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-full"></div>
        <div className="h-3 bg-[var(--bg-secondary)] rounded w-4/5"></div>
      </div>
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} />
      ))}
    </div>
  );
}

'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  if (totalItems === 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate compact page numbers for mobile responsiveness
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 4) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        pages.push(1, 2, '...', totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1, '...', totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="pt-4 border-t border-[var(--border-color)] space-y-3">
      {/* Top Row: Information & Page Size Selector */}
      <div className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
        <div>
          Menampilkan <span className="font-bold text-[var(--text-main)]">{startItem} - {endItem}</span> dari{' '}
          <span className="font-bold text-[var(--text-main)]">{totalItems}</span> data
        </div>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px]">Per hal:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="py-1 px-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-color)] text-xs font-bold text-[var(--text-main)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-gold)] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Bottom Row: Centered Navigation Buttons */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs"
            title="Halaman Pertama"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Prev Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs"
            title="Halaman Sebelumnya"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Numeric Page Buttons */}
          <div className="flex items-center gap-1 mx-0.5">
            {getPageNumbers().map((p, idx) => {
              if (p === '...') {
                return (
                  <span key={`ellipsis-${idx}`} className="px-1 text-xs text-[var(--text-muted)] font-bold select-none">
                    …
                  </span>
                );
              }
              const pageNum = Number(p);
              const isCurrent = pageNum === currentPage;
              return (
                <button
                  key={`page-${pageNum}`}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`min-w-[32px] h-8 px-2 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[var(--accent-gold)] to-[#b57a38] text-white shadow-sm scale-105'
                      : 'border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] hover:bg-[var(--bg-secondary)]'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          {/* Next Page */}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs"
            title="Halaman Selanjutnya"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-xl border border-[var(--border-color)] bg-[var(--bg-primary)] text-[var(--text-main)] flex items-center justify-center hover:bg-[var(--bg-secondary)] disabled:opacity-25 disabled:pointer-events-none transition-all shadow-2xs"
            title="Halaman Terakhir"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}

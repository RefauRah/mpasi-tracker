import { TBMedicationLog } from './types';

// Convert DD-MM-YYYY to YYYY-MM-DD
export function parseDateToISO(dateStr: string): string {
  if (!dateStr) return '';
  const trimmed = dateStr.trim();
  // If DD-MM-YYYY
  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('-');
    return `${y}-${m}-${d}`;
  }
  // If DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [d, m, y] = trimmed.split('/');
    return `${y}-${m}-${d}`;
  }
  // If YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

// Convert YYYY-MM-DD to DD-MM-YYYY
export function formatISOToDate(isoStr: string): string {
  if (!isoStr) return '';
  const trimmed = isoStr.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [y, m, d] = trimmed.split('-');
    return `${d}-${m}-${y}`;
  }
  return trimmed;
}

export const initialTBSeedData: Omit<TBMedicationLog, 'id'>[] = [
  { baby_id: 1, day_number: 1, date: '2026-08-05', time: '07:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Cup feeder + air putih + sirplus', status: 'Selesai', notes: '~50%' },
  { baby_id: 1, day_number: 2, date: '2026-08-06', time: '06:50', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Cup feeder + air putih + sirplus', status: 'Selesai', notes: '<50%' },
  { baby_id: 1, day_number: 3, date: '2026-08-07', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Cup feeder + air putih + sirplus', status: 'Selesai', notes: '~50%' },
  { baby_id: 1, day_number: 4, date: '2026-08-08', time: '06:50', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 5, date: '2026-08-09', time: '06:50', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 6, date: '2026-08-10', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 7, date: '2026-08-11', time: '06:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 8, date: '2026-08-12', time: '05:50', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 9, date: '2026-08-13', time: '06:20', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 10, date: '2026-08-14', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 11, date: '2026-08-15', time: '06:05', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 12, date: '2026-08-16', time: '06:40', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 13, date: '2026-08-17', time: '05:50', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 14, date: '2026-08-18', time: '07:10', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 15, date: '2026-08-19', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 16, date: '2026-08-20', time: '06:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 17, date: '2026-08-21', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 18, date: '2026-08-22', time: '06:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 19, date: '2026-08-23', time: '06:45', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 20, date: '2026-08-24', time: '07:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 21, date: '2026-08-25', time: '06:35', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 22, date: '2026-08-26', time: '06:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 23, date: '2026-08-27', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 24, date: '2026-08-28', time: '06:45', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 25, date: '2026-08-29', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 26, date: '2026-08-30', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 27, date: '2026-08-31', time: '07:05', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 28, date: '2026-09-01', time: '06:55', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 29, date: '2026-09-02', time: '06:05', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 30, date: '2026-09-03', time: '06:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 31, date: '2026-09-04', time: '06:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 32, date: '2026-09-05', time: '06:55', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 33, date: '2026-09-06', time: '06:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 34, date: '2026-09-07', time: '06:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 35, date: '2026-09-08', time: '06:45', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 36, date: '2026-09-09', time: '05:45', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 37, date: '2026-09-10', time: '06:46', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 38, date: '2026-09-11', time: '06:46', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 39, date: '2026-09-12', time: '05:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 40, date: '2026-09-13', time: '06:10', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 41, date: '2026-09-14', time: '06:15', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
  { baby_id: 1, day_number: 42, date: '2026-09-15', time: '06:25', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 43, date: '2026-09-16', time: '06:05', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 44, date: '2026-09-17', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 45, date: '2026-09-18', time: '06:10', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 46, date: '2026-09-19', time: '05:45', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 47, date: '2026-09-20', time: '06:05', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 48, date: '2026-09-21', time: '07:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 49, date: '2026-09-22', time: '05:40', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 50, date: '2026-09-23', time: '05:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 51, date: '2026-09-24', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 52, date: '2026-09-25', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 53, date: '2026-09-26', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 54, date: '2026-09-27', time: '06:00', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~90%' },
  { baby_id: 1, day_number: 55, date: '2026-09-28', time: '06:30', medicine_name: 'OAT KDT Anak', dosage: '2 Tablet', method: 'Spuit + air putih', status: 'Selesai', notes: '~80%' },
];

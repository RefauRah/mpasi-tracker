'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend,
} from 'recharts';

interface StatItem {
  date: string;
  label: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  iron: number;
  calcium: number;
}

interface NutritionChartProps {
  data: StatItem[];
  targetCalories: number;
}

export default function NutritionChart({ data, targetCalories }: NutritionChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-xs text-[var(--text-muted)]">
        Belum ada data grafik yang cukup. Silakan input makanan terlebih dahulu.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Chart 1: Kalori Harian vs Target */}
      <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)]">
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">Tren Kalori Harian (kkal)</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Garis putus-putus merah menunjukkan target kalori harian</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7C6E60' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7C6E60' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DFD1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <ReferenceLine
                y={targetCalories}
                stroke="#D96B43"
                strokeDasharray="5 5"
                label={{ value: `Target (${targetCalories})`, fill: '#D96B43', fontSize: 10, position: 'top' }}
              />
              <Line
                type="monotone"
                dataKey="calories"
                name="Kalori (kkal)"
                stroke="#C68B45"
                strokeWidth={3}
                dot={{ r: 4, fill: '#C68B45' }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Makronutrisi Breakdown (Protein, Karbo, Lemak) */}
      <div className="bg-[var(--bg-card)] rounded-[var(--radius-lg)] p-5 border border-[var(--border-color)] shadow-[var(--shadow-md)]">
        <h3 className="text-sm font-bold text-[var(--text-main)] mb-1">Distribusi Makronutrisi (gram)</h3>
        <p className="text-xs text-[var(--text-muted)] mb-4">Perbandingan Protein, Karbohidrat, dan Lemak harian</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#7C6E60' }} />
              <YAxis tick={{ fontSize: 11, fill: '#7C6E60' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E8DFD1',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="protein" name="Protein (g)" fill="#F59E0B" radius={[4, 4, 0, 0]} />
              <Bar dataKey="carbs" name="Karbo (g)" fill="#FB923C" radius={[4, 4, 0, 0]} />
              <Bar dataKey="fat" name="Lemak (g)" fill="#EAB308" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

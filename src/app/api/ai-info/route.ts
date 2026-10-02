import { NextResponse } from 'next/server';

export async function GET() {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const hasApiKey = Boolean(
    process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== ''
  );

  const availableModels = [
    {
      id: 'gemini-2.0-flash',
      name: 'Gemini 2.0 Flash (Default)',
      description: 'Model generasi terbaru Google: sangat cepat, cerdas, efisien & stabil untuk analisis nutrisi.',
      isDefault: true,
      tag: 'Direkomendasikan',
    },
    {
      id: 'gemini-2.0-flash-lite',
      name: 'Gemini 2.0 Flash-Lite',
      description: 'Versi ringan dengan latency super cepat dan hemat kuota.',
      isDefault: false,
      tag: 'Ultra Cepat',
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'Model stabil generasi 1.5 dengan jendela konteks luas.',
      isDefault: false,
      tag: 'Stabil',
    },
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Model penalaran tingkat tinggi untuk analisis kompleks dan detail medis mendalam.',
      isDefault: false,
      tag: 'High Reasoning',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      description: 'Model preview generasi 2.5 dengan efisiensi dan akurasi tinggi.',
      isDefault: false,
      tag: 'Next Gen',
    },
    {
      id: 'gemini-2.5-pro',
      name: 'Gemini 2.5 Pro',
      description: 'Model penalaran tertinggi Google Gemini untuk kebutuhan analisis spesifik.',
      isDefault: false,
      tag: 'Next Gen Pro',
    },
  ];

  return NextResponse.json({
    activeModel: model,
    hasApiKey,
    provider: 'Google Gemini AI',
    availableModels,
  });
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import { AnalyzeResult, MenuRecommendation, NutritionSummary, NutritionTarget } from './types';

const apiKey = process.env.GEMINI_API_KEY || '';

export async function analyzeFoodWithGemini(
  inputText: string,
  ageInMonths: number
): Promise<AnalyzeResult> {
  if (!apiKey) {
    // Graceful fallback mock estimation if no API key present
    return generateMockAnalysis(inputText);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Kamu adalah ahli gizi spesialis MPASI (Makanan Pendamping ASI) bayi.
Tugasmu adalah menganalisis teks makanan MPASI yang diinputkan orang tua.
Teks input bisa mengandung berbagai satuan (contoh: gram, sendok makan / sdm, sendok teh / sdt, potong, buah, genggam, mangkuk kecil, bola pingpong, dll.).

Konteks Usia Bayi: ${ageInMonths} bulan.
Input Makanan: "${inputText}"

Hitung estimasi nutrisi dengan akurat berdasarkan standar gizi makanan pendamping ASI.
Kembalikan HANYA format JSON murni (JSON raw tanpa \`\`\`json markdown wrapper):

{
  "foods": [
    {
      "name": "string (nama makanan)",
      "quantity": "string (porsi & satuan)",
      "estimated_grams": number,
      "calories": number,
      "protein": number,
      "carbs": number,
      "fat": number,
      "fiber": number,
      "iron": number,
      "calcium": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "iron": number,
    "calcium": number
  },
  "notes": "string (catatan gizi singkat untuk orang tua)"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson) as AnalyzeResult;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return generateMockAnalysis(inputText);
  }
}

export async function getRecommendationsWithGemini(
  current: NutritionSummary,
  target: NutritionTarget,
  ageInMonths: number
): Promise<MenuRecommendation[]> {
  if (!apiKey) {
    return generateMockRecommendations(current, target, ageInMonths);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Kamu adalah konsultan MPASI bayi profesional.
Bayi berusia ${ageInMonths} bulan.
Asupan nutrisi harian bayi hari ini:
- Kalori: ${current.calories} kkal / target ${target.calories} kkal
- Protein: ${current.protein}g / target ${target.protein}g
- Karbohidrat: ${current.carbs}g / target ${target.carbs}g
- Lemak: ${current.fat}g / target ${target.fat}g
- Serat: ${current.fiber}g / target ${target.fiber}g
- Zat Besi: ${current.iron}mg / target ${target.iron}mg
- Kalsium: ${current.calcium}mg / target ${target.calcium}mg

Berikan 3 rekomendasi menu MPASI yang sehat, lezat, aman untuk usia ${ageInMonths} bulan, dan fokus melengkapi nutrisi yang masih kurang hari ini.

Kembalikan HANYA format JSON murni (JSON raw tanpa \`\`\`json markdown wrapper):
[
  {
    "title": "Nama Menu MPASI",
    "description": "Deskripsi singkat bahan dan tekstur penyajian",
    "nutrientsProvided": ["Zat Besi", "Protein", ...],
    "estimatedCalories": 120
  }
]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as MenuRecommendation[];
  } catch (error) {
    console.error('Error calling Gemini API for recommendations:', error);
    return generateMockRecommendations(current, target, ageInMonths);
  }
}

/**
 * Fallback jika API key belum diisi atau error network
 */
function generateMockAnalysis(inputText: string): AnalyzeResult {
  const items = inputText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
  
  const foods = items.map(item => {
    const isRice = /nasi|bubur|beras/i.test(item);
    const isMeat = /daging|ayam|hati|ikan|telur/i.test(item);
    const isVeg = /wortel|bayam|brokoli|labu|sayur/i.test(item);
    const isFruit = /pisang|alpukat|apel|buah/i.test(item);

    let grams = 30;
    let cal = 40;
    let prot = 1.5;
    let carbs = 7;
    let fat = 1;
    let fiber = 0.5;
    let iron = 0.4;
    let calc = 5;

    if (isRice) {
      grams = 45; cal = 55; prot = 1.2; carbs = 12; fat = 0.3; fiber = 0.3; iron = 0.3; calc = 4;
    } else if (isMeat) {
      grams = 25; cal = 65; prot = 5.5; carbs = 0.5; fat = 3.5; fiber = 0; iron = 1.8; calc = 8;
    } else if (isVeg) {
      grams = 20; cal = 18; prot = 0.6; carbs = 3.5; fat = 0.2; fiber = 1.2; iron = 0.6; calc = 12;
    } else if (isFruit) {
      grams = 35; cal = 35; prot = 0.5; carbs = 8.5; fat = 0.3; fiber = 1.0; iron = 0.2; calc = 6;
    }

    return {
      name: item,
      quantity: item,
      estimated_grams: grams,
      calories: Math.round(cal),
      protein: Number(prot.toFixed(1)),
      carbs: Number(carbs.toFixed(1)),
      fat: Number(fat.toFixed(1)),
      fiber: Number(fiber.toFixed(1)),
      iron: Number(iron.toFixed(1)),
      calcium: Math.round(calc),
    };
  });

  const total = foods.reduce(
    (acc, f) => ({
      calories: Math.round(acc.calories + f.calories),
      protein: Number((acc.protein + f.protein).toFixed(1)),
      carbs: Number((acc.carbs + f.carbs).toFixed(1)),
      fat: Number((acc.fat + f.fat).toFixed(1)),
      fiber: Number((acc.fiber + f.fiber).toFixed(1)),
      iron: Number((acc.iron + f.iron).toFixed(1)),
      calcium: Math.round(acc.calcium + f.calcium),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, iron: 0, calcium: 0 }
  );

  return {
    foods,
    total,
    notes: 'Kombinasi makanan yang baik! Pastikan selalu menambahkan lemak tambahan seperti minyak kelapa/EVOO/mentega untuk tumbuh kembang otak si kecil.',
  };
}

function generateMockRecommendations(
  current: NutritionSummary,
  target: NutritionTarget,
  ageInMonths: number
): MenuRecommendation[] {
  return [
    {
      title: 'Bubur Hati Ayam & Wortel',
      description: 'Hati ayam kaya akan zat besi hewani yang mudah diserap, dipadukan dengan wortel lumat.',
      nutrientsProvided: ['Zat Besi', 'Protein', 'Vitamin A'],
      estimatedCalories: 110,
    },
    {
      title: 'Puree Alpukat & Santan Gurih',
      description: 'Alpukat matang dilumatkan dengan sedikit santan hangat untuk menambah asupan lemak sehat.',
      nutrientsProvided: ['Lemak Sehat', 'Kalori'],
      estimatedCalories: 95,
    },
    {
      title: 'Tim Daging Sapi & Tahu Saring',
      description: 'Daging sapi giling ditim lembut bersama tahu dan kaldu ayam kampung.',
      nutrientsProvided: ['Zat Besi', 'Protein', 'Kalsium'],
      estimatedCalories: 130,
    },
  ];
}

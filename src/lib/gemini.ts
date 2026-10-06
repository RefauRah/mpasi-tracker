import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AnalyzeResult,
  MenuRecommendation,
  NutritionSummary,
  NutritionTarget,
  ParentRole,
  ParentProfile,
  ParentFoodItem,
  ParentAnalyzeResult,
  ParentRecommendation,
  ParentLabCheck,
  AITargetAssessment,
} from './types';
import { calculateLabAdjustedTargets } from './nutrition-targets';

const apiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

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
    const model = genAI.getGenerativeModel({ model: geminiModel });

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
    const model = genAI.getGenerativeModel({ model: geminiModel });

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

export async function analyzeParentFoodWithGemini(
  inputText: string,
  role: ParentRole
): Promise<ParentAnalyzeResult> {
  const roleName = role === 'ayah' ? 'Ayah (Pria)' : 'Ibu (Wanita)';

  if (!apiKey) {
    return generateMockParentAnalysis(inputText, role);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: geminiModel });

    const prompt = `
Kamu adalah dokter spesialis nutrisi klinis dan ahli diet metabolik.
Tugasmu adalah menganalisis makanan harian untuk orang dewasa (${roleName}) dengan fokus utama pada:
1. PENCEGAHAN & PENURUNAN ASAM URAT (Kadar Purin makanan: Rendah/Sedang/Tinggi/Sangat Tinggi, estimasi mg purin).
2. PENCEGAHAN & PENURUNAN KOLESTEROL (Kadar Kolesterol mg, Lemak Jenuh g, dan Serat g yang meluruhkan kolesterol).

Input Makanan: "${inputText}"

Hitung estimasi nutrisi dengan akurat.
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
      "cholesterol": number,
      "purine_mg": number,
      "purine_level": "rendah" | "sedang" | "tinggi" | "sangat_tinggi",
      "saturated_fat": number
    }
  ],
  "total": {
    "calories": number,
    "protein": number,
    "carbs": number,
    "fat": number,
    "fiber": number,
    "cholesterol": number,
    "purine_mg": number,
    "saturated_fat": number
  },
  "health_evaluation": "string (evaluasi klinis singkat mengenai dampak makanan ini terhadap asam urat dan kolesterol, serta saran medis ringkas)",
  "purine_status": "aman" | "waspada" | "tinggi",
  "cholesterol_status": "aman" | "waspada" | "tinggi"
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as ParentAnalyzeResult;
  } catch (error) {
    console.error('Error calling Gemini API for parent food analysis:', error);
    return generateMockParentAnalysis(inputText, role);
  }
}

export async function getParentRecommendationsWithGemini(
  role: ParentRole,
  currentCholesterol: number,
  currentPurine: number
): Promise<ParentRecommendation[]> {
  const roleName = role === 'ayah' ? 'Ayah' : 'Ibu';

  if (!apiKey) {
    return generateMockParentRecommendations(role);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: geminiModel });

    const prompt = `
Kamu adalah konsultan gizi klinis untuk ${roleName}.
Saat ini asupan harian:
- Kolesterol: ${currentCholesterol} mg (Batas aman < 200 mg)
- Purin: ${currentPurine} mg (Batas aman < 400 mg)

Berikan 3 ide hidangan lezat khas Indonesia yang RAMAH KOLESTEROL & ASAM URAT (sangat rendah purin, bebas jeroan/emping/lemak jenuh, kaya serat larut, anti-inflamasi).

Kembalikan HANYA format JSON murni (JSON raw tanpa \`\`\`json markdown wrapper):
[
  {
    "title": "Nama Menu",
    "category": "sarapan" | "makan_siang" | "makan_malam" | "snack_sehat",
    "description": "Bahan dan cara memasak sehat (rebus/panggang/kukus/tumis sedikit minyak)",
    "benefits": ["Kaya Serat Larut", "Rendah Purin", ...],
    "purine_level": "Sangat Rendah",
    "cholesterol_level": "0 - 15 mg (Sangat Rendah)",
    "estimated_calories": 250
  }
]
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();

    return JSON.parse(cleanJson) as ParentRecommendation[];
  } catch (error) {
    console.error('Error calling Gemini API for parent recommendations:', error);
    return generateMockParentRecommendations(role);
  }
}

function generateMockParentAnalysis(inputText: string, role: ParentRole): ParentAnalyzeResult {
  const items = inputText.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);

  const foods: ParentFoodItem[] = items.map((item) => {
    const isJeroan = /hati|jeroan|babat|usus|paru|limpa|otak/i.test(item);
    const isEmping = /emping|melinjo/i.test(item);
    const isSeafood = /udang|cumi|kepiting|kerang|sarden/i.test(item);
    const isFried = /goreng|gorengan|santan|gulai|rendang/i.test(item);
    const isChickenBreast = /dada ayam|ayam kukus|ayam panggang/i.test(item);
    const isEgg = /telur/i.test(item);
    const isVeg = /bayam|wortel|buncis|labu|brokoli|sayur/i.test(item);
    const isFruit = /pepaya|apel|pisang|jeruk|alpukat|buah/i.test(item);
    const isOatOrRice = /oat|oatmeal|nasi merah|nasi/i.test(item);
    const isTofuTempeh = /tahu|tempe/i.test(item);

    let calories = 150;
    let protein = 5;
    let carbs = 20;
    let fat = 4;
    let fiber = 2;
    let cholesterol = 10;
    let purine_mg = 40;
    let purine_level: 'rendah' | 'sedang' | 'tinggi' | 'sangat_tinggi' = 'rendah';
    let saturated_fat = 1.2;

    if (isJeroan) {
      calories = 220; protein = 22; carbs = 2; fat = 14; fiber = 0;
      cholesterol = 280; purine_mg = 250; purine_level = 'sangat_tinggi'; saturated_fat = 5.5;
    } else if (isEmping) {
      calories = 130; protein = 3; carbs = 18; fat = 6; fiber = 1.5;
      cholesterol = 0; purine_mg = 160; purine_level = 'tinggi'; saturated_fat = 1.8;
    } else if (isSeafood) {
      calories = 160; protein = 24; carbs = 1; fat = 6; fiber = 0;
      cholesterol = 150; purine_mg = 180; purine_level = 'tinggi'; saturated_fat = 1.8;
    } else if (isFried) {
      calories = 280; protein = 8; carbs = 22; fat = 18; fiber = 1;
      cholesterol = 65; purine_mg = 70; purine_level = 'sedang'; saturated_fat = 7.0;
    } else if (isChickenBreast) {
      calories = 165; protein = 31; carbs = 0; fat = 3.6; fiber = 0;
      cholesterol = 85; purine_mg = 90; purine_level = 'sedang'; saturated_fat = 1.0;
    } else if (isEgg) {
      calories = 75; protein = 6.5; carbs = 0.5; fat = 5; fiber = 0;
      cholesterol = 185; purine_mg = 5; purine_level = 'rendah'; saturated_fat = 1.6;
    } else if (isVeg) {
      calories = 45; protein = 2.5; carbs = 8; fat = 0.5; fiber = 3.5;
      cholesterol = 0; purine_mg = 25; purine_level = 'rendah'; saturated_fat = 0.1;
    } else if (isFruit) {
      calories = 70; protein = 1; carbs = 17; fat = 0.5; fiber = 3.2;
      cholesterol = 0; purine_mg = 8; purine_level = 'rendah'; saturated_fat = 0.1;
    } else if (isOatOrRice) {
      calories = 180; protein = 4.5; carbs = 38; fat = 1.5; fiber = 4.0;
      cholesterol = 0; purine_mg = 15; purine_level = 'rendah'; saturated_fat = 0.3;
    } else if (isTofuTempeh) {
      calories = 120; protein = 11; carbs = 6; fat = 6; fiber = 3;
      cholesterol = 0; purine_mg = 50; purine_level = 'sedang'; saturated_fat = 0.9;
    }

    return {
      name: item,
      quantity: '1 porsi',
      estimated_grams: 100,
      calories,
      protein,
      carbs,
      fat,
      fiber,
      cholesterol,
      purine_mg,
      purine_level,
      saturated_fat,
    };
  });

  const total = foods.reduce(
    (acc, f) => ({
      calories: Math.round(acc.calories + f.calories),
      protein: Number((acc.protein + f.protein).toFixed(1)),
      carbs: Number((acc.carbs + f.carbs).toFixed(1)),
      fat: Number((acc.fat + f.fat).toFixed(1)),
      fiber: Number((acc.fiber + f.fiber).toFixed(1)),
      cholesterol: Math.round(acc.cholesterol + f.cholesterol),
      purine_mg: Math.round(acc.purine_mg + f.purine_mg),
      saturated_fat: Number((acc.saturated_fat + f.saturated_fat).toFixed(1)),
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, cholesterol: 0, purine_mg: 0, saturated_fat: 0 }
  );

  const purine_status = total.purine_mg > 350 ? 'tinggi' : total.purine_mg > 200 ? 'waspada' : 'aman';
  const cholesterol_status = total.cholesterol > 200 ? 'tinggi' : total.cholesterol > 120 ? 'waspada' : 'aman';

  let health_evaluation = 'Pilihan makanan seimbang. Pertahankan asupan serat dan perbanyak minum air putih (2-3 liter) untuk meluruhkan asam urat.';
  if (total.purine_mg > 300 || total.cholesterol > 200) {
    health_evaluation = '⚠️ Perhatian: Terdeteksi bahan tinggi purin/kolesterol. Batasi makanan berlemak jenuh & olahan jeroan/emping untuk menjaga asam urat dan kolesterol dalam batas normal.';
  }

  return {
    foods,
    total,
    health_evaluation,
    purine_status,
    cholesterol_status,
  };
}

function generateMockParentRecommendations(role: ParentRole): ParentRecommendation[] {
  return [
    {
      title: 'Oatmeal Kuah Bening Dada Ayam & Wortel',
      category: 'sarapan',
      description: 'Oatmeal gurih kaya beta-glukan penurun kolesterol dimasak dengan kaldu bening tanpa lemak dan suwiran dada ayam.',
      benefits: ['Menurunkan Kolesterol LDL', 'Bebas Kolesterol Jahat', 'Purin Sangat Rendah'],
      purine_level: 'Sangat Rendah (< 30mg)',
      cholesterol_level: '15 mg',
      estimated_calories: 260,
    },
    {
      title: 'Ikan Gurame / Nila Kukus Jahe & Sayur Bening Labu Siam',
      category: 'makan_siang',
      description: 'Ikan air tawar rendah purin dikukus dengan jahe dan bawang putih anti-inflamasi, ditemani sayur bening labu siam dan jagung manis.',
      benefits: ['Melancarkan Asam Urat', 'Anti-Inflamasi Alami', 'Kaya Omega 3'],
      purine_level: 'Rendah (Aman)',
      cholesterol_level: '45 mg',
      estimated_calories: 340,
    },
    {
      title: 'Tumis Tahu Wortel Minyak Zaitun & Buah Pepaya',
      category: 'makan_malam',
      description: 'Tahu lembut ditumis dengan sedikit minyak zaitun dan buncis manis, ditutup dengan potongan buah pepaya segar kaya vitamin C.',
      benefits: ['Tinggi Serat Larut', 'Vitamin C Peluruh Asam Urat', 'Rendah Lemak Jenuh'],
      purine_level: 'Rendah',
      cholesterol_level: '0 mg',
      estimated_calories: 230,
    },
  ];
}

export async function evaluateAITargetsFromLab(
  role: ParentRole,
  profile: ParentProfile,
  latestLab: ParentLabCheck | null,
  forceAI: boolean = false
): Promise<AITargetAssessment> {
  const isAyah = role === 'ayah';
  const roleName = isAyah ? 'Ayah' : 'Ibu';
  const condition = profile.special_condition || 'none';
  const isBusui = condition === 'menyusui_eksklusif' || condition === 'menyusui_lanjutan';
  const isHamil = condition === 'hamil';

  // Compute synchronized clinical targets using single source of truth
  const targetCalc = calculateLabAdjustedTargets({
    role,
    specialCondition: condition,
    latestLab,
  });

  if (!targetCalc.hasLabData || !latestLab) {
    return {
      role,
      labDate: null,
      hasLabData: false,
      uricAcid: null,
      uricAcidStatus: 'normal',
      totalCholesterol: null,
      cholesterolStatus: 'normal',
      adjusted_purine_max: targetCalc.target_purine_max,
      adjusted_cholesterol_max: targetCalc.target_cholesterol_max,
      adjusted_fiber_min: targetCalc.target_fiber_min,
      adjusted_water_glasses: targetCalc.adjusted_water_glasses,
      phase: targetCalc.phase,
      title: targetCalc.defaultTitle,
      summary: targetCalc.defaultSummary,
      directives: targetCalc.defaultDirectives,
      recommendations: targetCalc.defaultRecommendations,
    };
  }

  // If manual AI evaluation triggered with Gemini API
  if (forceAI && apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: geminiModel });

      const conditionNote = isBusui
        ? `Ibu sedang dalam kondisi MENYUSUI AKTIF (${condition === 'menyusui_eksklusif' ? 'ASI Eksklusif 0-6 bulan' : 'Menyusui Lanjutan'}). Pastikan pantangan tidak mengorbankan nutrisi dan suplai ASI si kecil.`
        : isHamil
        ? `Ibu sedang dalam kondisi HAMIL. Prioritaskan keselamatan janin dan nutrisi seimbang.`
        : profile.notes ? `Catatan Kondisi Khusus: ${profile.notes}` : '';

      const prompt = `
Kamu adalah Dokter Spesialis Gizi Klinis & Konselor Nutrisi Laktasi. Analisis hasil laboratorium darah terbaru untuk ${roleName}:
- Kondisi Spesifik: ${conditionNote || 'Normal'}
- Tanggal Tes: ${latestLab.date}
- Asam Urat: ${targetCalc.uricAcid} mg/dL (Batas Normal ${roleName}: <= ${targetCalc.maxUricNormal} mg/dL) -> Status: ${targetCalc.uricAcidStatus.toUpperCase()}
- Kolesterol Total: ${targetCalc.totalCholesterol} mg/dL (Batas Normal: < 200 mg/dL) -> Status: ${targetCalc.cholesterolStatus.toUpperCase()}
${latestLab.ldl_cholesterol ? `- LDL: ${latestLab.ldl_cholesterol} mg/dL` : ''}
${latestLab.triglycerides ? `- Trigliserida: ${latestLab.triglycerides} mg/dL` : ''}
${latestLab.blood_pressure ? `- Tekanan Darah: ${latestLab.blood_pressure}` : ''}
${latestLab.notes ? `- Catatan Hasil Lab: ${latestLab.notes}` : ''}

Target Penyesuaian AI yang Ditetapkan:
- Batas Maksimum Purin: ${targetCalc.target_purine_max} mg/hari
- Batas Maksimum Kolesterol Makanan: ${targetCalc.target_cholesterol_max} mg/hari
- Minimal Serat Makanan: ${targetCalc.target_fiber_min} g/hari
- Target Air Minum: ${targetCalc.adjusted_water_glasses} gelas/hari

Berikan respon HANYA format JSON murni (raw JSON tanpa \`\`\`json markdown):
{
  "title": "Judul Evaluasi Singkat (contoh: 'Fase Pemulihan Ketat Kolesterol untuk Ibu Menyusui')",
  "summary": "Penjelasan ringkas 2 kalimat mengenai kondisi lab dan alasan penyesuaian target harian dengan mempertimbangkan kondisi menyusui/kesehatan.",
  "directives": [
    "Poin instruksi gizi 1 (pantangan / batasan spesifik)",
    "Poin instruksi gizi 2 (prioritas makanan penurun kolesterol/asam urat yang aman)",
    "Poin instruksi hidrasi / gaya hidup"
  ],
  "recommendations": [
    "Contoh bahan makanan lokal yang sangat dianjurkan untuk dikonsumsi hari ini"
  ]
}
`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      return {
        role,
        labDate: latestLab.date,
        hasLabData: true,
        uricAcid: targetCalc.uricAcid,
        uricAcidStatus: targetCalc.uricAcidStatus,
        totalCholesterol: targetCalc.totalCholesterol,
        cholesterolStatus: targetCalc.cholesterolStatus,
        adjusted_purine_max: targetCalc.target_purine_max,
        adjusted_cholesterol_max: targetCalc.target_cholesterol_max,
        adjusted_fiber_min: targetCalc.target_fiber_min,
        adjusted_water_glasses: targetCalc.adjusted_water_glasses,
        phase: targetCalc.phase,
        title: parsed.title || targetCalc.defaultTitle,
        summary: parsed.summary || targetCalc.defaultSummary,
        directives: Array.isArray(parsed.directives) && parsed.directives.length > 0 ? parsed.directives : targetCalc.defaultDirectives,
        recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0 ? parsed.recommendations : targetCalc.defaultRecommendations,
      };
    } catch (err) {
      console.error('Error generating AI lab assessment with Gemini:', err);
    }
  }

  // Fast clinical response without external API latency
  return {
    role,
    labDate: latestLab.date,
    hasLabData: true,
    uricAcid: targetCalc.uricAcid,
    uricAcidStatus: targetCalc.uricAcidStatus,
    totalCholesterol: targetCalc.totalCholesterol,
    cholesterolStatus: targetCalc.cholesterolStatus,
    adjusted_purine_max: targetCalc.target_purine_max,
    adjusted_cholesterol_max: targetCalc.target_cholesterol_max,
    adjusted_fiber_min: targetCalc.target_fiber_min,
    adjusted_water_glasses: targetCalc.adjusted_water_glasses,
    phase: targetCalc.phase,
    title: targetCalc.defaultTitle,
    summary: targetCalc.defaultSummary,
    directives: targetCalc.defaultDirectives,
    recommendations: targetCalc.defaultRecommendations,
  };
}




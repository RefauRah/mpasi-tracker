import { NextResponse } from 'next/server';
import { getParentRecommendationsWithGemini } from '@/lib/gemini';
import { ParentRole } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { role = 'ayah', currentCholesterol = 0, currentPurine = 0 } = body;

    const recommendations = await getParentRecommendationsWithGemini(
      role as ParentRole,
      Number(currentCholesterol),
      Number(currentPurine)
    );

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error in parent recommendations:', error);
    return NextResponse.json([]);
  }
}

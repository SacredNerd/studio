'use server';

import { refineSearch } from '@/ai/flows/ai-search-refinement';
import type { RefineSearchOutput } from '@/ai/flows/ai-search-refinement';

export async function getAiRefinement(
  keywords: string
): Promise<RefineSearchOutput | { error: string }> {
  if (!keywords) {
    return { error: 'Keywords are required.' };
  }
  try {
    const result = await refineSearch({ keywords });
    return result;
  } catch (e) {
    console.error(e);
    return { error: 'Failed to get AI refinement.' };
  }
}

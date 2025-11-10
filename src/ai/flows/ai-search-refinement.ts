'use server';

/**
 * @fileOverview An AI-powered search refinement flow.
 *
 * - refineSearch - A function that refines the job search query based on initial keywords.
 * - RefineSearchInput - The input type for the refineSearch function.
 * - RefineSearchOutput - The return type for the refineSearch function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RefineSearchInputSchema = z.object({
  keywords: z
    .string()
    .describe('The initial keywords entered by the user for job search.'),
});
export type RefineSearchInput = z.infer<typeof RefineSearchInputSchema>;

const RefineSearchOutputSchema = z.object({
  refinedKeywords: z
    .string()
    .describe(
      'The refined keywords suggested by the AI to improve search results.'
    ),
  reasoning: z
    .string()
    .describe('The AI’s reasoning for suggesting the refined keywords.'),
});
export type RefineSearchOutput = z.infer<typeof RefineSearchOutputSchema>;

export async function refineSearch(input: RefineSearchInput): Promise<RefineSearchOutput> {
  return refineSearchFlow(input);
}

const refineSearchPrompt = ai.definePrompt({
  name: 'refineSearchPrompt',
  input: {schema: RefineSearchInputSchema},
  output: {schema: RefineSearchOutputSchema},
  prompt: `You are an AI-powered job search assistant. Your goal is to help users discover relevant job postings by intelligently refining their search queries.

Based on the user's initial keywords, suggest related terms or adjustments to the search that might yield better results. Explain your reasoning for the suggested refinements.

Initial Keywords: {{{keywords}}}

Consider synonyms, related job titles, and skills associated with the keywords.
`,
});

const refineSearchFlow = ai.defineFlow(
  {
    name: 'refineSearchFlow',
    inputSchema: RefineSearchInputSchema,
    outputSchema: RefineSearchOutputSchema,
  },
  async input => {
    const {output} = await refineSearchPrompt(input);
    return output!;
  }
);

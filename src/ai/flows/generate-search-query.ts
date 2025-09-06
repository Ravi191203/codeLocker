'use server';
/**
 * @fileOverview An AI flow for converting natural language into a search query.
 *
 * - generateSearchQuery - A function that converts a user's plain text query into an optimized search string.
 * - GenerateSearchQueryInput - The input type for the generateSearchQuery function.
 * - GenerateSearchQueryOutput - The return type for the generateSearchQuery function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSearchQueryInputSchema = z.object({
  query: z.string().describe('The user\'s natural language search query.'),
});
export type GenerateSearchQueryInput = z.infer<typeof GenerateSearchQueryInputSchema>;

const GenerateSearchQueryOutputSchema = z.object({
  searchQuery: z.string().describe('An optimized search query string containing relevant keywords and programming terms.'),
});
export type GenerateSearchQueryOutput = z.infer<typeof GenerateSearchQueryOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSearchQueryPrompt',
  input: { schema: GenerateSearchQueryInputSchema },
  output: { schema: GenerateSearchQueryOutputSchema },
  prompt: `You are a search optimization expert. Your task is to convert a user's natural language query about a code snippet into a highly effective, concise search query string. The query should consist of space-separated keywords, programming terms, and potential language names that are likely to be found in the snippet's name, description, code, or tags.

Do not use any special syntax like "AND" or "OR". Just provide a list of relevant terms.

User Query:
"{{query}}"

Optimized Search Query:`,
});

const generateSearchQueryFlow = ai.defineFlow(
  {
    name: 'generateSearchQueryFlow',
    inputSchema: GenerateSearchQueryInputSchema,
    outputSchema: GenerateSearchQueryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateSearchQuery(input: GenerateSearchQueryInput): Promise<GenerateSearchQueryOutput> {
  return generateSearchQueryFlow(input);
}

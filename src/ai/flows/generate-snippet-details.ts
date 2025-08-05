'use server';
/**
 * @fileOverview An AI flow for generating details about a code snippet.
 *
 * - generateSnippetDetails - A function that generates a name, description, and tags for a code snippet.
 * - GenerateSnippetDetailsInput - The input type for the generateSnippetDetails function.
 * - GenerateSnippetDetailsOutput - The return type for the generateSnippetDetails function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateSnippetDetailsInputSchema = z.object({
  code: z.string().describe('The code snippet.'),
  language: z.string().describe('The programming language of the snippet.'),
});
export type GenerateSnippetDetailsInput = z.infer<typeof GenerateSnippetDetailsInputSchema>;

const GenerateSnippetDetailsOutputSchema = z.object({
  name: z.string().describe('A short, descriptive name for the code snippet (5-7 words max).'),
  description: z.string().describe('A clear, concise description of what the code snippet does.'),
  tags: z.array(z.string()).describe('An array of 3-5 relevant lowercase tags (e.g., "react", "hook", "auth").'),
});
export type GenerateSnippetDetailsOutput = z.infer<typeof GenerateSnippetDetailsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateSnippetDetailsPrompt',
  input: { schema: GenerateSnippetDetailsInputSchema },
  output: { schema: GenerateSnippetDetailsOutputSchema },
  prompt: `You are an expert software engineer. Analyze the following code snippet written in {{language}} and generate a concise name, a clear description, and relevant tags for it.

Code:
\`\`\`{{language}}
{{{code}}}
\`\`\`

Provide the output in the requested JSON format. The name should be short and descriptive. The description should explain the purpose and functionality of the code. The tags should be lowercase and help categorize the snippet.`,
});

const generateSnippetDetailsFlow = ai.defineFlow(
  {
    name: 'generateSnippetDetailsFlow',
    inputSchema: GenerateSnippetDetailsInputSchema,
    outputSchema: GenerateSnippetDetailsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateSnippetDetails(input: GenerateSnippetDetailsInput): Promise<GenerateSnippetDetailsOutput> {
  return generateSnippetDetailsFlow(input);
}

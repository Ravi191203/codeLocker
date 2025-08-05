'use server';
/**
 * @fileOverview An AI flow for converting a code snippet from one language to another.
 *
 * - convertCode - A function that translates a code snippet.
 * - ConvertCodeInput - The input type for the convertCode function.
 * - ConvertCodeOutput - The return type for the convertCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ConvertCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to convert.'),
  sourceLanguage: z.string().describe('The original programming language of the code snippet.'),
  targetLanguage: z.string().describe('The target programming language to convert the code to.'),
});
export type ConvertCodeInput = z.infer<typeof ConvertCodeInputSchema>;

const ConvertCodeOutputSchema = z.object({
  convertedCode: z.string().describe('The code snippet translated into the target language.'),
});
export type ConvertCodeOutput = z.infer<typeof ConvertCodeOutputSchema>;

const prompt = ai.definePrompt({
  name: 'convertCodePrompt',
  input: { schema: ConvertCodeInputSchema },
  output: { schema: ConvertCodeOutputSchema },
  prompt: `You are an expert software engineer specializing in code conversion between programming languages.

Your task is to convert the following code snippet from {{{sourceLanguage}}} to {{{targetLanguage}}}.

Ensure the converted code is accurate, idiomatic, and maintains the original functionality. Add comments where the conversion might be nuanced or where language-specific features are used.

Original Code ({{{sourceLanguage}}}):
\`\`\`{{{sourceLanguage}}}
{{{code}}}
\`\`\`

Provide only the converted code in the response.`,
});

const convertCodeFlow = ai.defineFlow(
  {
    name: 'convertCodeFlow',
    inputSchema: ConvertCodeInputSchema,
    outputSchema: ConvertCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function convertCode(input: ConvertCodeInput): Promise<ConvertCodeOutput> {
  return convertCodeFlow(input);
}

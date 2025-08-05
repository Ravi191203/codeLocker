'use server';
/**
 * @fileOverview An AI flow for explaining a code snippet.
 *
 * - explainCode - A function that generates a detailed explanation for a given code snippet.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to explain.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z
    .string()
    .describe(
      'A detailed, step-by-step explanation of the code in markdown format. Explain the overall purpose first, then break down key parts.'
    ),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: { schema: ExplainCodeInputSchema },
  output: { schema: ExplainCodeOutputSchema },
  prompt: `You are an expert software engineer and a patient teacher. Your goal is to explain a code snippet clearly to someone who may be a beginner.

Analyze the following {{{language}}} code snippet and provide a detailed, step-by-step explanation in Markdown format.

First, provide a high-level summary of what the code does. Then, break down the code into logical parts and explain each part. Use code blocks for small segments when you refer to them.

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Provide the output in the requested JSON format.`,
});

const explainCodeFlow = ai.defineFlow(
  {
    name: 'explainCodeFlow',
    inputSchema: ExplainCodeInputSchema,
    outputSchema: ExplainCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

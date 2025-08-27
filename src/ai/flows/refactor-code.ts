'use server';
/**
 * @fileOverview An AI flow for refactoring a code snippet.
 *
 * - refactorCode - A function that refactors a code snippet based on a goal.
 * - RefactorCodeInput - The input type for the refactorCode function.
 * - RefactorCodeOutput - The return type for the refactorCode function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const RefactorCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to refactor.'),
  language: z.string().describe('The programming language of the code snippet.'),
  goal: z
    .enum([
      'readability',
      'performance',
      'maintainability',
      'best-practices',
      'modernize',
    ])
    .describe('The primary goal of the refactoring.'),
});
export type RefactorCodeInput = z.infer<typeof RefactorCodeInputSchema>;

const RefactorCodeOutputSchema = z.object({
  refactoredCode: z.string().describe('The refactored code snippet.'),
  explanation: z
    .string()
    .describe(
      'A detailed explanation of the changes made during refactoring, in markdown format.'
    ),
});
export type RefactorCodeOutput = z.infer<typeof RefactorCodeOutputSchema>;

const prompt = ai.definePrompt({
  name: 'refactorCodePrompt',
  input: { schema: RefactorCodeInputSchema },
  output: { schema: RefactorCodeOutputSchema },
  prompt: `You are an expert software engineer specializing in code refactoring and optimization. Your task is to refactor the given code snippet based on the specified goal.

Goal: {{{goal}}}
Language: {{{language}}}

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Refactor the code to achieve the goal. Provide the refactored code and a detailed, step-by-step explanation of the changes you made in Markdown format.

Focus on the following aspects based on the goal:
- **readability**: Improve variable names, add comments where necessary, simplify complex logic, and ensure consistent formatting.
- **performance**: Optimize algorithms, reduce redundant computations, and use more efficient language features.
- **maintainability**: Break down large functions, reduce code duplication, and improve modularity.
- **best-practices**: Adhere to idiomatic coding conventions and established software design principles for the language.
- **modernize**: Update syntax to use modern language features (e.g., ES6+ in JavaScript, modern Python features).

Provide the output in the requested JSON format.`,
});

const refactorCodeFlow = ai.defineFlow(
  {
    name: 'refactorCodeFlow',
    inputSchema: RefactorCodeInputSchema,
    outputSchema: RefactorCodeOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function refactorCode(
  input: RefactorCodeInput
): Promise<RefactorCodeOutput> {
  return refactorCodeFlow(input);
}

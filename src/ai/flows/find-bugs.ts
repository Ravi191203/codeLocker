'use server';
/**
 * @fileOverview An AI flow for finding bugs in a code snippet.
 *
 * - findBugs - A function that analyzes a code snippet for bugs.
 * - FindBugsInput - The input type for the findBugs function.
 * - FindBugsOutput - The return type for the findBugs function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const FindBugsInputSchema = z.object({
  code: z.string().describe('The code snippet to analyze.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type FindBugsInput = z.infer<typeof FindBugsInputSchema>;

const BugDetailSchema = z.object({
    line: z.number().describe('The line number where the bug is located.'),
    bug: z.string().describe('A short description of the bug or issue.'),
    suggestion: z.string().describe('A suggestion on how to fix the bug.'),
});

const FindBugsOutputSchema = z.object({
  bugs: z.array(BugDetailSchema).describe('An array of bugs found in the code snippet.'),
});
export type FindBugsOutput = z.infer<typeof FindBugsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'findBugsPrompt',
  input: { schema: FindBugsInputSchema },
  output: { schema: FindBugsOutputSchema },
  prompt: `You are an expert software engineer and code reviewer. Your task is to analyze a code snippet for bugs, potential issues, and security vulnerabilities.

Analyze the following {{{language}}} code snippet and identify any bugs or problems. For each issue found, provide the line number, a short description of the bug, and a suggestion for how to fix it.

If you don't find any bugs, return an empty array.

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`

Provide the output in the requested JSON format.`,
});

const findBugsFlow = ai.defineFlow(
  {
    name: 'findBugsFlow',
    inputSchema: FindBugsInputSchema,
    outputSchema: FindBugsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function findBugs(input: FindBugsInput): Promise<FindBugsOutput> {
  return findBugsFlow(input);
}

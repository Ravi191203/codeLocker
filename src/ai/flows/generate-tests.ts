'use server';
/**
 * @fileOverview An AI flow for generating unit tests for a code snippet.
 *
 * - generateTests - A function that creates unit tests for a given code snippet.
 * - GenerateTestsInput - The input type for the generateTests function.
 * - GenerateTestsOutput - The return type for the generateTests function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateTestsInputSchema = z.object({
  code: z.string().describe('The code snippet to generate tests for.'),
  language: z.string().describe('The programming language of the code snippet.'),
});
export type GenerateTestsInput = z.infer<typeof GenerateTestsInputSchema>;

const GenerateTestsOutputSchema = z.object({
  tests: z.string().describe('The generated unit tests for the code snippet, as a code block string.'),
});
export type GenerateTestsOutput = z.infer<typeof GenerateTestsOutputSchema>;

const prompt = ai.definePrompt({
  name: 'generateTestsPrompt',
  input: { schema: GenerateTestsInputSchema },
  output: { schema: GenerateTestsOutputSchema },
  prompt: `You are an expert software engineer specializing in software testing. Your task is to write a suite of unit tests for the given code snippet.

The language of the code snippet is {{{language}}}.

Use a popular and appropriate testing framework for the language. For example:
- JavaScript/TypeScript: Use Jest or Vitest.
- Python: Use PyTest.
- Java: Use JUnit.
- C#: Use xUnit or NUnit.
- Go: Use the built-in 'testing' package.

The generated tests should be thorough, covering edge cases and common scenarios. The code should be complete and ready to run. Provide only the test code in your response.

Code:
\`\`\`{{{language}}}
{{{code}}}
\`\`\`
`,
});

const generateTestsFlow = ai.defineFlow(
  {
    name: 'generateTestsFlow',
    inputSchema: GenerateTestsInputSchema,
    outputSchema: GenerateTestsOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);

export async function generateTests(input: GenerateTestsInput): Promise<GenerateTestsOutput> {
  return generateTestsFlow(input);
}

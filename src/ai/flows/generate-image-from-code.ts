'use server';
/**
 * @fileOverview An AI flow for generating a visually appealing image from a code snippet.
 *
 * - generateImageFromCode - A function that creates an image from code.
 * - GenerateImageFromCodeInput - The input type for the function.
 * - GenerateImageFromCodeOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const GenerateImageFromCodeInputSchema = z.object({
  code: z.string().describe('The code snippet to render into an image.'),
  language: z.string().describe('The programming language of the code snippet.'),
  theme: z.enum(['dark', 'light', 'synthwave', 'pastel', 'ocean', 'forest']).describe('The visual theme for the code image.'),
});
export type GenerateImageFromCodeInput = z.infer<typeof GenerateImageFromCodeInputSchema>;

const GenerateImageFromCodeOutputSchema = z.object({
  imageUrl: z.string().describe('The data URI of the generated image.'),
});
export type GenerateImageFromCodeOutput = z.infer<typeof GenerateImageFromCodeOutputSchema>;

const generateImageFromCodeFlow = ai.defineFlow(
  {
    name: 'generateImageFromCodeFlow',
    inputSchema: GenerateImageFromCodeInputSchema,
    outputSchema: GenerateImageFromCodeOutputSchema,
  },
  async ({ code, language, theme }) => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually stunning, high-quality image that beautifully renders the following ${language} code snippet.

The image should look like a screenshot from a professional code sharing tool (like Carbon or Ray.so).

Apply a "${theme}" theme. The theme should dictate the background, text color, and syntax highlighting. Ensure the code is perfectly legible, well-formatted with proper indentation, and uses a clean, modern monospace font. The final image should have rounded corners and a subtle drop shadow for a polished look.

Do not include any text or branding other than the code itself.

Code:
\`\`\`${language}
${code}
\`\`\`
`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media.url) {
        throw new Error('Image generation failed.');
    }

    return { imageUrl: media.url };
  }
);

export async function generateImageFromCode(input: GenerateImageFromCodeInput): Promise<GenerateImageFromCodeOutput> {
  return generateImageFromCodeFlow(input);
}

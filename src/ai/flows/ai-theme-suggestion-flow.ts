'use server';
/**
 * @fileOverview A Genkit flow for suggesting themes and color palettes based on user keywords.
 *
 * - aiThemeSuggestion - A function that handles the AI theme suggestion process.
 * - AIThemeSuggestionInput - The input type for the aiThemeSuggestion function.
 * - AIThemeSuggestionOutput - The return type for the aiThemeSuggestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AIThemeSuggestionInputSchema = z.object({
  keywords: z.string().describe('Keywords describing the desired aesthetic.'),
});
export type AIThemeSuggestionInput = z.infer<typeof AIThemeSuggestionInputSchema>;

const ColorPaletteSchema = z.object({
  name: z.string().describe('Name of the color palette, e.g., "Primary", "Accent".'),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/).describe('Hex code of a color, e.g., "#3F51B5".')).describe('Array of hex codes for the colors in this palette.'),
});

const AIThemeSuggestionOutputSchema = z.object({
  themeName: z.string().describe('A catchy name for the suggested theme.'),
  themeDescription: z.string().describe('A brief description of the suggested theme.'),
  colorPalettes: z.array(ColorPaletteSchema).describe('An array of suggested color palettes.'),
});
export type AIThemeSuggestionOutput = z.infer<typeof AIThemeSuggestionOutputSchema>;

const prompt = ai.definePrompt({
  name: 'aiThemeSuggestionPrompt',
  input: {schema: AIThemeSuggestionInputSchema},
  output: {schema: AIThemeSuggestionOutputSchema},
  prompt: `You are an AI assistant specialized in generating aesthetically pleasing themes and color palettes for "Link-in-Bio" profiles, similar to bento.me or Linktree.
Based on the user's keywords, suggest a creative theme name, a short description, and at least three distinct color palettes.
Each color palette should include at least three colors in hex code format (e.g., "#RRGGBB").
Ensure the suggestions align with a dynamic, expressive color scheme inspired by Material You 3 principles, using bold typography and vibrant, harmonious colors.

User's desired aesthetic keywords: {{{keywords}}}`,
});

const aiThemeSuggestionFlow = ai.defineFlow(
  {
    name: 'aiThemeSuggestionFlow',
    inputSchema: AIThemeSuggestionInputSchema,
    outputSchema: AIThemeSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

export async function aiThemeSuggestion(input: AIThemeSuggestionInput): Promise<AIThemeSuggestionOutput> {
  return aiThemeSuggestionFlow(input);
}

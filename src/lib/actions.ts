'use server';

import { aiThemeSuggestion, type AIThemeSuggestionInput } from '@/ai/flows/ai-theme-suggestion-flow';
import { z } from 'zod';

const schema = z.object({
  keywords: z.string().min(3, { message: 'Please enter at least 3 characters.' }),
});

export async function generateTheme(prevState: any, formData: FormData) {
  const validatedFields = schema.safeParse({
    keywords: formData.get('keywords'),
  });

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.keywords?.[0],
    };
  }
  
  try {
    const input: AIThemeSuggestionInput = { keywords: validatedFields.data.keywords };
    const theme = await aiThemeSuggestion(input);
    return { data: theme };
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate theme. Please try again.' };
  }
}

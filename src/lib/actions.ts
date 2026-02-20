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

export async function getWebsiteTitle(url: string): Promise<{ title?: string; error?: string }> {
  try {
    if (!url || !url.startsWith('http')) {
      return { error: 'Please enter a valid URL.' };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { error: `Could not fetch the URL. Status: ${response.status}` };
    }

    const html = await response.text();
    
    // Try to find og:title first
    const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
        return { title: ogTitleMatch[1] };
    }

    // Fallback to <title> tag
    const titleMatch = html.match(/<title>(.*?)<\/title>/is);
    if (titleMatch && titleMatch[1]) {
        // The title might contain newlines or extra spaces, so let's clean it up.
        const cleanedTitle = titleMatch[1].trim().replace(/\s+/g, ' ');
        return { title: cleanedTitle };
    }

    return { title: '' }; // No title found, return empty string

  } catch (error: any) {
    if (error.name === 'AbortError') {
        return { error: 'Request timed out.' };
    }
    console.error('Error fetching website title:', error);
    return { error: 'Failed to fetch title from the URL.' };
  }
}

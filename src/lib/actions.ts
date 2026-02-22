'use server';

import { aiThemeSuggestion, type AIThemeSuggestionInput } from '@/ai/flows/ai-theme-suggestion-flow';
import { z } from 'zod';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { serverFirestore } from '@/firebase/server';
import type { UserProfile } from '@/lib/types';

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

export async function getWebsiteMeta(url: string): Promise<{ title?: string; imageUrl?: string, error?: string }> {
  try {
    if (!url || !url.startsWith('http')) {
      return { error: 'Please enter a valid URL.' };
    }
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout

    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        // Some sites block requests without a user-agent
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
      }
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { error: `Could not fetch the URL. Status: ${response.status}` };
    }

    const html = await response.text();
    let title, imageUrl;
    
    // Try to find og:title first
    const ogTitleMatch = html.match(/<meta\s+(?:name|property)="og:title"\s+content="([^"]*)"/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
        title = ogTitleMatch[1];
    } else {
        // Fallback to <title> tag
        const titleMatch = html.match(/<title>(.*?)<\/title>/is);
        if (titleMatch && titleMatch[1]) {
            title = titleMatch[1].trim().replace(/\s+/g, ' ');
        }
    }
    
    // Try to find og:image
    const ogImageMatch = html.match(/<meta\s+(?:name|property)="og:image"\s+content="([^"]*)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      try {
        const parsedUrl = new URL(url);
        imageUrl = new URL(ogImageMatch[1], parsedUrl.origin).href;
      } catch (e) {
        // Ignore if URL creation fails
        imageUrl = ogImageMatch[1];
      }
    }

    return { title, imageUrl };

  } catch (error: any) {
    if (error.name === 'AbortError') {
        return { error: 'Request timed out.' };
    }
    console.error('Error fetching website meta:', error);
    return { error: 'Failed to fetch meta data from the URL.' };
  }
}

export async function searchUsersByUsername(username: string): Promise<Pick<UserProfile, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'username'>[]> {
  if (!username || username.length < 1 || !process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
    return [];
  }
  
  const lowerCaseQuery = username.toLowerCase();

  try {
    const profilesRef = collection(serverFirestore, 'user_profiles');
    const q = query(
      profilesRef, 
      where('username', '>=', lowerCaseQuery), 
      where('username', '<=', lowerCaseQuery + '\uf8ff'),
      limit(10)
    );
    
    const querySnapshot = await getDocs(q);
    const users = querySnapshot.docs.map(doc => {
      const data = doc.data() as UserProfile;
      return {
        id: doc.id,
        firstName: data.firstName,
        lastName: data.lastName,
        avatarUrl: data.avatarUrl,
        username: data.username,
      };
    });

    return users;

  } catch (error) {
    console.error("Error searching users:", error);
    return [];
  }
}

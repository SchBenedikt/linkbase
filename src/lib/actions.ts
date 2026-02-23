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
    const response = await fetch('/functions/generate-theme', {
      method: 'POST',
      body: formData,
    });
    const result = await response.json();
    if (!response.ok || result.error) {
      return { error: result.error || 'Failed to generate theme. Please try again.' };
    }
    return result;
  } catch (error) {
    console.error(error);
    return { error: 'Failed to generate theme. Please try again.' };
  }
}

export async function getWebsiteMeta(url: string): Promise<{ title?: string; imageUrl?: string; error?: string }> {
  try {
    if (!url || !url.startsWith('http')) {
      return { error: 'Please enter a valid URL.' };
    }
    const response = await fetch(`/functions/website-meta?url=${encodeURIComponent(url)}`);
    const result = await response.json();
    if (!response.ok && !result.error) {
      return { error: 'Failed to fetch meta data from the URL.' };
    }
    return result;
  } catch (error) {
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
    console.error('Error searching users:', error);
    return [];
  }
}
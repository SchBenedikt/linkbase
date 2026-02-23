
import { NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * API Route: GET /api/website-meta?url=...
 * Fetches Open Graph title and image from a given URL server-side to avoid CORS.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url || !url.startsWith('http')) {
    return NextResponse.json({ error: 'Please enter a valid URL.' }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ error: `Could not fetch the URL. Status: ${response.status}` }, { status: 502 });
    }

    const html = await response.text();
    let title, imageUrl;

    const ogTitleMatch = html.match(/<meta\s+(?:name|property)="og:title"\s+content="([^"]*)"/i);
    if (ogTitleMatch && ogTitleMatch[1]) {
      title = ogTitleMatch[1];
    } else {
      const titleMatch = html.match(/<title>(.*?)<\/title>/is);
      if (titleMatch && titleMatch[1]) {
        title = titleMatch[1].trim().replace(/\s+/g, ' ');
      }
    }

    const ogImageMatch = html.match(/<meta\s+(?:name|property)="og:image"\s+content="([^"]*)"/i);
    if (ogImageMatch && ogImageMatch[1]) {
      try {
        const parsedUrl = new URL(url);
        imageUrl = new URL(ogImageMatch[1], parsedUrl.origin).href;
      } catch {
        imageUrl = ogImageMatch[1];
      }
    }

    return NextResponse.json({ title, imageUrl });
  } catch (error) {
    if (error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timed out.' }, { status: 504 });
    }
    console.error('Error fetching website meta:', error);
    return NextResponse.json({ error: 'Failed to fetch meta data from the URL.' }, { status: 500 });
  }
}

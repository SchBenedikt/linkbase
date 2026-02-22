/**
 * Cloudflare Pages Function: GET /api/website-meta?url=...
 * Fetches Open Graph title and image from a given URL server-side to avoid CORS.
 */
export async function onRequestGet(context) {
  const { request } = context;
  const url = new URL(request.url).searchParams.get('url');

  if (!url || !url.startsWith('http')) {
    return Response.json({ error: 'Please enter a valid URL.' }, { status: 400 });
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
      return Response.json({ error: `Could not fetch the URL. Status: ${response.status}` }, { status: 502 });
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

    return Response.json({ title, imageUrl });
  } catch (error) {
    if (error.name === 'AbortError') {
      return Response.json({ error: 'Request timed out.' }, { status: 504 });
    }
    console.error('Error fetching website meta:', error);
    return Response.json({ error: 'Failed to fetch meta data from the URL.' }, { status: 500 });
  }
}

/**
 * Cloudflare Pages Function: POST /api/generate-theme
 * Calls the Gemini REST API to generate a theme from keywords.
 * The GEMINI_API_KEY environment variable must be set in Cloudflare Pages.
 */
export async function onRequestPost(context) {
  const { request, env } = context;

  let keywords;
  try {
    const formData = await request.formData();
    keywords = formData.get('keywords');
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  if (!keywords || String(keywords).length < 3) {
    return Response.json({ error: 'Please enter at least 3 characters.' }, { status: 400 });
  }

  const apiKey = env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json({ error: 'AI service not configured.' }, { status: 503 });
  }

  const prompt = `You are an AI assistant specialized in generating aesthetically pleasing themes and color palettes for "Link-in-Bio" profiles, similar to bento.me or Linktree.
Based on the user's keywords, suggest a creative theme name, a short description, and at least three distinct color palettes.
Each color palette should include at least three colors in hex code format (e.g., "#RRGGBB").
Ensure the suggestions align with a dynamic, expressive color scheme inspired by Material You 3 principles, using bold typography and vibrant, harmonious colors.

User's desired aesthetic keywords: ${keywords}

Respond with a JSON object in this exact format:
{
  "themeName": "string",
  "themeDescription": "string",
  "colorPalettes": [
    { "name": "string", "colors": ["#RRGGBB"] }
  ]
}`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!response.ok) {
      return Response.json({ error: 'AI service error.' }, { status: 502 });
    }

    const result = await response.json();
    const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return Response.json({ error: 'No response from AI service.' }, { status: 502 });
    }

    const theme = JSON.parse(text);
    return Response.json({ data: theme });
  } catch (error) {
    console.error('Error generating theme:', error);
    return Response.json({ error: 'Failed to generate theme. Please try again.' }, { status: 500 });
  }
}

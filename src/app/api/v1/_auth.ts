/**
 * Shared API key authentication helper for the v1 developer API.
 *
 * API keys are stored in Firestore under `api_keys/{key}` with the shape:
 *   { ownerId: string; name?: string; createdAt: Timestamp }
 *
 * Clients pass the key as:   Authorization: Bearer <api_key>
 */

import { NextRequest, NextResponse } from 'next/server';
import { serverFirestore } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';

export type AuthResult =
  | { ok: true; ownerId: string }
  | { ok: false; response: NextResponse };

/** Validates the Bearer API key and returns the owner's UID, or an error response. */
export async function verifyApiKey(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: 'Missing or invalid Authorization header. Use: Authorization: Bearer <api_key>' },
        { status: 401 },
      ),
    };
  }

  const apiKey = authHeader.slice(7).trim();
  if (!apiKey) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Empty API key.' }, { status: 401 }),
    };
  }

  if (!serverFirestore) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Server configuration error.' }, { status: 500 }),
    };
  }

  try {
    const keyRef = doc(serverFirestore, 'api_keys', apiKey);
    const keySnap = await getDoc(keyRef);
    if (!keySnap.exists()) {
      return {
        ok: false,
        response: NextResponse.json({ error: 'Invalid API key.' }, { status: 401 }),
      };
    }
    const { ownerId } = keySnap.data() as { ownerId: string };
    return { ok: true, ownerId };
  } catch (err) {
    console.error('API key verification failed:', err);
    return {
      ok: false,
      response: NextResponse.json({ error: 'Internal server error.' }, { status: 500 }),
    };
  }
}

/**
 * GET /api/v1/me
 *
 * Returns basic information about the authenticated user.
 * Authentication: Authorization: Bearer <api_key>
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '../_auth';
import { serverFirestore } from '@/firebase/server';
import { doc, getDoc } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (!auth.ok) return auth.response;

  if (!serverFirestore) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const profileRef = doc(serverFirestore, 'user_profiles', auth.ownerId);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return NextResponse.json({ error: 'User profile not found.' }, { status: 404 });
    }

    const data = profileSnap.data();
    return NextResponse.json({
      data: {
        id: profileSnap.id,
        username: data.username ?? null,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
      },
    }, { status: 200 });
  } catch (err) {
    console.error('GET /api/v1/me error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

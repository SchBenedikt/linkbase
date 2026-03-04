/**
 * GET /api/v1/pages
 *
 * Returns all pages owned by the authenticated user.
 * Authentication: Authorization: Bearer <api_key>
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '../_auth';
import { serverFirestore } from '@/firebase/server';
import { collection, query, where, getDocs } from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (!auth.ok) return auth.response;

  if (!serverFirestore) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  try {
    const q = query(
      collection(serverFirestore, 'pages'),
      where('ownerId', '==', auth.ownerId),
    );
    const snap = await getDocs(q);

    const pages = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        slug: data.slug,
        title: data.title ?? null,
        status: data.status,
        firstName: data.firstName ?? null,
        lastName: data.lastName ?? null,
        bio: data.bio ?? null,
        avatarUrl: data.avatarUrl ?? null,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ data: pages }, { status: 200 });
  } catch (err) {
    console.error('GET /api/v1/pages error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

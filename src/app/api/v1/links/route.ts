/**
 * GET /api/v1/links
 *
 * Returns all short links owned by the authenticated user.
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
      collection(serverFirestore, 'shortLinks'),
      where('ownerId', '==', auth.ownerId),
    );
    const snap = await getDocs(q);

    const links = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        code: data.code,
        title: data.title ?? null,
        originalUrl: data.originalUrl,
        clickCount: data.clickCount ?? 0,
        isActive: data.isActive !== false,
        createdAt: data.createdAt?.toDate?.()?.toISOString() ?? null,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() ?? null,
      };
    });

    return NextResponse.json({ data: links }, { status: 200 });
  } catch (err) {
    console.error('GET /api/v1/links error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

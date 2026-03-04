/**
 * GET /api/v1/analytics?pageId=<id>&range=30
 *
 * Returns analytics data for a page owned by the authenticated user.
 * Query params:
 *   pageId  – required – the Firestore page document ID
 *   range   – optional – number of days (7 | 30 | 90, default 30)
 *
 * Authentication: Authorization: Bearer <api_key>
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyApiKey } from '../_auth';
import { serverFirestore } from '@/firebase/server';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  orderBy,
} from 'firebase/firestore';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyApiKey(req);
  if (!auth.ok) return auth.response;

  if (!serverFirestore) {
    return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const pageId = searchParams.get('pageId');
  const rangeRaw = parseInt(searchParams.get('range') ?? '30', 10);
  const range = [7, 30, 90].includes(rangeRaw) ? rangeRaw : 30;

  if (!pageId) {
    return NextResponse.json(
      { error: 'pageId query parameter is required.' },
      { status: 400 },
    );
  }

  // Verify ownership
  const pageSnap = await getDoc(doc(serverFirestore, 'pages', pageId));
  if (!pageSnap.exists()) {
    return NextResponse.json({ error: 'Page not found.' }, { status: 404 });
  }
  if (pageSnap.data().ownerId !== auth.ownerId) {
    return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  }

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - range);
  const cutoff = cutoffDate.toISOString().split('T')[0];

  try {
    const [viewsSnap, clicksSnap, geoSnap, deviceSnap] = await Promise.all([
      getDocs(
        query(
          collection(serverFirestore, 'pages', pageId, 'page_views'),
          where('date', '>=', cutoff),
          orderBy('date'),
        ),
      ),
      getDocs(
        query(
          collection(serverFirestore, 'pages', pageId, 'link_clicks'),
          where('date', '>=', cutoff),
          orderBy('date'),
        ),
      ),
      getDocs(collection(serverFirestore, 'pages', pageId, 'geo_stats')),
      getDocs(collection(serverFirestore, 'pages', pageId, 'device_stats')),
    ]);

    const pageViews = viewsSnap.docs.map((d) => ({ date: d.data().date, count: d.data().count }));
    const linkClicks = clicksSnap.docs.map((d) => ({
      linkId: d.data().linkId,
      date: d.data().date,
      count: d.data().count,
    }));
    const geoStats = geoSnap.docs.map((d) => ({
      country: d.data().country,
      count: d.data().count,
    }));
    const deviceStats = deviceSnap.docs.map((d) => ({
      device: d.data().device,
      count: d.data().count,
    }));

    const totalViews = pageViews.reduce((s, v) => s + v.count, 0);
    const totalClicks = linkClicks.reduce((s, c) => s + c.count, 0);

    return NextResponse.json({
      data: {
        pageId,
        range,
        totalViews,
        totalClicks,
        ctr: totalViews > 0 ? parseFloat(((totalClicks / totalViews) * 100).toFixed(2)) : 0,
        pageViews,
        linkClicks,
        geoStats,
        deviceStats,
      },
    });
  } catch (err) {
    console.error('GET /api/v1/analytics error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

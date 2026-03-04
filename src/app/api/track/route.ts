/**
 * POST /api/track
 *
 * Records a page view with geolocation (country from IP) and device type
 * (derived from User-Agent). Writes to Firestore subcollections:
 *   pages/{pageId}/page_views/{date}           – existing daily counter
 *   pages/{pageId}/geo_stats/{country}         – per-country counter
 *   pages/{pageId}/device_stats/{deviceType}   – per-device counter
 *
 * The endpoint is called from the public page (client-side) so that the
 * server can read the real visitor IP from request headers.
 */

import { NextRequest, NextResponse } from 'next/server';
import { adminFirestore } from '@/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export const dynamic = 'force-dynamic';

// Simple device detection from User-Agent
function detectDevice(ua: string): 'mobile' | 'tablet' | 'desktop' {
  if (!ua) return 'desktop';
  if (/ipad|tablet|kindle|playbook|silk|(android(?!.*mobile))/i.test(ua)) return 'tablet';
  if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) return 'mobile';
  return 'desktop';
}

// Get the real client IP from common proxy headers
function getClientIp(req: NextRequest): string {
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  const xForwardedFor = req.headers.get('x-forwarded-for');
  if (xForwardedFor) return xForwardedFor.split(',')[0].trim();
  const xRealIp = req.headers.get('x-real-ip');
  if (xRealIp) return xRealIp.trim();
  return 'unknown';
}

// Resolve country from IP using the free ipapi.co service (HTTPS, 1k req/day free)
async function resolveCountry(ip: string): Promise<string> {
  if (!ip || ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('::')) {
    return 'Unknown';
  }
  try {
    const res = await fetch(
      `https://ipapi.co/${encodeURIComponent(ip)}/json/`,
      {
        headers: { 'User-Agent': 'linkbase/1.0' },
        signal: AbortSignal.timeout(3000),
      },
    );
    if (!res.ok) return 'Unknown';
    const data = (await res.json()) as { country_name?: string; error?: boolean };
    if (data.error || !data.country_name) return 'Unknown';
    return data.country_name;
  } catch {
    return 'Unknown';
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { pageId } = body as { pageId?: string };

    if (!pageId || typeof pageId !== 'string') {
      return NextResponse.json({ error: 'pageId is required.' }, { status: 400 });
    }

    if (!adminFirestore) {
      return NextResponse.json({ ok: true });
    }

    const ua = req.headers.get('user-agent') ?? '';
    const ip = getClientIp(req);
    const deviceType = detectDevice(ua);
    const today = new Date().toISOString().split('T')[0];
    const country = await resolveCountry(ip);

    const pageRef = adminFirestore.collection('pages').doc(pageId);

    await Promise.all([
      // Daily page-view counter
      pageRef
        .collection('page_views')
        .doc(today)
        .set({ pageId, date: today, count: FieldValue.increment(1) }, { merge: true }),

      // Per-country counter
      pageRef
        .collection('geo_stats')
        .doc(country.replace(/[^a-zA-Z0-9_-]/g, '_'))
        .set({ country, count: FieldValue.increment(1) }, { merge: true }),

      // Per-device counter
      pageRef
        .collection('device_stats')
        .doc(deviceType)
        .set({ device: deviceType, count: FieldValue.increment(1) }, { merge: true }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('POST /api/track error:', err);
    // Never return 500 – tracking failures should be invisible to visitors
    return NextResponse.json({ ok: true });
  }
}

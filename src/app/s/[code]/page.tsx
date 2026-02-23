import RedirectClient from './redirect-client';

// This is a placeholder to satisfy Next.js's static export requirements.
// The actual redirect logic is handled client-side.
export function generateStaticParams() {
  return [];
}

export default function Page() {
  return <RedirectClient />;
}

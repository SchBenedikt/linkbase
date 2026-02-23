import RedirectClient from './redirect-client';

// Static export: we only pre-render the placeholder.
// All real codes are resolved client-side via Firestore.
export async function generateStaticParams() {
  return [{ code: '_placeholder' }];
}

export default function Page({ params }: { params: { code: string } }) {
  return <RedirectClient />;
}

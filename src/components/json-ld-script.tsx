'use client';

import { useEffect, useRef } from 'react';

interface JsonLdScriptProps {
  data: object;
}

export default function JsonLdScript({ data }: JsonLdScriptProps) {
  const scriptRef = useRef<HTMLScriptElement>(null);

  useEffect(() => {
    if (scriptRef.current) {
      scriptRef.current.textContent = JSON.stringify(data);
    }
  }, [data]);

  return (
    <script
      ref={scriptRef}
      type="application/ld+json"
    />
  );
}

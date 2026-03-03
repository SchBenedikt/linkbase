---
title: "Building a Link-in-Bio Platform with Next.js 15, Firebase, and Cloudflare Workers"
published: true
description: "Learn how we built Linkbase, a modern link-in-bio platform with Next.js 15, Firebase, and Cloudflare Workers. Includes SEO optimization, PWA features, and structured data."
tags: ['nextjs', 'firebase', 'cloudflare', 'react', 'typescript', 'seo', 'pwa']
cover_image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&h=630&fit=crop'
canonical_url: 'https://dev.to/benediktschaechner/building-a-link-in-bio-platform-with-nextjs-15-firebase-and-cloudflare-workers'
---

# Building a Link-in-Bio Platform with Next.js 15, Firebase, and Cloudflare Workers

In this article, I'll walk you through how we built **Linkbase** - a modern link-in-bio platform that combines the best features of Linktree, Carrd, and personal websites. We'll cover everything from the tech stack to SEO optimization and deployment strategies.

## What We're Building

Linkbase is a free, feature-rich link-in-bio platform that includes:
- **Bento grid layouts** for beautiful profile pages
- **Built-in blog** for content creation
- **Short link tracking** with analytics
- **AI theme generation** for personalized designs
- **Social media embeds** (YouTube, Spotify, etc.)
- **PWA features** for mobile app-like experience

## Tech Stack Overview

### Frontend
- **Next.js 15** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Radix UI** for accessible components
- **Framer Motion** for animations

### Backend & Database
- **Firebase Firestore** for real-time database
- **Firebase Authentication** for user management
- **Firebase Admin SDK** for server-side operations

### Deployment & Infrastructure
- **Cloudflare Workers** for serverless deployment
- **OpenNext.js** for Next.js Cloudflare compatibility
- **Cloudflare Pages** for static assets

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic user pages
│   ├── post/[postId]/     # Blog posts
│   ├── dashboard/         # User dashboard
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   └── dashboard/        # Dashboard components
├── firebase/             # Firebase configuration
├── lib/                  # Utilities and types
└── ai/                   # AI integration
```

## Key Features Implementation

### 1. Dynamic User Pages

Each user gets a customizable page with a unique slug. We use Next.js dynamic routes:

```typescript
// src/app/[slug]/public-page.tsx
export default async function PublicPage({ params }: { params: { slug: string } }) {
  const pageData = await getPageData(params.slug);
  
  if (!pageData || pageData.status !== 'published') {
    notFound();
  }

  return <PublicPageComponent page={pageData} />;
}
```

### 2. Bento Grid Layout

The bento grid is our signature feature - a customizable grid layout where users can arrange their links:

```typescript
// Grid component with drag-and-drop
function BentoGrid({ links, onReorder }) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {links.map((link) => (
        <BentoCard
          key={link.id}
          colSpan={link.colSpan || 1}
          rowSpan={link.rowSpan || 1}
        >
          {/* Card content based on type */}
        </BentoCard>
      ))}
    </div>
  );
}
```

### 3. AI Theme Generation

We integrated Google's Gemini AI for theme generation:

```typescript
// src/ai/genkit.ts
import { gemini15Flash } from '@genkit-ai/google-genai';

export const themeGenerator = genkit({
  plugins: [googleAI()],
});

export async function generateTheme(description: string) {
  const result = await themeGenerator.generate({
    model: gemini15Flash,
    prompt: `Generate a color palette for: ${description}`,
    config: { temperature: 0.7 },
  });

  return result.text();
}
```

## SEO Optimization Strategy

### 1. Dynamic Sitemap

We created a dynamic sitemap that includes all user pages and blog posts:

```typescript
// src/app/sitemap.ts
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    { route: '', priority: 1.0, changeFreq: 'daily' },
    // ... other static routes
  ];

  // Fetch dynamic content from Firebase
  const userPages = await fetchPublishedPages();
  const blogPosts = await fetchPublishedPosts();

  return [...staticRoutes, ...userPages, ...blogPosts];
}
```

### 2. Structured Data

We implemented comprehensive JSON-LD structured data:

```typescript
// Blog post schema
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'BlogPosting',
  'headline': post.title,
  'author': { 
    '@type': 'Person', 
    'name': authorName,
    'url': `${siteUrl}/${authorSlug}`
  },
  'publisher': { 
    '@type': 'Organization', 
    'name': 'Linkbase',
    'logo': { '@type': 'ImageObject', 'url': `${siteUrl}/icon.svg` }
  },
  'datePublished': post.createdAt,
  'dateModified': post.updatedAt,
  // ... more fields
};
```

### 3. PWA Manifest

Created a comprehensive PWA manifest for mobile app-like experience:

```json
{
  "name": "Linkbase - Free Link-in-Bio & Digital Business Card",
  "short_name": "Linkbase",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "categories": ["productivity", "social", "business"],
  "shortcuts": [
    {
      "name": "Create New Page",
      "url": "/dashboard",
      "icons": [{ "src": "/icon.svg", "sizes": "96x96" }]
    }
  ]
}
```

## Performance Optimizations

### Core Web Vitals

We implemented several optimizations for better Core Web Vitals:

1. **Resource Preloading**
```typescript
const preloadResources = [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  { rel: 'dns-prefetch', href: 'https://firebase.googleapis.com' },
];
```

2. **Font Optimization**
```typescript
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap" rel="stylesheet" />
```

3. **Image Optimization**
- Used Next.js Image component
- Implemented lazy loading
- Added proper alt texts

### Cloudflare Workers Deployment

Deploying to Cloudflare Workers required special handling:

```typescript
// next.config.ts
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true, // Required for static export
  },
};

// open-next.config.ts
export default {
  buildCommand: 'next build',
  devCommand: 'next dev',
  routes: {
    '/': 'index.html',
    '/blog': 'blog.html',
    // ... other routes
  },
};
```

## Security Considerations

### Firebase Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Published pages are public
    match /pages/{pageId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && resource.data.ownerId == request.auth.uid;
    }
  }
}
```

### Environment Variables

```typescript
// Secure environment configuration
const config = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
  },
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
};
```

## Analytics & Monitoring

### Custom Analytics Dashboard

We built a real-time analytics dashboard:

```typescript
// Analytics component
function AnalyticsChart({ data }) {
  return (
    <div className="analytics-dashboard">
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="clicks" stroke="#8884d8" />
      </LineChart>
    </div>
  );
}
```

### Performance Monitoring

```typescript
// Core Web Vitals monitoring
if ('PerformanceObserver' in window) {
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'largest-contentful-paint') {
        console.log('LCP:', entry.startTime);
      }
      // ... other metrics
    }
  });
  observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
}
```

## Deployment Workflow

### GitHub Actions CI/CD

```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build:cloudflare
      
      - name: Deploy to Cloudflare
        run: npm run deploy:wrangler
```

## Lessons Learned

### 1. Cloudflare Workers Compatibility
- Next.js 15 requires OpenNext.js for Cloudflare compatibility
- Some features like Image optimization need special handling
- Dynamic routes require careful configuration

### 2. SEO Best Practices
- Structured data significantly improves search visibility
- Dynamic sitemaps are crucial for content-heavy sites
- Core Web Vitals impact rankings more than ever

### 3. Performance Optimization
- Resource preloading makes a noticeable difference
- Font loading strategy affects perceived performance
- Client-side hydration needs careful optimization

## Future Improvements

1. **Internationalization**: Add multi-language support
2. **Advanced Analytics**: Implement custom event tracking
3. **API Rate Limiting**: Add proper rate limiting for public APIs
4. **Image CDN**: Implement CDN for better image delivery
5. **Progressive Enhancement**: Improve offline capabilities

## Conclusion

Building Linkbase taught us valuable lessons about modern web development, from SEO optimization to serverless deployment. The combination of Next.js 15, Firebase, and Cloudflare Workers provides a powerful stack for building scalable, performant web applications.

The key takeaways are:
- **SEO is not optional** - proper structured data and sitemaps are essential
- **Performance matters** - Core Web Vitals impact user experience and rankings
- **Serverless is powerful** - Cloudflare Workers offer great performance at scale
- **TypeScript saves time** - catch errors early and improve developer experience

You can check out the live application at [linkbase.io](https://linkbase.io) and the source code is available on GitHub.

---

*What features would you like to see in a link-in-bio platform? Let me know in the comments below!*

#nextjs #firebase #cloudflare #react #typescript #seo #pwa

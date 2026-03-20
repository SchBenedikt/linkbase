'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Globe, Users, BookOpen, Link as LinkIcon, BarChart3,
  Lock, Eye, EyeOff, LogOut, Shield, AlertCircle,
  TrendingUp, FileText, Calendar, Activity,
} from 'lucide-react';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '@/firebase';
import type { Page, Post } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

const ADMIN_PASSWORD = 'benedikt';
const ADMIN_SESSION_KEY = 'linkbase_admin_session';

interface ShortLink {
  id: string;
  shortCode: string;
  targetUrl: string;
  clicks: number;
  createdAt: Timestamp;
  createdBy: string;
}

interface UserProfile {
  uid: string;
  displayName?: string;
  email?: string;
  createdAt?: Timestamp;
}

export default function AdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Data states
  const [pages, setPages] = useState<(Page & { id: string })[]>([]);
  const [posts, setPosts] = useState<(Post & { id: string })[]>([]);
  const [shortLinks, setShortLinks] = useState<ShortLink[]>([]);
  const [stats, setStats] = useState({
    totalPages: 0,
    publishedPages: 0,
    totalPosts: 0,
    publishedPosts: 0,
    totalShortLinks: 0,
    totalClicks: 0,
  });
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    // Check if already authenticated
    const session = localStorage.getItem(ADMIN_SESSION_KEY);
    if (session === 'authenticated') {
      setIsAuthenticated(true);
      loadData();
    }
    setLoading(false);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem(ADMIN_SESSION_KEY, 'authenticated');
      setError('');
      loadData();
    } else {
      setError('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setPassword('');
  };

  const loadData = async () => {
    setDataLoading(true);
    try {
      // Load pages
      const pagesQuery = query(
        collection(db, 'pages'),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      const pagesSnap = await getDocs(pagesQuery);
      const pagesData = pagesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Page & { id: string }));
      setPages(pagesData);

      // Load posts
      const postsQuery = query(
        collection(db, 'posts'),
        orderBy('updatedAt', 'desc'),
        limit(100)
      );
      const postsSnap = await getDocs(postsQuery);
      const postsData = postsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post & { id: string }));
      setPosts(postsData);

      // Load short links
      const linksQuery = query(
        collection(db, 'shortLinks'),
        orderBy('createdAt', 'desc'),
        limit(100)
      );
      const linksSnap = await getDocs(linksQuery);
      const linksData = linksSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShortLink));
      setShortLinks(linksData);

      // Calculate stats
      const publishedPages = pagesData.filter(p => p.status === 'published').length;
      const publishedPosts = postsData.filter(p => p.status === 'published').length;
      const totalClicks = linksData.reduce((sum, link) => sum + (link.clicks || 0), 0);

      setStats({
        totalPages: pagesData.length,
        publishedPages,
        totalPosts: postsData.length,
        publishedPosts,
        totalShortLinks: linksData.length,
        totalClicks,
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="h-12 w-12 rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-primary/10 rounded-2xl">
              <Shield className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-center mb-2">Admin Access</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Enter the admin password to access the dashboard
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full">
              <Lock className="mr-2 h-4 w-4" />
              Access Admin Panel
            </Button>
          </form>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">Linkbase Admin</h1>
              <p className="text-xs text-muted-foreground">System Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/">
                <Globe className="mr-2 h-4 w-4" />
                View Site
              </a>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <Badge variant="secondary">{stats.publishedPages} live</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalPages}</h3>
            <p className="text-sm text-muted-foreground">Total Pages</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/10 rounded-xl">
                <BookOpen className="h-6 w-6 text-purple-600" />
              </div>
              <Badge variant="secondary">{stats.publishedPosts} live</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalPosts}</h3>
            <p className="text-sm text-muted-foreground">Blog Posts</p>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <LinkIcon className="h-6 w-6 text-green-600" />
              </div>
              <Badge variant="secondary">{stats.totalClicks} clicks</Badge>
            </div>
            <h3 className="text-2xl font-bold mb-1">{stats.totalShortLinks}</h3>
            <p className="text-sm text-muted-foreground">Short Links</p>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs defaultValue="pages" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pages">
              <Globe className="h-4 w-4 mr-2" />
              Pages
            </TabsTrigger>
            <TabsTrigger value="posts">
              <BookOpen className="h-4 w-4 mr-2" />
              Blog Posts
            </TabsTrigger>
            <TabsTrigger value="links">
              <LinkIcon className="h-4 w-4 mr-2" />
              Short Links
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">All Pages</h2>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Slug</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Links</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pages.map((page) => (
                          <TableRow key={page.id}>
                            <TableCell className="font-mono text-sm">
                              <a href={`/${page.slug}`} target="_blank" rel="noopener" className="text-primary hover:underline">
                                /{page.slug}
                              </a>
                            </TableCell>
                            <TableCell>{page.title || page.slug}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{page.userId}</TableCell>
                            <TableCell>
                              <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                                {page.status}
                              </Badge>
                            </TableCell>
                            <TableCell>{page.links?.length || 0}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {page.updatedAt?.toDate().toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="posts">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">All Blog Posts</h2>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Author</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Updated</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {posts.map((post) => (
                          <TableRow key={post.id}>
                            <TableCell>
                              <a href={`/post/${post.id}`} target="_blank" rel="noopener" className="text-primary hover:underline">
                                {post.title}
                              </a>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{post.authorId}</TableCell>
                            <TableCell>
                              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                                {post.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {post.category && <Badge variant="outline">{post.category}</Badge>}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {post.updatedAt?.toDate().toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card>
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">All Short Links</h2>
                {dataLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Short Code</TableHead>
                          <TableHead>Target URL</TableHead>
                          <TableHead>Clicks</TableHead>
                          <TableHead>Owner</TableHead>
                          <TableHead>Created</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {shortLinks.map((link) => (
                          <TableRow key={link.id}>
                            <TableCell className="font-mono text-sm">
                              <a href={`/s/${link.shortCode}`} target="_blank" rel="noopener" className="text-primary hover:underline">
                                /s/{link.shortCode}
                              </a>
                            </TableCell>
                            <TableCell className="max-w-xs truncate text-sm">
                              {link.targetUrl}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                <BarChart3 className="h-3 w-3 mr-1" />
                                {link.clicks || 0}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">{link.createdBy}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {link.createdAt?.toDate().toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

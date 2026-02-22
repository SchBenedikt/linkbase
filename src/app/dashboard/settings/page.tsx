'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { collection, query, where, doc, limit, writeBatch, getDoc } from 'firebase/firestore';
import type { Page } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { UserNav } from '@/components/user-nav';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ThemeToggle } from '@/components/theme-toggle';
import { DashboardNav } from '@/components/dashboard-nav';

// Schemas
const slugSchema = z.object({
  slug: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens.'),
});
const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});
const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
});

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState('');
  const [reauthAction, setReauthAction] = useState<{ type: 'email' | 'password', value: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');

  const pagesQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, 'pages'), where('ownerId', '==', user.uid), limit(1)) : null,
    [user, firestore]
  );
  const { data: pages, isLoading: arePagesLoading } = useCollection<Page>(pagesQuery);
  const page = pages?.[0];

  const slugForm = useForm<z.infer<typeof slugSchema>>({
    resolver: zodResolver(slugSchema),
    defaultValues: { slug: '' },
  });
  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: user?.email || '' },
  });
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { newPassword: '' },
  });

  useEffect(() => {
    if(user?.email) {
      emailForm.reset({ email: user.email });
    }
    if (page?.slug) {
        slugForm.reset({ slug: page.slug });
    }
  }, [user, page, emailForm, slugForm]);

  const handleUpdateSlug = async ({ slug }: z.infer<typeof slugSchema>) => {
    if (!firestore || !page || !user) {
        toast({ variant: "destructive", title: "Error", description: "Could not update username." });
        return;
    }

    if (slug === page.slug) {
        toast({ title: "No changes", description: "The new username is the same as the old one." });
        return;
    }
    
    setLoading('slug');

    const newSlugRef = doc(firestore, 'slug_lookups', slug);
    const newSlugSnap = await getDoc(newSlugRef);

    if (newSlugSnap.exists()) {
        slugForm.setError('slug', { type: 'manual', message: 'This username is already taken.' });
        setLoading('');
        return;
    }
    
    try {
        const batch = writeBatch(firestore);
        const pageRef = doc(firestore, 'pages', page.id);
        batch.update(pageRef, { slug: slug });
        const oldSlugRef = doc(firestore, 'slug_lookups', page.slug);
        batch.delete(oldSlugRef);
        batch.set(newSlugRef, { pageId: page.id });
        await batch.commit();
        toast({ title: 'Success!', description: 'Your username has been updated.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update username.' });
    } finally {
        setLoading('');
    }
  };

  const handleUpdateEmail = async ({ email }: z.infer<typeof emailSchema>) => {
    if (!user) return;
    setLoading('email');
    try {
      await updateEmail(user, email);
      toast({ title: 'Success!', description: 'Your email address has been updated.' });
      emailForm.reset({ email });
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setReauthAction({ type: 'email', value: email });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } finally {
      setLoading('');
    }
  };

  const handleUpdatePassword = async ({ newPassword }: z.infer<typeof passwordSchema>) => {
    if (!user) return;
    setLoading('password');
    try {
      await updatePassword(user, newPassword);
      toast({ title: 'Success!', description: 'Your password has been changed.' });
      passwordForm.reset();
    } catch (error: any) {
      if (error.code === 'auth/requires-recent-login') {
        setReauthAction({ type: 'password', value: newPassword });
      } else {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
    } finally {
      setLoading('');
    }
  };

  const handleReauthenticate = async () => {
    if (!user || !user.email || !reauthAction || !currentPassword) return;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    
    try {
      await reauthenticateWithCredential(user, credential);
      // After re-auth, retry the original action
      if (reauthAction.type === 'email') {
        await handleUpdateEmail({ email: reauthAction.value });
      } else if (reauthAction.type === 'password') {
        await handleUpdatePassword({ newPassword: reauthAction.value });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'The password you entered is incorrect.' });
    } finally {
      setReauthAction(null);
      setCurrentPassword('');
    }
  };

  const isLoading = isUserLoading || arePagesLoading;

  if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
        <header className="bg-background/80 backdrop-blur-md border-b sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
                <DashboardNav />
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <UserNav />
                </div>
            </div>
        </header>
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-3xl font-bold tracking-tight mb-8">Settings</h2>
            <div className="max-w-2xl mx-auto space-y-8">
                {page && (
                    <Card className="border-0 shadow-none bg-transparent">
                        <CardHeader>
                            <CardTitle>Change Username</CardTitle>
                            <CardDescription>This is your unique URL on BioBloom. Choose wisely.</CardDescription>
                        </CardHeader>
                        <Form {...slugForm}>
                            <form onSubmit={slugForm.handleSubmit(handleUpdateSlug)}>
                                <CardContent>
                                    <FormField
                                        control={slugForm.control}
                                        name="slug"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Username</FormLabel>
                                                <div className="flex items-center">
                                                    <span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0">biobloom.co/</span>
                                                    <FormControl>
                                                        <Input {...field} className="rounded-l-none bg-card" />
                                                    </FormControl>
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </CardContent>
                                <CardFooter>
                                    <Button type="submit" disabled={loading === 'slug'}>
                                        {loading === 'slug' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Save Username
                                    </Button>
                                </CardFooter>
                            </form>
                        </Form>
                    </Card>
                )}
                <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                        <CardTitle>Change Email Address</CardTitle>
                        <CardDescription>Update the email address associated with your account.</CardDescription>
                    </CardHeader>
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(handleUpdateEmail)}>
                            <CardContent>
                                <FormField
                                control={emailForm.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>New Email</FormLabel>
                                    <FormControl>
                                        <Input type="email" {...field} className="bg-card" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading === 'email'}>
                                {loading === 'email' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Email
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
                
                <Card className="border-0 shadow-none bg-transparent">
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Choose a strong, new password to protect your account.</CardDescription>
                    </CardHeader>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handleUpdatePassword)}>
                            <CardContent>
                                <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                    <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                        <Input type="password" {...field} className="bg-card" />
                                    </FormControl>
                                    <FormMessage />
                                    </FormItem>
                                )}
                                />
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading === 'password'}>
                                {loading === 'password' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Save Password
                                </Button>
                            </CardFooter>
                        </form>
                    </Form>
                </Card>
            </div>
        </main>
        
        <AlertDialog open={!!reauthAction} onOpenChange={(open) => !open && setReauthAction(null)}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Please Re-authenticate</AlertDialogTitle>
                    <AlertDialogDescription>
                        For your security, please enter your current password to continue.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-2 py-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                        id="current-password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="bg-card"
                    />
                </div>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setReauthAction(null)}>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleReauthenticate}>Confirm</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

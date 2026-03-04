'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, writeBatch, getDoc, serverTimestamp, setDoc, collection, query, where, deleteDoc } from 'firebase/firestore';
import type { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trash2, Copy, Plus, Check, Code2 } from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

// Schemas
const profileSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters.').regex(/^[a-z0-9-]+$/, 'Username can only contain lowercase letters, numbers, and hyphens.'),
  title: z.string().optional(),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  bio: z.string().max(160, 'Bio cannot be longer than 160 characters.').optional(),
  avatarUrl: z.string().url('Please enter a valid image URL').optional().or(z.literal('')),
  openForWork: z.boolean().optional(),
  categories: z.string().optional(),
  socialLinks: z.array(z.object({
    platform: z.string().min(1, "Platform is required."),
    url: z.string().url("Please enter a valid URL.").or(z.literal('')),
  })).optional(),
});
const emailSchema = z.object({
  email: z.string().email('Invalid email address.'),
});
const passwordSchema = z.object({
  newPassword: z.string().min(6, 'Password must be at least 6 characters long.'),
});

const availablePlatforms = ["instagram", "x", "facebook", "linkedin", "tiktok", "pinterest", "soundcloud", "github", "youtube", "website"];

export default function SettingsPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [loading, setLoading] = useState('');
  const [reauthAction, setReauthAction] = useState<{ type: 'email' | 'password', value: string } | null>(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newKeyName, setNewKeyName] = useState('');
  const [isCreatingKey, setIsCreatingKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // API keys collection
  const apiKeysQuery = useMemoFirebase(() =>
    user && firestore ? query(collection(firestore!, 'api_keys'), where('ownerId', '==', user.uid)) : null,
    [user, firestore]
  );
  const { data: apiKeys, isLoading: areApiKeysLoading } = useCollection<{ id: string; name?: string; createdAt: any }>(apiKeysQuery);

  const handleCreateApiKey = useCallback(async () => {
    if (!user || !firestore) return;
    setIsCreatingKey(true);
    try {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const arr = new Uint8Array(32);
      crypto.getRandomValues(arr);
      const key = 'lb_' + Array.from(arr).map(n => chars[n % chars.length]).join('');
      const keyRef = doc(firestore!, 'api_keys', key);
      await setDoc(keyRef, {
        ownerId: user.uid,
        name: newKeyName.trim() || 'Default',
        createdAt: serverTimestamp(),
      });
      setNewKeyName('');
      // Copy to clipboard immediately
      await navigator.clipboard.writeText(key).catch(() => {});
      toast({ title: 'API key created', description: 'The key has been copied to your clipboard. Store it safely – it won\'t be shown again.' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not create API key.' });
    } finally {
      setIsCreatingKey(false);
    }
  }, [user, firestore, newKeyName, toast]);

  const handleRevokeApiKey = useCallback(async (keyId: string) => {
    if (!firestore) return;
    try {
      await deleteDoc(doc(firestore!, 'api_keys', keyId));
      toast({ title: 'API key revoked' });
    } catch (err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message || 'Could not revoke API key.' });
    }
  }, [firestore, toast]);

  const handleCopyKey = useCallback(async (key: string) => {
    await navigator.clipboard.writeText(key).catch(() => {});
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }, []);

  const userProfileRef = useMemoFirebase(() => 
    user ? doc(firestore, 'user_profiles', user.uid) : null,
    [user, firestore]
  );
  const { data: userProfile, isLoading: isProfileLoading } = useDoc<UserProfile>(userProfileRef);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      username: '',
      title: '',
      firstName: '',
      lastName: '',
      bio: '',
      avatarUrl: '',
      openForWork: false,
      categories: '',
      socialLinks: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: profileForm.control,
    name: "socialLinks"
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
    if (userProfile) {
      profileForm.reset({
        username: userProfile.username || '',
        title: userProfile.title || '',
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        bio: userProfile.bio || '',
        avatarUrl: userProfile.avatarUrl || '',
        openForWork: userProfile.openForWork || false,
        categories: userProfile.categories?.join(', ') || '',
        socialLinks: userProfile.socialLinks || [],
      });
    } else if (user) {
        // Pre-fill from auth if no profile exists
        profileForm.reset({
            ...profileForm.getValues(),
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            avatarUrl: user.photoURL || '',
        });
    }
    if(user?.email) {
      emailForm.reset({ email: user.email });
    }
  }, [user, userProfile, emailForm, profileForm]);

  const handleProfileUpdate = async (data: z.infer<typeof profileSchema>) => {
    if (!firestore || !user) {
        toast({ variant: "destructive", title: "Error", description: "Could not update profile." });
        return;
    }
    
    setLoading('profile');
    
    // Check for username uniqueness if it has changed
    if (data.username && data.username !== userProfile?.username) {
        const newUsernameRef = doc(firestore, 'username_lookups', data.username);
        const newUsernameSnap = await getDoc(newUsernameRef);
        if (newUsernameSnap.exists()) {
            profileForm.setError('username', { type: 'manual', message: 'This username is already taken.' });
            setLoading('');
            return;
        }
    }
    
    try {
        const batch = writeBatch(firestore);
        const profileRef = doc(firestore, 'user_profiles', user.uid);
        
        const categoriesArray = data.categories
            ? data.categories.split(',').map(c => c.trim()).filter(Boolean)
            : [];

        const dataToSave = {
            ...data,
            categories: categoriesArray,
            id: user.uid,
            updatedAt: serverTimestamp(),
        };

        if (userProfile) {
            batch.update(profileRef, dataToSave);
        } else {
            batch.set(profileRef, { ...dataToSave, createdAt: serverTimestamp() });
        }

        // Handle username lookup update
        if (data.username && data.username !== userProfile?.username) {
            const newUsernameRef = doc(firestore, 'username_lookups', data.username);
            batch.set(newUsernameRef, { userId: user.uid });
            if (userProfile?.username) {
                const oldUsernameRef = doc(firestore, 'username_lookups', userProfile.username);
                batch.delete(oldUsernameRef);
            }
        }
        
        await batch.commit();
        toast({ title: 'Success!', description: 'Your profile has been updated.' });
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message || 'Could not update profile.' });
    } finally {
        setLoading('');
    }
  };

  const handleEmailUpdate = async ({ email }: z.infer<typeof emailSchema>) => {
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

  const handlePasswordUpdate = async ({ newPassword }: z.infer<typeof passwordSchema>) => {
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
      if (reauthAction.type === 'email') {
        await handleEmailUpdate({ email: reauthAction.value });
      } else if (reauthAction.type === 'password') {
        await handlePasswordUpdate({ newPassword: reauthAction.value });
      }
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Authentication Error', description: 'The password you entered is incorrect.' });
    } finally {
      setReauthAction(null);
      setCurrentPassword('');
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading && !userProfile) { // Show loading spinner only on initial load
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground border-b sticky top-0 z-50">
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
            
            <Tabs defaultValue="profile" className="max-w-4xl mx-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="security">Security</TabsTrigger>
                <TabsTrigger value="api" className="gap-2"><Code2 className="h-4 w-4" />Developer API</TabsTrigger>
              </TabsList>

              <TabsContent value="profile" className="mt-6">
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Public Profile</CardTitle>
                                <CardDescription>This information is for your global user identity, used for author details on posts and for mentions. It does not automatically change your individual Bento pages.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <FormField control={profileForm.control} name="username" render={({ field }) => (
                                    <FormItem><FormLabel>Username</FormLabel><div className="flex items-center"><span className="text-sm text-muted-foreground px-3 py-2 bg-muted rounded-l-md border border-r-0">@</span><FormControl><Input {...field} className="rounded-l-none" /></FormControl></div><FormDescription>Your unique handle for mentions across the platform.</FormDescription><FormMessage /></FormItem>
                                )} />
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                     <FormField control={profileForm.control} name="firstName" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={profileForm.control} name="lastName" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                                <FormField control={profileForm.control} name="avatarUrl" render={({ field }) => (<FormItem><FormLabel>Avatar URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." {...field} /></FormControl><FormMessage /></FormItem>)} />
                                <FormField control={profileForm.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Bio</FormLabel><FormControl><Textarea {...field} rows={3} placeholder="Tell us a little about yourself" /></FormControl><FormMessage /></FormItem>)} />
                                
                                 <FormField
                                    control={profileForm.control}
                                    name="openForWork"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm bg-background">
                                        <div className="space-y-0.5">
                                            <FormLabel>Open for work</FormLabel>
                                            <FormDescription>Show that you are available for hire.</FormDescription>
                                        </div>
                                        <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        </FormItem>
                                    )}
                                />

                                <FormField control={profileForm.control} name="categories" render={({ field }) => (
                                    <FormItem><FormLabel>Categories / Tags</FormLabel><FormControl><Input {...field} placeholder="e.g. Photographer, Developer" /></FormControl><FormDescription>Enter multiple categories separated by commas.</FormDescription><FormMessage /></FormItem>
                                )}/>
                                
                                <div>
                                    <FormLabel>Social Links</FormLabel>
                                    <div className="space-y-4 pt-2">
                                        {fields.map((field, index) => (
                                            <div key={field.id} className="flex items-center gap-2">
                                                <FormField control={profileForm.control} name={`socialLinks.${index}.platform`} render={({ field }) => (
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl><SelectTrigger className="w-[120px]"><SelectValue placeholder="Platform" /></SelectTrigger></FormControl>
                                                        <SelectContent>{availablePlatforms.map(p => <SelectItem key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</SelectItem>)}</SelectContent>
                                                    </Select>
                                                )}/>
                                                <FormField control={profileForm.control} name={`socialLinks.${index}.url`} render={({ field }) => ( <FormControl><Input {...field} placeholder="https://..." className="flex-1" /></FormControl> )}/>
                                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                                            </div>
                                        ))}
                                        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={() => append({ platform: '', url: '' })}>Add Social Link</Button>
                                    </div>
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" disabled={loading === 'profile'}>
                                    {loading === 'profile' && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Save Profile
                                </Button>
                            </CardFooter>
                        </Card>
                    </form>
                </Form>
              </TabsContent>

              <TabsContent value="security" className="mt-6 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Email Address</CardTitle>
                        <CardDescription>Update the email address associated with your account.</CardDescription>
                    </CardHeader>
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(handleEmailUpdate)}>
                            <CardContent>
                                <FormField control={emailForm.control} name="email" render={({ field }) => (
                                    <FormItem><FormLabel>New Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
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
                
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>Choose a strong, new password to protect your account.</CardDescription>
                    </CardHeader>
                    <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(handlePasswordUpdate)}>
                            <CardContent>
                                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                    <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                                )} />
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
              </TabsContent>

              {/* ── Developer API ──────────────────────────────────────────────────── */}
              <TabsContent value="api" className="mt-6 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Developer API Keys</CardTitle>
                    <CardDescription>
                      Generate API keys to access the Linkbase REST API. Keep your keys safe — they grant
                      full read access to your account data.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Create new key */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Key name (optional, e.g. My App)"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="max-w-xs"
                      />
                      <Button onClick={handleCreateApiKey} disabled={isCreatingKey} className="gap-2">
                        {isCreatingKey ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                        Generate Key
                      </Button>
                    </div>

                    {/* Key list */}
                    {areApiKeysLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : apiKeys && apiKeys.length > 0 ? (
                      <div className="space-y-2">
                        {apiKeys.map((k) => (
                          <div key={k.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="min-w-0">
                                <p className="text-sm font-medium">{k.name || 'Unnamed key'}</p>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {k.id.slice(0, 12)}••••••••••••••••••
                                </p>
                                {k.createdAt?.toDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Created {k.createdAt.toDate().toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleCopyKey(k.id)}
                                title="Copy key"
                              >
                                {copiedKey === k.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRevokeApiKey(k.id)}
                                title="Revoke key"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No API keys yet. Generate one above.</p>
                    )}
                  </CardContent>
                </Card>

                {/* API reference */}
                <Card>
                  <CardHeader>
                    <CardTitle>API Reference</CardTitle>
                    <CardDescription>Base URL: <code className="text-xs bg-muted px-1 rounded">{typeof window !== 'undefined' ? window.location.origin : ''}/api/v1</code></CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <p className="text-muted-foreground">Pass your API key in the <code className="bg-muted px-1 rounded">Authorization</code> header:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">{'Authorization: Bearer <your_api_key>'}</pre>
                    <div className="space-y-2">
                      {[
                        { method: 'GET', path: '/api/v1/me', desc: 'Get your profile information' },
                        { method: 'GET', path: '/api/v1/pages', desc: 'List all your pages' },
                        { method: 'GET', path: '/api/v1/links', desc: 'List all your short links' },
                      ].map(endpoint => (
                        <div key={endpoint.path} className="flex items-start gap-3 p-2 rounded border">
                          <Badge variant="secondary" className="font-mono text-xs flex-shrink-0">{endpoint.method}</Badge>
                          <code className="text-xs font-mono">{endpoint.path}</code>
                          <span className="text-xs text-muted-foreground ml-auto">{endpoint.desc}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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

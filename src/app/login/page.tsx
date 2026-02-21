'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';


const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" {...props}>
      <title>Google</title>
      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.85 3.18-1.73 4.1-1.02 1.02-2.6 1.62-4.58 1.62-3.53 0-6.47-2.92-6.47-6.5s2.94-6.5 6.47-6.5c1.96 0 3.37.79 4.38 1.74l2.55-2.55C17.34 2.34 15.13 1.5 12.48 1.5c-5.48 0-9.92 4.44-9.92 9.92s4.44 9.92 9.92 9.92c5.22 0 9.5-3.48 9.5-9.66 0-.6-.05-1.12-.15-1.62H12.48z" />
    </svg>
  );

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
        await signInWithPopup(auth, provider);
        // Redirect is handled by the useEffect hook
    } catch(error: any) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Authentication Error',
            description: error.message || 'Could not sign in with Google. Please try again.',
        });
    } finally {
        setLoading(false);
    }
  };

  const handleAuthAction = async () => {
    if (!email || password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid email and a password with at least 6 characters.',
      });
      return;
    }
    setLoading(true);
    try {
      if (activeTab === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
      // Redirect is handled by useEffect
    } catch (error: any) {
      console.error(error);
      const errorMessage = 
        error.code === 'auth/email-already-in-use' ? 'This email address is already in use.'
        : error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 'Invalid login credentials.'
        : 'An error occurred. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (isUserLoading || user) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
       <div className="hidden lg:flex flex-col items-center justify-center p-12 bg-secondary text-secondary-foreground">
            <div className="mx-auto w-[400px] space-y-6">
                <Link href="/" className="font-headline font-bold text-4xl">
                    BioBloom*
                </Link>
                <p className="text-xl">
                    Everything you are, in one simple link. Create your personal page in minutes.
                </p>
            </div>
        </div>
        <div className="flex items-center justify-center p-6 sm:p-12 bg-background">
             <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
                <Link href="/" className="font-headline font-bold text-3xl lg:hidden mb-8 block text-center text-primary">
                    BioBloom*
                </Link>
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <Card className="mt-4 bg-transparent border-0 shadow-none">
                
                    <CardHeader>
                    <CardTitle>{activeTab === 'login' ? 'Welcome back' : 'Create an account'}</CardTitle>
                    <CardDescription>
                        {activeTab === 'login' 
                        ? 'Log in to your account to continue.' 
                        : 'Create a new account to get started.'
                        }
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" placeholder="m@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="bg-card" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="bg-card" />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {loading 
                                    ? (activeTab === 'login' ? 'Logging in...' : 'Creating account...')
                                    : (activeTab === 'login' ? 'Login' : 'Create Account')
                                    }
                                </Button>
                            </div>
                        </form>
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Or continue with
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={handleGoogleSignIn} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GoogleIcon className="mr-2 h-4 w-4" />}
                            Google
                        </Button>
                    </CardContent>
                </Card>
            </Tabs>
        </div>
    </div>
  );
}

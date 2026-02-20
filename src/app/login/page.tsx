'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/profile');
    }
  }, [user, isUserLoading, router]);

  const handleAuthAction = async () => {
    if (!email || password.length < 6) {
      toast({
        variant: 'destructive',
        title: 'Fehler',
        description: 'Bitte geben Sie eine gültige E-Mail und ein Passwort mit mindestens 6 Zeichen ein.',
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
        error.code === 'auth/email-already-in-use' ? 'Diese E-Mail-Adresse wird bereits verwendet.'
        : error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' ? 'Ungültige Anmeldeinformationen.'
        : 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.';
      toast({
        variant: 'destructive',
        title: 'Authentifizierungsfehler',
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
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <div className="absolute top-4 left-4">
             <Button variant="ghost" asChild>
                <Link href="/">&larr; Zurück zur Startseite</Link>
            </Button>
        </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Anmelden</TabsTrigger>
          <TabsTrigger value="signup">Registrieren</TabsTrigger>
        </TabsList>
        
        <Card className="mt-4">
          <form onSubmit={(e) => { e.preventDefault(); handleAuthAction(); }}>
            <CardHeader>
              <CardTitle>{activeTab === 'login' ? 'Anmelden' : 'Registrieren'}</CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Melden Sie sich bei Ihrem Konto an, um fortzufahren.' 
                  : 'Erstellen Sie ein neues Konto, um loszulegen.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input id="email" type="email" placeholder="m@beispiel.de" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Passwort</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading 
                  ? (activeTab === 'login' ? 'Wird angemeldet...' : 'Wird erstellt...')
                  : (activeTab === 'login' ? 'Anmelden' : 'Konto erstellen')
                }
              </Button>
            </CardFooter>
          </form>
        </Card>
      </Tabs>
    </div>
  );
}

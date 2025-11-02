
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, LogOut } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Welcome to Your Dashboard</CardTitle>
          <CardDescription>
            This is your personal space in Mouth Metrics Studio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>You are signed in with the phone number:</p>
          <p className="text-lg font-semibold text-primary">{user.phoneNumber}</p>
          <div className="flex gap-4 pt-4">
            <Button onClick={handleSignOut} variant="secondary">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button onClick={() => router.push('/profile')}>
              Manage Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

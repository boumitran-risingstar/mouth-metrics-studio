
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, type User, updateEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, LogOut, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || '');
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

  const handleAddEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email) {
      setError("Email address is required.");
      return;
    }
    
    setIsProcessing(true);
    setError(null);

    try {
      // Logic for adding a new email or updating a verified one
      if (!user.email || user.emailVerified) {
        await updateEmail(user, email);
        await sendEmailVerification(user);
      } else {
        // This case should not be hit due to UI disable, but as a safeguard:
        setError("Please verify your current email before changing it.");
        setIsProcessing(false);
        return;
      }
      

      const idToken = await user.getIdToken(true); // Force refresh to get latest claims
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            phoneNumber: user.phoneNumber,
            email: user.email,
            emailVerified: user.emailVerified,
        }),
      });

      if (!response.ok) {
          throw new Error('Failed to update profile on the server.');
      }
      
      await user.reload();
      setUser({ ...user }); // force re-render

      toast({
        title: "Verification Email Sent",
        description: `A verification link has been sent to ${email}. Please check your inbox.`,
      });

    } catch (error: any) {
      console.error("Error updating email:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
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

  const isEmailUnverified = user.email && !user.emailVerified;

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
          <Button onClick={handleSignOut} className="mt-4" variant="secondary">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {user.email && (
                <div className="space-y-2">
                    <Label>Current Email</Label>
                    <div className="flex items-center gap-2 text-sm">
                        <span>{user.email}</span>
                        {user.emailVerified ? (
                            <span className="flex items-center gap-1 text-green-600"><CheckCircle className="h-4 w-4" /> Verified</span>
                        ) : (
                            <span className="flex items-center gap-1 text-yellow-600"><AlertCircle className="h-4 w-4" /> Not Verified</span>
                        )}
                    </div>
                </div>
            )}
            <form onSubmit={handleAddEmail} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
               {isEmailUnverified && (
                <Alert variant="default">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please verify your current email address before you can update it.
                  </AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                  <Label htmlFor="email">{user.email ? "Update Email" : "Add Email"}</Label>
                  <div className="flex gap-2">
                      <Input 
                          id="email" 
                          type="email" 
                          placeholder="you@example.com" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isEmailUnverified}
                      />
                  </div>
              </div>
              <Button type="submit" disabled={isProcessing || isEmailUnverified}>
                {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isProcessing ? "Processing..." : (user.email ? "Update & Re-verify Email" : "Add & Verify Email")}
              </Button>
               {isEmailUnverified && (
                 <Button type="button" variant="outline" onClick={async () => {
                   await sendEmailVerification(user);
                   toast({ title: "Verification Email Sent", description: `A verification link has been sent to ${user.email}.` });
                 }}>
                    Resend Verification Email
                 </Button>
                )}
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

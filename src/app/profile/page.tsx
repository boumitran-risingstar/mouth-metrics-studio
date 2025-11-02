
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User, updateEmail, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, AlertCircle, Pencil } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        
        // Fetch full profile from our backend
        try {
          const idToken = await user.getIdToken();
          const response = await fetch(`/api/users/${user.uid}`, {
            headers: { 'Authorization': `Bearer ${idToken}` }
          });
          if (response.ok) {
            const profileData = await response.json();
            setName(profileData.name || '');
            if (!profileData.name) {
              setIsNameEditing(true); // Start in editing mode if name is not set
            }
          } else {
            console.error('Failed to fetch user profile');
          }
        } catch (e) {
            console.error('Error fetching profile', e)
        }

      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsProcessing(true);
    setError(null);

    let emailUpdated = false;

    try {
      // Handle email update if it has changed
      if (email && email !== user.email) {
          if (!user.email || user.emailVerified) {
              await updateEmail(user, email);
              await sendEmailVerification(user);
              emailUpdated = true;
          } else {
              throw new Error("Please verify your current email before changing it.");
          }
      }
      
      const idToken = await user.getIdToken(true);
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            phoneNumber: user.phoneNumber,
            email: email, // send the new email
            name: name,
        }),
      });

      if (!response.ok) {
          throw new Error('Failed to update profile on the server.');
      }
      
      await user.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser ? { ...updatedUser } : null); 
      setIsNameEditing(false);

      if (emailUpdated) {
        toast({
          title: "Verification Email Sent",
          description: `A verification link has been sent to ${email}. Please check your inbox.`,
        });
      } else {
        toast({
            title: "Profile Saved",
            description: "Your profile information has been updated.",
        });
      }

    } catch (error: any) {
      console.error("Error updating profile:", error);
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
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Manage your account details.</CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
                {error && (
                    <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label>Phone Number</Label>
                    <p className="text-lg font-semibold text-muted-foreground">{user.phoneNumber}</p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <div className="flex items-center gap-2">
                        {isNameEditing ? (
                            <Input 
                                id="name" 
                                type="text" 
                                placeholder="Your full name" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        ) : (
                            <>
                                <p className="text-lg flex-1">{name}</p>
                                <Button variant="ghost" size="icon" onClick={() => setIsNameEditing(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>

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
                
                <div className="flex gap-4">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isProcessing ? "Saving..." : "Save Profile"}
                    </Button>
                    {isEmailUnverified && (
                    <Button type="button" variant="outline" onClick={async () => {
                        await sendEmailVerification(user);
                        toast({ title: "Verification Email Sent", description: `A verification link has been sent to ${user.email}.` });
                    }}>
                        Resend Verification Email
                    </Button>
                    )}
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Pencil, PlusCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type EmailEntry = {
    address: string;
    verified: boolean;
};

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const [isNameEditing, setIsNameEditing] = useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const { toast } = useToast();

  const fetchProfile = useCallback(async (user: User) => {
    try {
      const idToken = await user.getIdToken();
      const response = await fetch(`/api/users/${user.uid}`, {
        headers: { 'Authorization': `Bearer ${idToken}` }
      });
      if (response.ok) {
        const profileData = await response.json();
        setName(profileData.name || '');
        setEmails(profileData.emails || []);
        if (!profileData.name) {
          setIsNameEditing(true);
        }
      } else {
        console.error('Failed to fetch user profile');
        setError('Failed to load your profile. Please try again later.');
      }
    } catch (e) {
        console.error('Error fetching profile', e)
        setError('An error occurred while loading your profile.');
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchProfile(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router, fetchProfile]);

  const handleProfileUpdate = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const idToken = await user.getIdToken(true);
      const response = await fetch(`/api/users`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({
            phoneNumber: user.phoneNumber,
            name: name,
            emails: emails,
        }),
      });

      if (!response.ok) {
          throw new Error('Failed to update profile on the server.');
      }
      
      const profileData = await response.json();
      
      setName(profileData.name || '');
      setEmails(profileData.emails || []);
      setIsNameEditing(false);
      setIsAddingEmail(false);
      setNewEmail('');

      toast({
          title: "Profile Saved",
          description: "Your profile information has been updated.",
      });

    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddEmail = () => {
    if (newEmail && !emails.some(e => e.address === newEmail)) {
      const updatedEmails = [...emails, { address: newEmail, verified: false }];
      setEmails(updatedEmails);
      setIsAddingEmail(false);
      setNewEmail('');
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Email",
            description: "Email is either empty or already in your list.",
        })
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmails(emails.filter(email => email.address !== emailToRemove));
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
                        <AlertCircle className="h-4 w-4" />
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
                                <p className="text-lg flex-1">{name || 'Not set'}</p>
                                <Button type="button" variant="ghost" size="icon" onClick={() => setIsNameEditing(true)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                
                <div className="space-y-4">
                    <Label>Email Addresses</Label>
                    {emails.length > 0 ? (
                        <div className="space-y-2">
                            {emails.map((email, index) => (
                                <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm">{email.address}</span>
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveEmail(email.address)}>
                                      <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No email addresses added yet.</p>
                    )}

                    {isAddingEmail ? (
                         <div className="flex items-center gap-2 pt-2">
                            <Input 
                                type="email" 
                                placeholder="new.email@example.com"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                            />
                            <Button type="button" onClick={handleAddEmail}>Add</Button>
                            <Button type="button" variant="ghost" size="icon" onClick={() => { setIsAddingEmail(false); setNewEmail(''); }}>
                                <X className="h-4 w-4" />
                            </Button>
                         </div>
                    ) : (
                        <Button type="button" variant="outline" onClick={() => setIsAddingEmail(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Email
                        </Button>
                    )}
                </div>
                
                <div className="flex gap-4 pt-4">
                    <Button type="submit" disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isProcessing ? "Saving..." : "Save Profile"}
                    </Button>
                </div>
            </form>
        </CardContent>
      </Card>
    </div>
  );
}

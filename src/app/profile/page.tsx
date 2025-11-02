"use client";

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, Pencil, PlusCircle, X, Linkedin, Github } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

type EmailEntry = {
    address: string;
    verified: boolean;
};

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z" />
    </svg>
);

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
    </svg>
);

const TwitterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.14.3C5.82.3 2.02 5.55 2.02 10.42c0 3.32 1.7 6.22 4.23 7.76.27.3.4.65.3.98l-.4 1.63c-.1.5.38.9.87.7l1.9-.8c.4-.17.84-.23 1.28-.23 4.9 0 9.2-3.84 9.2-8.62 0-5.18-4.3-9.58-10.16-9.58zm0 15.1c-1.1 0-2.18-.3-3.12-.82l-.02-.02-.1-.06-1.55.67.33-1.32.06-.26-.18-.2c-2.3-1.5-3.6-3.9-3.6-6.5C4.02 6.8 7.3 4.3 12.14 4.3c4.7 0 8.12 3.4 8.12 7.53 0 4.1-3.2 7.27-7.12 7.27z" />
    </svg>
);

const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
        <path d="M10,15L15.19,12L10,9V15M21.56,7.17C21.69,7.64 21.78,8.27 21.84,9.07C21.91,9.87 21.94,10.56 21.94,11.16L22,12C22,14.19 21.84,15.8 21.56,16.83C21.31,17.73 20.73,18.31 19.83,18.56C19.36,18.69 18.73,18.78 17.93,18.84C17.13,18.91 16.44,18.94 15.84,18.94L15,19C12.81,19 11.2,18.84 10.17,18.56C9.27,18.31 8.69,17.73 8.44,16.83C8.31,16.36 8.22,15.73 8.16,14.93C8.09,14.13 8.06,13.44 8.06,12.84L8,12C8,9.81 8.16,8.2 8.44,7.17C8.69,6.27 9.27,5.69 10.17,5.44C10.64,5.31 11.27,5.22 12.07,5.16C12.87,5.09 13.56,5.06 14.16,5.06L15,5C17.19,5 18.8,5.16 19.83,5.44C20.73,5.69 21.31,6.27 21.56,7.17Z"></path>
    </svg>
);

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
    <div className="container mx-auto py-10 space-y-8">
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
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
            <CardTitle>Social Media Connect</CardTitle>
            <CardDescription>Connect your social media accounts for a richer experience.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <Linkedin className="h-6 w-6 text-[#0A66C2]" />
                    <span className="font-medium">LinkedIn</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <FacebookIcon className="h-6 w-6 text-[#1877F2]" />
                    <span className="font-medium">Facebook</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <InstagramIcon className="h-6 w-6 text-pink-500" />
                    <span className="font-medium">Instagram</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <TwitterIcon className="h-6 w-6 text-black dark:text-white" />
                    <span className="font-medium">X (Twitter)</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <PinterestIcon className="h-6 w-6 text-[#E60023]" />
                    <span className="font-medium">Pinterest</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <Github className="h-6 w-6" />
                    <span className="font-medium">GitHub</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
             <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-3">
                    <YoutubeIcon className="h-6 w-6 text-[#FF0000]" />
                    <span className="font-medium">YouTube</span>
                </div>
                <Button variant="outline">Connect</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
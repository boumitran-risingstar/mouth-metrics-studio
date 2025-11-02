"use client";

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type UserProfile = {
    name: string;
    phoneNumber: string;
    emails: { address: string; verified: boolean }[];
};

export function ProfileInformationCard() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const fetchUserProfile = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch(`/api/users/${currentUser.uid}`, {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfile(data);
                setOriginalProfile(JSON.parse(JSON.stringify(data)));
            } else {
                console.error("Failed to fetch user profile.");
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchUserProfile(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchUserProfile]);

    const handleFieldChange = (field: keyof UserProfile, value: any) => {
        if (profile) {
            setProfile({ ...profile, [field]: value });
        }
    };

    const handleEmailChange = (index: number, value: string) => {
        if (profile) {
            const newEmails = [...profile.emails];
            newEmails[index].address = value;
            handleFieldChange('emails', newEmails);
        }
    };

    const addEmail = () => {
        if (profile) {
            handleFieldChange('emails', [...profile.emails, { address: '', verified: false }]);
        }
    };

    const removeEmail = (index: number) => {
        if (profile) {
            handleFieldChange('emails', profile.emails.filter((_, i) => i !== index));
        }
    };

    const handleCancel = () => {
        setProfile(originalProfile);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user || !profile) return;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`/api/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({
                    name: profile.name,
                    emails: profile.emails,
                })
            });

            if (response.ok) {
                const savedData = await response.json();
                setProfile(savedData);
                setOriginalProfile(JSON.parse(JSON.stringify(savedData)));
                setIsEditing(false);
                toast({ title: "Success", description: "Your profile has been updated." });
            } else {
                throw new Error("Failed to save profile.");
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving your profile." });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Manage your personal details.</CardDescription>
                    </div>
                    {!isEditing && !loading && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={profile?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Addresses</Label>
                            {profile?.emails.map((email, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <Input value={email.address} onChange={(e) => handleEmailChange(index, e.target.value)} />
                                    <Button variant="ghost" size="icon" onClick={() => removeEmail(index)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </div>
                            ))}
                             <Button variant="outline" size="sm" onClick={addEmail}>
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Email
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4 text-sm">
                        <div>
                            <p className="font-medium text-muted-foreground">Full Name</p>
                            <p>{profile?.name || 'Not set'}</p>
                        </div>
                         <div>
                            <p className="font-medium text-muted-foreground">Phone Number</p>
                            <p>{profile?.phoneNumber}</p>
                        </div>
                        <div>
                            <p className="font-medium text-muted-foreground">Email Addresses</p>
                            {profile?.emails && profile.emails.length > 0 ? (
                                profile.emails.map((email, index) => (
                                    <p key={index}>{email.address}</p>
                                ))
                            ) : (
                                <p>No email addresses added.</p>
                            )}
                        </div>
                    </div>
                )}
            </CardContent>
            {isEditing && (
                 <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

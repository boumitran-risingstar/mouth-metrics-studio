
"use client";

import { useEffect, useState, useCallback, useRef } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Edit, Loader2, PlusCircle, Trash2, User as UserIcon, Phone, Mail, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useUserProfile, type UserProfile } from '@/context/user-profile-context';

export function ProfileInformationCard() {
    const { user, userProfile, setUserProfile, loading, error } = useUserProfile();
    const [localProfile, setLocalProfile] = useState<UserProfile | null>(null);
    const [originalProfile, setOriginalProfile] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    
    useEffect(() => {
        if(userProfile) {
            const profileCopy = JSON.parse(JSON.stringify(userProfile));
            setLocalProfile(profileCopy);
            setOriginalProfile(profileCopy);
        }
    }, [userProfile]);

    const handleFieldChange = (field: keyof UserProfile, value: any) => {
        if (localProfile) {
            setLocalProfile({ ...localProfile, [field]: value });
        }
    };

    const handleEmailChange = (index: number, value: string) => {
        if (localProfile) {
            const newEmails = [...localProfile.emails];
            newEmails[index].address = value;
            handleFieldChange('emails', newEmails);
        }
    };

    const addEmail = () => {
        if (localProfile) {
            handleFieldChange('emails', [...localProfile.emails, { address: '', verified: false }]);
        }
    };

    const removeEmail = (index: number) => {
        if (localProfile) {
            handleFieldChange('emails', localProfile.emails.filter((_, i) => i !== index));
        }
    };

    const handleCancel = () => {
        setLocalProfile(originalProfile);
        setIsEditing(false);
    };

    const handleSave = async (dataToSave: Partial<UserProfile>) => {
        if (!user) return false;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch(`/api/profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify(dataToSave)
            });

            if (response.ok) {
                const savedData = await response.json();
                setUserProfile(savedData);
                const savedCopy = JSON.parse(JSON.stringify(savedData));
                setLocalProfile(savedCopy);
                setOriginalProfile(savedCopy);
                
                if(Object.keys(dataToSave).length > 1) { 
                    toast({ title: "Success", description: "Your profile has been updated." });
                }
                return true;
            } else {
                throw new Error("Failed to save profile.");
            }
        } catch (error) {
            console.error("Failed to save profile:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving your profile." });
            return false;
        } finally {
            setIsProcessing(false);
        }
    };
    
    const onSaveClick = async () => {
        if (!localProfile) return;
        const success = await handleSave({
            name: localProfile.name,
            emails: localProfile.emails,
        });
        if (success) {
            setIsEditing(false);
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handlePhotoUpload(file);
        }
    };

    const handlePhotoUpload = async (file: File) => {
        if (!user) return;
        setIsUploading(true);
        try {
            const idToken = await user.getIdToken();
            const formData = new FormData();
            formData.append('file', file);

            const uploadResponse = await fetch('/api/storage/upload', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${idToken}`
                },
                body: formData
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload image.');
            }

            const { url } = await uploadResponse.json();
            
            const saved = await handleSave({ photoURL: url });

            if (saved) {
                 toast({ title: "Success", description: "Your profile picture has been updated." });
            } else {
                throw new Error("Failed to save new profile picture URL.");
            }

        } catch (error) {
            console.error("Failed to upload photo:", error);
            toast({ variant: "destructive", title: "Error", description: "Could not update your profile picture." });
        } finally {
            setIsUploading(false);
        }
    };

    const hasData = localProfile && (localProfile.name || localProfile.phoneNumber || (localProfile.emails && localProfile.emails.length > 0));

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                 <div className="flex justify-between items-start">
                    <div className="flex-1 space-y-1.5">
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Manage your personal details.</CardDescription>
                    </div>
                    <div className="relative">
                        <Avatar className="h-20 w-20 border-2">
                             <AvatarImage src={localProfile?.photoURL} alt={localProfile?.name} />
                             <AvatarFallback>
                                 <UserIcon className="h-10 w-10 text-muted-foreground" />
                             </AvatarFallback>
                        </Avatar>
                        <Button
                            size="icon"
                            className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            aria-label="Change profile picture"
                        >
                            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                        </Button>
                        <Input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileSelect} 
                            className="hidden" 
                            accept="image/png, image/jpeg, image/gif"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                     <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-5 w-1/2" />
                        <Skeleton className="h-5 w-2/3" />
                    </div>
                ) : error ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>{error}</p>
                    </div>
                ) : isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" value={localProfile?.name || ''} onChange={(e) => handleFieldChange('name', e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label>Phone Number</Label>
                            <Input value={localProfile?.phoneNumber || ''} disabled />
                        </div>
                        <div className="space-y-2">
                            <Label>Email Addresses</Label>
                            {localProfile?.emails.map((email, index) => (
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
                ) : hasData ? (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <UserIcon className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Full Name</p>
                                <p className="font-semibold">{localProfile?.name || 'Not set'}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Phone className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Phone Number</p>
                                <p className="font-semibold">{localProfile?.phoneNumber}</p>
                            </div>
                        </div>
                        <div>
                             <div className="flex items-center gap-4 mb-3">
                                <Mail className="h-6 w-6 text-muted-foreground" />
                                <p className="font-semibold text-sm text-muted-foreground">Email Addresses</p>
                            </div>
                            <div className="pl-10">
                                {localProfile?.emails && localProfile.emails.length > 0 ? (
                                    localProfile.emails.map((email, index) => (
                                        <p key={index} className="font-semibold">{email.address}</p>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground">No email addresses added.</p>
                                )}
                            </div>
                        </div>
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Profile
                        </Button>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No profile information available.</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>Add your details</Button>
                    </div>
                )}
            </CardContent>
            {isEditing && (
                 <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel} disabled={isProcessing}>Cancel</Button>
                    <Button onClick={onSaveClick} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}


"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, Star, Clock, Edit, Loader2, PlusCircle, Trash2, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ProfessionData = {
    title: string;
    industry: string;
    yearsOfExperience: number;
    skills: string[];
};

const initialData: ProfessionData = {
    title: "",
    industry: "",
    yearsOfExperience: 0,
    skills: [],
};

export function ProfessionCard() {
    const [user, setUser] = useState<User | null>(null);
    const [professionData, setProfessionData] = useState<ProfessionData>(initialData);
    const [originalData, setOriginalData] = useState<ProfessionData>(initialData);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [newSkill, setNewSkill] = useState("");
    const { toast } = useToast();

    const fetchProfessionData = useCallback(async (currentUser: User) => {
        setLoading(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/professions', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setProfessionData(data);
                setOriginalData(data);
            } else {
                throw new Error("Service not available");
            }
        } catch (error) {
            console.error("Failed to fetch profession data:", error);
            setError("Could not load professional information.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                fetchProfessionData(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchProfessionData]);

    const handleFieldChange = (field: keyof ProfessionData, value: string | number | string[]) => {
        setProfessionData(prev => ({ ...prev, [field]: value }));
    };

    const handleAddSkill = () => {
        if (newSkill && !professionData.skills.includes(newSkill)) {
            handleFieldChange('skills', [...professionData.skills, newSkill]);
            setNewSkill("");
        }
    };

    const handleRemoveSkill = (skillToRemove: string) => {
        handleFieldChange('skills', professionData.skills.filter(skill => skill !== skillToRemove));
    };

    const handleCancel = () => {
        setProfessionData(originalData);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/professions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify(professionData)
            });

            if (response.ok) {
                const savedData = await response.json();
                setProfessionData(savedData);
                setOriginalData(savedData);
                setIsEditing(false);
                toast({ title: "Success", description: "Your professional information has been saved." });
            } else {
                throw new Error("Failed to save data.");
            }
        } catch (error) {
            console.error("Failed to save profession data:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving." });
        } finally {
            setIsProcessing(false);
        }
    };

    const hasData = professionData && (professionData.title || professionData.industry || professionData.yearsOfExperience > 0 || professionData.skills.length > 0);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Professional Information</CardTitle>
                        <CardDescription>Your career details and expertise.</CardDescription>
                    </div>
                    {!isEditing && !loading && !error && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {loading ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Skeleton className="h-8 w-8" />
                            <Skeleton className="h-6 w-1/2" />
                        </div>
                        <div className="flex items-center gap-4">
                             <Skeleton className="h-8 w-8" />
                             <Skeleton className="h-6 w-1/3" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-24" />
                            <Skeleton className="h-6 w-16" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>{error}</p>
                    </div>
                ) : isEditing ? (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input id="title" value={professionData.title} onChange={(e) => handleFieldChange('title', e.target.value)} placeholder="e.g., Dental Hygienist" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="industry">Industry</Label>
                            <Input id="industry" value={professionData.industry} onChange={(e) => handleFieldChange('industry', e.target.value)} placeholder="e.g., Healthcare" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="experience">Years of Experience</Label>
                            <Input id="experience" type="number" value={professionData.yearsOfExperience} onChange={(e) => handleFieldChange('yearsOfExperience', parseInt(e.target.value, 10) || 0)} placeholder="e.g., 8" />
                        </div>
                        <div className="space-y-2">
                            <Label>Skills</Label>
                            <div className="flex flex-wrap gap-2">
                                {professionData.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                                        {skill}
                                        <button onClick={() => handleRemoveSkill(skill)} className="rounded-full hover:bg-destructive/20 p-0.5">
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Input value={newSkill} onChange={(e) => setNewSkill(e.target.value)} placeholder="Add a new skill" 
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSkill();}}}/>
                                <Button type="button" onClick={handleAddSkill}><PlusCircle className="h-4 w-4" /></Button>
                            </div>
                        </div>
                    </div>
                ) : hasData ? (
                    <>
                        <div className="flex items-center gap-4">
                            <Briefcase className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Title</p>
                                <p className="font-semibold">{professionData.title}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <Building className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Industry</p>
                                <p className="font-semibold">{professionData.industry}</p>
                            </div>
                        </div>
                         <div className="flex items-center gap-4">
                            <Clock className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="text-sm text-muted-foreground">Years of Experience</p>
                                <p className="font-semibold">{professionData.yearsOfExperience}</p>
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-3">
                                <Star className="h-6 w-6 text-muted-foreground" />
                                <p className="text-sm font-semibold text-muted-foreground">Skills</p>
                            </div>
                            {professionData.skills.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {professionData.skills.map((skill) => (
                                        <Badge key={skill} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground pl-10">No skills added yet.</p>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No professional information added yet.</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>Add your profession details</Button>
                    </div>
                )}
            </CardContent>
            {isEditing && (
                <CardFooter className="flex justify-end gap-2">
                    <Button variant="ghost" onClick={handleCancel}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isProcessing}>
                        {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
}

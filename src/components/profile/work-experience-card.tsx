"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Building, Briefcase, Calendar, Edit, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO } from 'date-fns';

type WorkExperience = {
    id?: string;
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    description: string;
};

export function WorkExperienceCard() {
    const [user, setUser] = useState<User | null>(null);
    const [experiences, setExperiences] = useState<WorkExperience[]>([]);
    const [originalExperiences, setOriginalExperiences] = useState<WorkExperience[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const fetchExperiences = useCallback(async (currentUser: User) => {
        setLoading(true);
        setError(null);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/work-experiences', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data: WorkExperience[] = await response.json();
                setExperiences(data);
                setOriginalExperiences(JSON.parse(JSON.stringify(data)));
            } else {
                throw new Error("Service not available");
            }
        } catch (error) {
            console.error("Failed to fetch work experiences:", error);
            setError("Could not load work experiences.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchExperiences(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchExperiences]);

    const handleFieldChange = (index: number, field: keyof WorkExperience, value: string) => {
        const updatedExperiences = [...experiences];
        updatedExperiences[index] = { ...updatedExperiences[index], [field]: value };
        setExperiences(updatedExperiences);
    };

    const addExperienceEntry = () => {
        setExperiences([...experiences, { company: "", title: "", startDate: "", description: "" }]);
    };

    const removeExperienceEntry = (index: number) => {
        setExperiences(experiences.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        setExperiences(originalExperiences);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/work-experiences', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ workExperiences: experiences })
            });

            if (response.ok) {
                const savedData = await response.json();
                setExperiences(savedData);
                setOriginalExperiences(JSON.parse(JSON.stringify(savedData)));
                setIsEditing(false);
                toast({ title: "Success", description: "Your work experience has been saved." });
            } else {
                throw new Error("Failed to save data.");
            }
        } catch (error) {
            console.error("Failed to save work experience:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving." });
        } finally {
            setIsProcessing(false);
        }
    };
    
    const formatDateRange = (startDate: string, endDate?: string) => {
        if (!startDate) return '';
        const start = format(parseISO(startDate), "MMM yyyy");
        const end = endDate ? format(parseISO(endDate), "MMM yyyy") : 'Present';
        return `${start} - ${end}`;
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Work Experience</CardTitle>
                        <CardDescription>Your professional work history.</CardDescription>
                    </div>
                    {!isEditing && !loading && !error && (
                        <Button variant="ghost" size="icon" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-3/4" />
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                        </div>
                        <Separator/>
                         <div className="space-y-2">
                           <Skeleton className="h-5 w-4/5" />
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                        </div>
                    </div>
                ) : error ? (
                    <div className="text-center text-muted-foreground py-8">
                        <p>{error}</p>
                    </div>
                ) : isEditing ? (
                    <div className="space-y-6">
                        {experiences.map((exp, index) => (
                            <div key={exp.id || index} className="space-y-4 p-4 border rounded-lg relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeExperienceEntry(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor={`company-${index}`}>Company</Label>
                                    <Input id={`company-${index}`} value={exp.company} onChange={(e) => handleFieldChange(index, 'company', e.target.value)} placeholder="e.g., SmileWell Dental Clinic" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`title-${index}`}>Title</Label>
                                    <Input id={`title-${index}`} value={exp.title} onChange={(e) => handleFieldChange(index, 'title', e.target.value)} placeholder="e.g., Lead Dental Hygienist" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`startDate-${index}`}>Start Date</Label>
                                        <Input id={`startDate-${index}`} type="date" value={exp.startDate || ''} onChange={(e) => handleFieldChange(index, 'startDate', e.target.value)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`endDate-${index}`}>End Date (optional)</Label>
                                        <Input id={`endDate-${index}`} type="date" value={exp.endDate || ''} onChange={(e) => handleFieldChange(index, 'endDate', e.target.value)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`description-${index}`}>Description</Label>
                                    <Textarea id={`description-${index}`} value={exp.description} onChange={(e) => handleFieldChange(index, 'description', e.target.value)} placeholder="Describe your responsibilities and achievements." />
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addExperienceEntry}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Experience
                        </Button>
                    </div>
                ) : experiences.length > 0 ? (
                    <div className="space-y-6">
                        {experiences.map((exp, index) => (
                            <div key={exp.id}>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-primary">{exp.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Building className="h-4 w-4 flex-shrink-0" />
                                        <span>{exp.company}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                        <span>{formatDateRange(exp.startDate, exp.endDate)}</span>
                                    </div>
                                    {exp.description && (
                                        <p className="text-sm pt-2">{exp.description}</p>
                                    )}
                                </div>
                                {index < experiences.length - 1 && <Separator className="my-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                         { !error && (
                            <>
                                <p>No work experience added yet.</p>
                                <Button variant="link" onClick={() => setIsEditing(true)}>
                                    Add your work experience
                                </Button>
                            </>
                        )}
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

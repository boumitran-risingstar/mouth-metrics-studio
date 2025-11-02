
"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, School, Calendar, BookOpen, PlusCircle, Trash2, Loader2, Edit, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type EducationData = {
    degree: string;
    institution: string;
    graduationYear: string; // Use string for input field
    fieldOfStudy: string;
};

export function EducationCard() {
    const [user, setUser] = useState<User | null>(null);
    const [educationHistory, setEducationHistory] = useState<EducationData[]>([]);
    const [originalEducationHistory, setOriginalEducationHistory] = useState<EducationData[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const fetchEducationData = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/educations', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                const educations = data.map((edu: any) => ({...edu, graduationYear: String(edu.graduationYear)}));
                setEducationHistory(educations);
                setOriginalEducationHistory(JSON.parse(JSON.stringify(educations))); // Deep copy
            } else {
                console.error("Failed to fetch education data.");
            }
        } catch (error) {
            console.error("Failed to fetch education data:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchEducationData(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchEducationData]);

    const handleFieldChange = (index: number, field: keyof EducationData, value: string) => {
        const updatedHistory = [...educationHistory];
        updatedHistory[index] = { ...updatedHistory[index], [field]: value };
        setEducationHistory(updatedHistory);
    };

    const addEducationEntry = () => {
        setEducationHistory([...educationHistory, { degree: "", institution: "", graduationYear: "", fieldOfStudy: "" }]);
    };

    const removeEducationEntry = (index: number) => {
        setEducationHistory(educationHistory.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        setEducationHistory(originalEducationHistory);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/educations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ educations: educationHistory.map(edu => ({...edu, graduationYear: parseInt(edu.graduationYear, 10) || 0 })) })
            });

            if (response.ok) {
                const savedData = await response.json();
                const educations = savedData.map((edu: any) => ({...edu, graduationYear: String(edu.graduationYear)}));
                setEducationHistory(educations);
                setOriginalEducationHistory(JSON.parse(JSON.stringify(educations)));
                setIsEditing(false);
                toast({ title: "Success", description: "Your educational qualifications have been saved." });
            } else {
                throw new Error("Failed to save data.");
            }
        } catch (error) {
            console.error("Failed to save education data:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving your qualifications." });
        } finally {
            setIsProcessing(false);
        }
    };
    
    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Educational Qualification</CardTitle>
                        <CardDescription>Your academic background and qualifications.</CardDescription>
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
                    <div className="space-y-6">
                        <div className="space-y-2">
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-1/4" />
                        </div>
                        <Separator/>
                         <div className="space-y-2">
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                ) : isEditing ? (
                     <div className="space-y-6">
                        {educationHistory.map((edu, index) => (
                            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeEducationEntry(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor={`degree-${index}`}>Degree</Label>
                                    <Input id={`degree-${index}`} value={edu.degree} onChange={(e) => handleFieldChange(index, 'degree', e.target.value)} placeholder="e.g., Doctor of Dental Surgery (DDS)" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`institution-${index}`}>Institution</Label>
                                    <Input id={`institution-${index}`} value={edu.institution} onChange={(e) => handleFieldChange(index, 'institution', e.target.value)} placeholder="e.g., University of Smilewell" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor={`fieldOfStudy-${index}`}>Field of Study</Label>
                                        <Input id={`fieldOfStudy-${index}`} value={edu.fieldOfStudy} onChange={(e) => handleFieldChange(index, 'fieldOfStudy', e.target.value)} placeholder="e.g., Dentistry" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor={`graduationYear-${index}`}>Graduation Year</Label>
                                        <Input id={`graduationYear-${index}`} type="number" value={edu.graduationYear} onChange={(e) => handleFieldChange(index, 'graduationYear', e.target.value)} placeholder="e.g., 2018" />
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addEducationEntry}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Qualification
                        </Button>
                    </div>
                ) : educationHistory.length > 0 ? (
                    <div className="space-y-6">
                        {educationHistory.map((edu, index) => (
                            <div key={index}>
                                <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                        <GraduationCap className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                        <p className="font-semibold text-primary">{edu.degree}</p>
                                    </div>
                                    <div className="flex items-start gap-3 pl-8">
                                        <School className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                        <p>{edu.institution}</p>
                                    </div>
                                    <div className="flex items-start gap-3 pl-8">
                                        <BookOpen className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                        <p>{edu.fieldOfStudy}</p>
                                    </div>
                                    <div className="flex items-start gap-3 pl-8">
                                        <Calendar className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                                        <p>Graduated: {edu.graduationYear}</p>
                                    </div>
                                </div>
                                {index < educationHistory.length - 1 && <Separator className="my-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No educational information added yet.</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>Add your qualifications</Button>
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

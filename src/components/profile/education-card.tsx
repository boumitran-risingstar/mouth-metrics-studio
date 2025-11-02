"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { GraduationCap, School, Calendar, BookOpen } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type EducationData = {
    degree: string;
    institution: string;
    graduationYear: number;
    fieldOfStudy: string;
};

export function EducationCard() {
    const [user, setUser] = useState<User | null>(null);
    const [educationHistory, setEducationHistory] = useState<EducationData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const idToken = await currentUser.getIdToken();
                    const response = await fetch('/api/educations', {
                        headers: { Authorization: `Bearer ${idToken}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setEducationHistory(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch education data:", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Educational Qualification</CardTitle>
                <CardDescription>
                    Your academic background and qualifications.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
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
                    <p className="text-muted-foreground">No educational information available.</p>
                )}
            </CardContent>
        </Card>
    );
}

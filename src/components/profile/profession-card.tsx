
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, Clock, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ProfessionData = {
    title: string;
    industry: string;
    yearsOfExperience: number;
    skills: string[];
};

export function ProfessionCard() {
    const [user, setUser] = useState<User | null>(null);
    const [profession, setProfession] = useState<ProfessionData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const idToken = await currentUser.getIdToken();
                    const response = await fetch('/api/professions', {
                        headers: { Authorization: `Bearer ${idToken}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setProfession(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch profession data:", error);
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
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                    Your professional background and skills.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-6 w-3/4" />
                        <Skeleton className="h-6 w-1/2" />
                        <Skeleton className="h-6 w-1/3" />
                        <div className="flex flex-wrap gap-2 pt-2">
                            <Skeleton className="h-6 w-20 rounded-full" />
                            <Skeleton className="h-6 w-24 rounded-full" />
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </div>
                    </div>
                ) : profession ? (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <Briefcase className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Title:</span> {profession.title}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Industry:</span> {profession.industry}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-muted-foreground" />
                            <p><span className="font-semibold">Experience:</span> {profession.yearsOfExperience} years</p>
                        </div>
                        <div className="flex items-start gap-3 pt-2">
                             <Wrench className="h-5 w-5 text-muted-foreground mt-1" />
                            <div>
                                <p className="font-semibold mb-2">Skills:</p>
                                <div className="flex flex-wrap gap-2">
                                    {profession.skills.map((skill, index) => (
                                        <Badge key={index} variant="secondary">{skill}</Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <p className="text-muted-foreground">No professional information available.</p>
                )}
            </CardContent>
        </Card>
    );
}

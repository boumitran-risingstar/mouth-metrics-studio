
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Briefcase, Building, Star, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type ProfessionData = {
    title: string;
    industry: string;
    yearsOfExperience: number;
    skills: string[];
};

export function ProfessionCard() {
    const [user, setUser] = useState<User | null>(null);
    const [professionData, setProfessionData] = useState<ProfessionData | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

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
                        setProfessionData(data);
                    } else {
                        toast({ variant: "destructive", title: "Error", description: "Failed to fetch profession data." });
                    }
                } catch (error) {
                    console.error("Failed to fetch profession data:", error);
                    toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your profession data." });
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [toast]);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle>Professional Information</CardTitle>
                <CardDescription>
                Your career details and expertise.
                </CardDescription>
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
                ) : professionData ? (
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
                                <p className="text-sm text-muted-foreground">Skills</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {professionData.skills.map((skill) => (
                                    <Badge key={skill} variant="secondary">{skill}</Badge>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-center text-muted-foreground">No professional information available.</p>
                )}
            </CardContent>
        </Card>
    );
}

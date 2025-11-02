
"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, Link as LinkIcon, Edit } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format } from 'date-fns';

type Article = {
    id: string;
    title: string;
    publication: string;
    publicationDate: string;
    url: string;
};

export function ArticlesCard() {
    const [user, setUser] = useState<User | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchArticles = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/articles', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data = await response.json();
                setArticles(data);
            } else {
                toast({ variant: "destructive", title: "Error", description: "Failed to fetch articles." });
            }
        } catch (error) {
            console.error("Failed to fetch articles:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while fetching your articles." });
        } finally {
            setLoading(false);
        }
    }, [toast]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchArticles(currentUser);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [fetchArticles]);

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Articles & Publications</CardTitle>
                        <CardDescription>Your published works and articles.</CardDescription>
                    </div>
                    {/* Placeholder for future edit functionality */}
                    {!loading && (
                        <Button variant="ghost" size="icon" onClick={() => toast({ title: "Coming Soon!", description: "You'll be able to edit this soon." })}>
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
                ) : articles.length > 0 ? (
                    <div className="space-y-6">
                        {articles.map((article, index) => (
                            <div key={article.id}>
                                <div className="space-y-3">
                                    <h3 className="font-semibold text-primary">{article.title}</h3>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Newspaper className="h-4 w-4 flex-shrink-0" />
                                        <span>{article.publication}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                        <span>{format(new Date(article.publicationDate), "MMMM d, yyyy")}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <LinkIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                        <Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                            {article.url}
                                        </Link>
                                    </div>
                                </div>
                                {index < articles.length - 1 && <Separator className="my-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No articles or publications added yet.</p>
                        <Button variant="link" onClick={() => toast({ title: "Coming Soon!", description: "You'll be able to add articles soon." })}>
                            Add your publications
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

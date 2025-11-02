
"use client";

import { useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Newspaper, Calendar, Link as LinkIcon, Edit, PlusCircle, Trash2, Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { format, parseISO } from 'date-fns';

type Article = {
    id?: string;
    title: string;
    publication: string;
    publicationDate: string; // Storing as YYYY-MM-DD string for input
    url: string;
};

export function ArticlesCard() {
    const [user, setUser] = useState<User | null>(null);
    const [articles, setArticles] = useState<Article[]>([]);
    const [originalArticles, setOriginalArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { toast } = useToast();

    const fetchArticles = useCallback(async (currentUser: User) => {
        setLoading(true);
        try {
            const idToken = await currentUser.getIdToken();
            const response = await fetch('/api/articles', {
                headers: { Authorization: `Bearer ${idToken}` }
            });
            if (response.ok) {
                const data: Article[] = await response.json();
                setArticles(data);
                setOriginalArticles(JSON.parse(JSON.stringify(data)));
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

    const handleFieldChange = (index: number, field: keyof Article, value: string) => {
        const updatedArticles = [...articles];
        updatedArticles[index] = { ...updatedArticles[index], [field]: value };
        setArticles(updatedArticles);
    };

    const addArticleEntry = () => {
        setArticles([...articles, { title: "", publication: "", publicationDate: "", url: "" }]);
    };

    const removeArticleEntry = (index: number) => {
        setArticles(articles.filter((_, i) => i !== index));
    };

    const handleCancel = () => {
        setArticles(originalArticles);
        setIsEditing(false);
    };

    const handleSave = async () => {
        if (!user) return;
        setIsProcessing(true);
        try {
            const idToken = await user.getIdToken();
            const response = await fetch('/api/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ articles })
            });

            if (response.ok) {
                const savedData = await response.json();
                setArticles(savedData);
                setOriginalArticles(JSON.parse(JSON.stringify(savedData)));
                setIsEditing(false);
                toast({ title: "Success", description: "Your articles and publications have been saved." });
            } else {
                throw new Error("Failed to save data.");
            }
        } catch (error) {
            console.error("Failed to save articles:", error);
            toast({ variant: "destructive", title: "Error", description: "An error occurred while saving." });
        } finally {
            setIsProcessing(false);
        }
    };

    const isValidDate = (dateString: string) => {
        if (!dateString) return false;
        const date = parseISO(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    };

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader>
                <div className="flex justify-between items-center">
                    <div>
                        <CardTitle>Articles & Publications</CardTitle>
                        <CardDescription>Your published works and articles.</CardDescription>
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
                ) : isEditing ? (
                    <div className="space-y-6">
                        {articles.map((article, index) => (
                            <div key={index} className="space-y-4 p-4 border rounded-lg relative">
                                <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeArticleEntry(index)}>
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                                <div className="space-y-2">
                                    <Label htmlFor={`title-${index}`}>Title</Label>
                                    <Input id={`title-${index}`} value={article.title} onChange={(e) => handleFieldChange(index, 'title', e.target.value)} placeholder="e.g., Innovations in Cosmetic Dentistry" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`publication-${index}`}>Publication</Label>
                                    <Input id={`publication-${index}`} value={article.publication} onChange={(e) => handleFieldChange(index, 'publication', e.target.value)} placeholder="e.g., Journal of Dental Science" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`publicationDate-${index}`}>Publication Date</Label>
                                    <Input id={`publicationDate-${index}`} type="date" value={article.publicationDate || ''} onChange={(e) => handleFieldChange(index, 'publicationDate', e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor={`url-${index}`}>URL</Label>
                                    <Input id={`url-${index}`} type="url" value={article.url} onChange={(e) => handleFieldChange(index, 'url', e.target.value)} placeholder="https://example.com/article" />
                                </div>
                            </div>
                        ))}
                        <Button variant="outline" onClick={addArticleEntry}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Article
                        </Button>
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
                                    {isValidDate(article.publicationDate) && (
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                            <Calendar className="h-4 w-4 flex-shrink-0" />
                                            <span>{format(parseISO(article.publicationDate), "MMMM d, yyyy")}</span>
                                        </div>
                                    )}
                                    {article.url && (
                                        <div className="flex items-center gap-3 text-sm">
                                            <LinkIcon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                                            <Link href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-all">
                                                {article.url}
                                            </Link>
                                        </div>
                                    )}
                                </div>
                                {index < articles.length - 1 && <Separator className="my-6" />}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        <p>No articles or publications added yet.</p>
                        <Button variant="link" onClick={() => setIsEditing(true)}>
                            Add your publications
                        </Button>
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

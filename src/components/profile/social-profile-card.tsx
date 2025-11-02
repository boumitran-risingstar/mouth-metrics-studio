
"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Github, Linkedin, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// SVG Icon components for social media brands
const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
);
  
const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
);
  
const PinterestIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
        <path d="M12 4c-5 0-9 4-9 9 0 4.2 3 8 7 8 1 0 1.5-.5 1.5-1 0-.5-.5-1-.5-1.5-.5-.5-1-1-1-2 0-1.5 1.5-3 3-3 2 0 3.5 1.5 3.5 3.5 0 2.5-1.5 4.5-3.5 4.5-1 0-1.5-.5-1.5-1.5 0-1 .5-2 1-2.5C13 14 14 12 14 10.5c0-1.5-1-2.5-2.5-2.5S9 9 9 10.5c0 .5.5 1.5.5 2L8 16c-1-2-1.5-4-1.5-5.5 0-4 3.5-7.5 7.5-7.5s7.5 3.5 7.5 7.5c0 3-2 6-5 6-1 0-2-.5-2-1.5 0-.5.5-1 .5-1.5s.5-1.5.5-2c0-1-1.5-2-1.5-2s-1.5 1-1.5 2.5c0 2.5 2 4.5 4 4.5 3 0 5-3 5-6s-3-7-7-7z" />
    </svg>
);
  
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10C2.5 6 4.5 4 7 4h10c2.5 0 4.5 2 4.5 3.5v10c0 1.5-2 3.5-4.5 3.5H7c-2.5 0-4.5-2-4.5-3.5z" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
);

const iconMap: { [key: string]: React.ComponentType<React.SVGProps<SVGSVGElement>> } = {
    LinkedIn: Linkedin,
    Facebook: FacebookIcon,
    Instagram: InstagramIcon,
    X: XIcon,
    Pinterest: PinterestIcon,
    GitHub: Github,
    YouTube: YoutubeIcon,
};

type SocialPlatform = {
    name: string;
    connected: boolean;
};

export function SocialProfileCard() {
    const [user, setUser] = useState<User | null>(null);
    const [socials, setSocials] = useState<SocialPlatform[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                try {
                    const idToken = await currentUser.getIdToken();
                    const response = await fetch('/api/social-profiles', {
                        headers: { Authorization: `Bearer ${idToken}` }
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setSocials(data);
                    }
                } catch (error) {
                    console.error("Failed to fetch social profiles:", error);
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
                <CardTitle>Social Media Connect</CardTitle>
                <CardDescription>
                Connect your social media accounts to complete your profile.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                {loading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                           <div className="flex items-center gap-3">
                             <Skeleton className="h-6 w-6 rounded-full" />
                             <Skeleton className="h-4 w-24" />
                           </div>
                           <Skeleton className="h-8 w-[100px]" />
                        </div>
                    ))
                ) : (
                    socials.map((platform) => {
                        const platformNameForIcon = platform.name === "X (Twitter)" ? "X" : platform.name;
                        const Icon = iconMap[platformNameForIcon];
                        return (
                        <div
                            key={platform.name}
                            className="flex items-center justify-between p-3 border rounded-lg"
                        >
                            <div className="flex items-center gap-3">
                            {Icon && <Icon className="h-6 w-6" />}
                            <span className="font-medium">{platform.name}</span>
                            </div>
                            <Button
                            variant={platform.connected ? "secondary" : "default"}
                            size="sm"
                            >
                            {platform.connected ? "Disconnect" : "Connect"}
                            </Button>
                        </div>
                        );
                    })
                )}
                </div>
            </CardContent>
        </Card>
    );
}

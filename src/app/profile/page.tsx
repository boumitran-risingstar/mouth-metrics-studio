"use client";

import { useEffect, useState, useCallback } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { SocialProfileCard } from '@/components/profile/social-profile-card';
import { EducationCard } from '@/components/profile/education-card';
import { ProfessionCard } from '@/components/profile/profession-card';
import { ArticlesCard } from '@/components/profile/articles-card';
import { ProfileInformationCard } from '@/components/profile/profile-information-card';
import { WorkExperienceCard } from '@/components/profile/work-experience-card';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);


  if (loading) {
    return (
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
            <Loader2 className="h-16 w-16 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <ProfileInformationCard />
      <ProfessionCard />
      <WorkExperienceCard />
      <EducationCard />
      <ArticlesCard />
      <SocialProfileCard />
    </div>
  );
}

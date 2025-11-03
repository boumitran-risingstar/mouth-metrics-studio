
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export type UserProfile = {
    id: string;
    name: string;
    phoneNumber: string;
    emails: { address: string; verified: boolean }[];
    photoURL?: string;
};

interface UserProfileContextType {
    user: User | null;
    userProfile: UserProfile | null;
    setUserProfile: (profile: UserProfile | null) => void;
    loading: boolean;
    error: string | null;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                if (!userProfile || userProfile.id !== currentUser.uid) {
                    setLoading(true);
                    try {
                        const idToken = await currentUser.getIdToken();
                        const response = await fetch(`/api/profile/${currentUser.uid}`, {
                            headers: { Authorization: `Bearer ${idToken}` }
                        });
                        if (response.ok) {
                            const data = await response.json();
                            setUserProfile(data);
                        } else {
                            throw new Error("Failed to fetch user profile");
                        }
                    } catch (err: any) {
                        setError(err.message || "Could not load profile information.");
                        console.error("Error fetching user profile:", err);
                    } finally {
                        setLoading(false);
                    }
                } else {
                     setLoading(false);
                }
            } else {
                setUser(null);
                setUserProfile(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        userProfile,
        setUserProfile,
        loading,
        error
    };

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
};

export const useUserProfile = () => {
    const context = useContext(UserProfileContext);
    if (context === undefined) {
        throw new Error('useUserProfile must be used within a UserProfileProvider');
    }
    return context;
};

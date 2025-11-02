
"use client";

import { useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

type Business = {
  id: string;
  name: string;
  address: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loadingBusinesses, setLoadingBusinesses] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [newBusinessAddress, setNewBusinessAddress] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await fetchBusinesses(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const fetchBusinesses = async (currentUser: User) => {
    setLoadingBusinesses(true);
    try {
      const idToken = await currentUser.getIdToken();
      const response = await fetch('/api/businesses', {
        headers: {
          'Authorization': `Bearer ${idToken}`,
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch businesses');
      }
      const data = await response.json();
      setBusinesses(data);
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not load your businesses.",
      });
    } finally {
      setLoadingBusinesses(false);
    }
  };

  const handleCreateBusiness = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newBusinessName || !newBusinessAddress) return;

    setIsCreating(true);
    try {
      const idToken = await user.getIdToken();
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ name: newBusinessName, address: newBusinessAddress }),
      });

      if (!response.ok) {
        throw new Error('Failed to create business');
      }
      
      // Reset form and close dialog
      setNewBusinessName('');
      setNewBusinessAddress('');
      setIsDialogOpen(false);

      toast({
        title: "Success!",
        description: "Your new business has been created.",
      });

      // Refresh the list of businesses
      await fetchBusinesses(user);

    } catch (error) {
      console.error(error);
       toast({
        variant: "destructive",
        title: "Error",
        description: "Could not create your business. Please try again.",
      });
    } finally {
        setIsCreating(false);
    }
  };

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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold font-headline">Dashboard</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
             <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Business
             </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create a New Business</DialogTitle>
              <DialogDescription>
                Fill in the details for your new business profile.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBusiness}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., SmileWell Dental"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">
                    Address
                  </Label>
                  <Input
                    id="address"
                    value={newBusinessAddress}
                    onChange={(e) => setNewBusinessAddress(e.target.value)}
                    className="col-span-3"
                    placeholder="e.g., 123 Main St, Anytown, USA"
                    required
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCreating ? 'Creating...' : 'Create Business'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {loadingBusinesses ? (
        <div className="flex items-center justify-center pt-20">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      ) : businesses.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Building className="h-6 w-6 text-primary" />
                  {business.name}
                </CardTitle>
                <CardDescription>{business.address}</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Future content can go here */}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 border-2 border-dashed rounded-lg">
          <Building className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No businesses found</h3>
          <p className="mt-1 text-sm text-muted-foreground">Get started by creating your first business profile.</p>
          <div className="mt-6">
             <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Business
             </Button>
          </div>
        </div>
      )}
    </div>
  );
}

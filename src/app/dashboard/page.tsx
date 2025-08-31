"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User as UserIcon, Mail, BrainCircuit, Loader2 } from "lucide-react";
import { analyzeUserProfile, AnalyzeUserProfileOutput } from "@/ai/flows/analyze-user-profile";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [interests, setInterests] = useState<AnalyzeUserProfileOutput | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      const getInterests = async () => {
        setIsAnalyzing(true);
        try {
          const result = await analyzeUserProfile({
            displayName: user.displayName || 'Anonymous',
            email: user.email || '',
            otherDetails: `User since ${user.metadata.creationTime}`,
          });
          setInterests(result);
        } catch (error) {
          console.error("Failed to analyze user profile:", error);
          setInterests({ primaryInterests: "Could not determine interests." });
        } finally {
          setIsAnalyzing(false);
        }
      };
      getInterests();
    }
  }, [user]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-10 flex items-center justify-between p-4 bg-card border-b">
        <h1 className="text-2xl font-bold text-primary">AuthZen Dashboard</h1>
        <Button onClick={logout} variant="ghost">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </header>
      <main className="flex-grow p-4 md:p-8">
        <div className="max-w-4xl mx-auto grid gap-8">
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary">
                  <AvatarImage src={user.photoURL || ''} alt={user.displayName || 'User'} />
                  <AvatarFallback className="text-2xl bg-primary/20 text-primary font-semibold">
                    {user.displayName ? getInitials(user.displayName) : <UserIcon />}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-3xl font-headline">{user.displayName || 'Welcome!'}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <Mail className="h-4 w-4" />
                    {user.email}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Primary Interests</CardTitle>
                        <BrainCircuit className="h-4 w-4 text-muted-foreground ml-auto" />
                    </CardHeader>
                    <CardContent>
                    {isAnalyzing ? (
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                      </div>
                    ) : (
                      <p className="text-lg font-semibold text-primary">
                        {interests?.primaryInterests || "No interests found."}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                        AI-generated based on your profile.
                    </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold text-green-600">Active</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Joined on {new Date(user.metadata.creationTime!).toLocaleDateString()}
                        </p>
                    </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

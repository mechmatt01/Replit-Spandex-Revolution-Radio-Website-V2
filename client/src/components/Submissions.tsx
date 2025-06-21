import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Lock, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import type { Submission, InsertSubmission } from "@shared/schema";

export default function Submissions() {
  const [formData, setFormData] = useState<InsertSubmission>({
    songTitle: "",
    artistName: "",
    albumTitle: "",
    releaseYear: undefined,
    submitterName: "",
    message: "",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: recentSubmissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Submission Successful!",
        description: "Your song request has been submitted for review.",
      });
      setFormData({
        songTitle: "",
        artistName: "",
        albumTitle: "",
        releaseYear: undefined,
        submitterName: "",
        message: "",
      });
      setAgreedToTerms(false);
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: () => {
      toast({
        title: "Submission Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      toast({
        title: "Terms Required",
        description: "Please agree to the terms and conditions.",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertSubmission, value: string | number | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Handle unauthorized errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in with a paid subscription to submit song requests.",
        variant: "destructive",
      });
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user has paid subscription (assuming stripeSubscriptionId indicates paid status)
  const hasPaidSubscription = user?.stripeSubscriptionId || false;

  return (
    <section id="submissions" className="py-20 bg-dark-bg">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-bold text-3xl md:text-4xl mb-4 text-black dark:text-white">
            SUBMIT YOUR REQUESTS
          </h2>
          <p className="text-gray-400 text-lg">
            Got a metal track that needs to be heard? Submit your requests and help shape our playlist.
          </p>
          {!isAuthenticated && (
            <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <div className="flex items-center justify-center gap-2 text-orange-400">
                <Crown className="h-5 w-5" />
                <span className="font-semibold">Premium Feature - Paid Subscription Required</span>
              </div>
            </div>
          )}
        </div>

        {!isAuthenticated || !hasPaidSubscription ? (
          <Card className="bg-dark-surface border-dark-border mb-12">
            <CardContent className="p-8 text-center">
              <Lock className="h-16 w-16 text-orange-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Premium Feature</h3>
              <p className="text-gray-400 mb-6">
                Song submissions are available exclusively to paid subscribers. 
                Sign in and upgrade to submit your favorite tracks.
              </p>
              <Button 
                onClick={() => window.location.href = '/api/login'}
                className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full font-semibold mr-4"
              >
                Sign In
              </Button>
              <Button 
                onClick={() => document.getElementById('subscribe')?.scrollIntoView({ behavior: 'smooth' })}
                variant="outline"
                className="border-orange-500 text-orange-400 hover:bg-orange-500/10 px-6 py-3 rounded-full font-semibold"
              >
                View Subscriptions
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-dark-surface border-dark-border mb-12">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="songTitle" className="text-gray-300 font-semibold">Song Title *</Label>
                  <Input
                    id="songTitle"
                    value={formData.songTitle}
                    onChange={(e) => handleInputChange("songTitle", e.target.value)}
                    placeholder="Enter song title"
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                  />
                </div>
                <div>
                  <Label htmlFor="artistName" className="text-gray-300 font-semibold">Artist/Band *</Label>
                  <Input
                    id="artistName"
                    value={formData.artistName}
                    onChange={(e) => handleInputChange("artistName", e.target.value)}
                    placeholder="Enter artist name"
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                  />
                </div>
              </div>



              <div>
                <Label htmlFor="submitterName" className="text-gray-300 font-semibold">Your Name</Label>
                <Input
                  id="submitterName"
                  value={formData.submitterName || ""}
                  onChange={(e) => handleInputChange("submitterName", e.target.value)}
                  placeholder="Enter your name (optional)"
                  className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                />
              </div>

              <div>
                <Label htmlFor="message" className="text-gray-300 font-semibold">Additional Message</Label>
                <Textarea
                  id="message"
                  value={formData.message || ""}
                  onChange={(e) => handleInputChange("message", e.target.value)}
                  placeholder="Tell us why this song rocks or share any additional details..."
                  rows={4}
                  className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange resize-none"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={setAgreedToTerms}
                  className="border-dark-border"
                />
                <Label htmlFor="terms" className="text-gray-400 text-sm">
                  I agree that this submission follows metal music guidelines and community standards.
                </Label>
              </div>

              <Button
                type="submit"
                disabled={submitMutation.isPending}
                className="w-full md:w-auto bg-metal-orange hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 animate-glow"
              >
                <Send className="mr-2 h-4 w-4" />
                {submitMutation.isPending ? "SUBMITTING..." : "SUBMIT REQUEST"}
              </Button>
            </form>
          </CardContent>
        </Card>
        )}

        {/* Recent Submissions */}
        <div>
          <h3 className="font-bold text-xl mb-6 text-metal-gold">Recent Submissions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentSubmissions.slice(0, 4).map((submission) => (
              <Card key={submission.id} className="bg-dark-surface border-dark-border">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold">{submission.songTitle}</h4>
                      <p className="text-gray-400 text-sm">{submission.artistName}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded ${
                      submission.status === "approved" ? "text-metal-orange bg-metal-orange/20" :
                      submission.status === "rejected" ? "text-metal-red bg-metal-red/20" :
                      "text-metal-gold bg-metal-gold/20"
                    }`}>
                      {submission.status === "approved" ? "Approved" :
                       submission.status === "rejected" ? "Rejected" :
                       "Pending"}
                    </span>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {submission.submitterName ? `Submitted by: ${submission.submitterName}` : "Anonymous"}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {submission.createdAt ? formatDate(submission.createdAt) : "Recently"}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

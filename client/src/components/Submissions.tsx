import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, Lock, Crown } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Checkbox } from "../components/ui/checkbox";
import { useToast } from "../hooks/use-toast";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { usePremiumTest } from "../contexts/PremiumTestContext";
import { isUnauthorizedError } from "../lib/authUtils";
import { apiRequest } from "../lib/queryClient";
import type { Submission, InsertSubmission } from "@shared/schema";
import LiveChat from "../components/LiveChat";

export default function Submissions() {
  const [formData, setFormData] = useState<InsertSubmission>({
    name: "",
    email: "",
    songTitle: "",
    artist: "",
    genre: "",
    message: "",
    status: "pending",
  });
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useFirebaseAuth();
  const { getColors, currentTheme } = useTheme();
  const colors = getColors();

  const { data: recentSubmissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
  });

  const submitMutation = useMutation({
    mutationFn: async (data: InsertSubmission) => {
      // Check for premium subscription before submission
      if (!isAuthenticated) {
        window.location.href = "/#/login";
        return;
      }

      if (!hasPaidSubscription) {
        setShowPremiumNotification(true);
        return;
      }

      const response = await apiRequest("POST", "/api/submissions", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Submission Successful!",
        description: "Your song request has been submitted for review.",
      });
      setFormData({
        name: "",
        email: "",
        songTitle: "",
        artist: "",
        genre: "",
        message: "",
        status: "pending",
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

  const handleInputChange = (
    field: keyof InsertSubmission,
    value: string | number | undefined,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // State for premium notification
  const [showPremiumNotification, setShowPremiumNotification] = useState(false);

  // Check if user has paid subscription (uses Stripe + test override)
  const { getEffectivePremiumStatus } = usePremiumTest();
  const hasPaidSubscription = getEffectivePremiumStatus();

  // Check if user is in a band (from Firebase profile)
  const [userInBand, setUserInBand] = useState(false);
  
  useEffect(() => {
    if (isAuthenticated && user) {
      // In a real app, fetch from Firebase: user's "inBand" boolean field
      // For now, assume it's true for authenticated users (placeholder)
      setUserInBand(true); // TODO: Fetch actual inBand status from Firebase
    } else {
      setUserInBand(false);
    }
  }, [isAuthenticated, user]);

  // Show submission form only if logged in AND in a band AND has subscription
  const canShowForm = isAuthenticated && userInBand && hasPaidSubscription;

  return (
    <section 
      id="submissions" 
      className="py-20 transition-colors duration-300"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Show form only if user meets all criteria */}
        {!isAuthenticated ? (
          <div className="text-center py-12">
            <h2 className="font-orbitron text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Band Submissions
            </h2>
            <p style={{ color: colors.textMuted }} className="mb-6">
              Sign in and create an account as a band member to submit your music.
            </p>
          </div>
        ) : !userInBand ? (
          <div className="text-center py-12">
            <h2 className="font-orbitron text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Band Submissions
            </h2>
            <p style={{ color: colors.textMuted }} className="mb-6">
              This feature is only available for band members. Update your profile to indicate you're in a band.
            </p>
          </div>
        ) : !hasPaidSubscription ? (
          <div className="text-center py-12">
            <h2 className="font-orbitron text-2xl font-bold mb-4" style={{ color: colors.text }}>
              Band Submissions
            </h2>
            <p style={{ color: colors.textMuted }} className="mb-6">
              Band members with an active subscription can submit their music. Subscribe to get started!
            </p>
          </div>
        ) : null}

        {canShowForm && (
        <>
        <div className="text-center mb-12">
          <h2 
            className="font-orbitron font-bold text-3xl md:text-4xl mb-4"
            style={{ 
              color: currentTheme === 'light-mode' ? '#000000' : colors.text 
            }}
          >
            SUBMIT YOUR REQUESTS
          </h2>
          <p 
            className="text-lg"
            style={{ color: colors.textMuted }}
          >
            Got a metal track that needs to be heard? Submit your requests and
            help shape our playlist.
          </p>
        </div>

        {!isAuthenticated || !hasPaidSubscription ? (
          <div className="mt-6">
            <div
              className="p-6 rounded-lg text-center transition-all duration-300 animate-in fade-in slide-in-from-top-4"
              style={{
                backgroundColor: `${colors.primary}25`,
                border: 'none',
              }}
            >
              <div
                className="flex items-center justify-center gap-2 mb-4"
                style={{ color: colors.primary }}
              >
                <Crown className="h-5 w-5" />
                <span className="font-semibold">
                  Premium Feature - Paid Subscription Required
                </span>
              </div>
              <p 
                className="mb-6"
                style={{ color: colors.textMuted }}
              >
                {!isAuthenticated 
                  ? "Song submissions are available exclusively to paid subscribers. Sign in and upgrade to submit your favorite tracks."
                  : "Song submissions are available exclusively to paid subscribers. Upgrade your subscription to submit your favorite tracks."
                }
              </p>
              <div className="flex gap-4 justify-center">
                {!isAuthenticated && (
                  <Button
                    onClick={() => {
                      // Trigger auth modal instead of redirect
                      const event = new CustomEvent("openAuthModal", {
                        detail: { mode: "login" },
                      });
                      window.dispatchEvent(event);
                    }}
                    className="px-6 py-3 rounded-full font-semibold transition-all duration-300 border-0"
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.primaryText || "white",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor =
                        colors.primaryDark || colors.primary;
                      e.currentTarget.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = colors.primary;
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  >
                    Login
                  </Button>
                )}
                <Button
                  onClick={() =>
                    document
                      .getElementById("subscribe")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  variant="outline"
                  className="px-6 py-3 rounded-full font-semibold transition-all duration-300"
                  style={{
                    borderColor: colors.primary,
                    color: colors.primary,
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `${colors.primary}10`;
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  View Subscriptions
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <Card className="bg-dark-surface border-dark-border mb-12">
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label
                      htmlFor="songTitle"
                      className="text-gray-300 font-semibold"
                    >
                      Song Title *
                    </Label>
                    <Input
                      id="songTitle"
                      value={formData.songTitle}
                      onChange={(e) =>
                        handleInputChange("songTitle", e.target.value)
                      }
                      placeholder="Enter song title"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="artist"
                      className="text-gray-300 font-semibold"
                    >
                      Artist/Band *
                    </Label>
                    <Input
                      id="artist"
                      value={formData.artist}
                      onChange={(e) =>
                        handleInputChange("artist", e.target.value)
                      }
                      placeholder="Enter artist name"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label
                      htmlFor="name"
                      className="text-gray-300 font-semibold"
                    >
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Enter your name"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary"
                    />
                  </div>
                  <div>
                    <Label
                      htmlFor="email"
                      className="text-gray-300 font-semibold"
                    >
                      Your Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      placeholder="Enter your email"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <Label
                    htmlFor="message"
                    className="text-gray-300 font-semibold"
                  >
                    Additional Message
                  </Label>
                  <Textarea
                    id="message"
                    value={formData.message || ""}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    placeholder="Tell us why this song rocks or share any additional details..."
                    rows={4}
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-400/60 focus:border-primary resize-none"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={agreedToTerms}
                    onCheckedChange={(checked) => setAgreedToTerms(checked === true)}
                    className="border-dark-border"
                  />
                  <Label htmlFor="terms" className="text-gray-400 text-sm">
                    I agree that this submission follows metal music guidelines
                    and community standards.
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  className="w-full md:w-auto bg-metal-orange hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold text-lg transition-all duration-300 animate-glow focus:outline-none focus:ring-0"
                >
                  <Send className="mr-2 h-4 w-4" />
                  {submitMutation.isPending
                    ? "SUBMITTING..."
                    : "SUBMIT REQUEST"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Recent Submissions */}
        {(recentSubmissions || []).length > 0 &&
          isAuthenticated &&
          hasPaidSubscription && (
            <div className="mt-16">
              <h3
                className="font-bold text-xl mb-6"
                style={{ color: colors.primary }}
              >
                Recent Submissions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(recentSubmissions || []).slice(0, 4).map((submission) => (
                  <Card
                    key={submission.id}
                    className="bg-dark-surface border-dark-border"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">
                            {submission.songTitle}
                          </h4>
                          <p className="text-gray-400 text-sm">
                            {submission.artistName}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            submission.status === "approved"
                              ? "text-metal-orange bg-metal-orange/20"
                              : submission.status === "rejected"
                                ? "text-metal-red bg-metal-red/20"
                                : "text-metal-gold bg-metal-gold/20"
                          }`}
                        >
                          {submission.status === "approved"
                            ? "Approved"
                            : submission.status === "rejected"
                              ? "Rejected"
                              : "Pending"}
                        </span>
                      </div>
                      <p className="text-gray-500 text-xs">
                        {submission.submitterName
                          ? `Submitted by: ${submission.submitterName}`
                          : "Anonymous"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {submission.createdAt
                          ? formatDate(submission.createdAt)
                          : "Recently"}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

        {/* Premium Feature Notification */}
        {showPremiumNotification && (
          <LiveChat
            isEnabled={true}
            onToggle={() => setShowPremiumNotification(false)}
          />
        )}
        </>
        )}
      </div>
    </section>
  );
}

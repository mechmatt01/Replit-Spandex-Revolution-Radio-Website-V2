import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/contexts/ThemeContext";
import { Upload, Crown, LogOut, User, CreditCard, FileText, Camera } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { User as UserType } from "@shared/schema";

interface ProfileProps {
  onNavigateToSubscribe?: () => void;
}

const rockAvatars = [
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1586297135537-94bc9ba060aa?w=300&h=300&fit=crop&crop=face"
];

export default function Profile({ onNavigateToSubscribe }: ProfileProps) {
  const [activeSection, setActiveSection] = useState("profile");
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isCancelSubModalOpen, setIsCancelSubModalOpen] = useState(false);
  const [showPremiumNotification, setShowPremiumNotification] = useState<{show: boolean, type: string}>({ show: false, type: '' });
  const [profileData, setProfileData] = useState<Partial<UserType>>({});
  
  const { user, isAuthenticated } = useAuth();
  const { getColors, getGradient, theme } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const colors = getColors();

  // Check if user has active subscription
  const hasActiveSubscription = user?.subscriptionStatus === "active";

  // Fetch user submissions
  const { data: userSubmissions = [] } = useQuery({
    queryKey: ["/api/user/submissions"],
    enabled: isAuthenticated && hasActiveSubscription,
  });

  // Fetch subscription details
  const { data: subscriptionDetails } = useQuery({
    queryKey: ["/api/user/subscription"],
    enabled: isAuthenticated && hasActiveSubscription,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: Partial<UserType>) => {
      const response = await apiRequest("PATCH", "/api/user/profile", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel subscription mutation
  const cancelSubscriptionMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/user/cancel-subscription");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Subscription Canceled",
        description: "Your subscription will end at the current billing period.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsCancelSubModalOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Cancellation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleProfileUpdate = () => {
    const updatedData = {
      firstName: profileData.firstName || user?.firstName,
      lastName: profileData.lastName || user?.lastName,
      phoneNumber: profileData.phoneNumber || user?.phoneNumber,
      profileImageUrl: profileData.profileImageUrl || user?.profileImageUrl,
    };
    updateProfileMutation.mutate(updatedData);
  };

  const handleAvatarSelect = (avatarUrl: string) => {
    setProfileData(prev => ({ ...prev, profileImageUrl: avatarUrl }));
    setIsAvatarModalOpen(false);
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real implementation, you'd upload to a service like AWS S3
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileData(prev => ({ ...prev, profileImageUrl: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getDisplayName = () => {
    return profileData.firstName || user?.firstName || "User";
  };

  const getProfileImage = () => {
    return profileData.profileImageUrl || user?.profileImageUrl || "";
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
            <p className="text-muted-foreground mb-4">Please sign in to view your profile.</p>
            <Button onClick={() => window.location.href = "/#/login"}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen",
      theme === "light" ? "bg-white" : "bg-black"
    )}>
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  <Button
                    variant={activeSection === "profile" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Button>
                  
                  {hasActiveSubscription && (
                    <Button
                      variant={activeSection === "subscription" ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection("subscription")}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Subscription Management
                    </Button>
                  )}
                  
                  <Button
                    variant={activeSection === "submissions" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setActiveSection("submissions")}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Submission Requests
                  </Button>
                  
                  <Separator className="my-4" />
                  
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setIsLogoutModalOpen(true)}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeSection === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24">
                        <AvatarImage src={getProfileImage()} />
                        <AvatarFallback className="text-2xl">
                          {getDisplayName().charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {hasActiveSubscription && (
                        <div 
                          className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-background"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Crown className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline">
                          <Camera className="mr-2 h-4 w-4" />
                          Change
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem asChild>
                          <label className="flex items-center cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload from File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </label>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => {
                            if (hasActiveSubscription) {
                              setIsAvatarModalOpen(true);
                            } else {
                              // Show premium avatar notification
                              setShowPremiumNotification({ show: true, type: 'premium_avatar' });
                            }
                          }}
                        >
                          <Crown className="mr-2 h-4 w-4" />
                          <div className="flex flex-col">
                            <span>Spandex Salvation Avatars</span>
                            {!hasActiveSubscription && (
                              <span className="text-xs text-muted-foreground">
                                Subscription Required
                              </span>
                            )}
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName ?? user?.firstName ?? ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName ?? user?.lastName ?? ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        value={user?.email ?? ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        placeholder="Enter your phone number"
                        value={profileData.phoneNumber ?? user?.phoneNumber ?? ""}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleProfileUpdate}
                    disabled={updateProfileMutation.isPending}
                    className="w-full"
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "subscription" && hasActiveSubscription && (
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Current Plan</Label>
                      <p className="text-lg font-semibold capitalize">
                        {user?.subscriptionTier || "Premium"} Plan
                      </p>
                    </div>
                    <div>
                      <Label>Monthly Price</Label>
                      <p className="text-lg font-semibold">$9.99/month</p>
                    </div>
                    <div>
                      <Label>Next Billing Date</Label>
                      <p className="text-lg font-semibold">
                        {subscriptionDetails?.nextBillingDate || "Loading..."}
                      </p>
                    </div>
                    <div>
                      <Label>Payment Method</Label>
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">
                          **** **** **** {subscriptionDetails?.lastFourDigits || "4242"}
                        </span>
                        <div className="text-sm text-muted-foreground">
                          {subscriptionDetails?.cardType || "Visa"}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    variant="destructive" 
                    onClick={() => setIsCancelSubModalOpen(true)}
                  >
                    Cancel Subscription
                  </Button>
                </CardContent>
              </Card>
            )}

            {activeSection === "submissions" && (
              <Card>
                <CardHeader>
                  <CardTitle>Your Submission Requests</CardTitle>
                </CardHeader>
                <CardContent>
                  {!hasActiveSubscription ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        Submission requests are available with an active subscription.
                      </p>
                      <Button onClick={onNavigateToSubscribe}>
                        Subscribe Now
                      </Button>
                    </div>
                  ) : userSubmissions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">
                        No submission requests yet.
                      </p>
                      <Button onClick={() => window.location.href = "/#submissions"}>
                        Submit a Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userSubmissions.map((submission: any) => (
                        <Card key={submission.id}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h3 className="font-semibold">{submission.songTitle}</h3>
                                <p className="text-muted-foreground">{submission.artistName}</p>
                                {submission.albumTitle && (
                                  <p className="text-sm text-muted-foreground">{submission.albumTitle}</p>
                                )}
                                {submission.message && (
                                  <p className="text-sm mt-2">{submission.message}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <Badge 
                                  variant={
                                    submission.status === "approved" ? "default" :
                                    submission.status === "rejected" ? "destructive" : "secondary"
                                  }
                                >
                                  {submission.status}
                                </Badge>
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(submission.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selection Modal */}
      <Dialog open={isAvatarModalOpen} onOpenChange={setIsAvatarModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Choose Your Spandex Salvation Avatar</DialogTitle>
            <DialogDescription>
              Select from our collection of rock-themed avatars
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-5 gap-4 py-4">
            {rockAvatars.map((avatar, index) => (
              <button
                key={index}
                onClick={() => handleAvatarSelect(avatar)}
                className="relative group"
              >
                <Avatar className="w-16 h-16 group-hover:ring-2 group-hover:ring-primary transition-all">
                  <AvatarImage src={avatar} />
                  <AvatarFallback>A{index + 1}</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Modal */}
      <Dialog open={isLogoutModalOpen} onOpenChange={setIsLogoutModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>
              Are you sure you want to log out of your account?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLogoutModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Modal */}
      <Dialog open={isCancelSubModalOpen} onOpenChange={setIsCancelSubModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Subscription</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your current billing period.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelSubModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => cancelSubscriptionMutation.mutate()}
              disabled={cancelSubscriptionMutation.isPending}
            >
              {cancelSubscriptionMutation.isPending ? "Canceling..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Premium Feature Notification */}
      {showPremiumNotification.show && (
        <LiveChat
          isEnabled={true}
          onToggle={() => setShowPremiumNotification({ show: false, type: '' })}
          premiumFeatureType={showPremiumNotification.type as any}
        />
      )}
    </div>
  );
}
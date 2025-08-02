import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation, useSearch } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, } from "@/components/ui/dialog";
import { User, CreditCard, Calendar, Crown, Upload, LogOut, FileText, CheckCircle, AlertCircle, Camera, } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
// Premium avatar options
const premiumAvatars = [
    { id: 1, name: "Metal Warrior", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=metal1&backgroundColor=000000" },
    { id: 2, name: "Rock Legend", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=rock2&backgroundColor=1a1a1a" },
    { id: 3, name: "Guitar Hero", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=guitar3&backgroundColor=2a2a2a" },
    { id: 4, name: "Drum Master", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=drums4&backgroundColor=3a3a3a" },
    { id: 5, name: "Bass Thunder", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=bass5&backgroundColor=4a4a4a" },
    { id: 6, name: "Vocal Fury", url: "https://api.dicebear.com/9.x/avataaars/svg?seed=vocal6&backgroundColor=5a5a5a" },
];
export default function ProfilePage() {
    const { user, firebaseUser, firebaseProfile, isAuthenticated, logout, refreshUser, updateProfile, uploadProfileImage } = useAuth();
    const [, setLocation] = useLocation();
    const { colors, isDarkMode } = useTheme();
    const { toast } = useToast();
    const queryString = useSearch();
    // Parse query parameters
    const urlParams = new URLSearchParams(queryString);
    const sectionParam = urlParams.get('section') || 'profile';
    // States
    const [selectedSection, setSelectedSection] = useState(sectionParam);
    const [profileData, setProfileData] = useState({
        displayName: "",
        phoneNumber: "",
        email: "",
        profileImageUrl: "",
    });
    const [showChangeImageDropdown, setShowChangeImageDropdown] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    // Update selected section from URL parameter
    useEffect(() => {
        setSelectedSection(sectionParam);
    }, [sectionParam]);
    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            setLocation("/");
        }
    }, [isAuthenticated, setLocation]);
    // Load user data from Firebase profile or fallback to regular user
    useEffect(() => {
        if (firebaseProfile) {
            // Use Firebase profile data (preferred)
            setProfileData({
                displayName: `${firebaseProfile.FirstName} ${firebaseProfile.LastName}`.trim() || firebaseProfile.EmailAddress?.split('@')[0] || "",
                phoneNumber: firebaseProfile.PhoneNumber || "",
                email: firebaseProfile.EmailAddress || "",
                profileImageUrl: firebaseProfile.UserProfileImage || "",
            });
        }
        else if (user) {
            // Fallback to regular user data
            setProfileData({
                displayName: user.firstName || user.email?.split('@')[0] || "",
                phoneNumber: user.phoneNumber || "",
                email: user.email || "",
                profileImageUrl: user.profileImageUrl || "",
            });
        }
    }, [user, firebaseProfile]);
    // Load submissions
    useEffect(() => {
        if (user && user.activeSubscription) {
            loadSubmissions();
        }
    }, [user]);
    const loadSubmissions = async () => {
        try {
            const response = await fetch("/api/user/submissions", {
                credentials: 'include',
            });
            if (response.ok) {
                const data = await response.json();
                setSubmissions(data);
            }
        }
        catch (error) {
            console.error("Failed to load submissions:", error);
        }
    };
    const handleSaveProfile = async () => {
        setLoading(true);
        try {
            // Parse display name into first and last name
            const nameParts = profileData.displayName.trim().split(' ');
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';
            // Use Firebase update profile function
            const success = await updateProfile({
                FirstName: firstName,
                LastName: lastName,
                PhoneNumber: profileData.phoneNumber,
                UserProfileImage: profileData.profileImageUrl,
            });
            if (!success)
                throw new Error("Failed to update profile");
            toast({
                title: "Profile Updated",
                description: "Your profile has been saved successfully.",
            });
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update profile.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        setUploadingImage(true);
        try {
            // Upload to Firebase Storage
            const success = await uploadProfileImage(file);
            if (success) {
                toast({
                    title: "Image Uploaded",
                    description: "Your profile image has been updated successfully.",
                });
            }
            else {
                throw new Error("Failed to upload image");
            }
        }
        catch (error) {
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload image.",
                variant: "destructive",
            });
        }
        finally {
            setUploadingImage(false);
            setShowChangeImageDropdown(false);
        }
    };
    const handleAvatarSelect = async (avatarUrl) => {
        try {
            // Update profile with new avatar URL in Firebase
            const success = await updateProfile({
                UserProfileImage: avatarUrl,
            });
            if (success) {
                setProfileData(prev => ({ ...prev, profileImageUrl: avatarUrl }));
                toast({
                    title: "Avatar Updated",
                    description: "Your profile avatar has been updated successfully.",
                });
            }
            else {
                throw new Error("Failed to update avatar");
            }
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update avatar.",
                variant: "destructive",
            });
        }
        finally {
            setShowAvatarSelector(false);
        }
    };
    const handleCancelSubscription = async () => {
        try {
            const response = await fetch("/api/subscription/cancel", {
                method: "POST",
                credentials: 'include',
            });
            if (!response.ok)
                throw new Error("Failed to cancel subscription");
            await refreshUser();
            setShowCancelSubscriptionDialog(false);
            toast({
                title: "Subscription Cancelled",
                description: "Your subscription has been cancelled and will end at the next billing cycle.",
            });
        }
        catch (error) {
            toast({
                title: "Cancellation Failed",
                description: error.message || "Failed to cancel subscription.",
                variant: "destructive",
            });
        }
    };
    const handleLogout = async () => {
        await logout();
        setLocation("/");
    };
    if (!user) {
        return null;
    }
    const sidebarItems = [
        { id: "profile", label: "Profile", icon: User },
        ...(user.activeSubscription
            ? [
                {
                    id: "subscription",
                    label: "Subscription Management",
                    icon: CreditCard,
                },
            ]
            : []),
        {
            id: "submissions",
            label: "Submission Requests",
            icon: FileText,
        },
    ];
    const gradient = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}80 100%)`;
    return (<div className="min-h-screen pt-20" style={{ backgroundColor: colors.background }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="border-2 shadow-xl overflow-hidden" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
            backdropFilter: 'blur(10px)',
        }}>
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {(sidebarItems || []).map((item) => (<button key={item.id} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${selectedSection === item.id
                ? 'shadow-lg'
                : 'hover:shadow-md'}`} style={{
                backgroundColor: selectedSection === item.id ? colors.primary : 'transparent',
                color: selectedSection === item.id ? 'white' : colors.text,
            }} onClick={() => setSelectedSection(item.id)}>
                      <item.icon size={20}/>
                      <span>{item.label}</span>
                    </button>))}

                  <div className="my-4 mx-4 border-t" style={{ borderColor: `${colors.primary}20` }}/>

                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md" style={{
            backgroundColor: 'transparent',
            color: '#EF4444',
        }} onClick={() => setShowLogoutDialog(true)}>
                    <LogOut size={20}/>
                    <span>Logout</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSection === "profile" && (<Card className="border-2 shadow-xl" style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `${colors.primary}40`,
                backdropFilter: 'blur(10px)',
            }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-black" style={{ color: colors.text }}>
                    Profile Settings
                  </CardTitle>
                  <CardDescription style={{ color: `${colors.text}80` }}>
                    Manage your account information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image Section */}
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full shadow-lg ring-4 ring-offset-2" style={{
                background: profileData.profileImageUrl
                    ? `url(${profileData.profileImageUrl}) center/cover`
                    : gradient,
                '--ring-color': colors.primary,
                '--ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
            }}>
                        {!profileData.profileImageUrl && (<div className="w-full h-full flex items-center justify-center">
                            <User size={40} className="text-white"/>
                          </div>)}
                      </div>

                      <DropdownMenu open={showChangeImageDropdown} onOpenChange={setShowChangeImageDropdown}>
                        <DropdownMenuTrigger asChild>
                          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110" style={{
                backgroundColor: colors.primary,
                border: `2px solid ${isDarkMode ? '#000000' : '#ffffff'}`,
            }}>
                            <Camera size={16} className="text-white"/>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="w-48" style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `${colors.primary}40`,
            }}>
                          <DropdownMenuItem>
                            <label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer w-full">
                              <Upload size={16}/>
                              <span>Upload Photo</span>
                            </label>
                            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={handleImageUpload}/>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                if (!user.activeSubscription) {
                    toast({
                        title: "Premium Feature",
                        description: "Premium avatars are available for subscribers only.",
                    });
                    return;
                }
                setShowAvatarSelector(true);
                setShowChangeImageDropdown(false);
            }}>
                            <Crown size={16}/>
                            <span>Premium Avatars</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="flex-1 space-y-2">
                      <h3 className="font-bold text-lg" style={{ color: colors.text }}>
                        Profile Picture
                      </h3>
                      <p className="text-sm" style={{ color: `${colors.text}80` }}>
                        Upload a photo or choose from our premium avatar collection
                      </p>
                    </div>
                  </div>

                  {/* Display Name */}
                  <div className="space-y-2">
                    <Label htmlFor="displayName" style={{ color: colors.text }}>
                      Display Name
                    </Label>
                    <Input id="displayName" value={profileData.displayName} onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))} placeholder="Enter your display name" className="font-semibold" style={{
                backgroundColor: 'transparent',
                borderColor: `${colors.primary}40`,
                color: colors.text,
            }}/>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" style={{ color: colors.text }}>
                      Email Address
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input id="email" value={profileData.email} disabled className="font-semibold" style={{
                backgroundColor: 'transparent',
                borderColor: `${colors.primary}40`,
                color: colors.text,
                opacity: 0.7,
            }}/>
                      {user.emailVerified && (<Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle size={14}/>
                          Verified
                        </Badge>)}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" style={{ color: colors.text }}>
                      Phone Number
                    </Label>
                    <div className="flex items-center gap-2">
                      <Input id="phoneNumber" value={profileData.phoneNumber} onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))} placeholder="+1 (555) 123-4567" className="font-semibold" style={{
                backgroundColor: 'transparent',
                borderColor: `${colors.primary}40`,
                color: colors.text,
            }}/>
                      {user.phoneVerified && (<Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle size={14}/>
                          Verified
                        </Badge>)}
                    </div>
                  </div>

                  {/* Save Button */}
                  <Button onClick={handleSaveProfile} disabled={loading} className="w-full font-bold shadow-lg" style={{
                backgroundColor: colors.primary,
                color: 'white',
            }}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardContent>
              </Card>)}

            {selectedSection === "subscription" && user.activeSubscription && (<Card className="border-2 shadow-xl" style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `${colors.primary}40`,
                backdropFilter: 'blur(10px)',
            }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-black" style={{ color: colors.text }}>
                    Subscription Management
                  </CardTitle>
                  <CardDescription style={{ color: `${colors.text}80` }}>
                    Manage your subscription and billing information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Current Plan */}
                  <div className="p-6 rounded-lg border-2" style={{ borderColor: `${colors.primary}40` }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Crown className="text-yellow-500" size={24}/>
                          <h3 className="font-black text-xl" style={{ color: colors.text }}>
                            Legend Package
                          </h3>
                        </div>
                        <p className="text-sm mb-4" style={{ color: `${colors.text}80` }}>
                          Premium access to all features
                        </p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} style={{ color: colors.primary }}/>
                            <span className="text-sm" style={{ color: colors.text }}>Unlimited song submissions</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} style={{ color: colors.primary }}/>
                            <span className="text-sm" style={{ color: colors.text }}>Premium avatars & badges</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle size={16} style={{ color: colors.primary }}/>
                            <span className="text-sm" style={{ color: colors.text }}>Early access to new features</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-2xl" style={{ color: colors.primary }}>$9.99</p>
                        <p className="text-sm" style={{ color: `${colors.text}80` }}>per month</p>
                      </div>
                    </div>
                  </div>

                  {/* Billing Information */}
                  <div className="space-y-4">
                    <h4 className="font-bold" style={{ color: colors.text }}>Billing Information</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                        <div className="flex items-center gap-3">
                          <CreditCard size={20} style={{ color: colors.primary }}/>
                          <span className="font-semibold" style={{ color: colors.text }}>•••• •••• •••• 4242</span>
                        </div>
                        <Badge variant="outline">Visa</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                        <div className="flex items-center gap-3">
                          <Calendar size={20} style={{ color: colors.primary }}/>
                          <span className="font-semibold" style={{ color: colors.text }}>Next billing date</span>
                        </div>
                        <span style={{ color: colors.text }}>
                          {format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Cancel Subscription */}
                  <div className="pt-4 border-t" style={{ borderColor: `${colors.primary}20` }}>
                    <Button variant="outline" onClick={() => setShowCancelSubscriptionDialog(true)} className="w-full font-semibold" style={{
                borderColor: '#EF4444',
                color: '#EF4444',
            }}>
                      Cancel Subscription
                    </Button>
                  </div>
                </CardContent>
              </Card>)}

            {selectedSection === "submissions" && (<Card className="border-2 shadow-xl" style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `${colors.primary}40`,
                backdropFilter: 'blur(10px)',
            }}>
                <CardHeader>
                  <CardTitle className="text-2xl font-black" style={{ color: colors.text }}>
                    Submission Requests
                  </CardTitle>
                  <CardDescription style={{ color: `${colors.text}80` }}>
                    Track your song submission history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!user.activeSubscription ? (<div className="text-center py-12">
                      <Crown size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.primary }}/>
                      <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                        Premium Feature
                      </h3>
                      <p className="mb-6" style={{ color: `${colors.text}80` }}>
                        Song submissions are available for premium subscribers only
                      </p>
                      <Button onClick={() => setLocation("/subscription")} className="font-bold shadow-lg" style={{
                    backgroundColor: colors.primary,
                    color: 'white',
                }}>
                        Upgrade to Premium
                      </Button>
                    </div>) : (submissions?.length || 0) === 0 ? (<div className="text-center py-12">
                      <FileText size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.primary }}/>
                      <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                        No Submissions Yet
                      </h3>
                      <p style={{ color: `${colors.text}80` }}>
                        You haven't submitted any songs yet
                      </p>
                    </div>) : (<div className="space-y-4">
                      {(submissions || []).map((submission) => (<div key={submission.id} className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md" style={{
                        borderColor: `${colors.primary}20`,
                        backgroundColor: `${colors.primary}05`,
                    }}>
                          <div className="flex items-start justify-between">
                            <div>
                              <h4 className="font-bold" style={{ color: colors.text }}>
                                {submission.artistName} - {submission.songTitle}
                              </h4>
                              <p className="text-sm mt-1" style={{ color: `${colors.text}80` }}>
                                Submitted on {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                              </p>
                            </div>
                            <Badge variant={submission.status === 'approved' ? 'default' :
                        submission.status === 'rejected' ? 'destructive' :
                            'secondary'}>
                              {submission.status}
                            </Badge>
                          </div>
                        </div>))}
                    </div>)}
                </CardContent>
              </Card>)}
          </div>
        </div>
      </div>

      {/* Avatar Selector Dialog */}
      <Dialog open={showAvatarSelector} onOpenChange={setShowAvatarSelector}>
        <DialogContent className="max-w-2xl" style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
        }}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black" style={{ color: colors.text }}>
              Premium Avatar Collection
            </DialogTitle>
            <DialogDescription style={{ color: `${colors.text}80` }}>
              Choose from our exclusive metal-themed avatars
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {(premiumAvatars || []).map((avatar) => (<button key={avatar.id} onClick={() => handleAvatarSelect(avatar.url)} className="group relative rounded-lg overflow-hidden transition-all duration-200 hover:scale-105 hover:shadow-xl">
                <img src={avatar.url} alt={avatar.name} className="w-full h-full object-cover"/>
                <div className="absolute inset-0 flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{
                background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 100%)',
            }}>
                  <span className="text-white font-semibold text-sm">{avatar.name}</span>
                </div>
              </button>))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <AlertDialogContent style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black" style={{ color: colors.text }}>
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: `${colors.text}80` }}>
              <AlertCircle className="inline mr-2" size={16}/>
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: colors.text }}>
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700 text-white">
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
        }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black" style={{ color: colors.text }}>
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: `${colors.text}80` }}>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: colors.text }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>);
}

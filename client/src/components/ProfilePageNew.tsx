import { useState, useEffect } from "react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLocation, useSearch } from "wouter";
import { findUserProfileByFirebaseUID, updateUserProfile, uploadProfileImage, UserProfile, getProfileImageWithFallback } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Crown,
  Upload,
  ImageIcon,
  LogOut,
  FileText,
  Star,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  Camera,
  MoreVertical,
  X,
} from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { format } from "date-fns";
import AvatarSelector from "./AvatarSelector";

export default function ProfilePage() {
  const { user, signOut } = useFirebaseAuth();
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
  const [originalProfileData, setOriginalProfileData] = useState({
    displayName: "",
    phoneNumber: "",
    email: "",
    profileImageUrl: "",
  });
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangeImageDropdown, setShowChangeImageDropdown] = useState(false);
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showProfile, setShowProfile] = useState(true);

  // Update selected section from URL parameter
  useEffect(() => {
    setSelectedSection(sectionParam);
  }, [sectionParam]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Load user data from Firebase profile
  useEffect(() => {
    if (user) {
      const initialData = {
        displayName: user.displayName || user.email?.split('@')[0] || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
        profileImageUrl: getProfileImageWithFallback(null, user.photoURL),
      };
      setProfileData(initialData);
      setOriginalProfileData(initialData);
    }
  }, [user]);

  // Load complete user profile from Firestore
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          // Try to find user profile by Firebase UID
          const profile = await findUserProfileByFirebaseUID(user.uid, user.email || '');
          if (profile) {
            setUserProfile(profile);
            // Update profile data with Firestore data and proper fallback
            const firestoreData = {
              displayName: `${profile.firstName} ${profile.lastName}`.trim(),
              phoneNumber: profile.phoneNumber || "",
              email: profile.emailAddress || user.email || "",
              profileImageUrl: getProfileImageWithFallback(profile.userProfileImage, user.photoURL),
            };
            setProfileData(firestoreData);
            setOriginalProfileData(firestoreData);
          }
        } catch (error) {
          console.error('Failed to load user profile:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user]);

  // Load submissions
  useEffect(() => {
    // TODO: Check subscription status from user profile
    if (user) {
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
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  // Check if there are any changes made to the profile
  const hasChanges = () => {
    return (
      profileData.displayName !== originalProfileData.displayName ||
      profileData.phoneNumber !== originalProfileData.phoneNumber ||
      profileData.email !== originalProfileData.email ||
      profileData.profileImageUrl !== originalProfileData.profileImageUrl
    );
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      // Parse display name into first and last name
      const nameParts = profileData.displayName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Update user profile in Firestore
      const updateResult = await updateUserProfile(userProfile.userID, {
        firstName,
        lastName,
        phoneNumber: profileData.phoneNumber,
        userProfileImage: profileData.profileImageUrl,
        updatedAt: new Date().toISOString(),
      });

      if (updateResult) {
        // Update local state
        setUserProfile((prev: UserProfile | null) => prev ? {
          ...prev,
          firstName,
          lastName,
          phoneNumber: profileData.phoneNumber,
          userProfileImage: profileData.profileImageUrl,
          updatedAt: new Date().toISOString(),
        } : null);

        // Update original data after successful save
        setOriginalProfileData({
          displayName: profileData.displayName,
          phoneNumber: profileData.phoneNumber,
          email: profileData.email,
          profileImageUrl: profileData.profileImageUrl,
        });

        toast({
          title: "Profile Updated",
          description: "Your profile has been saved successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Upload image to Firebase Storage
      const imageUrl = await uploadProfileImage(file, userProfile.userID);
      
      // Update user profile in Firestore
      const updateResult = await updateUserProfile(userProfile.userID, {
        userProfileImage: imageUrl,
        updatedAt: new Date().toISOString(),
      });

      if (updateResult) {
        // Update local state
        setProfileData(prev => ({ ...prev, profileImageUrl: imageUrl }));
        setUserProfile(prev => prev ? {
          ...prev,
          userProfileImage: imageUrl,
          updatedAt: new Date().toISOString(),
        } : null);

        toast({
          title: "Image Uploaded",
          description: "Your profile image has been updated successfully.",
        });
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image.",
        variant: "destructive",
      });
    } finally {
      setUploadingImage(false);
      setShowChangeImageDropdown(false);
    }
  };

  const handleAvatarSelect = async (avatarUrl: string) => {
    try {
      if (!userProfile) {
        throw new Error('User profile not found');
      }

      // Update user profile in Firestore
      const updateResult = await updateUserProfile(userProfile.userID, {
        userProfileImage: avatarUrl,
        updatedAt: new Date().toISOString(),
      });

      if (updateResult) {
        // Update local state
        setProfileData(prev => ({ ...prev, profileImageUrl: avatarUrl }));
        setUserProfile(prev => prev ? {
          ...prev,
          userProfileImage: avatarUrl,
          updatedAt: new Date().toISOString(),
        } : null);

        // Toast notification is already shown in AvatarSelector component
        // No need for duplicate notification here
      } else {
        throw new Error('Failed to update avatar');
      }
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update avatar.",
        variant: "destructive",
      });
    } finally {
      setShowAvatarSelector(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const response = await fetch("/api/subscription/cancel", {
        method: "POST",
        credentials: 'include',
      });

      if (!response.ok) throw new Error("Failed to cancel subscription");

      // Profile updated successfully
      setShowCancelSubscriptionDialog(false);
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled and will end at the next billing cycle.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    await signOut();
    setLocation("/");
  };

  if (!user) {
    return null;
  }

  const sidebarItems = [
    { id: "profile", label: "Profile", icon: User },
    // TODO: Add subscription data when available
    // {
    //   id: "subscription",
    //   label: "Subscription Management",
    //   icon: CreditCard,
    // },
    {
      id: "submissions",
      label: "Submission Requests",
      icon: FileText,
    },
  ];

  const gradient = `linear-gradient(135deg, ${colors.primary} 0%, ${colors.primary}80 100%)`;

  return (
    <div
      className="min-h-screen pt-20"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card
              className="border-2 shadow-xl overflow-hidden"
              style={{
                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `${colors.primary}40`,
                backdropFilter: 'blur(10px)',
              }}
            >
              <CardContent className="p-0">
                <div className="space-y-1 p-2">
                  {(sidebarItems || []).map((item) => (
                    <button
                      key={item.id}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${
                        selectedSection === item.id 
                          ? 'shadow-lg' 
                          : 'hover:shadow-md'
                      }`}
                      style={{
                        backgroundColor: selectedSection === item.id ? colors.primary : 'transparent',
                        color: selectedSection === item.id ? 'white' : colors.text,
                      }}
                      onClick={() => setSelectedSection(item.id)}
                    >
                      <item.icon size={20} />
                      <span>{item.label}</span>
                    </button>
                  ))}

                  <div className="my-4 mx-4 border-t" style={{ borderColor: `${colors.primary}20` }} />

                  <button
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md"
                    style={{
                      backgroundColor: 'transparent',
                      color: '#EF4444',
                    }}
                    onClick={() => setShowLogoutDialog(true)}
                  >
                    <LogOut size={20} />
                    <span>Logout</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {showProfile && (
              <>
                {selectedSection === "profile" && (
                  <Card
                    className="border-2 shadow-xl"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: `${colors.primary}40`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    {/* Profile Section Header */}
                    <div className="relative mb-6">
                      <h2 className="text-2xl font-bold text-center" style={{ color: colors.text }}>
                        Profile Settings
                      </h2>
                      
                      {/* Modern Close Button - Positioned in top right */}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.history.back()}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 group z-50"
                        style={{
                          backgroundColor: `${colors.primary}20`,
                          border: `2px solid ${colors.primary}40`,
                          color: colors.primary,
                          backdropFilter: 'blur(10px)',
                          boxShadow: `0 4px 12px ${colors.primary}30`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = `${colors.primary}30`;
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = `0 6px 20px ${colors.primary}40`;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${colors.primary}20`;
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary}30`;
                        }}
                      >
                        <X 
                          size={20} 
                          className="transition-all duration-300 group-hover:rotate-90" 
                          style={{ color: colors.primary }}
                        />
                      </Button>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-2xl font-black" style={{ color: colors.text }}>
                        Profile Settings
                      </CardTitle>
                      <CardDescription style={{ color: `${colors.text}80` }}>
                        Manage your account information and preferences
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {loading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: colors.primary }}></div>
                          <span className="ml-3" style={{ color: colors.text }}>Loading profile...</span>
                        </div>
                      ) : (
                        <>
                          {/* Profile Image Section */}
                          <div className="flex items-start space-x-6">
                            <div className="relative">
                              <div
                                className="w-24 h-24 rounded-full shadow-lg ring-4 ring-offset-2 overflow-hidden relative"
                                style={{
                                  '--ring-color': colors.primary,
                                  '--ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                } as React.CSSProperties}
                              >
                                {profileData.profileImageUrl && profileData.profileImageUrl !== '' ? (
                                  <img
                                    src={profileData.profileImageUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      // Show fallback when image fails to load
                                      const parent = target.parentElement;
                                      if (parent) {
                                        const fallback = document.createElement('div');
                                        fallback.className = 'w-full h-full flex items-center justify-center';
                                        fallback.style.background = gradient;
                                        fallback.innerHTML = '<svg class="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>';
                                        parent.appendChild(fallback);
                                      }
                                    }}
                                  />
                                ) : (
                                  <div 
                                    className="w-full h-full flex items-center justify-center"
                                    style={{ background: gradient }}
                                  >
                                    <User size={40} className="text-white" />
                                  </div>
                                )}
                              </div>

                          <DropdownMenu open={showChangeImageDropdown} onOpenChange={setShowChangeImageDropdown}>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-0"
                                style={{
                                  backgroundColor: colors.primary,
                                  border: `2px solid ${isDarkMode ? '#000000' : colors.primary}`,
                                }}
                                title="Change profile picture"
                                aria-label="Change profile picture"
                              >
                                <Camera size={16} className="text-white" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent 
                              align="start" 
                              className="w-48"
                              style={{
                                backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                borderColor: `${colors.primary}40`,
                              }}
                            >
                              <DropdownMenuItem disabled={uploadingImage}>
                                <label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer w-full">
                                  {uploadingImage ? (
                                    <>
                                      <div className="animate-spin rounded-full h-4 w-4 border-b-2" style={{ borderColor: colors.primary }}></div>
                                      <span>Uploading...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload size={16} />
                                      <span>Upload Photo</span>
                                    </>
                                  )}
                                </label>
                                <input
                                  id="image-upload"
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                  disabled={uploadingImage}
                                />
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                                                 {/* TODO: Check subscription status */}
                                   if (false) {
                                    toast({
                                      title: "Premium Feature",
                                      description: "Premium avatars are available for subscribers only.",
                                    });
                                    return;
                                  }
                                  setShowAvatarSelector(true);
                                  setShowChangeImageDropdown(false);
                                }}
                              >
                                <Crown size={16} />
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
                        <Input
                          id="displayName"
                          value={profileData.displayName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                          placeholder="Enter your display name"
                          className="font-semibold"
                          style={{
                            backgroundColor: 'transparent',
                            borderColor: `${colors.primary}40`,
                            color: colors.text,
                          }}
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <Label htmlFor="email" style={{ color: colors.text }}>
                          Email Address
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="email"
                            value={profileData.email}
                            disabled
                            className="font-semibold"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: `${colors.primary}40`,
                              color: colors.text,
                              opacity: 0.7,
                            }}
                          />
                          {user?.emailVerified && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle size={14} />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Phone Number */}
                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber" style={{ color: colors.text }}>
                          Phone Number
                        </Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="phoneNumber"
                            value={profileData.phoneNumber}
                            onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                            placeholder="+1 (555) 123-4567"
                            className="font-semibold"
                            style={{
                              backgroundColor: 'transparent',
                              borderColor: `${colors.primary}40`,
                              color: colors.text,
                            }}
                          />
                          {/* TODO: Add phone verification status when available */}
                          {false && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <CheckCircle size={14} />
                              Verified
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Save Button */}
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving || !hasChanges()}
                        className="w-full font-bold shadow-lg transition-all duration-300"
                        style={{
                          backgroundColor: hasChanges() ? colors.primary : `${colors.primary}40`,
                          color: 'white',
                          opacity: hasChanges() ? 1 : 0.6,
                          cursor: hasChanges() ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </Button>
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {selectedSection === "subscription" && (
                  <Card
                    className="border-2 shadow-xl"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: `${colors.primary}40`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
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
                              <Crown size={24} style={{ color: colors.accent }} />
                              <h3 className="font-black text-xl" style={{ color: colors.text }}>
                                Legend Package
                              </h3>
                            </div>
                            <p className="text-sm mb-4" style={{ color: `${colors.text}80` }}>
                              Premium access to all features
                            </p>
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} style={{ color: colors.primary }} />
                                <span className="text-sm" style={{ color: colors.text }}>Unlimited song submissions</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} style={{ color: colors.primary }} />
                                <span className="text-sm" style={{ color: colors.text }}>Premium avatars & badges</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <CheckCircle size={16} style={{ color: colors.primary }} />
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
                              <CreditCard size={20} style={{ color: colors.primary }} />
                              <span className="font-semibold" style={{ color: colors.text }}>•••• •••• •••• 4242</span>
                            </div>
                            <Badge variant="outline">Visa</Badge>
                          </div>
                          <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${colors.primary}10` }}>
                            <div className="flex items-center gap-3">
                              <Calendar size={20} style={{ color: colors.primary }} />
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
                        <Button
                          variant="outline"
                          onClick={() => setShowCancelSubscriptionDialog(true)}
                          className="w-full font-semibold focus:outline-none focus:ring-0"
                          style={{
                            borderColor: '#EF4444',
                            color: '#EF4444',
                          }}
                        >
                          Cancel Subscription
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {selectedSection === "submissions" && (
                  <Card
                    className="border-2 shadow-xl"
                    style={{
                      backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                      borderColor: `${colors.primary}40`,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <CardHeader>
                      <CardTitle className="text-2xl font-black" style={{ color: colors.text }}>
                        Submission Requests
                      </CardTitle>
                      <CardDescription style={{ color: `${colors.text}80` }}>
                        Track your song submission history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {/* TODO: Check subscription status */}
                      {false ? (
                        <div className="text-center py-12">
                          <Crown size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.primary }} />
                          <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                            Premium Feature
                          </h3>
                          <p className="mb-6" style={{ color: `${colors.text}80` }}>
                            Song submissions are available for premium subscribers only
                          </p>
                          <Button
                            onClick={() => setLocation("/subscription")}
                            className="font-bold shadow-lg focus:outline-none focus:ring-0"
                            style={{
                              backgroundColor: colors.primary,
                              color: 'white',
                            }}
                          >
                            Upgrade to Premium
                          </Button>
                        </div>
                      ) : (submissions?.length || 0) === 0 ? (
                        <div className="text-center py-12">
                          <FileText size={48} className="mx-auto mb-4 opacity-50" style={{ color: colors.primary }} />
                          <h3 className="font-bold text-lg mb-2" style={{ color: colors.text }}>
                            No Submissions Yet
                          </h3>
                          <p style={{ color: `${colors.text}80` }}>
                            You haven't submitted any songs yet
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {(submissions || []).map((submission) => (
                            <div
                              key={submission.id}
                              className="p-4 rounded-lg border transition-all duration-200 hover:shadow-md"
                              style={{
                                borderColor: `${colors.primary}20`,
                                backgroundColor: `${colors.primary}05`,
                              }}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold" style={{ color: colors.text }}>
                                    {submission.artistName} - {submission.songTitle}
                                  </h4>
                                  <p className="text-sm mt-1" style={{ color: `${colors.text}80` }}>
                                    Submitted on {format(new Date(submission.createdAt), 'MMM dd, yyyy')}
                                  </p>
                                </div>
                                <Badge
                                  variant={
                                    submission.status === 'approved' ? 'default' :
                                    submission.status === 'rejected' ? 'destructive' :
                                    'secondary'
                                  }
                                >
                                  {submission.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Avatar Selector Dialog */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={profileData.profileImageUrl}
        onAvatarUpdate={handleAvatarSelect}
        userID={userProfile?.userID || user?.uid || ""}
      />

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelSubscriptionDialog} onOpenChange={setShowCancelSubscriptionDialog}>
        <AlertDialogContent
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black" style={{ color: colors.text }}>
              Cancel Subscription
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: `${colors.text}80` }}>
              <AlertCircle className="inline mr-2" size={16} />
              Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing cycle.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: colors.text }} className="focus:outline-none focus:ring-0">
              Keep Subscription
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              className="bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-0"
            >
              Cancel Subscription
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent
          style={{
            backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
            borderColor: `${colors.primary}40`,
          }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black" style={{ color: colors.text }}>
              Confirm Logout
            </AlertDialogTitle>
            <AlertDialogDescription style={{ color: `${colors.text}80` }}>
              Are you sure you want to log out of your account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: colors.text }} className="focus:outline-none focus:ring-0">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-0"
            >
              Logout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
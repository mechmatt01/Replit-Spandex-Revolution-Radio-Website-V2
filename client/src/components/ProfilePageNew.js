import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { useFirebaseAuth } from "../contexts/FirebaseAuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { useLocation, useSearch } from "wouter";
import { findUserProfileByFirebaseUID, updateUserProfile, uploadProfileImage, getProfileImageWithFallback } from "../lib/firebase";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, } from "../components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "../components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, } from "../components/ui/dropdown-menu";
import { User, CreditCard, Calendar, Crown, Upload, LogOut, FileText, CheckCircle, AlertCircle, Camera, } from "lucide-react";
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
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChangeImageDropdown, setShowChangeImageDropdown] = useState(false);
    const [showAvatarSelector, setShowAvatarSelector] = useState(false);
    const [showCancelSubscriptionDialog, setShowCancelSubscriptionDialog] = useState(false);
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [submissions, setSubmissions] = useState([]);
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
            setProfileData({
                displayName: user.displayName || user.email?.split('@')[0] || "",
                phoneNumber: user.phoneNumber || "",
                email: user.email || "",
                profileImageUrl: getProfileImageWithFallback(null, user.photoURL),
            });
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
                        setProfileData({
                            displayName: `${profile.firstName} ${profile.lastName}`.trim(),
                            phoneNumber: profile.phoneNumber || "",
                            email: profile.emailAddress || user.email || "",
                            profileImageUrl: getProfileImageWithFallback(profile.userProfileImage, user.photoURL),
                        });
                    }
                }
                catch (error) {
                    console.error('Failed to load user profile:', error);
                }
                finally {
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
        }
        catch (error) {
            console.error("Failed to load submissions:", error);
        }
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
                setUserProfile((prev) => prev ? {
                    ...prev,
                    firstName,
                    lastName,
                    phoneNumber: profileData.phoneNumber,
                    userProfileImage: profileData.profileImageUrl,
                    updatedAt: new Date().toISOString(),
                } : null);
                toast({
                    title: "Profile Updated",
                    description: "Your profile has been saved successfully.",
                });
            }
            else {
                throw new Error('Failed to update profile');
            }
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update profile.",
                variant: "destructive",
            });
        }
        finally {
            setIsSaving(false);
        }
    };
    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
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
            }
            else {
                throw new Error('Failed to update profile');
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
                toast({
                    title: "Avatar Updated",
                    description: "Your avatar has been updated successfully.",
                });
            }
            else {
                throw new Error('Failed to update avatar');
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
            // Profile updated successfully
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
    return (_jsxs("div", { className: "min-h-screen pt-20", style: { backgroundColor: colors.background }, children: [_jsx("div", { className: "max-w-7xl mx-auto px-4 py-8", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsx("div", { className: "lg:col-span-1", children: _jsx(Card, { className: "border-2 shadow-xl overflow-hidden", style: {
                                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                                    borderColor: `${colors.primary}40`,
                                    backdropFilter: 'blur(10px)',
                                }, children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "space-y-1 p-2", children: [(sidebarItems || []).map((item) => (_jsxs("button", { className: `w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 ${selectedSection === item.id
                                                    ? 'shadow-lg'
                                                    : 'hover:shadow-md'}`, style: {
                                                    backgroundColor: selectedSection === item.id ? colors.primary : 'transparent',
                                                    color: selectedSection === item.id ? 'white' : colors.text,
                                                }, onClick: () => setSelectedSection(item.id), children: [_jsx(item.icon, { size: 20 }), _jsx("span", { children: item.label })] }, item.id))), _jsx("div", { className: "my-4 mx-4 border-t", style: { borderColor: `${colors.primary}20` } }), _jsxs("button", { className: "w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-all duration-200 hover:shadow-md", style: {
                                                    backgroundColor: 'transparent',
                                                    color: '#EF4444',
                                                }, onClick: () => setShowLogoutDialog(true), children: [_jsx(LogOut, { size: 20 }), _jsx("span", { children: "Logout" })] })] }) }) }) }), _jsxs("div", { className: "lg:col-span-3", children: [selectedSection === "profile" && (_jsxs(Card, { className: "border-2 shadow-xl", style: {
                                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                                        borderColor: `${colors.primary}40`,
                                        backdropFilter: 'blur(10px)',
                                    }, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-black", style: { color: colors.text }, children: "Profile Settings" }), _jsx(CardDescription, { style: { color: `${colors.text}80` }, children: "Manage your account information and preferences" })] }), _jsx(CardContent, { className: "space-y-6", children: loading ? (_jsxs("div", { className: "flex items-center justify-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2", style: { borderColor: colors.primary } }), _jsx("span", { className: "ml-3", style: { color: colors.text }, children: "Loading profile..." })] })) : (_jsxs(_Fragment, { children: [_jsxs("div", { className: "flex items-start space-x-6", children: [_jsxs("div", { className: "relative", children: [_jsx("div", { className: "w-24 h-24 rounded-full shadow-lg ring-4 ring-offset-2 overflow-hidden", style: {
                                                                            background: profileData.profileImageUrl
                                                                                ? `url(${profileData.profileImageUrl}) center/cover`
                                                                                : gradient,
                                                                            '--ring-color': colors.primary,
                                                                            '--ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                                                        }, children: !profileData.profileImageUrl && (_jsx("div", { className: "w-full h-full flex items-center justify-center", children: _jsx(User, { size: 40, className: "text-white" }) })) }), _jsxs(DropdownMenu, { open: showChangeImageDropdown, onOpenChange: setShowChangeImageDropdown, children: [_jsx(DropdownMenuTrigger, { asChild: true, children: _jsx("button", { className: "absolute bottom-0 right-0 w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-0", style: {
                                                                                        backgroundColor: colors.primary,
                                                                                        border: `2px solid ${isDarkMode ? '#000000' : colors.primary}`,
                                                                                    }, title: "Change profile picture", "aria-label": "Change profile picture", children: _jsx(Camera, { size: 16, className: "text-white" }) }) }), _jsxs(DropdownMenuContent, { align: "start", className: "w-48", style: {
                                                                                    backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                                                                                    borderColor: `${colors.primary}40`,
                                                                                }, children: [_jsxs(DropdownMenuItem, { disabled: uploadingImage, children: [_jsx("label", { htmlFor: "image-upload", className: "flex items-center gap-2 cursor-pointer w-full", children: uploadingImage ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2", style: { borderColor: colors.primary } }), _jsx("span", { children: "Uploading..." })] })) : (_jsxs(_Fragment, { children: [_jsx(Upload, { size: 16 }), _jsx("span", { children: "Upload Photo" })] })) }), _jsx("input", { id: "image-upload", type: "file", accept: "image/*", className: "hidden", onChange: handleImageUpload, disabled: uploadingImage })] }), _jsxs(DropdownMenuItem, { onClick: () => {
                                                                                            { /* TODO: Check subscription status */ }
                                                                                            if (false) {
                                                                                                toast({
                                                                                                    title: "Premium Feature",
                                                                                                    description: "Premium avatars are available for subscribers only.",
                                                                                                });
                                                                                                return;
                                                                                            }
                                                                                            setShowAvatarSelector(true);
                                                                                            setShowChangeImageDropdown(false);
                                                                                        }, children: [_jsx(Crown, { size: 16 }), _jsx("span", { children: "Premium Avatars" })] })] })] })] }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("h3", { className: "font-bold text-lg", style: { color: colors.text }, children: "Profile Picture" }), _jsx("p", { className: "text-sm", style: { color: `${colors.text}80` }, children: "Upload a photo or choose from our premium avatar collection" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "displayName", style: { color: colors.text }, children: "Display Name" }), _jsx(Input, { id: "displayName", value: profileData.displayName, onChange: (e) => setProfileData(prev => ({ ...prev, displayName: e.target.value })), placeholder: "Enter your display name", className: "font-semibold", style: {
                                                                    backgroundColor: 'transparent',
                                                                    borderColor: `${colors.primary}40`,
                                                                    color: colors.text,
                                                                } })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", style: { color: colors.text }, children: "Email Address" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "email", value: profileData.email, disabled: true, className: "font-semibold", style: {
                                                                            backgroundColor: 'transparent',
                                                                            borderColor: `${colors.primary}40`,
                                                                            color: colors.text,
                                                                            opacity: 0.7,
                                                                        } }), user?.emailVerified && (_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { size: 14 }), "Verified"] }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "phoneNumber", style: { color: colors.text }, children: "Phone Number" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { id: "phoneNumber", value: profileData.phoneNumber, onChange: (e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value })), placeholder: "+1 (555) 123-4567", className: "font-semibold", style: {
                                                                            backgroundColor: 'transparent',
                                                                            borderColor: `${colors.primary}40`,
                                                                            color: colors.text,
                                                                        } }), false && (_jsxs(Badge, { variant: "outline", className: "flex items-center gap-1", children: [_jsx(CheckCircle, { size: 14 }), "Verified"] }))] })] }), _jsx(Button, { onClick: handleSaveProfile, disabled: isSaving, className: "w-full font-bold shadow-lg", style: {
                                                            backgroundColor: colors.primary,
                                                            color: 'white',
                                                        }, children: isSaving ? "Saving..." : "Save Changes" })] })) })] })), selectedSection === "subscription" && (_jsxs(Card, { className: "border-2 shadow-xl", style: {
                                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                                        borderColor: `${colors.primary}40`,
                                        backdropFilter: 'blur(10px)',
                                    }, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-black", style: { color: colors.text }, children: "Subscription Management" }), _jsx(CardDescription, { style: { color: `${colors.text}80` }, children: "Manage your subscription and billing information" })] }), _jsx(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "p-6 rounded-lg border-2", style: { borderColor: `${colors.primary}40` }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsx(Crown, { size: 24, style: { color: colors.accent } }), _jsx("h3", { className: "font-black text-xl", style: { color: colors.text }, children: "Legend Package" })] }), _jsx("p", { className: "text-sm mb-4", style: { color: `${colors.text}80` }, children: "Premium access to all features" }), _jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16, style: { color: colors.primary } }), _jsx("span", { className: "text-sm", style: { color: colors.text }, children: "Unlimited song submissions" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16, style: { color: colors.primary } }), _jsx("span", { className: "text-sm", style: { color: colors.text }, children: "Premium avatars & badges" })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { size: 16, style: { color: colors.primary } }), _jsx("span", { className: "text-sm", style: { color: colors.text }, children: "Early access to new features" })] })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-black text-2xl", style: { color: colors.primary }, children: "$9.99" }), _jsx("p", { className: "text-sm", style: { color: `${colors.text}80` }, children: "per month" })] })] }) }), _jsxs("div", { className: "space-y-4", children: [_jsx("h4", { className: "font-bold", style: { color: colors.text }, children: "Billing Information" }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg", style: { backgroundColor: `${colors.primary}10` }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(CreditCard, { size: 20, style: { color: colors.primary } }), _jsx("span", { className: "font-semibold", style: { color: colors.text }, children: "\u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 \u2022\u2022\u2022\u2022 4242" })] }), _jsx(Badge, { variant: "outline", children: "Visa" })] }), _jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg", style: { backgroundColor: `${colors.primary}10` }, children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx(Calendar, { size: 20, style: { color: colors.primary } }), _jsx("span", { className: "font-semibold", style: { color: colors.text }, children: "Next billing date" })] }), _jsx("span", { style: { color: colors.text }, children: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'MMM dd, yyyy') })] })] })] }), _jsx("div", { className: "pt-4 border-t", style: { borderColor: `${colors.primary}20` }, children: _jsx(Button, { variant: "outline", onClick: () => setShowCancelSubscriptionDialog(true), className: "w-full font-semibold focus:outline-none focus:ring-0", style: {
                                                            borderColor: '#EF4444',
                                                            color: '#EF4444',
                                                        }, children: "Cancel Subscription" }) })] })] })), selectedSection === "submissions" && (_jsxs(Card, { className: "border-2 shadow-xl", style: {
                                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.95)',
                                        borderColor: `${colors.primary}40`,
                                        backdropFilter: 'blur(10px)',
                                    }, children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-2xl font-black", style: { color: colors.text }, children: "Submission Requests" }), _jsx(CardDescription, { style: { color: `${colors.text}80` }, children: "Track your song submission history" })] }), _jsx(CardContent, { children: false ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(Crown, { size: 48, className: "mx-auto mb-4 opacity-50", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold text-lg mb-2", style: { color: colors.text }, children: "Premium Feature" }), _jsx("p", { className: "mb-6", style: { color: `${colors.text}80` }, children: "Song submissions are available for premium subscribers only" }), _jsx(Button, { onClick: () => setLocation("/subscription"), className: "font-bold shadow-lg focus:outline-none focus:ring-0", style: {
                                                            backgroundColor: colors.primary,
                                                            color: 'white',
                                                        }, children: "Upgrade to Premium" })] })) : (submissions?.length || 0) === 0 ? (_jsxs("div", { className: "text-center py-12", children: [_jsx(FileText, { size: 48, className: "mx-auto mb-4 opacity-50", style: { color: colors.primary } }), _jsx("h3", { className: "font-bold text-lg mb-2", style: { color: colors.text }, children: "No Submissions Yet" }), _jsx("p", { style: { color: `${colors.text}80` }, children: "You haven't submitted any songs yet" })] })) : (_jsx("div", { className: "space-y-4", children: (submissions || []).map((submission) => (_jsx("div", { className: "p-4 rounded-lg border transition-all duration-200 hover:shadow-md", style: {
                                                        borderColor: `${colors.primary}20`,
                                                        backgroundColor: `${colors.primary}05`,
                                                    }, children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-bold", style: { color: colors.text }, children: [submission.artistName, " - ", submission.songTitle] }), _jsxs("p", { className: "text-sm mt-1", style: { color: `${colors.text}80` }, children: ["Submitted on ", format(new Date(submission.createdAt), 'MMM dd, yyyy')] })] }), _jsx(Badge, { variant: submission.status === 'approved' ? 'default' :
                                                                    submission.status === 'rejected' ? 'destructive' :
                                                                        'secondary', children: submission.status })] }) }, submission.id))) })) })] }))] })] }) }), _jsx(AvatarSelector, { isOpen: showAvatarSelector, onClose: () => setShowAvatarSelector(false), currentAvatar: profileData.profileImageUrl, onAvatarUpdate: handleAvatarSelect, userID: userProfile?.userID || user?.uid || "" }), _jsx(AlertDialog, { open: showCancelSubscriptionDialog, onOpenChange: setShowCancelSubscriptionDialog, children: _jsxs(AlertDialogContent, { style: {
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: `${colors.primary}40`,
                    }, children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { className: "text-xl font-black", style: { color: colors.text }, children: "Cancel Subscription" }), _jsx(AlertDialogDescription, { style: { color: `${colors.text}80` }, children: [_jsx(AlertCircle, { className: "inline mr-2", size: 16 }), "Are you sure you want to cancel your subscription? You'll lose access to premium features at the end of your billing cycle."] })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { style: { color: colors.text }, className: "focus:outline-none focus:ring-0", children: "Keep Subscription" }), _jsx(AlertDialogAction, { onClick: handleCancelSubscription, className: "bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-0", children: "Cancel Subscription" })] })] }) }), _jsx(AlertDialog, { open: showLogoutDialog, onOpenChange: setShowLogoutDialog, children: _jsxs(AlertDialogContent, { style: {
                        backgroundColor: isDarkMode ? 'rgba(0, 0, 0, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: `${colors.primary}40`,
                    }, children: [_jsxs(AlertDialogHeader, { children: [_jsx(AlertDialogTitle, { className: "text-xl font-black", style: { color: colors.text }, children: "Confirm Logout" }), _jsx(AlertDialogDescription, { style: { color: `${colors.text}80` }, children: "Are you sure you want to log out of your account?" })] }), _jsxs(AlertDialogFooter, { children: [_jsx(AlertDialogCancel, { style: { color: colors.text }, className: "focus:outline-none focus:ring-0", children: "Cancel" }), _jsx(AlertDialogAction, { onClick: handleLogout, className: "bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-0", children: "Logout" })] })] }) })] }));
}

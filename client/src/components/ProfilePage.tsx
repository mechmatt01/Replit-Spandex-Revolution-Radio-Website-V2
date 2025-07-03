import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  User,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  Crown,
  Upload,
  Image,
  LogOut,
  FileText,
  Star,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import AvatarSelector from "./AvatarSelector";
import VerificationModal from "./VerificationModal";

export default function ProfilePage() {
  const { user, isAuthenticated, logout, refreshUser } = useAuth();
  const [, setLocation] = useLocation();
  const { colors } = useTheme();
  const { toast } = useToast();

  // States
  const [selectedSection, setSelectedSection] = useState("profile");
  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
  });
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<"email" | "phone">(
    "email",
  );
  const [loading, setLoading] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/");
    }
  }, [isAuthenticated, setLocation]);

  // Load user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phoneNumber: user.phoneNumber || "",
        email: user.email || "",
      });
    }
  }, [user]);

  // Load submissions
  useEffect(() => {
    if (user && user.activeSubscription) {
      loadSubmissions();
    }
  }, [user]);

  const loadSubmissions = async () => {
    try {
      const data = await apiRequest("GET", "/api/user/submissions");
      setSubmissions(data);
    } catch (error) {
      console.error("Failed to load submissions:", error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await apiRequest("POST", "/api/user/update-profile", profileData);
      await refreshUser();
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (type: string) => {
    if (type === "upload") {
      setShowAvatarSelector(true);
    } else if (type === "avatars") {
      if (!user?.activeSubscription) {
        setLocation("/subscription");
        return;
      }
      setShowAvatarSelector(true);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await apiRequest("POST", "/api/subscription/cancel");
      await refreshUser();
      toast({
        title: "Subscription Cancelled",
        description:
          "Your subscription has been cancelled and will end at the next billing cycle.",
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
    await logout();
    setLocation("/");
  };

  const handleVerification = (type: "email" | "phone") => {
    setVerificationType(type);
    setShowVerificationModal(true);
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
    ...(user.activeSubscription
      ? [{ id: "submissions", label: "Submission Requests", icon: FileText }]
      : []),
    { id: "logout", label: "Logout", icon: LogOut },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card
              style={{
                backgroundColor: colors.cardBackground,
                borderColor: colors.primary,
              }}
            >
              <CardContent className="p-0">
                <div className="space-y-1">
                  {sidebarItems.map((item) => (
                    <Button
                      key={item.id}
                      variant="ghost"
                      className={`w-full justify-start text-left p-4 h-auto ${
                        selectedSection === item.id ? "bg-orange-500/10" : ""
                      } ${item.id === "logout" ? "text-red-500 hover:text-red-600 hover:bg-red-50" : ""}`}
                      style={{
                        color:
                          item.id === "logout"
                            ? "#EF4444"
                            : selectedSection === item.id
                              ? colors.primary
                              : colors.text,
                      }}
                      onClick={() => {
                        if (item.id === "logout") {
                          // Logout handled by AlertDialog
                          return;
                        }
                        setSelectedSection(item.id);
                      }}
                    >
                      {item.id === "logout" ? (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <div className="flex items-center gap-3 w-full">
                              <item.icon className="h-5 w-5" />
                              <span className="font-medium">{item.label}</span>
                            </div>
                          </AlertDialogTrigger>
                          <AlertDialogContent
                            style={{
                              backgroundColor: colors.cardBackground,
                              borderColor: colors.primary,
                            }}
                          >
                            <AlertDialogHeader>
                              <AlertDialogTitle style={{ color: colors.text }}>
                                Confirm Logout
                              </AlertDialogTitle>
                              <AlertDialogDescription
                                style={{ color: colors.text + "80" }}
                              >
                                Are you sure you want to log out of your
                                account?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel style={{ color: colors.text }}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleLogout}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                Logout
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      ) : (
                        <div className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span className="font-medium">{item.label}</span>
                        </div>
                      )}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {selectedSection === "profile" && (
              <Card
                style={{
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text }}>Profile</CardTitle>
                  <CardDescription style={{ color: colors.text + "80" }}>
                    Manage your personal information and profile settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Profile Image */}
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <img
                        src={
                          user.profileImageUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + " " + user.lastName)}&background=f97316&color=fff&size=120`
                        }
                        alt="Profile"
                        className="w-24 h-24 rounded-full object-cover border-4"
                        style={{ borderColor: colors.primary }}
                      />
                      {user.activeSubscription && (
                        <div
                          className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full border-2 border-white flex items-center justify-center"
                          style={{ backgroundColor: colors.primary }}
                        >
                          <Crown className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                          }}
                        >
                          Change
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        style={{
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.primary,
                        }}
                      >
                        <DropdownMenuItem
                          onClick={() => handleAvatarChange("upload")}
                          style={{ color: colors.text }}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload from File
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleAvatarChange("avatars")}
                          className="flex flex-col items-start p-3"
                          style={{ color: colors.text }}
                        >
                          <div className="flex items-center">
                            <Image className="h-4 w-4 mr-2" />
                            Spandex Salvation Avatars
                          </div>
                          {!user.activeSubscription && (
                            <span className="text-xs opacity-60 mt-1">
                              Subscription Required
                            </span>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" style={{ color: colors.text }}>
                        User Display Name
                      </Label>
                      <Input
                        id="firstName"
                        value={profileData.firstName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            firstName: e.target.value,
                          }))
                        }
                        style={{
                          color: colors.text,
                          backgroundColor: colors.background,
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" style={{ color: colors.text }}>
                        Last Name
                      </Label>
                      <Input
                        id="lastName"
                        value={profileData.lastName}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            lastName: e.target.value,
                          }))
                        }
                        style={{
                          color: colors.text,
                          backgroundColor: colors.background,
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" style={{ color: colors.text }}>
                      Phone Number
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="phoneNumber"
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            phoneNumber: e.target.value,
                          }))
                        }
                        placeholder={
                          profileData.phoneNumber || "Enter your phone number"
                        }
                        style={{
                          color: colors.text,
                          backgroundColor: colors.background,
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleVerification("phone")}
                        style={{
                          borderColor: colors.primary,
                          color: colors.primary,
                        }}
                      >
                        {user.isPhoneVerified ? "Verified" : "Verify"}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" style={{ color: colors.text }}>
                      Email Address
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          setProfileData((prev) => ({
                            ...prev,
                            email: e.target.value,
                          }))
                        }
                        style={{
                          color: colors.text,
                          backgroundColor: colors.background,
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleVerification("email")}
                        style={{
                          borderColor: colors.primary,
                          color: colors.primary,
                        }}
                      >
                        {user.isEmailVerified ? "Verified" : "Verify"}
                      </Button>
                    </div>
                  </div>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                    className="w-full"
                    style={{ backgroundColor: colors.primary, color: "white" }}
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </CardContent>
              </Card>
            )}

            {selectedSection === "subscription" && user.activeSubscription && (
              <Card
                style={{
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text }}>
                    Subscription Management
                  </CardTitle>
                  <CardDescription style={{ color: colors.text + "80" }}>
                    Manage your subscription and billing information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Star
                          className="h-6 w-6"
                          style={{ color: colors.primary }}
                        />
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: colors.text }}
                          >
                            {user.subscriptionTier?.charAt(0).toUpperCase() +
                              user.subscriptionTier?.slice(1)}{" "}
                            Plan
                          </h3>
                          <p
                            className="text-sm opacity-75"
                            style={{ color: colors.text }}
                          >
                            Current subscription tier
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <CreditCard
                          className="h-6 w-6"
                          style={{ color: colors.primary }}
                        />
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: colors.text }}
                          >
                            $9.99/month
                          </h3>
                          <p
                            className="text-sm opacity-75"
                            style={{ color: colors.text }}
                          >
                            Current price
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Calendar
                          className="h-6 w-6"
                          style={{ color: colors.primary }}
                        />
                        <div>
                          <h3
                            className="font-semibold"
                            style={{ color: colors.text }}
                          >
                            {user.renewalDate
                              ? new Date(user.renewalDate).toLocaleDateString()
                              : "Next month"}
                          </h3>
                          <p
                            className="text-sm opacity-75"
                            style={{ color: colors.text }}
                          >
                            Next renewal date
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div
                        className="p-4 border rounded-lg"
                        style={{ borderColor: "#374151" }}
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <CreditCard
                            className="h-5 w-5"
                            style={{ color: colors.primary }}
                          />
                          <span
                            className="font-medium"
                            style={{ color: colors.text }}
                          >
                            Payment Method
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span style={{ color: colors.text }}>
                            •••• •••• •••• 4242
                          </span>
                          <Badge variant="secondary">VISA</Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent
                      style={{
                        backgroundColor: colors.cardBackground,
                        borderColor: "#EF4444",
                      }}
                    >
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-red-600">
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription style={{ color: colors.text }}>
                          Your subscription will be cancelled and you'll lose
                          access to premium features at the end of your current
                          billing period.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel style={{ color: colors.text }}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleCancelSubscription}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Confirm
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            )}

            {selectedSection === "submissions" && user.activeSubscription && (
              <Card
                style={{
                  backgroundColor: colors.cardBackground,
                  borderColor: colors.primary,
                }}
              >
                <CardHeader>
                  <CardTitle style={{ color: colors.text }}>
                    Submission Requests
                  </CardTitle>
                  <CardDescription style={{ color: colors.text + "80" }}>
                    View and manage your song submission requests.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submissions.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText
                        className="h-12 w-12 mx-auto mb-4 opacity-50"
                        style={{ color: colors.text }}
                      />
                      <p className="mb-4" style={{ color: colors.text }}>
                        You haven't submitted any requests yet.
                      </p>
                      <Button
                        onClick={() => setLocation("/contact")}
                        style={{
                          backgroundColor: colors.primary,
                          color: "white",
                        }}
                      >
                        Submit New Request
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {submissions.map((submission: any, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg"
                          style={{ borderColor: "#374151" }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3
                                className="font-semibold"
                                style={{ color: colors.text }}
                              >
                                {submission.title || "Song Request"}
                              </h3>
                              <p
                                className="text-sm opacity-75"
                                style={{ color: colors.text }}
                              >
                                {submission.description || submission.message}
                              </p>
                            </div>
                            <Badge variant="secondary">
                              {submission.status || "Pending"}
                            </Badge>
                          </div>
                          <p
                            className="text-xs opacity-50 mt-2"
                            style={{ color: colors.text }}
                          >
                            Submitted:{" "}
                            {new Date(
                              submission.createdAt,
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <AvatarSelector
        isOpen={showAvatarSelector}
        onClose={() => setShowAvatarSelector(false)}
        currentAvatar={user.profileImageUrl}
        onAvatarUpdate={async (avatarUrl) => {
          await refreshUser();
        }}
      />

      <VerificationModal
        isOpen={showVerificationModal}
        onClose={() => setShowVerificationModal(false)}
        type={verificationType}
        contactInfo={
          verificationType === "email"
            ? profileData.email
            : profileData.phoneNumber
        }
      />
    </div>
  );
}

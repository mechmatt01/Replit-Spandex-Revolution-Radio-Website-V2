import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { User, Phone, Mail, MapPin, CreditCard, Trash2, Shield, Crown, Star, Calendar, Camera, Bell, Volume2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import AvatarSelector from './AvatarSelector';
import VerificationModal from './VerificationModal';

interface SubscriptionTier {
  id: string;
  name: string;
  price: number;
  features: string[];
  icon: React.ReactNode;
  color: string;
}

const SUBSCRIPTION_TIERS: SubscriptionTier[] = [
  {
    id: 'rebel',
    name: 'Rebel',
    price: 4.99,
    features: ['Ad-free listening', 'High quality audio', 'Mobile app access'],
    icon: <Volume2 className="h-5 w-5" />,
    color: '#10B981'
  },
  {
    id: 'legend',
    name: 'Legend',
    price: 9.99,
    features: ['Everything in Rebel', 'Exclusive content', 'Chat privileges', 'Custom avatar uploads'],
    icon: <Star className="h-5 w-5" />,
    color: '#F59E0B'
  },
  {
    id: 'icon',
    name: 'Icon',
    price: 19.99,
    features: ['Everything in Legend', 'VIP chat', 'Early access', 'Direct artist contact', 'Premium avatars'],
    icon: <Crown className="h-5 w-5" />,
    color: '#8B5CF6'
  }
];

export default function ProfileManagement() {
  const { user, refreshUser } = useAuth();
  const { colors } = useTheme();
  const { toast } = useToast();
  
  // Form states
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    username: '',
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    showVerifiedBadge: true,
    locationSharing: true,
  });
  
  // Modal states
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationType, setVerificationType] = useState<'email' | 'phone'>('email');
  const [loading, setLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        username: user.username || '',
      });
      setPreferences({
        emailNotifications: true, // Default values - would come from user preferences
        pushNotifications: true,
        showVerifiedBadge: user.showVerifiedBadge || false,
        locationSharing: true,
      });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await apiRequest('POST', '/api/user/update-profile', profileData);
      await refreshUser();
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
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

  const handlePreferencesUpdate = async () => {
    try {
      await apiRequest('POST', '/api/user/update-preferences', preferences);
      
      toast({
        title: "Preferences Updated",
        description: "Your preferences have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update preferences.",
        variant: "destructive",
      });
    }
  };

  const handleSubscription = async (tierId: string) => {
    setSubscriptionLoading(true);
    
    try {
      const response = await apiRequest('POST', '/api/subscription/create', { 
        plan: tierId 
      });
      
      // Redirect to Stripe checkout
      window.location.href = response.checkoutUrl;
    } catch (error: any) {
      toast({
        title: "Subscription Error",
        description: error.message || "Failed to process subscription.",
        variant: "destructive",
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      await apiRequest('POST', '/api/subscription/cancel');
      await refreshUser();
      
      toast({
        title: "Subscription Cancelled",
        description: "Your subscription has been cancelled. You'll retain access until the end of your billing period.",
      });
    } catch (error: any) {
      toast({
        title: "Cancellation Failed",
        description: error.message || "Failed to cancel subscription.",
        variant: "destructive",
      });
    }
  };

  const handleAccountDeletion = async () => {
    try {
      await apiRequest('POST', '/api/user/schedule-deletion');
      
      toast({
        title: "Account Deletion Scheduled",
        description: "Your account will be deleted in 30 days. You can cancel this at any time before then.",
        variant: "destructive",
      });
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to schedule account deletion.",
        variant: "destructive",
      });
    }
  };

  const handleVerification = (type: 'email' | 'phone') => {
    setVerificationType(type);
    setShowVerificationModal(true);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: colors.text }}>Please log in to access your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="relative">
          <div 
            className="w-20 h-20 rounded-full border-2 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ borderColor: colors.primary }}
            onClick={() => setShowAvatarSelector(true)}
          >
            <img
              src={user.profileImageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName + ' ' + user.lastName)}&background=f97316&color=fff&size=80`}
              alt="Profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <Button
            size="sm"
            className="absolute -bottom-1 -right-1 rounded-full w-8 h-8 p-0"
            style={{ backgroundColor: colors.primary }}
            onClick={() => setShowAvatarSelector(true)}
          >
            <Camera className="h-4 w-4" />
          </Button>
        </div>
        
        <div>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>
            {user.firstName} {user.lastName}
          </h1>
          <p className="opacity-75" style={{ color: colors.text }}>
            @{user.username}
          </p>
          <div className="flex items-center gap-2 mt-2">
            {user.activeSubscription && (
              <Badge style={{ backgroundColor: SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.color }}>
                {SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.icon}
                <span className="ml-1">{SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.name}</span>
              </Badge>
            )}
            {user.showVerifiedBadge && (
              <Badge variant="secondary">
                <Shield className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-4" style={{ backgroundColor: colors.background }}>
          <TabsTrigger value="profile" style={{ color: colors.text }}>Profile</TabsTrigger>
          <TabsTrigger value="subscription" style={{ color: colors.text }}>Subscription</TabsTrigger>
          <TabsTrigger value="preferences" style={{ color: colors.text }}>Preferences</TabsTrigger>
          <TabsTrigger value="security" style={{ color: colors.text }}>Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card style={{ backgroundColor: colors.cardBackground, borderColor: colors.primary }}>
            <CardHeader>
              <CardTitle style={{ color: colors.text }}>Profile Information</CardTitle>
              <CardDescription style={{ color: colors.text + '80' }}>
                Update your personal information and contact details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" style={{ color: colors.text }}>First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      style={{ color: colors.text, backgroundColor: colors.background }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" style={{ color: colors.text }}>Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      style={{ color: colors.text, backgroundColor: colors.background }}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="username" style={{ color: colors.text }}>Username</Label>
                  <Input
                    id="username"
                    value={profileData.username}
                    onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                    style={{ color: colors.text, backgroundColor: colors.background }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" style={{ color: colors.text }}>Email Address</Label>
                  <div className="flex gap-2">
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      style={{ color: colors.text, backgroundColor: colors.background }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleVerification('email')}
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      {user.isEmailVerified ? (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Mail className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" style={{ color: colors.text }}>Phone Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="phoneNumber"
                      type="tel"
                      value={profileData.phoneNumber}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      style={{ color: colors.text, backgroundColor: colors.background }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleVerification('phone')}
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      {user.isPhoneVerified ? (
                        <>
                          <Shield className="h-4 w-4 mr-1" />
                          Verified
                        </>
                      ) : (
                        <>
                          <Phone className="h-4 w-4 mr-1" />
                          Verify
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscription">
          <div className="space-y-6">
            {user.activeSubscription ? (
              <Card style={{ backgroundColor: colors.cardBackground, borderColor: colors.primary }}>
                <CardHeader>
                  <CardTitle style={{ color: colors.text }}>Current Subscription</CardTitle>
                  <CardDescription style={{ color: colors.text + '80' }}>
                    You are currently subscribed to the {SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.name} plan.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.icon}
                      <div>
                        <h3 className="font-semibold" style={{ color: colors.text }}>
                          {SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.name} Plan
                        </h3>
                        <p className="text-sm opacity-75" style={{ color: colors.text }}>
                          ${SUBSCRIPTION_TIERS.find(t => t.id === user.subscriptionTier)?.price}/month
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {user.renewalDate && (
                        <p className="text-sm opacity-75" style={{ color: colors.text }}>
                          Renews on {new Date(user.renewalDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full">
                        Cancel Subscription
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent style={{ backgroundColor: colors.cardBackground, borderColor: colors.primary }}>
                      <AlertDialogHeader>
                        <AlertDialogTitle style={{ color: colors.text }}>
                          Cancel Subscription?
                        </AlertDialogTitle>
                        <AlertDialogDescription style={{ color: colors.text + '80' }}>
                          You'll lose access to premium features at the end of your billing period. 
                          You can resubscribe at any time.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel style={{ color: colors.text }}>Keep Subscription</AlertDialogCancel>
                        <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">
                          Cancel Subscription
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {SUBSCRIPTION_TIERS.map((tier) => (
                  <Card 
                    key={tier.id} 
                    className="relative overflow-hidden hover:scale-105 transition-transform"
                    style={{ backgroundColor: colors.cardBackground, borderColor: tier.color }}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <div style={{ color: tier.color }}>
                          {tier.icon}
                        </div>
                        <CardTitle style={{ color: colors.text }}>{tier.name}</CardTitle>
                      </div>
                      <div className="text-3xl font-bold" style={{ color: colors.text }}>
                        ${tier.price}
                        <span className="text-sm font-normal opacity-75">/month</span>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 mb-6">
                        {tier.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-sm" style={{ color: colors.text }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tier.color }} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleSubscription(tier.id)}
                        disabled={subscriptionLoading}
                        className="w-full"
                        style={{ backgroundColor: tier.color, color: 'white' }}
                      >
                        {subscriptionLoading ? 'Processing...' : 'Subscribe'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="preferences">
          <Card style={{ backgroundColor: colors.cardBackground, borderColor: colors.primary }}>
            <CardHeader>
              <CardTitle style={{ color: colors.text }}>Preferences</CardTitle>
              <CardDescription style={{ color: colors.text + '80' }}>
                Customize your experience and notification settings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notifications" style={{ color: colors.text }}>Email Notifications</Label>
                  <p className="text-sm opacity-75" style={{ color: colors.text }}>
                    Receive updates about new shows and features
                  </p>
                </div>
                <Switch
                  id="email-notifications"
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, emailNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notifications" style={{ color: colors.text }}>Push Notifications</Label>
                  <p className="text-sm opacity-75" style={{ color: colors.text }}>
                    Get notified when your favorite shows start
                  </p>
                </div>
                <Switch
                  id="push-notifications"
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="verified-badge" style={{ color: colors.text }}>Show Verified Badge</Label>
                  <p className="text-sm opacity-75" style={{ color: colors.text }}>
                    Display verification status on your profile
                  </p>
                </div>
                <Switch
                  id="verified-badge"
                  checked={preferences.showVerifiedBadge}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showVerifiedBadge: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="location-sharing" style={{ color: colors.text }}>Location Sharing</Label>
                  <p className="text-sm opacity-75" style={{ color: colors.text }}>
                    Show your location on the live listener map
                  </p>
                </div>
                <Switch
                  id="location-sharing"
                  checked={preferences.locationSharing}
                  onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, locationSharing: checked }))}
                />
              </div>

              <Button
                onClick={handlePreferencesUpdate}
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <div className="space-y-6">
            <Card style={{ backgroundColor: colors.cardBackground, borderColor: colors.primary }}>
              <CardHeader>
                <CardTitle style={{ color: colors.text }}>Account Security</CardTitle>
                <CardDescription style={{ color: colors.text + '80' }}>
                  Manage your account security and verification status.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#374151' }}>
                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5" style={{ color: colors.primary }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Email Verification</p>
                      <p className="text-sm opacity-75" style={{ color: colors.text }}>
                        {user.isEmailVerified ? 'Your email is verified' : 'Please verify your email address'}
                      </p>
                    </div>
                  </div>
                  {user.isEmailVerified ? (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerification('email')}
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      Verify Now
                    </Button>
                  )}
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg" style={{ borderColor: '#374151' }}>
                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5" style={{ color: colors.primary }} />
                    <div>
                      <p className="font-medium" style={{ color: colors.text }}>Phone Verification</p>
                      <p className="text-sm opacity-75" style={{ color: colors.text }}>
                        {user.isPhoneVerified ? 'Your phone number is verified' : 'Please verify your phone number'}
                      </p>
                    </div>
                  </div>
                  {user.isPhoneVerified ? (
                    <Badge variant="secondary">
                      <Shield className="h-3 w-3 mr-1" />
                      Verified
                    </Badge>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleVerification('phone')}
                      style={{ borderColor: colors.primary, color: colors.primary }}
                    >
                      Verify Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200" style={{ backgroundColor: colors.cardBackground, borderColor: '#EF4444' }}>
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription style={{ color: colors.text + '80' }}>
                  Permanently delete your account and all associated data.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent style={{ backgroundColor: colors.cardBackground, borderColor: '#EF4444' }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-red-600">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription style={{ color: colors.text }}>
                        This action cannot be undone. This will permanently delete your account,
                        cancel any active subscriptions, and remove all your data from our servers.
                        Your account will be scheduled for deletion in 30 days, during which you can still cancel this action.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel style={{ color: colors.text }}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAccountDeletion} className="bg-red-600 hover:bg-red-700">
                        Schedule Deletion
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

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
        contactInfo={verificationType === 'email' ? profileData.email : profileData.phoneNumber}
      />
    </div>
  );
}
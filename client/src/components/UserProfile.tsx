import React, { useState, useEffect } from 'react';
import { useFirebaseAuth } from '../contexts/FirebaseAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usePremiumTest } from '../contexts/PremiumTestContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { useToast } from '../hooks/use-toast';
import { 
  User, 
  CreditCard, 
  Settings, 
  Crown, 
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  Edit,
  Save,
  Trash2
} from 'lucide-react';
import StripePaymentProcessor from './StripePaymentProcessor';

interface Subscription {
  id: string;
  status: string;
  plan: string;
  current_period_end: number;
  cancel_at_period_end: boolean;
  amount: number;
  currency: string;
}

interface UserProfileProps {
  onClose: () => void;
}

export default function UserProfile({ onClose }: UserProfileProps) {
  const { user, isAuthenticated } = useFirebaseAuth();
  const { colors } = useTheme();
  const { getEffectivePremiumStatus, actualPremiumStatus } = usePremiumTest();
  const { toast } = useToast();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    bio: '',
    location: '',
    website: ''
  });

  const hasPremiumSubscription = getEffectivePremiumStatus();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUserSubscriptions();
    }
  }, [isAuthenticated, user]);

  const fetchUserSubscriptions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Mock subscription data - in production, fetch from Stripe
      const mockSubscriptions: Subscription[] = hasPremiumSubscription ? [{
        id: 'sub_123',
        status: 'active',
        plan: 'Legend',
        current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60),
        cancel_at_period_end: false,
        amount: 1299,
        currency: 'usd'
      }] : [];
      
      setSubscriptions(mockSubscriptions);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch subscription data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId })
      });

      if (response.ok) {
        toast({
          title: 'Subscription Cancelled',
          description: 'Your subscription has been cancelled. You will retain access until the end of your billing period.'
        });
        fetchUserSubscriptions();
      } else {
        throw new Error('Failed to cancel subscription');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      // In production, save to Firebase
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.'
      });
      setEditingProfile(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const getSubscriptionStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'canceled': return 'bg-red-500';
      case 'past_due': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-full max-w-md mx-4" style={{ backgroundColor: colors.surface }}>
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
            <h3 className="text-lg font-semibold mb-2">Authentication Required</h3>
            <p className="text-gray-400 mb-4">Please log in to access your profile.</p>
            <Button onClick={onClose}>Close</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <Card className="w-full h-full" style={{ backgroundColor: colors.surface }}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-6 w-6" style={{ color: colors.primary }} />
              <div>
                <CardTitle className="text-xl">User Profile</CardTitle>
                <p className="text-sm text-gray-400">{user?.email}</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>

          <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger value="profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </TabsTrigger>
                <TabsTrigger value="subscription" className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  Subscription
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Billing
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </TabsTrigger>
              </TabsList>

              {/* Profile Tab */}
              <TabsContent value="profile" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Profile Information</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingProfile(!editingProfile)}
                  >
                    {editingProfile ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
                    {editingProfile ? 'Save' : 'Edit'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={profileData.displayName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                      disabled={!editingProfile}
                      style={{ backgroundColor: colors.background }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      style={{ backgroundColor: colors.background }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                      disabled={!editingProfile}
                      placeholder="City, Country"
                      style={{ backgroundColor: colors.background }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      disabled={!editingProfile}
                      placeholder="https://yourwebsite.com"
                      style={{ backgroundColor: colors.background }}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    disabled={!editingProfile}
                    placeholder="Tell us about yourself..."
                    className="w-full h-24 p-3 rounded-md border resize-none"
                    style={{ backgroundColor: colors.background, borderColor: colors.border }}
                  />
                </div>

                {editingProfile && (
                  <div className="flex gap-2">
                    <Button onClick={handleSaveProfile} disabled={loading}>
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={() => setEditingProfile(false)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Subscription Tab */}
              <TabsContent value="subscription" className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Subscription Status</h3>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${hasPremiumSubscription ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                    <span className="text-sm font-medium">
                      {hasPremiumSubscription ? 'Premium Active' : 'Free Tier'}
                    </span>
                  </div>
                </div>

                {hasPremiumSubscription ? (
                  <div className="space-y-4">
                    {subscriptions.map((subscription) => (
                      <Card key={subscription.id} style={{ backgroundColor: colors.background }}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Crown className="h-5 w-5 text-yellow-500" />
                              <div>
                                <h4 className="font-semibold">{subscription.plan} Plan</h4>
                                <p className="text-sm text-gray-400">
                                  ${subscription.amount / 100}/month
                                </p>
                              </div>
                            </div>
                            <Badge className={getSubscriptionStatusColor(subscription.status)}>
                              {subscription.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Next billing:</span>
                              <p className="font-medium">{formatDate(subscription.current_period_end)}</p>
                            </div>
                            <div>
                              <span className="text-gray-400">Status:</span>
                              <p className="font-medium">
                                {subscription.cancel_at_period_end ? 'Cancels at period end' : 'Auto-renewing'}
                              </p>
                            </div>
                          </div>

                          <hr className="my-4 border-gray-200" />

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelSubscription(subscription.id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Cancel Subscription
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setActiveTab('billing')}
                            >
                              <CreditCard className="h-4 w-4 mr-2" />
                              Manage Billing
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Crown className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
                    <p className="text-gray-400 mb-6">
                      Unlock exclusive features, ad-free streaming, and premium content.
                    </p>
                    <Button
                      onClick={() => setShowSubscriptionPlans(true)}
                      style={{ backgroundColor: colors.primary }}
                    >
                      <Crown className="h-4 w-4 mr-2" />
                      View Subscription Plans
                    </Button>
                  </div>
                )}
              </TabsContent>

              {/* Billing Tab */}
              <TabsContent value="billing" className="space-y-6">
                <h3 className="text-lg font-semibold">Billing History</h3>
                <div className="text-center py-8">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">No Billing History</h3>
                  <p className="text-gray-400">
                    Your billing history will appear here once you have an active subscription.
                  </p>
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="space-y-6">
                <h3 className="text-lg font-semibold">Account Settings</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-gray-400">Receive updates about your subscription and account</p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <div>
                      <h4 className="font-medium">Marketing Emails</h4>
                      <p className="text-sm text-gray-400">Receive promotional content and new feature announcements</p>
                    </div>
                    <Switch />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg" style={{ backgroundColor: colors.background }}>
                    <div>
                      <h4 className="font-medium">Two-Factor Authentication</h4>
                      <p className="text-sm text-gray-400">Add an extra layer of security to your account</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Enable
                    </Button>
                  </div>
                </div>

                <hr className="border-gray-200" />

                <div className="space-y-4">
                  <h4 className="font-medium text-red-400">Danger Zone</h4>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-red-200" style={{ backgroundColor: colors.background }}>
                    <div>
                      <h4 className="font-medium text-red-400">Delete Account</h4>
                      <p className="text-sm text-gray-400">Permanently delete your account and all data</p>
                    </div>
                    <Button variant="destructive" size="sm">
                      Delete Account
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Subscription Plans Modal */}
      {showSubscriptionPlans && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Choose Your Subscription Plan</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowSubscriptionPlans(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
              <StripePaymentProcessor />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { 
  Settings, 
  Music, 
  Calendar, 
  ShoppingBag, 
  Users, 
  TrendingUp, 
  Edit,
  Save,
  Trash2,
  Plus,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Package,
  Cog,
  Radio
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

interface MerchItem {
  id: number;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
  isActive: boolean;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ShowScheduleItem {
  id: number;
  title: string;
  description: string;
  host: string;
  dayOfWeek: string;
  time: string;
  duration: number;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  isAdmin: boolean;
  isActiveListening: boolean;
  activeSubscription: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface Setting {
  id: number;
  key: string;
  value: string;
  description?: string;
  updatedBy?: string;
  updatedAt: string;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
  const [editingShow, setEditingShow] = useState<ShowScheduleItem | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newMerchItem, setNewMerchItem] = useState<Partial<MerchItem>>({
    name: "",
    description: "",
    price: 0,
    category: "",
    stock: 0,
    featured: false,
    isActive: true
  });
  const [newShowItem, setNewShowItem] = useState<Partial<ShowScheduleItem>>({
    title: "",
    description: "",
    host: "",
    dayOfWeek: "",
    time: "",
    duration: 60,
    isActive: true
  });
  const [showAddMerch, setShowAddMerch] = useState(false);
  const [showAddShow, setShowAddShow] = useState(false);
  const [liveDataEnabled, setLiveDataEnabled] = useState(true);
  
  const { colors, isDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Mock authentication check
  const handleAuth = () => {
    if (adminUsername === "admin" && adminPassword === "metaladmin123") {
      setIsAuthenticated(true);
      toast({
        title: "Authentication Successful",
        description: "Welcome to the admin panel!",
      });
    } else {
      toast({
        title: "Authentication Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Data fetching hooks
  const { data: merchandise = [], isLoading: merchLoading } = useQuery({
    queryKey: ['/api/merchandise'],
    enabled: isAuthenticated
  });

  const { data: showSchedules = [], isLoading: showsLoading } = useQuery({
    queryKey: ['/api/show-schedules'],
    enabled: isAuthenticated
  });

  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    enabled: isAuthenticated
  });

  const { data: settings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/settings'],
    enabled: isAuthenticated
  });

  const { data: submissions = [], isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions'],
    enabled: isAuthenticated
  });

  // Mutations
  const createMerchMutation = useMutation({
    mutationFn: (data: Partial<MerchItem>) => apiRequest('POST', '/api/merchandise', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/merchandise'] });
      setShowAddMerch(false);
      setNewMerchItem({
        name: "", description: "", price: 0, category: "", stock: 0, featured: false, isActive: true
      });
      toast({ title: "Success", description: "Merchandise item created successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create merchandise item", variant: "destructive" });
    }
  });

  const updateMerchMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<MerchItem> }) => 
      apiRequest('PUT', `/api/merchandise/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/merchandise'] });
      setEditingMerch(null);
      toast({ title: "Success", description: "Merchandise item updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update merchandise item", variant: "destructive" });
    }
  });

  const deleteMerchMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/merchandise/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/merchandise'] });
      toast({ title: "Success", description: "Merchandise item deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete merchandise item", variant: "destructive" });
    }
  });

  const createShowMutation = useMutation({
    mutationFn: (data: Partial<ShowScheduleItem>) => apiRequest('POST', '/api/show-schedules', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/show-schedules'] });
      setShowAddShow(false);
      setNewShowItem({
        title: "", description: "", host: "", dayOfWeek: "", time: "", duration: 60, isActive: true
      });
      toast({ title: "Success", description: "Show scheduled successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create show", variant: "destructive" });
    }
  });

  const updateShowMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ShowScheduleItem> }) => 
      apiRequest('PUT', `/api/show-schedules/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/show-schedules'] });
      setEditingShow(null);
      toast({ title: "Success", description: "Show updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update show", variant: "destructive" });
    }
  });

  const updateSettingMutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => 
      apiRequest('PUT', `/api/settings/${key}`, { value, updatedBy: 'admin' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/settings'] });
      toast({ title: "Success", description: "Setting updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update setting", variant: "destructive" });
    }
  });

  const updateUserAdminMutation = useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) => 
      apiRequest('PUT', `/api/admin/users/${id}/admin-status`, { isAdmin }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({ title: "Success", description: "User admin status updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update user admin status", variant: "destructive" });
    }
  });

  // Authentication Screen
  if (!isAuthenticated) {
    return (
      <div 
        className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-sm"
        onClick={onClose}
      >
        <Card 
          className="w-full max-w-md mx-4 bg-gradient-to-br from-gray-900 to-black border-orange-500/30"
          onClick={(e) => e.stopPropagation()}
        >
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-orange-400 text-2xl font-black flex items-center justify-center gap-2">
              <Lock className="w-6 h-6" />
              Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-orange-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                className="bg-gray-800 border-orange-500/30 text-white focus:border-orange-400"
                placeholder="Enter admin username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-orange-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="bg-gray-800 border-orange-500/30 text-white focus:border-orange-400"
                placeholder="Enter admin password"
                onKeyPress={(e) => e.key === 'Enter' && handleAuth()}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button 
                onClick={handleAuth}
                className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-semibold"
              >
                <Lock className="w-4 h-4 mr-2" />
                Login
              </Button>
              <Button 
                onClick={onClose}
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Admin Panel
  return (
    <div 
      className="fixed inset-0 bg-black/95 z-50 backdrop-blur-sm overflow-hidden"
      onClick={onClose}
    >
      <div 
        className="h-full w-full flex bg-gradient-to-br from-gray-900 via-black to-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sidebar */}
        <div className="w-64 bg-gradient-to-b from-gray-800 to-gray-900 border-r border-orange-500/30 flex flex-col">
          <div className="p-6 border-b border-orange-500/30">
            <h2 className="text-2xl font-black text-orange-400 flex items-center gap-2">
              <Cog className="w-6 h-6" />
              Admin Panel
            </h2>
            <p className="text-sm text-gray-400 mt-1">Spandex Salvation Radio</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp, color: "text-blue-400" },
              { id: "merchandise", label: "Merchandise", icon: ShoppingBag, color: "text-green-400" },
              { id: "shows", label: "Show Management", icon: Radio, color: "text-purple-400" },
              { id: "users", label: "User Management", icon: Users, color: "text-pink-400" },
              { id: "settings", label: "Settings", icon: Settings, color: "text-yellow-400" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeSection === item.id
                    ? `bg-gradient-to-r from-orange-600/30 to-orange-500/20 text-orange-300 border border-orange-500/40`
                    : `text-gray-300 hover:bg-gray-800/50 hover:text-white`
                }`}
              >
                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-orange-400' : item.color}`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-orange-500/30">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white font-semibold"
            >
              <X className="w-4 h-4 mr-2" />
              Close Panel
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-8">
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black text-white">Dashboard Overview</h1>
                  <div className="flex items-center gap-3">
                    <Label htmlFor="liveData" className="text-orange-300 font-semibold">Enable Live Data</Label>
                    <Switch
                      id="liveData"
                      checked={liveDataEnabled}
                      onCheckedChange={setLiveDataEnabled}
                      className="data-[state=checked]:bg-orange-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-blue-300 text-sm font-medium">Total Users</p>
                          <p className="text-2xl font-bold text-white">{users.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-green-300 text-sm font-medium">Merchandise Items</p>
                          <p className="text-2xl font-bold text-white">{merchandise.length}</p>
                        </div>
                        <Package className="w-8 h-8 text-green-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-300 text-sm font-medium">Scheduled Shows</p>
                          <p className="text-2xl font-bold text-white">{showSchedules.length}</p>
                        </div>
                        <Radio className="w-8 h-8 text-purple-400" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-orange-300 text-sm font-medium">Live Status</p>
                          <p className="text-2xl font-bold text-white">{liveDataEnabled ? 'Active' : 'Disabled'}</p>
                        </div>
                        <TrendingUp className="w-8 h-8 text-orange-400" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-br from-gray-900/50 to-gray-800/30 border-orange-500/30">
                  <CardHeader>
                    <CardTitle className="text-orange-400 font-black">System Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Firebase Connected</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Stripe Configured</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Database Online</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "merchandise" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black text-white">Merchandise Management</h1>
                  <Button
                    onClick={() => setShowAddMerch(true)}
                    className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add New Item
                  </Button>
                </div>

                {merchLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : merchandise.length === 0 ? (
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardContent className="p-12 text-center">
                      <Package className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Merchandise Items</h3>
                      <p className="text-gray-500 mb-6">Start by adding your first merchandise item.</p>
                      <Button
                        onClick={() => setShowAddMerch(true)}
                        className="bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Item
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {merchandise.map((item: MerchItem) => (
                      <Card key={item.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-orange-500/30 hover:border-orange-500/50 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-2">{item.name}</h3>
                              <p className="text-gray-400 text-sm mb-3">{item.description}</p>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary" className={`${item.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                  {item.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {item.featured && (
                                  <Badge className="bg-orange-500/20 text-orange-300">Featured</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-2xl font-bold text-green-400">${item.price}</span>
                            <span className="text-sm text-gray-400">Stock: {item.stock}</span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => setEditingMerch(item)}
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => deleteMerchMutation.mutate(item.id)}
                              size="sm"
                              variant="destructive"
                              className="flex-1"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add Merchandise Modal */}
                {showAddMerch && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-orange-500/30 max-h-[90vh] overflow-auto">
                      <CardHeader className="border-b border-orange-500/30">
                        <CardTitle className="text-orange-400 font-black flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Add New Merchandise
                          </span>
                          <Button
                            onClick={() => setShowAddMerch(false)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-orange-300">Name</Label>
                            <Input
                              value={newMerchItem.name || ""}
                              onChange={(e) => setNewMerchItem({...newMerchItem, name: e.target.value})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                              placeholder="Product name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-300">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={newMerchItem.price || 0}
                              onChange={(e) => setNewMerchItem({...newMerchItem, price: parseFloat(e.target.value)})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-orange-300">Description</Label>
                          <Textarea
                            value={newMerchItem.description || ""}
                            onChange={(e) => setNewMerchItem({...newMerchItem, description: e.target.value})}
                            className="bg-gray-800 border-orange-500/30 text-white resize-none"
                            rows={3}
                            placeholder="Product description"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-orange-300">Category</Label>
                            <Select value={newMerchItem.category || ""} onValueChange={(value) => setNewMerchItem({...newMerchItem, category: value})}>
                              <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="collectibles">Collectibles</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-300">Stock Quantity</Label>
                            <Input
                              type="number"
                              value={newMerchItem.stock || 0}
                              onChange={(e) => setNewMerchItem({...newMerchItem, stock: parseInt(e.target.value)})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newMerchItem.featured || false}
                              onCheckedChange={(checked) => setNewMerchItem({...newMerchItem, featured: checked})}
                              className="data-[state=checked]:bg-orange-500"
                            />
                            <Label className="text-orange-300">Featured Item</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={newMerchItem.isActive !== false}
                              onCheckedChange={(checked) => setNewMerchItem({...newMerchItem, isActive: checked})}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <Label className="text-orange-300">Active</Label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => createMerchMutation.mutate(newMerchItem)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold"
                            disabled={createMerchMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {createMerchMutation.isPending ? 'Creating...' : 'Create Item'}
                          </Button>
                          <Button
                            onClick={() => setShowAddMerch(false)}
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Edit Merchandise Modal */}
                {editingMerch && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-orange-500/30 max-h-[90vh] overflow-auto">
                      <CardHeader className="border-b border-orange-500/30">
                        <CardTitle className="text-orange-400 font-black flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Edit className="w-5 h-5" />
                            Edit Merchandise
                          </span>
                          <Button
                            onClick={() => setEditingMerch(null)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-orange-300">Name</Label>
                            <Input
                              value={editingMerch.name}
                              onChange={(e) => setEditingMerch({...editingMerch, name: e.target.value})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-300">Price ($)</Label>
                            <Input
                              type="number"
                              step="0.01"
                              value={editingMerch.price}
                              onChange={(e) => setEditingMerch({...editingMerch, price: parseFloat(e.target.value)})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-orange-300">Description</Label>
                          <Textarea
                            value={editingMerch.description}
                            onChange={(e) => setEditingMerch({...editingMerch, description: e.target.value})}
                            className="bg-gray-800 border-orange-500/30 text-white resize-none"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-orange-300">Category</Label>
                            <Select value={editingMerch.category} onValueChange={(value) => setEditingMerch({...editingMerch, category: value})}>
                              <SelectTrigger className="bg-gray-800 border-orange-500/30 text-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="clothing">Clothing</SelectItem>
                                <SelectItem value="accessories">Accessories</SelectItem>
                                <SelectItem value="collectibles">Collectibles</SelectItem>
                                <SelectItem value="music">Music</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-orange-300">Stock Quantity</Label>
                            <Input
                              type="number"
                              value={editingMerch.stock}
                              onChange={(e) => setEditingMerch({...editingMerch, stock: parseInt(e.target.value)})}
                              className="bg-gray-800 border-orange-500/30 text-white"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingMerch.featured}
                              onCheckedChange={(checked) => setEditingMerch({...editingMerch, featured: checked})}
                              className="data-[state=checked]:bg-orange-500"
                            />
                            <Label className="text-orange-300">Featured Item</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={editingMerch.isActive}
                              onCheckedChange={(checked) => setEditingMerch({...editingMerch, isActive: checked})}
                              className="data-[state=checked]:bg-green-500"
                            />
                            <Label className="text-orange-300">Active</Label>
                          </div>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => updateMerchMutation.mutate({ id: editingMerch.id, data: editingMerch })}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold"
                            disabled={updateMerchMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {updateMerchMutation.isPending ? 'Updating...' : 'Update Item'}
                          </Button>
                          <Button
                            onClick={() => setEditingMerch(null)}
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeSection === "shows" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h1 className="text-3xl font-black text-white">Show Management</h1>
                  <Button
                    onClick={() => setShowAddShow(true)}
                    className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Schedule Show
                  </Button>
                </div>

                {showsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : showSchedules.length === 0 ? (
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardContent className="p-12 text-center">
                      <Radio className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Shows Scheduled</h3>
                      <p className="text-gray-500 mb-6">Create your first show schedule.</p>
                      <Button
                        onClick={() => setShowAddShow(true)}
                        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule First Show
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {showSchedules.map((show: ShowScheduleItem) => (
                      <Card key={show.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-purple-500/30 hover:border-purple-500/50 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-white">{show.title}</h3>
                                <Badge variant="secondary" className={`${show.isActive ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                  {show.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </div>
                              <p className="text-gray-400 mb-3">{show.description}</p>
                              <div className="flex items-center gap-6 text-sm">
                                <span className="text-purple-300 font-medium">Host: {show.host}</span>
                                <span className="text-purple-300 font-medium">{show.dayOfWeek} at {show.time}</span>
                                <span className="text-purple-300 font-medium">{show.duration} minutes</span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => setEditingShow(show)}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Add Show Modal */}
                {showAddShow && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <Card className="w-full max-w-2xl bg-gradient-to-br from-gray-900 to-black border-purple-500/30 max-h-[90vh] overflow-auto">
                      <CardHeader className="border-b border-purple-500/30">
                        <CardTitle className="text-purple-400 font-black flex items-center justify-between">
                          <span className="flex items-center gap-2">
                            <Plus className="w-5 h-5" />
                            Schedule New Show
                          </span>
                          <Button
                            onClick={() => setShowAddShow(false)}
                            size="sm"
                            variant="ghost"
                            className="text-gray-400 hover:text-white"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-purple-300">Show Title</Label>
                            <Input
                              value={newShowItem.title || ""}
                              onChange={(e) => setNewShowItem({...newShowItem, title: e.target.value})}
                              className="bg-gray-800 border-purple-500/30 text-white"
                              placeholder="Show name"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-purple-300">Host</Label>
                            <Input
                              value={newShowItem.host || ""}
                              onChange={(e) => setNewShowItem({...newShowItem, host: e.target.value})}
                              className="bg-gray-800 border-purple-500/30 text-white"
                              placeholder="Host name"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-purple-300">Description</Label>
                          <Textarea
                            value={newShowItem.description || ""}
                            onChange={(e) => setNewShowItem({...newShowItem, description: e.target.value})}
                            className="bg-gray-800 border-purple-500/30 text-white resize-none"
                            rows={3}
                            placeholder="Show description"
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-purple-300">Day of Week</Label>
                            <Select value={newShowItem.dayOfWeek || ""} onValueChange={(value) => setNewShowItem({...newShowItem, dayOfWeek: value})}>
                              <SelectTrigger className="bg-gray-800 border-purple-500/30 text-white">
                                <SelectValue placeholder="Select day" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Monday">Monday</SelectItem>
                                <SelectItem value="Tuesday">Tuesday</SelectItem>
                                <SelectItem value="Wednesday">Wednesday</SelectItem>
                                <SelectItem value="Thursday">Thursday</SelectItem>
                                <SelectItem value="Friday">Friday</SelectItem>
                                <SelectItem value="Saturday">Saturday</SelectItem>
                                <SelectItem value="Sunday">Sunday</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-purple-300">Time</Label>
                            <Input
                              type="time"
                              value={newShowItem.time || ""}
                              onChange={(e) => setNewShowItem({...newShowItem, time: e.target.value})}
                              className="bg-gray-800 border-purple-500/30 text-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-purple-300">Duration (minutes)</Label>
                            <Input
                              type="number"
                              value={newShowItem.duration || 60}
                              onChange={(e) => setNewShowItem({...newShowItem, duration: parseInt(e.target.value)})}
                              className="bg-gray-800 border-purple-500/30 text-white"
                              placeholder="60"
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={newShowItem.isActive !== false}
                            onCheckedChange={(checked) => setNewShowItem({...newShowItem, isActive: checked})}
                            className="data-[state=checked]:bg-green-500"
                          />
                          <Label className="text-purple-300">Active Show</Label>
                        </div>
                        <div className="flex gap-3 pt-4">
                          <Button
                            onClick={() => createShowMutation.mutate(newShowItem)}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold"
                            disabled={createShowMutation.isPending}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {createShowMutation.isPending ? 'Scheduling...' : 'Schedule Show'}
                          </Button>
                          <Button
                            onClick={() => setShowAddShow(false)}
                            variant="outline"
                            className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                          >
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}

            {activeSection === "users" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white">User Management</h1>

                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : users.length === 0 ? (
                  <Card className="bg-gray-800/30 border-gray-700">
                    <CardContent className="p-12 text-center">
                      <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-gray-400 mb-2">No Users Found</h3>
                      <p className="text-gray-500">Users will appear here when they register.</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {users.map((user: User) => (
                      <Card key={user.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-pink-500/30 hover:border-pink-500/50 transition-all duration-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-bold text-white">{user.firstName} {user.lastName}</h3>
                                <Badge variant="secondary" className={`${user.isAdmin ? 'bg-orange-500/20 text-orange-300' : 'bg-blue-500/20 text-blue-300'}`}>
                                  {user.isAdmin ? 'Admin' : 'User'}
                                </Badge>
                                {user.isActiveListening && (
                                  <Badge className="bg-green-500/20 text-green-300">Live</Badge>
                                )}
                                {user.activeSubscription && (
                                  <Badge className="bg-purple-500/20 text-purple-300">Premium</Badge>
                                )}
                              </div>
                              <div className="text-gray-400 space-y-1">
                                <p>Email: {user.email}</p>
                                <p>Username: {user.username}</p>
                                <p>Joined: {new Date(user.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                onClick={() => updateUserAdminMutation.mutate({ id: user.id, isAdmin: !user.isAdmin })}
                                size="sm"
                                className={user.isAdmin ? "bg-red-600 hover:bg-red-700" : "bg-orange-600 hover:bg-orange-700"}
                                disabled={updateUserAdminMutation.isPending}
                              >
                                {user.isAdmin ? 'Remove Admin' : 'Make Admin'}
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeSection === "settings" && (
              <div className="space-y-6">
                <h1 className="text-3xl font-black text-white">System Settings</h1>

                <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-yellow-500/30">
                  <CardHeader>
                    <CardTitle className="text-yellow-400 font-black flex items-center gap-2">
                      <Cog className="w-5 h-5" />
                      Live Data Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-yellow-300 font-semibold">Enable Live Data</Label>
                        <p className="text-sm text-gray-400">Toggle real-time data updates across the platform</p>
                      </div>
                      <Switch
                        checked={liveDataEnabled}
                        onCheckedChange={(checked) => {
                          setLiveDataEnabled(checked);
                          updateSettingMutation.mutate({ key: 'liveDataEnabled', value: checked.toString() });
                        }}
                        className="data-[state=checked]:bg-yellow-500"
                      />
                    </div>
                  </CardContent>
                </Card>

                {settingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="bg-gray-800/50 border-gray-700 animate-pulse">
                        <CardContent className="p-6">
                          <div className="h-4 bg-gray-700 rounded mb-2"></div>
                          <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {settings.map((setting: Setting) => (
                      <Card key={setting.id} className="bg-gradient-to-br from-gray-800/50 to-gray-900/30 border-yellow-500/30">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg font-bold text-white mb-1">{setting.key}</h3>
                              <p className="text-gray-400 text-sm mb-2">{setting.description}</p>
                              <p className="text-xs text-gray-500">
                                Last updated: {new Date(setting.updatedAt).toLocaleString()}
                                {setting.updatedBy && ` by ${setting.updatedBy}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                value={setting.value}
                                onChange={(e) => updateSettingMutation.mutate({ key: setting.key, value: e.target.value })}
                                className="w-48 bg-gray-800 border-yellow-500/30 text-white"
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
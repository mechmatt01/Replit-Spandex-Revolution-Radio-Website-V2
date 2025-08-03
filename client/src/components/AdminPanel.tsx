import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Switch } from "../components/ui/switch";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import { verifyAdminCredentials, initializeAdminCollection } from "../lib/firebase";
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
  Radio,
  TestTube,
  Zap
} from "lucide-react";

interface AdminPanelProps {
  onClose: () => void;
}

interface MerchItem {
  id: string;
  name: string;
  price: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  featured: boolean;
}

interface ShowScheduleItem {
  id: number;
  title: string;
  description: string;
  host: string;
  dayOfWeek: string;
  time: string;
  duration: string;
}

interface RadioStation {
  id: string;
  name: string;
  frequency: string;
  location: string;
  genre: string;
  streamUrl: string;
  fallbackUrl?: string;
  description: string;
  icon: string;
  isActive: boolean;
}

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
  const [editingShow, setEditingShow] = useState<ShowScheduleItem | null>(null);
  const [editingStation, setEditingStation] = useState<RadioStation | null>(null);
  const [newMerchItem, setNewMerchItem] = useState<Partial<MerchItem>>({});
  const [newShowItem, setNewShowItem] = useState<Partial<ShowScheduleItem>>({});
  const [newStationItem, setNewStationItem] = useState<Partial<RadioStation>>({});
  
  const { colors, isDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);
  
  // Debug mode state
  const [isDebugMode, setIsDebugMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debug-mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Test/Live mode state
  const [isTestMode, setIsTestMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('test-mode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  
  const toggleDebugMode = () => {
    const newValue = !isDebugMode;
    setIsDebugMode(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug-mode', JSON.stringify(newValue));
    }
  };

  const toggleTestMode = () => {
    const newValue = !isTestMode;
    setIsTestMode(newValue);
    if (typeof window !== 'undefined') {
      localStorage.setItem('test-mode', JSON.stringify(newValue));
    }
    
    toast({
      title: newValue ? "Test Mode Enabled" : "Live Mode Enabled",
      description: newValue ? "Using mock data for testing" : "Using live data from Firebase",
      variant: "default",
    });
  };

  // Initialize admin collection on component mount
  useEffect(() => {
    initializeAdminCollection();
  }, []);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (!isAuthenticated) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isAuthenticated, onClose]);

  // Fetch show schedules
  const { data: showSchedules } = useQuery<ShowScheduleItem[]>({
    queryKey: ["/api/schedules"],
    enabled: isAuthenticated,
  });

  // Mock merch data for now
  const mockMerch: MerchItem[] = [
    {
      id: "1",
      name: "Spandex Salvation T-Shirt",
      price: 25.99,
      description: "Official radio station t-shirt",
      image: "/api/placeholder/300/300",
      category: "clothing",
      stock: 50,
      featured: true,
    },
    {
      id: "2",
      name: "Metal Headband",
      price: 12.99,
      description: "Rock out with this stylish headband",
      image: "/api/placeholder/300/300",
      category: "accessories",
      stock: 30,
      featured: false,
    },
  ];

  // Admin authentication
  const handleAdminLogin = async () => {
    if (!adminUsername.trim() || !adminPassword.trim()) {
      toast({
        title: "Missing Credentials",
        description: "Please enter both username and password",
        variant: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const isValid = await verifyAdminCredentials(adminUsername, adminPassword);
      
      if (isValid) {
        setIsAuthenticated(true);
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the admin panel",
          variant: "default",
        });
      } else {
        toast({
          title: "Access Denied",
          description: "Invalid admin credentials",
          variant: "error",
        });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      toast({
        title: "Login Error",
        description: "An error occurred during login. Please try again.",
        variant: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update show schedule
  const updateShowMutation = useMutation({
    mutationFn: async (showData: Partial<ShowScheduleItem>) => {
      return apiRequest("PUT", `/api/schedules/${showData.id}`, showData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setEditingShow(null);
      toast({
        title: "Show Updated",
        description: "Show schedule has been updated successfully",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update show schedule",
        variant: "error",
      });
    },
  });

  // Create new show
  const createShowMutation = useMutation({
    mutationFn: async (showData: Partial<ShowScheduleItem>) => {
      return apiRequest("POST", "/api/schedules", showData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
      setNewShowItem({});
      toast({
        title: "Show Created",
        description: "New show has been added to the schedule",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create new show",
        variant: "error",
      });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <Card 
          ref={modalRef}
          className={`w-full max-w-md relative ${isDarkMode ? "bg-gray-900" : "bg-white"} mx-auto`}
        >
          <CardHeader className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`absolute right-2 top-2 ${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
            >
              <X className="w-4 h-4" />
            </Button>
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }} />
              <CardTitle className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}>
                Admin Access Login
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Enter admin credentials below to access administrative site settings
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input
                id="admin-username"
                type="text"
                value={adminUsername}
                onChange={(e) => setAdminUsername(e.target.value)}
                placeholder="Username"
                className={`${isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-400"} placeholder:opacity-50`}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Password"
                className={`${isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-400"} placeholder:opacity-50`}
                onKeyDown={(e) => e.key === "Enter" && !isLoading && handleAdminLogin()}
                disabled={isLoading}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAdminLogin}
                className="flex-1 transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: colors.primary }}
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-900" : "bg-white"} rounded-lg shadow-2xl mx-auto`}>
        <div className="sticky top-0 z-10 p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Settings className="w-8 h-8" style={{ color: colors.primary }} />
              <div>
                <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Admin Panel
                </h2>
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                  Manage your radio station
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="p-6">
          {/* Navigation Tabs */}
          <div className="flex space-x-1 mb-6 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {[
              { id: "overview", label: "Overview", icon: TrendingUp },
              { id: "schedule", label: "Schedule", icon: Calendar },
              { id: "radio", label: "Radio", icon: Radio },
              { id: "merch", label: "Merchandise", icon: ShoppingBag },
              { id: "users", label: "Users", icon: Users },
              { id: "settings", label: "Settings", icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSection(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeSection === tab.id
                    ? `${isDarkMode ? "bg-gray-700 text-white" : "bg-white text-black"} shadow-sm`
                    : `${isDarkMode ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Content Sections */}
          {activeSection === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                      Active Listeners
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>1,234</div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                      Revenue
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>$12,345</div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      +15.3% from last month
                    </p>
                  </CardContent>
                </Card>

                <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-black"}`}>
                      Shows Today
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>8</div>
                    <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      Next show in 2 hours
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                  <CardHeader>
                    <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { action: "New user registered", time: "2 minutes ago", user: "john@example.com" },
                        { action: "Show updated", time: "15 minutes ago", user: "admin" },
                        { action: "Merchandise added", time: "1 hour ago", user: "admin" },
                      ].map((activity, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>{activity.action}</p>
                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {activity.time} by {activity.user}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                  <CardHeader>
                    <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                        onClick={() => setActiveSection("schedule")}
                      >
                        <Calendar className="w-5 h-5" />
                        <span className="text-xs">Add Show</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                        onClick={() => setActiveSection("merch")}
                      >
                        <ShoppingBag className="w-5 h-5" />
                        <span className="text-xs">Add Merch</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-xs">View Users</span>
                      </Button>
                      <Button
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2"
                      >
                        <Settings className="w-5 h-5" />
                        <span className="text-xs">Settings</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeSection === "schedule" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Shows Management
                </h3>
                <Button
                  onClick={() => setNewShowItem({})}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Show</span>
                </Button>
              </div>

              {/* Shows Tabs */}
              <div className="flex space-x-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? "text-white border-b-2 border-blue-500" 
                      : "text-gray-600 border-b-2 border-blue-500"
                  }`}
                >
                  Upcoming Shows
                </button>
                <button
                  className={`px-4 py-2 text-sm font-medium ${
                    isDarkMode 
                      ? "text-gray-400 hover:text-white" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Past Shows
                </button>
              </div>

              {/* Upcoming Shows */}
              <div className="grid gap-4">
                {showSchedules?.map((show) => (
                  <Card key={show.id} className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                            {show.title}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {show.host} • {show.dayOfWeek} at {show.time}
                          </p>
                          {show.description && (
                            <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                              {show.description}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingShow(show)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // Handle delete show
                              toast({
                                title: "Delete Show",
                                description: "Are you sure you want to delete this show?",
                                variant: "error",
                              });
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Show Modal */}
              {(newShowItem.id !== undefined || editingShow) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className={`p-6 rounded-lg max-w-md w-full mx-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
                      {editingShow ? "Edit Show" : "Add New Show"}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="show-title">Show Title</Label>
                        <Input
                          id="show-title"
                          placeholder="Enter show title"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="show-host">Host</Label>
                        <Input
                          id="show-host"
                          placeholder="Enter host name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="show-description">Description</Label>
                        <Textarea
                          id="show-description"
                          placeholder="Enter show description"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="show-day">Day of Week</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select day" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="monday">Monday</SelectItem>
                              <SelectItem value="tuesday">Tuesday</SelectItem>
                              <SelectItem value="wednesday">Wednesday</SelectItem>
                              <SelectItem value="thursday">Thursday</SelectItem>
                              <SelectItem value="friday">Friday</SelectItem>
                              <SelectItem value="saturday">Saturday</SelectItem>
                              <SelectItem value="sunday">Sunday</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="show-time">Time</Label>
                          <Input
                            id="show-time"
                            type="time"
                            className="mt-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="show-duration">Duration (minutes)</Label>
                        <Input
                          id="show-duration"
                          type="number"
                          placeholder="60"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          style={{ backgroundColor: colors.primary }}
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Show
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          style={{ backgroundColor: "#6b7280", color: "white" }}
                          onClick={() => {
                            setEditingShow(null);
                            setNewShowItem({});
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "merch" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Products Management
                </h3>
                <Button
                  onClick={() => setNewMerchItem({})}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
              </div>

              {/* Products Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockMerch.map((item) => (
                  <Card key={item.id} className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-3"></div>
                      <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                        {item.name}
                      </h4>
                      <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                        ${item.price}
                      </p>
                      <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                        {item.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <Badge variant={item.featured ? "default" : "secondary"}>
                          {item.featured ? "Featured" : "Regular"}
                        </Badge>
                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Stock: {item.stock}
                        </span>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingMerch(item)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            toast({
                              title: "Delete Product",
                              description: "Are you sure you want to delete this product?",
                              variant: "error",
                            });
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Add/Edit Product Modal */}
              {(newMerchItem.id !== undefined || editingMerch) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className={`p-6 rounded-lg max-w-md w-full mx-auto ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
                    <h3 className={`text-lg font-semibold mb-4 ${isDarkMode ? "text-white" : "text-black"}`}>
                      {editingMerch ? "Edit Product" : "Add New Product"}
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="product-name">Product Name</Label>
                        <Input
                          id="product-name"
                          placeholder="Enter product name"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="product-price">Price ($)</Label>
                        <Input
                          id="product-price"
                          type="number"
                          step="0.01"
                          placeholder="25.99"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="product-description">Description</Label>
                        <Textarea
                          id="product-description"
                          placeholder="Enter product description"
                          className="mt-1"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="product-category">Category</Label>
                        <Select>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="clothing">Clothing</SelectItem>
                            <SelectItem value="accessories">Accessories</SelectItem>
                            <SelectItem value="music">Music</SelectItem>
                            <SelectItem value="collectibles">Collectibles</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="product-stock">Stock Quantity</Label>
                          <Input
                            id="product-stock"
                            type="number"
                            placeholder="50"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="product-featured">Featured</Label>
                          <Select>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Featured</SelectItem>
                              <SelectItem value="false">Regular</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="product-image">Product Image</Label>
                        <Input
                          id="product-image"
                          type="file"
                          accept="image/*"
                          className="mt-1"
                        />
                      </div>
                      
                      <div className="flex space-x-3 pt-4">
                        <Button 
                          style={{ backgroundColor: colors.primary }}
                          className="flex-1"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Product
                        </Button>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          style={{ backgroundColor: "#6b7280", color: "white" }}
                          onClick={() => {
                            setEditingMerch(null);
                            setNewMerchItem({});
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === "users" && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                User Management
              </h3>
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardContent className="p-6">
                  <p className={`text-center ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    User management features coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="space-y-6">
              <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                Admin Settings
              </h3>
              
              {/* Debug Mode Toggle */}
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>Debug Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Enable debug mode to show detailed notifications and logs
                      </p>
                    </div>
                    <Button
                      variant={isDebugMode ? "default" : "outline"}
                      onClick={toggleDebugMode}
                      style={{ backgroundColor: isDebugMode ? colors.primary : undefined }}
                    >
                      {isDebugMode ? "Debug Mode ON" : "Debug Mode OFF"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Test/Live Mode Toggle */}
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>Test/Live Mode</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                        Enable test mode to use mock data or live data from Firebase
                      </p>
                    </div>
                    <Switch
                      id="test-mode-switch"
                      checked={isTestMode}
                      onCheckedChange={toggleTestMode}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Site Settings */}
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardHeader>
                  <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>Site Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="site-title">Site Title</Label>
                      <Input
                        id="site-title"
                        defaultValue="Spandex Salvation Radio"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="stream-url">Stream URL</Label>
                      <Input
                        id="stream-url"
                        defaultValue="https://stream.example.com/live"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Contact Email</Label>
                      <Input
                        id="contact-email"
                        defaultValue="admin@spandex-salvation-radio.com"
                        className="mt-1"
                      />
                    </div>
                    <div className="flex space-x-3 pt-4">
                      <Button 
                        style={{ backgroundColor: colors.primary }}
                        className="flex-1"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline"
                        className="flex-1"
                        style={{ backgroundColor: "#6b7280", color: "white" }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "radio" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Radio Station Management
                </h3>
                <Button
                  onClick={() => setEditingStation({})}
                  style={{ backgroundColor: colors.primary }}
                  className="flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Station
                </Button>
              </div>

              {/* Radio Stations List */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    id: "hot-97",
                    name: "Hot 97",
                    frequency: "97.1 FM",
                    location: "New York, NY",
                    genre: "Hip Hop & R&B",
                    streamUrl: "https://stream.revma.ihrhls.com/zc6046",
                    fallbackUrl: "https://stream.revma.ihrhls.com/zc6046-fallback",
                    description: "New York's #1 Hip Hop & R&B",
                    icon: "🔥",
                    isActive: true,
                  },
                  {
                    id: "power-106",
                    name: "Power 105.1",
                    frequency: "105.1 FM",
                    location: "New York, NY",
                    genre: "Hip Hop & R&B",
                    streamUrl: "https://stream.revma.ihrhls.com/zc1481",
                    fallbackUrl: "https://stream.revma.ihrhls.com/zc1481-fallback",
                    description: "New York's Power 105.1",
                    icon: "⚡",
                    isActive: true,
                  },
                  {
                    id: "beat-955",
                    name: "95.5 The Beat",
                    frequency: "95.5 FM",
                    location: "Dallas, TX",
                    genre: "Hip Hop & R&B",
                    streamUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC.aac",
                    fallbackUrl: "https://playerservices.streamtheworld.com/api/livestream-redirect/KBFBFMAAC-fallback.aac",
                    description: "Dallas' #1 Hip Hop & R&B",
                    icon: "🎵",
                    isActive: true,
                  },
                  {
                    id: "hot-105",
                    name: "Hot 105",
                    frequency: "105.1 FM",
                    location: "Miami, FL",
                    genre: "Urban R&B",
                    streamUrl: "https://stream.revma.ihrhls.com/zc5907",
                    fallbackUrl: "https://stream.revma.ihrhls.com/zc5907-fallback",
                    description: "Miami's Today's R&B and Old School",
                    icon: "🌴",
                    isActive: true,
                  },
                  {
                    id: "q-93",
                    name: "Q93",
                    frequency: "93.3 FM",
                    location: "New Orleans, LA",
                    genre: "Hip Hop & R&B",
                    streamUrl: "https://stream.revma.ihrhls.com/zc1037",
                    fallbackUrl: "https://stream.revma.ihrhls.com/zc1037-fallback",
                    description: "New Orleans Hip Hop & R&B",
                    icon: "🎺",
                    isActive: true,
                  },
                  {
                    id: "somafm-metal",
                    name: "SomaFM Metal",
                    frequency: "Online",
                    location: "San Francisco, CA",
                    genre: "Metal",
                    streamUrl: "https://ice1.somafm.com/metal-128-mp3",
                    fallbackUrl: "https://ice1.somafm.com/metal-128-mp3-fallback",
                    description: "Heavy Metal & Hard Rock",
                    icon: "🤘",
                    isActive: true,
                  },
                ].map((station) => (
                  <Card key={station.id} className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{station.icon}</span>
                          <div>
                            <CardTitle className={`text-sm ${isDarkMode ? "text-white" : "text-black"}`}>
                              {station.name}
                            </CardTitle>
                            <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {station.frequency}
                            </p>
                          </div>
                        </div>
                        <Badge variant={station.isActive ? "default" : "secondary"}>
                          {station.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <strong>Location:</strong> {station.location}
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <strong>Genre:</strong> {station.genre}
                          </p>
                          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            <strong>Description:</strong> {station.description}
                          </p>
                        </div>
                        <div className="flex space-x-2 pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingStation(station)}
                            className="flex-1"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            style={{ backgroundColor: "#ef4444", color: "white" }}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Edit/Add Station Modal */}
              {editingStation && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <Card className={`w-full max-w-2xl ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
                    <CardHeader>
                      <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>
                        {editingStation.id ? "Edit Station" : "Add New Station"}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="station-name">Station Name</Label>
                            <Input
                              id="station-name"
                              defaultValue={editingStation.name}
                              placeholder="Enter station name"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-frequency">Frequency</Label>
                            <Input
                              id="station-frequency"
                              defaultValue={editingStation.frequency}
                              placeholder="e.g., 97.1 FM"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="station-location">Location</Label>
                            <Input
                              id="station-location"
                              defaultValue={editingStation.location}
                              placeholder="e.g., New York, NY"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="station-genre">Genre</Label>
                            <Input
                              id="station-genre"
                              defaultValue={editingStation.genre}
                              placeholder="e.g., Hip Hop & R&B"
                              className="mt-1"
                            />
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="station-description">Description</Label>
                          <Textarea
                            id="station-description"
                            defaultValue={editingStation.description}
                            placeholder="Enter station description"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="station-icon">Icon (Emoji)</Label>
                          <Input
                            id="station-icon"
                            defaultValue={editingStation.icon}
                            placeholder="🔥"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="station-stream-url">Stream URL</Label>
                          <Input
                            id="station-stream-url"
                            defaultValue={editingStation.streamUrl}
                            placeholder="https://stream.example.com/live"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="station-fallback-url">Fallback URL (Optional)</Label>
                          <Input
                            id="station-fallback-url"
                            defaultValue={editingStation.fallbackUrl}
                            placeholder="https://stream.example.com/fallback"
                            className="mt-1"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="station-active">Active Status</Label>
                          <Select defaultValue={editingStation.isActive ? "true" : "false"}>
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="true">Active</SelectItem>
                              <SelectItem value="false">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="flex space-x-3 pt-4">
                          <Button 
                            style={{ backgroundColor: colors.primary }}
                            className="flex-1"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {editingStation.id ? "Update Station" : "Add Station"}
                          </Button>
                          <Button 
                            variant="outline"
                            className="flex-1"
                            style={{ backgroundColor: "#6b7280", color: "white" }}
                            onClick={() => setEditingStation(null)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
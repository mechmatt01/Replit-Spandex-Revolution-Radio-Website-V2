import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Badge } from "../components/ui/badge";
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
  Lock
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

export default function AdminPanel({ onClose }: AdminPanelProps) {
  const [activeSection, setActiveSection] = useState("overview");
  const [adminUsername, setAdminUsername] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [editingMerch, setEditingMerch] = useState<MerchItem | null>(null);
  const [editingShow, setEditingShow] = useState<ShowScheduleItem | null>(null);
  const [newMerchItem, setNewMerchItem] = useState<Partial<MerchItem>>({});
  const [newShowItem, setNewShowItem] = useState<Partial<ShowScheduleItem>>({});
  
  const { colors, isDarkMode } = useTheme();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const modalRef = useRef<HTMLDivElement>(null);

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
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card 
          ref={modalRef}
          className={`w-full max-w-md relative ${isDarkMode ? "bg-gray-900" : "bg-white"}`}
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
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-y-auto ${isDarkMode ? "bg-gray-900" : "bg-white"} rounded-lg shadow-2xl`}>
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
                  Show Schedule
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

              <div className="grid gap-4">
                {showSchedules?.map((show) => (
                  <Card key={show.id} className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                            {show.title}
                          </h4>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {show.host} • {show.dayOfWeek} at {show.time}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingShow(show)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeSection === "merch" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-black"}`}>
                  Merchandise
                </h3>
                <Button
                  onClick={() => setNewMerchItem({})}
                  className="flex items-center space-x-2"
                  style={{ backgroundColor: colors.primary }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Item</span>
                </Button>
              </div>

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
                      <div className="flex items-center justify-between mt-2">
                        <Badge variant={item.featured ? "default" : "secondary"}>
                          {item.featured ? "Featured" : "Regular"}
                        </Badge>
                        <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                          Stock: {item.stock}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
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
              <Card className={isDarkMode ? "bg-gray-800" : "bg-white"}>
                <CardContent className="p-6">
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
                    <Button style={{ backgroundColor: colors.primary }}>
                      Save Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
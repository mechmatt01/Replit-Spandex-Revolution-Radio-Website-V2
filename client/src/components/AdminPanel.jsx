import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Settings, Calendar, ShoppingBag, Users, TrendingUp, Edit, Save, Trash2, Plus, X, Lock } from "lucide-react";
export default function AdminPanel({ onClose }) {
    const [activeSection, setActiveSection] = useState("overview");
    const [adminUsername, setAdminUsername] = useState("");
    const [adminPassword, setAdminPassword] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [editingMerch, setEditingMerch] = useState(null);
    const [editingShow, setEditingShow] = useState(null);
    const [newMerchItem, setNewMerchItem] = useState({});
    const [newShowItem, setNewShowItem] = useState({});
    const { colors, isDarkMode } = useTheme();
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const modalRef = useRef(null);
    // Handle click outside modal
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                onClose();
            }
        };
        if (!isAuthenticated) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isAuthenticated, onClose]);
    // Fetch show schedules
    const { data: showSchedules } = useQuery({
        queryKey: ["/api/schedules"],
        enabled: isAuthenticated,
    });
    // Mock merch data for now
    const mockMerch = [
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
            name: "Metal Horns Mug",
            price: 15.99,
            description: "Start your day with metal",
            image: "/api/placeholder/300/300",
            category: "accessories",
            stock: 30,
            featured: false,
        },
    ];
    // Admin authentication
    const handleAdminLogin = () => {
        // In production, this would be a proper authentication check
        if (adminUsername === "admin" && adminPassword === "metaladmin123") {
            setIsAuthenticated(true);
            toast({
                title: "Admin Access Granted",
                description: "Welcome to the admin panel",
                variant: "default",
            });
        }
        else {
            toast({
                title: "Access Denied",
                description: "Invalid admin credentials",
                variant: "destructive",
            });
        }
    };
    // Update show schedule
    const updateShowMutation = useMutation({
        mutationFn: async (showData) => {
            return apiRequest("PUT", `/api/schedules/${showData.id}`, showData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
            setEditingShow(null);
            toast({
                title: "Show Updated",
                description: "Show schedule has been updated successfully",
            });
        },
        onError: (error) => {
            toast({
                title: "Update Failed",
                description: "Failed to update show schedule",
                variant: "destructive",
            });
        },
    });
    // Create new show
    const createShowMutation = useMutation({
        mutationFn: async (showData) => {
            return apiRequest("POST", "/api/schedules", showData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/schedules"] });
            setNewShowItem({});
            toast({
                title: "Show Created",
                description: "New show has been added to the schedule",
            });
        },
        onError: (error) => {
            toast({
                title: "Creation Failed",
                description: "Failed to create new show",
                variant: "destructive",
            });
        },
    });
    if (!isAuthenticated) {
        return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card ref={modalRef} className={`w-full max-w-md relative ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
          <CardHeader className="relative">
            <Button variant="ghost" size="sm" onClick={onClose} className={`absolute right-2 top-2 ${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}>
              <X className="w-4 h-4"/>
            </Button>
            <div className="text-center">
              <Lock className="w-12 h-12 mx-auto mb-4" style={{ color: colors.primary }}/>
              <CardTitle className={`text-center ${isDarkMode ? "text-white" : "text-black"}`}>
                Admin Access Login
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                Enter admin password below to access administrative site settings
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-username">Username</Label>
              <Input id="admin-username" type="text" value={adminUsername} onChange={(e) => setAdminUsername(e.target.value)} placeholder="Username" className={`${isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-400"} placeholder:opacity-50`}/>
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} placeholder="Password" className={`${isDarkMode ? "placeholder:text-gray-400" : "placeholder:text-gray-400"} placeholder:opacity-50`} onKeyDown={(e) => e.key === "Enter" && handleAdminLogin()}/>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose} className="flex-1 transition-all duration-300 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500">
                Cancel
              </Button>
              <Button onClick={handleAdminLogin} className="flex-1 transition-all duration-300 hover:scale-105" style={{ backgroundColor: colors.primary }}>
                Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>);
    }
    return (<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className={`w-full max-w-7xl h-[90vh] ${isDarkMode ? "bg-gray-900" : "bg-white"}`}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>
            Admin Control Panel
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className={`${isDarkMode ? "text-white hover:bg-white/10" : "text-black hover:bg-black/10"}`}>
            <X className="w-4 h-4"/>
          </Button>
        </CardHeader>
        <CardContent className="p-0 h-full">
          <div className="flex h-full">
            {/* Sidebar */}
            <div className={`w-64 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"} p-4 space-y-2`}>
              <Button variant={activeSection === "overview" ? "default" : "ghost"} onClick={() => setActiveSection("overview")} className="w-full justify-start">
                <TrendingUp className="w-4 h-4 mr-2"/>
                Overview
              </Button>
              <Button variant={activeSection === "shows" ? "default" : "ghost"} onClick={() => setActiveSection("shows")} className="w-full justify-start">
                <Calendar className="w-4 h-4 mr-2"/>
                Show Management
              </Button>
              <Button variant={activeSection === "merch" ? "default" : "ghost"} onClick={() => setActiveSection("merch")} className="w-full justify-start">
                <ShoppingBag className="w-4 h-4 mr-2"/>
                Merchandise
              </Button>
              <Button variant={activeSection === "users" ? "default" : "ghost"} onClick={() => setActiveSection("users")} className="w-full justify-start">
                <Users className="w-4 h-4 mr-2"/>
                User Management
              </Button>
              <Button variant={activeSection === "settings" ? "default" : "ghost"} onClick={() => setActiveSection("settings")} className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2"/>
                Settings
              </Button>
            </div>

            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {activeSection === "overview" && (<div className="space-y-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    Dashboard Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Total Shows
                            </p>
                            <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                              {showSchedules?.length || 0}
                            </p>
                          </div>
                          <Calendar className="w-8 h-8" style={{ color: colors.primary }}/>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Merch Items
                            </p>
                            <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                              {mockMerch.length}
                            </p>
                          </div>
                          <ShoppingBag className="w-8 h-8" style={{ color: colors.primary }}/>
                        </div>
                      </CardContent>
                    </Card>
                    <Card className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              Active Users
                            </p>
                            <p className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                              42
                            </p>
                          </div>
                          <Users className="w-8 h-8" style={{ color: colors.primary }}/>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>)}

              {activeSection === "shows" && (<div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                      Show Management
                    </h2>
                    <Button onClick={() => setNewShowItem({ title: "", description: "", host: "", dayOfWeek: "", time: "", duration: "" })} style={{ backgroundColor: colors.primary }}>
                      <Plus className="w-4 h-4 mr-2"/>
                      Add Show
                    </Button>
                  </div>

                  {/* New Show Form */}
                  {Object.keys(newShowItem).length > 0 && (<Card className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                      <CardHeader>
                        <CardTitle className={`${isDarkMode ? "text-white" : "text-black"}`}>
                          Add New Show
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="show-title">Show Title</Label>
                            <Input id="show-title" value={newShowItem.title || ""} onChange={(e) => setNewShowItem({ ...newShowItem, title: e.target.value })} placeholder="Enter show title"/>
                          </div>
                          <div>
                            <Label htmlFor="show-host">Host</Label>
                            <Input id="show-host" value={newShowItem.host || ""} onChange={(e) => setNewShowItem({ ...newShowItem, host: e.target.value })} placeholder="Enter host name"/>
                          </div>
                          <div>
                            <Label htmlFor="show-day">Day of Week</Label>
                            <Select value={newShowItem.dayOfWeek || ""} onValueChange={(value) => setNewShowItem({ ...newShowItem, dayOfWeek: value })}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select day"/>
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
                          <div>
                            <Label htmlFor="show-time">Time</Label>
                            <Input id="show-time" value={newShowItem.time || ""} onChange={(e) => setNewShowItem({ ...newShowItem, time: e.target.value })} placeholder="e.g., 7:00 PM"/>
                          </div>
                          <div>
                            <Label htmlFor="show-duration">Duration</Label>
                            <Input id="show-duration" value={newShowItem.duration || ""} onChange={(e) => setNewShowItem({ ...newShowItem, duration: e.target.value })} placeholder="e.g., 2 hours"/>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="show-description">Description</Label>
                          <Textarea id="show-description" value={newShowItem.description || ""} onChange={(e) => setNewShowItem({ ...newShowItem, description: e.target.value })} placeholder="Enter show description" rows={3}/>
                        </div>
                        <div className="flex gap-2">
                          <Button onClick={() => createShowMutation.mutate(newShowItem)} disabled={createShowMutation.isPending} style={{ backgroundColor: colors.primary }}>
                            <Save className="w-4 h-4 mr-2"/>
                            Create Show
                          </Button>
                          <Button variant="outline" onClick={() => setNewShowItem({})}>
                            Cancel
                          </Button>
                        </div>
                      </CardContent>
                    </Card>)}

                  {/* Show List */}
                  <div className="space-y-4">
                    {showSchedules?.map((show) => (<Card key={show.id} className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                        <CardContent className="p-4">
                          {editingShow?.id === show.id ? (<div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label>Show Title</Label>
                                  <Input value={editingShow.title} onChange={(e) => setEditingShow({ ...editingShow, title: e.target.value })}/>
                                </div>
                                <div>
                                  <Label>Host</Label>
                                  <Input value={editingShow.host} onChange={(e) => setEditingShow({ ...editingShow, host: e.target.value })}/>
                                </div>
                                <div>
                                  <Label>Day</Label>
                                  <Input value={editingShow.dayOfWeek} onChange={(e) => setEditingShow({ ...editingShow, dayOfWeek: e.target.value })}/>
                                </div>
                                <div>
                                  <Label>Time</Label>
                                  <Input value={editingShow.time} onChange={(e) => setEditingShow({ ...editingShow, time: e.target.value })}/>
                                </div>
                              </div>
                              <div>
                                <Label>Description</Label>
                                <Textarea value={editingShow.description} onChange={(e) => setEditingShow({ ...editingShow, description: e.target.value })} rows={3}/>
                              </div>
                              <div className="flex gap-2">
                                <Button onClick={() => updateShowMutation.mutate(editingShow)} disabled={updateShowMutation.isPending} style={{ backgroundColor: colors.primary }}>
                                  <Save className="w-4 h-4 mr-2"/>
                                  Save
                                </Button>
                                <Button variant="outline" onClick={() => setEditingShow(null)}>
                                  Cancel
                                </Button>
                              </div>
                            </div>) : (<div className="flex justify-between items-start">
                              <div>
                                <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-black"}`}>
                                  {show.title}
                                </h3>
                                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                                  {show.host} • {show.dayOfWeek} {show.time} • {show.duration}
                                </p>
                                <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  {show.description}
                                </p>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => setEditingShow(show)}>
                                <Edit className="w-4 h-4"/>
                              </Button>
                            </div>)}
                        </CardContent>
                      </Card>))}
                  </div>
                </div>)}

              {activeSection === "merch" && (<div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                      Merchandise Management
                    </h2>
                    <Button onClick={() => setNewMerchItem({ name: "", price: 0, description: "", category: "", stock: 0 })} style={{ backgroundColor: colors.primary }}>
                      <Plus className="w-4 h-4 mr-2"/>
                      Add Product
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {mockMerch.map((item) => (<Card key={item.id} className={`${isDarkMode ? "bg-gray-800" : "bg-gray-50"}`}>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                            <ShoppingBag className="w-16 h-16 text-gray-400"/>
                          </div>
                          <h3 className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                            {item.name}
                          </h3>
                          <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {item.description}
                          </p>
                          <div className="flex justify-between items-center mt-2">
                            <span className={`font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                              ${item.price}
                            </span>
                            <Badge variant={item.featured ? "default" : "outline"}>
                              {item.featured ? "Featured" : "Standard"}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => setEditingMerch(item)}>
                              <Edit className="w-4 h-4"/>
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500">
                              <Trash2 className="w-4 h-4"/>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>))}
                  </div>
                </div>)}

              {activeSection === "users" && (<div className="space-y-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    User Management
                  </h2>
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    User management features coming soon...
                  </p>
                </div>)}

              {activeSection === "settings" && (<div className="space-y-6">
                  <h2 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-black"}`}>
                    System Settings
                  </h2>
                  <p className={`${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                    System settings and configuration options coming soon...
                  </p>
                </div>)}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);
}

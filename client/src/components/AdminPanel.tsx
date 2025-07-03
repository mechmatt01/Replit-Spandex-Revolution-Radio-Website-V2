import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  LogOut,
  Calendar,
  Music,
  List,
  Users,
  Pause,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAdmin } from "@/contexts/AdminContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { StreamStats, Submission, InsertNowPlaying } from "@shared/schema";

export default function AdminPanel() {
  const { user, isAdmin, logout } = useAdmin();
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [nowPlayingForm, setNowPlayingForm] = useState<InsertNowPlaying>({
    title: "",
    artist: "",
    album: "",
    duration: 0,
    currentTime: 0,
  });
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNowPlayingOpen, setIsNowPlayingOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats } = useQuery<StreamStats>({
    queryKey: ["/api/stream-stats"],
    enabled: isAdmin,
  });

  const { data: submissions = [] } = useQuery<Submission[]>({
    queryKey: ["/api/submissions"],
    enabled: isAdmin,
  });

  const { login } = useAdmin();

  const updateNowPlayingMutation = useMutation({
    mutationFn: async (data: InsertNowPlaying) => {
      const response = await apiRequest("POST", "/api/now-playing", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Now Playing Updated",
        description: "The current track has been updated successfully.",
      });
      setNowPlayingForm({
        title: "",
        artist: "",
        album: "",
        duration: 0,
        currentTime: 0,
      });
      setIsNowPlayingOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/now-playing"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update now playing information.",
        variant: "destructive",
      });
    },
  });

  const updateSubmissionStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest(
        "PATCH",
        `/api/submissions/${id}/status`,
        { status },
      );
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Status Updated",
        description: "Submission status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/submissions"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update submission status.",
        variant: "destructive",
      });
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(loginForm.username, loginForm.password);
    if (success) {
      setIsLoginOpen(false);
      setLoginForm({ username: "", password: "" });
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel.",
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleNowPlayingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateNowPlayingMutation.mutate(nowPlayingForm);
  };

  const handleUpdateSubmissionStatus = (id: number, status: string) => {
    updateSubmissionStatusMutation.mutate({ id, status });
  };

  if (!isAdmin) {
    return (
      <section className="py-20 bg-dark-surface border-t border-dark-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-orbitron font-bold text-2xl text-white mb-4">
            Admin Access Required
          </h2>
          <p className="text-gray-400 mb-6">
            Please log in to access the admin panel.
          </p>

          <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
            <DialogTrigger asChild>
              <Button className="bg-metal-orange hover:bg-orange-600 text-white">
                Admin Login
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-dark-surface border-dark-border">
              <DialogHeader>
                <DialogTitle className="text-white">Admin Login</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="username" className="text-gray-300">
                    Username
                  </Label>
                  <Input
                    id="username"
                    value={loginForm.username}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        username: e.target.value,
                      }))
                    }
                    className="bg-dark-bg border-dark-border text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password" className="text-gray-300">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({
                        ...prev,
                        password: e.target.value,
                      }))
                    }
                    className="bg-dark-bg border-dark-border text-white"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-metal-orange hover:bg-orange-600 text-white"
                >
                  Login
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-dark-surface border-t border-dark-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-orbitron font-bold text-2xl text-white">
                ADMIN PANEL
              </h2>
              <p className="text-gray-400">Welcome back, {user?.username}</p>
            </div>
            <Button
              onClick={logout}
              variant="destructive"
              className="bg-metal-red hover:bg-red-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Stats */}
          <Card className="bg-dark-bg border-dark-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-metal-orange">
                Quick Stats
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-400">Active Listeners</span>
                  <span className="font-semibold">
                    {stats?.currentListeners || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Song Requests</span>
                  <span className="font-semibold">
                    {submissions.filter((s) => s.status === "pending").length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Submissions</span>
                  <span className="font-semibold">{submissions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Stream Uptime</span>
                  <span className="font-semibold text-green-400">
                    {stats?.uptime || "99.9%"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Management */}
          <Card className="bg-dark-bg border-dark-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-metal-orange">
                Content Management
              </h3>
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-dark-surface border border-dark-border hover:border-metal-orange"
                >
                  <Calendar className="mr-3 h-4 w-4 text-metal-orange" />
                  Update Schedule
                </Button>

                <Dialog
                  open={isNowPlayingOpen}
                  onOpenChange={setIsNowPlayingOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start bg-dark-surface border border-dark-border hover:border-metal-orange"
                    >
                      <Music className="mr-3 h-4 w-4 text-metal-orange" />
                      Now Playing Control
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-dark-surface border-dark-border">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Update Now Playing
                      </DialogTitle>
                    </DialogHeader>
                    <form
                      onSubmit={handleNowPlayingSubmit}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="title" className="text-gray-300">
                          Song Title
                        </Label>
                        <Input
                          id="title"
                          value={nowPlayingForm.title}
                          onChange={(e) =>
                            setNowPlayingForm((prev) => ({
                              ...prev,
                              title: e.target.value,
                            }))
                          }
                          className="bg-dark-bg border-dark-border text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="artist" className="text-gray-300">
                          Artist
                        </Label>
                        <Input
                          id="artist"
                          value={nowPlayingForm.artist}
                          onChange={(e) =>
                            setNowPlayingForm((prev) => ({
                              ...prev,
                              artist: e.target.value,
                            }))
                          }
                          className="bg-dark-bg border-dark-border text-white"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="album" className="text-gray-300">
                          Album
                        </Label>
                        <Input
                          id="album"
                          value={nowPlayingForm.album || ""}
                          onChange={(e) =>
                            setNowPlayingForm((prev) => ({
                              ...prev,
                              album: e.target.value,
                            }))
                          }
                          className="bg-dark-bg border-dark-border text-white"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="duration" className="text-gray-300">
                            Duration (seconds)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            value={nowPlayingForm.duration}
                            onChange={(e) =>
                              setNowPlayingForm((prev) => ({
                                ...prev,
                                duration: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="bg-dark-bg border-dark-border text-white"
                            required
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="currentTime"
                            className="text-gray-300"
                          >
                            Current Time (seconds)
                          </Label>
                          <Input
                            id="currentTime"
                            type="number"
                            value={nowPlayingForm.currentTime}
                            onChange={(e) =>
                              setNowPlayingForm((prev) => ({
                                ...prev,
                                currentTime: parseInt(e.target.value) || 0,
                              }))
                            }
                            className="bg-dark-bg border-dark-border text-white"
                            required
                          />
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={updateNowPlayingMutation.isPending}
                        className="w-full bg-metal-orange hover:bg-orange-600 text-white"
                      >
                        {updateNowPlayingMutation.isPending
                          ? "Updating..."
                          : "Update Now Playing"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>

                <Button
                  variant="ghost"
                  className="w-full justify-start bg-dark-surface border border-dark-border hover:border-metal-orange"
                >
                  <List className="mr-3 h-4 w-4 text-metal-orange" />
                  Review Submissions
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start bg-dark-surface border border-dark-border hover:border-metal-orange"
                >
                  <Users className="mr-3 h-4 w-4 text-metal-orange" />
                  Manage Subscribers
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stream Control */}
          <Card className="bg-dark-bg border-dark-border">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4 text-metal-orange">
                Stream Control
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-400">Stream Status</span>
                  <span className="flex items-center text-green-400">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
                    Live
                  </span>
                </div>
                <Button className="w-full bg-metal-orange hover:bg-orange-600 text-white mb-3">
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Stream
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-dark-border hover:border-metal-orange text-white"
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Switch to Backup
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submissions Management */}
        <Card className="bg-dark-bg border-dark-border mt-8">
          <CardContent className="p-6">
            <h3 className="font-bold text-lg mb-4 text-metal-orange">
              Recent Submissions
            </h3>
            <div className="space-y-4">
              {submissions.slice(0, 5).map((submission) => (
                <div
                  key={submission.id}
                  className="flex items-center justify-between p-4 bg-dark-surface rounded-lg"
                >
                  <div>
                    <h4 className="font-semibold">{submission.songTitle}</h4>
                    <p className="text-gray-400 text-sm">
                      {submission.artistName}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {submission.submitterName
                        ? `by ${submission.submitterName}`
                        : "Anonymous"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        submission.status === "approved"
                          ? "bg-green-500/20 text-green-400"
                          : submission.status === "rejected"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {submission.status}
                    </span>
                    {submission.status === "pending" && (
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateSubmissionStatus(
                              submission.id,
                              "approved",
                            )
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs"
                          disabled={updateSubmissionStatusMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateSubmissionStatus(
                              submission.id,
                              "rejected",
                            )
                          }
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs"
                          disabled={updateSubmissionStatusMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

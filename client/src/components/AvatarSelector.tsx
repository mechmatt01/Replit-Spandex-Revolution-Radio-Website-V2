import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, User, Camera } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

// Pre-made avatar options (these would be stored in Firebase storage)
const AVATAR_OPTIONS = [
  { id: "metal-1", url: "/avatars/metal-skull.png", name: "Metal Skull" },
  { id: "metal-2", url: "/avatars/metal-guitar.png", name: "Guitar Hero" },
  { id: "metal-3", url: "/avatars/metal-horns.png", name: "Metal Horns" },
  { id: "metal-4", url: "/avatars/metal-flames.png", name: "Flaming Metal" },
  { id: "rock-1", url: "/avatars/rock-star.png", name: "Rock Star" },
  { id: "rock-2", url: "/avatars/rock-band.png", name: "Band Member" },
  { id: "vintage-1", url: "/avatars/vintage-vinyl.png", name: "Vinyl Lover" },
  { id: "vintage-2", url: "/avatars/vintage-radio.png", name: "Radio Head" },
  {
    id: "spandex-1",
    url: "/avatars/spandex-warrior.png",
    name: "Spandex Warrior",
  },
  { id: "spandex-2", url: "/avatars/spandex-legend.png", name: "Metal Legend" },
];

export default function AvatarSelector({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate,
}: AvatarSelectorProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { colors } = useTheme();
  const { toast } = useToast();

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid File",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/upload-avatar", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { avatarUrl } = await response.json();
      setSelectedAvatar(avatarUrl);

      toast({
        title: "Upload Successful",
        description: "Your profile image has been uploaded.",
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description:
          error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedAvatar) return;

    setSaving(true);

    try {
      await apiRequest("POST", "/api/user/update-avatar", {
        profileImageUrl: selectedAvatar,
      });

      onAvatarUpdate(selectedAvatar);
      toast({
        title: "Avatar Updated",
        description: "Your profile avatar has been updated successfully.",
      });
      onClose();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description:
          error.message || "Failed to update avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-2xl max-h-[80vh] overflow-y-auto"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.primary,
          color: colors.text,
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            <User className="h-6 w-6" style={{ color: colors.primary }} />
            Choose Your Avatar
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="avatars" className="w-full">
          <TabsList
            className="grid w-full grid-cols-2 mb-6"
            style={{ backgroundColor: colors.background }}
          >
            <TabsTrigger value="avatars" style={{ color: colors.text }}>
              Pre-made Avatars
            </TabsTrigger>
            <TabsTrigger value="upload" style={{ color: colors.text }}>
              Upload Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="avatars">
            <div className="grid grid-cols-5 gap-4 mb-6">
              {AVATAR_OPTIONS.map((avatar) => (
                <div
                  key={avatar.id}
                  className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 ${
                    selectedAvatar === avatar.url
                      ? "border-orange-500"
                      : "border-gray-600"
                  }`}
                  style={{
                    borderColor:
                      selectedAvatar === avatar.url
                        ? colors.primary
                        : "#4B5563",
                  }}
                  onClick={() => setSelectedAvatar(avatar.url)}
                >
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback for missing avatar images
                        const target = e.target as HTMLImageElement;
                        target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=f97316&color=fff&size=128`;
                      }}
                    />
                  </div>
                  <p
                    className="text-xs text-center mt-2 truncate"
                    style={{ color: colors.text }}
                  >
                    {avatar.name}
                  </p>
                  {selectedAvatar === avatar.url && (
                    <div
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.primary }}
                    >
                      <span className="text-xs text-white">✓</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className="mx-auto w-32 h-32 rounded-full border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-orange-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    borderColor: selectedAvatar ? colors.primary : "#4B5563",
                  }}
                >
                  {selectedAvatar && selectedAvatar.startsWith("data:") ? (
                    <img
                      src={selectedAvatar}
                      alt="Uploaded avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : selectedAvatar &&
                    !selectedAvatar.startsWith("/avatars/") ? (
                    <img
                      src={selectedAvatar}
                      alt="Current avatar"
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <div className="text-center">
                      <Camera
                        className="mx-auto h-8 w-8 mb-2"
                        style={{ color: colors.text }}
                      />
                      <p className="text-sm" style={{ color: colors.text }}>
                        {uploading ? "Uploading..." : "Click to upload"}
                      </p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="mt-4"
                  style={{ borderColor: colors.primary, color: colors.primary }}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {uploading ? "Uploading..." : "Choose File"}
                </Button>
              </div>

              <div
                className="text-center text-sm opacity-75"
                style={{ color: colors.text }}
              >
                <p>Supported formats: JPG, PNG, GIF</p>
                <p>Maximum size: 5MB</p>
                <p>Recommended: 200x200 pixels or larger</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div
          className="flex justify-between pt-4 border-t"
          style={{ borderColor: "#374151" }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            style={{ color: colors.text }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedAvatar || saving}
            className="px-6"
            style={{
              backgroundColor: colors.primary,
              color: "white",
              opacity: !selectedAvatar || saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Avatar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

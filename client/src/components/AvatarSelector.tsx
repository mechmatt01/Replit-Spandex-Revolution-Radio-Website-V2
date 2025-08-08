import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Upload, User, Camera, Crown, Star } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

// Import premium avatars
import BassBatAvatar from "../../Avatars/Premium_Avatars/Bass-Bat.jpeg";
import DrumDragonAvatar from "../../Avatars/Premium_Avatars/Drum-Dragon.jpeg";
import GuitarGoblinAvatar from "../../Avatars/Premium_Avatars/Guitar-Goblin.jpeg";
import HeadbangerHamsterAvatar from "../../Avatars/Premium_Avatars/Headbanger-Hamster.jpeg";
import MetalQueenAvatar from "../../Avatars/Premium_Avatars/Metal-Queen.jpeg";
import MetalCatAvatar from "../../Avatars/Premium_Avatars/Metal-Cat.jpeg";
import MoshPitMonsterAvatar from "../../Avatars/Premium_Avatars/Mosh-Pit-Monster.jpeg";
import PunkPandaAvatar from "../../Avatars/Premium_Avatars/Punk-Panda.jpeg";
import RebelRaccoonAvatar from "../../Avatars/Premium_Avatars/Rebel-Raccoon.jpeg";
import RockUnicornAvatar from "../../Avatars/Premium_Avatars/Rock-Unicorn.jpeg";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
}

// Pre-made avatar options

// Free tier avatars
const FREE_AVATAR_OPTIONS = [
  {
    id: "metal-drummer-cat",
    name: "Metal Drummer Cat",
    url: "https://i.imgur.com/8X9KJjg.png",
    description: "A fierce feline behind the drums",
    tier: "free"
  },
  {
    id: "skull-guitarist",
    name: "Skull Guitarist",
    url: "https://i.imgur.com/4K2Lp8M.png", 
    description: "Eternal rock spirit shredding",
    tier: "free"
  },
  {
    id: "wolf-singer",
    name: "Wolf Singer",
    url: "https://i.imgur.com/7N3Qr9T.png",
    description: "Howling lead vocals",
    tier: "free"
  },
  {
    id: "bear-bassist",
    name: "Bear Bassist",
    url: "https://i.imgur.com/5M8Zt6W.png",
    description: "Heavy bass lines from the wild",
    tier: "free"
  },
  {
    id: "rock-owl-guitarist",
    name: "Rock Owl Guitarist",
    url: "https://i.imgur.com/9P4Kr7X.png",
    description: "Wise riffs and solos",
    tier: "free"
  }
];

// Premium avatars with jumping elements effect
const PREMIUM_AVATAR_OPTIONS = [
  {
    id: "bass-bat",
    name: "Bass Bat",
    url: BassBatAvatar,
    description: "Night hunter with thunderous bass",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "drum-dragon",
    name: "Drum Dragon",
    url: DrumDragonAvatar,
    description: "Fire-breathing percussionist",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "guitar-goblin",
    name: "Guitar Goblin",
    url: GuitarGoblinAvatar,
    description: "Mischievous shredder from the depths",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "headbanger-hamster",
    name: "Headbanger Hamster",
    url: HeadbangerHamsterAvatar,
    description: "Tiny but mighty metalhead",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "metal-queen",
    name: "Metal Queen",
    url: MetalQueenAvatar,
    description: "Royalty of the metal realm",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "metal-cat",
    name: "Metal Cat",
    url: MetalCatAvatar,
    description: "Feline fury unleashed",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "mosh-pit-monster",
    name: "Mosh Pit Monster",
    url: MoshPitMonsterAvatar,
    description: "Chaos incarnate in the pit",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "punk-panda",
    name: "Punk Panda",
    url: PunkPandaAvatar,
    description: "Rebellious bamboo eater",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "rebel-raccoon",
    name: "Rebel Raccoon",
    url: RebelRaccoonAvatar,
    description: "Trash panda turned rock star",
    tier: "premium",
    jumpingElements: true
  },
  {
    id: "rock-unicorn",
    name: "Rock Unicorn",
    url: RockUnicornAvatar,
    description: "Magical metal mayhem",
    tier: "premium",
    jumpingElements: true
  }
];

const AVATAR_OPTIONS = [...FREE_AVATAR_OPTIONS, ...PREMIUM_AVATAR_OPTIONS];

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
            {/* Free Avatars Section */}
            <div className="mb-8">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: colors.text }}>
                <User className="h-5 w-5" />
                Free Avatars
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {FREE_AVATAR_OPTIONS.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-105`}
                    style={{}}
                    onClick={() => setSelectedAvatar(avatar.url)}
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-800">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=f97316&color=fff&size=128`;
                        }}
                      />
                    </div>
                    <p className="text-xs text-center mt-2 truncate" style={{ color: colors.text }}>
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
            </div>

            {/* Premium Avatars Section */}
            <div className="mb-6">
              <h3 className="flex items-center gap-2 text-lg font-bold mb-4" style={{ color: colors.primary }}>
                <Crown className="h-5 w-5" />
                Premium Avatars
                <Star className="h-4 w-4" style={{ color: colors.accent }} />
              </h3>
              <div className="grid grid-cols-5 gap-4">
                {PREMIUM_AVATAR_OPTIONS.map((avatar) => (
                  <div
                    key={avatar.id}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 ${
                      selectedAvatar === avatar.url
                        ? "border-primary"
                        : ""
                    }`}
                    style={{
                      borderColor:
                        selectedAvatar === avatar.url
                          ? colors.primary
                          : colors.accent,
                      background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                    }}
                    onClick={() => setSelectedAvatar(avatar.url)}
                  >
                    {/* Premium Crown Badge */}
                    <div className="absolute -top-2 -right-2 z-20">
                      <div className="rounded-full p-1" style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})` }}>
                        <Crown className="h-3 w-3 text-black" />
                      </div>
                    </div>

                    {/* Avatar Container with Jumping Elements Effect */}
                    <div className={`aspect-square rounded-lg ${avatar.jumpingElements ? 'premium-avatar-container' : 'overflow-hidden'} bg-gradient-to-br from-gray-800 to-gray-900 relative`}>
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover rounded-lg"
                        style={{
                          clipPath: avatar.jumpingElements 
                            ? "polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)"
                            : undefined
                        }}
                      />
                      
                      {/* Jumping Elements for Premium Avatars */}
                      {avatar.jumpingElements && (
                        <>
                          <div className="jumping-element top-0 left-0 text-lg" style={{ color: colors.accent }}>🤘</div>
                          <div className="jumping-element top-0 right-0 text-orange-500 text-lg">⚡</div>
                          <div className="jumping-element bottom-0 left-0 text-red-500 text-lg">🔥</div>
                          <div className="jumping-element bottom-0 right-0 text-purple-500 text-lg">💀</div>
                        </>
                      )}
                    </div>
                    
                    <p className="text-xs text-center mt-2 truncate font-semibold" style={{ color: colors.accent }}>
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
            </div>
          </TabsContent>

          <TabsContent value="upload">
            <div className="space-y-6">
              <div className="text-center">
                <div
                  className="mx-auto w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                  style={{}}
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

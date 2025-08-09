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
import { uploadProfileImage } from "../lib/firebase";

interface AvatarSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentAvatar?: string;
  onAvatarUpdate: (avatarUrl: string) => void;
  userID: string; // Add userID prop
}

// Function to get local avatar URL
const getAvatarUrl = (avatarName: string, isPremium: boolean = false) => {
  const folder = isPremium ? "Premium_Avatars" : "Default_Avatars";
  return `/Avatars/${folder}/${avatarName}`;
};

// Free tier avatars
const FREE_AVATAR_OPTIONS = [
  {
    id: "Metal-Drummer-Cat",
    name: "Metal Drummer Cat",
    url: getAvatarUrl("Metal-Drummer-Cat.png"),
    description: "A fierce cat drummer ready to rock",
    category: "free",
  },
  {
    id: "Metal-Bear-Bassist",
    name: "Metal Bear Bassist",
    url: getAvatarUrl("Metal-Bear-Bassist.png"),
    description: "A powerful bear with bass skills",
    category: "free",
  },
  {
    id: "Metal-Skull-Guitarist",
    name: "Metal Skull Guitarist",
    url: getAvatarUrl("Metal-Skull-Guitarist.png"),
    description: "A skull-headed guitar master",
    category: "free",
  },
  {
    id: "Metal-Wolf-Singer",
    name: "Metal Wolf Singer",
    url: getAvatarUrl("Metal-Wolf-Singer.png"),
    description: "A howling wolf vocalist",
    category: "free",
  },
  {
    id: "Rock-Owl-Guitarist",
    name: "Rock Owl Guitarist",
    url: getAvatarUrl("Rock-Owl-Guitarist.png"),
    description: "A wise owl shredding the guitar",
    category: "free",
  },
];

// Premium tier avatars
const PREMIUM_AVATAR_OPTIONS = [
  {
    id: "Bass-Bat",
    name: "Bass Bat",
    url: getAvatarUrl("Bass-Bat.jpeg", true),
    description: "A bat with killer bass skills",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Drum-Dragon",
    name: "Drum Dragon",
    url: getAvatarUrl("Drum-Dragon.jpeg", true),
    description: "A dragon that sets the rhythm on fire",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Guitar-Goblin",
    name: "Guitar Goblin",
    url: getAvatarUrl("Guitar-Goblin.jpeg", true),
    description: "A mischievous goblin with guitar magic",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Headbanger-Hamster",
    name: "Headbanger Hamster",
    url: getAvatarUrl("Headbanger-Hamster.jpeg", true),
    description: "A tiny hamster with massive headbanging energy",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Metal-Cat",
    name: "Metal Cat",
    url: getAvatarUrl("Metal-Cat.jpeg", true),
    description: "A fierce feline with metal attitude",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Metal-Queen",
    name: "Metal Queen",
    url: getAvatarUrl("Metal-Queen.jpeg", true),
    description: "A regal queen of metal",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Mosh-Pit-Monster",
    name: "Mosh Pit Monster",
    url: getAvatarUrl("Mosh-Pit-Monster.jpeg", true),
    description: "A monster born in the mosh pit",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Punk-Panda",
    name: "Punk Panda",
    url: getAvatarUrl("Punk-Panda.jpeg", true),
    description: "A rebellious panda with punk spirit",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Rebel-Raccoon",
    name: "Rebel Raccoon",
    url: getAvatarUrl("Rebel-Raccoon.jpeg", true),
    description: "A raccoon that breaks all the rules",
    category: "premium",
    jumpingElements: true,
  },
  {
    id: "Rock-Unicorn",
    name: "Rock Unicorn",
    url: getAvatarUrl("Rock-Unicorn.jpeg", true),
    description: "A magical unicorn that rocks hard",
    category: "premium",
    jumpingElements: true,
  },
];

const AVATAR_OPTIONS = [...FREE_AVATAR_OPTIONS, ...PREMIUM_AVATAR_OPTIONS];

export default function AvatarSelector({
  isOpen,
  onClose,
  currentAvatar,
  onAvatarUpdate,
  userID, // Add userID parameter
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
      // Use Firebase Storage upload function with the actual userID
      const imageUrl = await uploadProfileImage(file, userID);
      setSelectedAvatar(imageUrl);

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
      // Call the parent's onAvatarUpdate function
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

  const handleAvatarSelect = (avatar: typeof FREE_AVATAR_OPTIONS[0] | typeof PREMIUM_AVATAR_OPTIONS[0]) => {
    onAvatarUpdate(avatar.url);
    onClose();
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

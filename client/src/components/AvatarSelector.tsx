import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Button } from "../components/ui/button";
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

// Avatar caching functions
const getCachedAvatar = (userID: string): string | null => {
  try {
    const cached = localStorage.getItem(`avatar_${userID}`);
    return cached ? JSON.parse(cached) : null;
  } catch {
    return null;
  }
};

const setCachedAvatar = (userID: string, avatarUrl: string): void => {
  try {
    localStorage.setItem(`avatar_${userID}`, JSON.stringify(avatarUrl));
  } catch {
    // Silently fail if localStorage is not available
  }
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
  const { colors, isDarkMode } = useTheme();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('avatars');

  // Load cached avatar on component mount
  useEffect(() => {
    const cached = getCachedAvatar(userID);
    if (cached) {
      setSelectedAvatar(cached);
    }
  }, [userID]);

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
      setCachedAvatar(userID, imageUrl); // Cache the new avatar

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
      setCachedAvatar(userID, selectedAvatar); // Cache the new avatar
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
    // Update the avatar immediately
    onAvatarUpdate(avatar.url);
    setCachedAvatar(userID, avatar.url);
    
    // Show success notification
    toast({
      title: "Avatar Updated",
      description: `Selected ${avatar.name}`,
      variant: "success",
    });
    
    // Close the selector
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

        {/* Modern Switch/Slider Design */}
        <div className="mb-6">
          <div className="relative bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <div className="flex relative">
              {/* Sliding Background */}
              <div 
                className={`absolute top-1 bottom-1 rounded-lg transition-all duration-300 ease-out ${
                  activeTab === 'avatars' 
                    ? 'left-1 right-1/2 bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'left-1/2 right-1 bg-gradient-to-r from-green-500 to-emerald-600'
                }`}
                style={{
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                }}
              />
              
              {/* Avatars Tab */}
              <button
                onClick={() => setActiveTab('avatars')}
                className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'avatars' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeTab === 'avatars' ? 'bg-white' : 'bg-gray-400'
                  }`} />
                  <span>Premium Avatars</span>
                  {activeTab === 'avatars' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
              </button>
              
              {/* Upload Tab */}
              <button
                onClick={() => setActiveTab('upload')}
                className={`relative flex-1 py-3 px-4 rounded-lg text-sm font-semibold transition-all duration-300 z-10 ${
                  activeTab === 'upload' 
                    ? 'text-white' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    activeTab === 'upload' ? 'bg-white' : 'bg-gray-400'
                  }`} />
                  <span>Custom Upload</span>
                  {activeTab === 'upload' && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'avatars' && (
          <>
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
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-300 ${
                      selectedAvatar === avatar.url 
                        ? "opacity-50 scale-95 ring-2 ring-offset-2" 
                        : "hover:scale-105"
                    }`}
                    style={{
                      borderColor:
                        selectedAvatar === avatar.url
                          ? colors.primary
                          : colors.textMuted,
                      background: selectedAvatar === avatar.url 
                        ? `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}20)`
                        : `linear-gradient(135deg, ${colors.textMuted}20, ${colors.textMuted}10)`,
                      '--tw-ring-color': colors.primary,
                      '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                      filter: selectedAvatar === avatar.url ? 'grayscale(30%)' : 'none',
                    } as React.CSSProperties}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    {/* Avatar Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Selected State Overlay */}
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                          style={{ 
                            backgroundColor: colors.primary,
                          }}
                        >
                          <span className="text-sm text-white font-bold">✓</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-center mt-2 truncate" style={{ color: colors.text }}>
                      {avatar.name}
                    </p>
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
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-300 ${
                      selectedAvatar === avatar.url 
                        ? "opacity-50 scale-95 ring-2 ring-offset-2" 
                        : "hover:scale-105"
                    }`}
                    style={{
                      borderColor:
                        selectedAvatar === avatar.url
                          ? colors.primary
                          : colors.accent,
                      background: selectedAvatar === avatar.url 
                        ? `linear-gradient(135deg, ${colors.primary}30, ${colors.primary}20)`
                        : `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                      '--tw-ring-color': colors.primary,
                      '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                      filter: selectedAvatar === avatar.url ? 'grayscale(30%)' : 'none',
                    } as React.CSSProperties}
                    onClick={() => handleAvatarSelect(avatar)}
                  >
                    {/* Premium Crown Badge */}
                    <div className="absolute -top-2 -right-2 z-20">
                      <div className="rounded-full p-1" style={{ background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})` }}>
                        <Crown className="h-3 w-3 text-black" />
                      </div>
                    </div>
                    
                    {/* Avatar Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900 relative">
                      <img
                        src={avatar.url}
                        alt={avatar.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Jumping Elements - only show if not selected */}
                    {avatar.jumpingElements && selectedAvatar !== avatar.url && (
                      <>
                        <div 
                          className="absolute text-lg animate-bounce" 
                          style={{ 
                            color: colors.accent,
                            top: '-8px',
                            left: '-8px',
                            zIndex: 10,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                            transform: 'scale(1.2)'
                          }}
                        >
                          🤘
                        </div>
                        <div 
                          className="absolute text-lg animate-pulse" 
                          style={{ 
                            color: '#f97316',
                            top: '-8px',
                            right: '-8px',
                            zIndex: 10,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                            transform: 'scale(1.2)'
                          }}
                        >
                          ⚡
                        </div>
                        <div 
                          className="absolute text-lg animate-bounce" 
                          style={{ 
                            color: '#ef4444',
                            bottom: '-8px',
                            left: '-8px',
                            zIndex: 10,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                            transform: 'scale(1.2)',
                            animationDelay: '0.5s'
                          }}
                        >
                          🔥
                        </div>
                        <div 
                          className="absolute text-lg animate-pulse" 
                          style={{ 
                            color: '#a855f7',
                            bottom: '-8px',
                            right: '-8px',
                            zIndex: 10,
                            filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                            transform: 'scale(1.2)',
                            animationDelay: '1s'
                          }}
                        >
                          💀
                        </div>
                      </>
                    )}
                    
                    {/* Selected State Overlay */}
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg border-2 border-white"
                          style={{ 
                            backgroundColor: colors.primary,
                          }}
                        >
                          <span className="text-sm text-white font-bold">✓</span>
                        </div>
                      </div>
                    )}
                    
                    <p className="text-xs text-center mt-2 truncate" style={{ color: colors.text }}>
                      {avatar.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg" style={{ color: colors.text }}>
                Upload Custom Image
              </h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm" style={{ color: colors.textMuted }}>
                  {selectedAvatar ? 'Custom' : 'Default'}
                </span>
                <div 
                  className={`w-12 h-6 rounded-full transition-all duration-300 ease-in-out relative cursor-pointer ${
                    selectedAvatar ? 'bg-green-500' : 'bg-gray-400'
                  }`}
                  onClick={() => {
                    if (selectedAvatar) {
                      setSelectedAvatar('');
                      setCachedAvatar(userID, '');
                    }
                  }}
                >
                  <div 
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ease-in-out ${
                      selectedAvatar ? 'right-1' : 'left-1'
                    }`}
                  />
                </div>
              </div>
            </div>
            
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatar-upload"
                ref={fileInputRef}
              />
              <label
                htmlFor="avatar-upload"
                className={`block w-full p-4 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                  selectedAvatar 
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                }`}
                style={{
                  backgroundColor: selectedAvatar 
                    ? isDarkMode ? 'rgba(34, 197, 94, 0.1)' : 'rgba(34, 197, 94, 0.05)'
                    : 'transparent'
                }}
              >
                <div className="text-center">
                  {selectedAvatar ? (
                    <div className="space-y-2">
                      <div className="w-16 h-16 mx-auto rounded-full overflow-hidden border-2 border-green-500">
                        <img 
                          src={selectedAvatar} 
                          alt="Selected avatar" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        Custom image selected
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Click to change or remove
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto" style={{ color: colors.primary }} />
                      <p className="text-sm font-medium" style={{ color: colors.text }}>
                        Click to upload custom image
                      </p>
                      <p className="text-xs" style={{ color: colors.textMuted }}>
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  )}
                </div>
              </label>
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
        )}

        <div
          className="flex justify-between pt-4 border-t"
          style={{ borderColor: "#374151" }}
        >
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            className="focus:outline-none focus:ring-0"
            style={{ color: colors.text }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!selectedAvatar || saving}
            className="px-6 focus:outline-none focus:ring-0"
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

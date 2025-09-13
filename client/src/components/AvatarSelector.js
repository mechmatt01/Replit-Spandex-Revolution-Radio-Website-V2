import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, } from "../components/ui/dialog";
import { Button } from "../components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { Upload, User, Camera, Crown, Star } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useToast } from "../hooks/use-toast";
import { uploadProfileImage } from "../lib/firebase";
// Function to get local avatar URL
const getAvatarUrl = (avatarName, isPremium = false) => {
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
export default function AvatarSelector({ isOpen, onClose, currentAvatar, onAvatarUpdate, userID, // Add userID parameter
 }) {
    const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar || "");
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);
    const { colors, isDarkMode } = useTheme();
    const { toast } = useToast();
    const handleFileUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
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
        }
        catch (error) {
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload image. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setUploading(false);
        }
    };
    const handleSave = async () => {
        if (!selectedAvatar)
            return;
        setSaving(true);
        try {
            // Call the parent's onAvatarUpdate function
            onAvatarUpdate(selectedAvatar);
            toast({
                title: "Avatar Updated",
                description: "Your profile avatar has been updated successfully.",
            });
            onClose();
        }
        catch (error) {
            toast({
                title: "Update Failed",
                description: error.message || "Failed to update avatar. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setSaving(false);
        }
    };
    const handleAvatarSelect = (avatar) => {
        onAvatarUpdate(avatar.url);
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-2xl max-h-[80vh] overflow-y-auto", style: {
                backgroundColor: colors.cardBackground,
                borderColor: colors.primary,
                color: colors.text,
            }, children: [_jsx(DialogHeader, { children: _jsxs(DialogTitle, { className: "flex items-center gap-3 text-xl font-bold", children: [_jsx(User, { className: "h-6 w-6", style: { color: colors.primary } }), "Choose Your Avatar"] }) }), _jsxs(Tabs, { defaultValue: "avatars", className: "w-full", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-2 mb-6", style: { backgroundColor: colors.background }, children: [_jsx(TabsTrigger, { value: "avatars", style: { color: colors.text }, children: "Pre-made Avatars" }), _jsx(TabsTrigger, { value: "upload", style: { color: colors.text }, children: "Upload Custom" })] }), _jsxs(TabsContent, { value: "avatars", children: [_jsxs("div", { className: "mb-8", children: [_jsxs("h3", { className: "flex items-center gap-2 text-lg font-bold mb-4", style: { color: colors.text }, children: [_jsx(User, { className: "h-5 w-5" }), "Free Avatars"] }), _jsx("div", { className: "grid grid-cols-5 gap-4", children: FREE_AVATAR_OPTIONS.map((avatar) => (_jsxs("div", { className: `relative cursor-pointer rounded-lg p-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === avatar.url ? "ring-2 ring-offset-2" : ""}`, style: {
                                                    borderColor: selectedAvatar === avatar.url ? colors.primary : 'transparent',
                                                    borderWidth: selectedAvatar === avatar.url ? '2px' : '0px',
                                                    '--tw-ring-color': colors.primary,
                                                    '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                                }, onClick: () => setSelectedAvatar(avatar.url), children: [_jsx("div", { className: "aspect-square rounded-lg overflow-hidden bg-gray-800", children: _jsx("img", { src: avatar.url, alt: avatar.name, className: "w-full h-full object-cover", onError: (e) => {
                                                                const target = e.target;
                                                                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.name)}&background=f97316&color=fff&size=128`;
                                                            } }) }), _jsx("p", { className: "text-xs text-center mt-2 truncate", style: { color: colors.text }, children: avatar.name }), selectedAvatar === avatar.url && (_jsx("div", { className: "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white", style: {
                                                            backgroundColor: colors.primary,
                                                            zIndex: 30
                                                        }, children: _jsx("span", { className: "text-xs text-white font-bold", children: "\u2713" }) }))] }, avatar.id))) })] }), _jsxs("div", { className: "mb-6", children: [_jsxs("h3", { className: "flex items-center gap-2 text-lg font-bold mb-4", style: { color: colors.primary }, children: [_jsx(Crown, { className: "h-5 w-5" }), "Premium Avatars", _jsx(Star, { className: "h-4 w-4", style: { color: colors.accent } })] }), _jsx("div", { className: "grid grid-cols-5 gap-4", children: PREMIUM_AVATAR_OPTIONS.map((avatar) => (_jsxs("div", { className: `relative cursor-pointer rounded-lg border-2 p-2 transition-all duration-200 hover:scale-105 ${selectedAvatar === avatar.url ? "ring-2 ring-offset-2" : ""}`, style: {
                                                    borderColor: selectedAvatar === avatar.url
                                                        ? colors.primary
                                                        : colors.accent,
                                                    background: `linear-gradient(135deg, ${colors.accent}20, ${colors.accent}10)`,
                                                    '--tw-ring-color': colors.primary,
                                                    '--tw-ring-offset-color': isDarkMode ? '#000000' : '#ffffff',
                                                }, onClick: () => setSelectedAvatar(avatar.url), children: [_jsx("div", { className: "absolute -top-2 -right-2 z-20", children: _jsx("div", { className: "rounded-full p-1", style: { background: `linear-gradient(to right, ${colors.accent}, ${colors.primary})` }, children: _jsx(Crown, { className: "h-3 w-3 text-black" }) }) }), _jsxs("div", { className: `aspect-square rounded-lg ${avatar.jumpingElements ? 'premium-avatar-container' : 'overflow-hidden'} bg-gradient-to-br from-gray-800 to-gray-900 relative`, children: [_jsx("img", { src: avatar.url, alt: avatar.name, className: "w-full h-full object-cover rounded-lg", style: {
                                                                    clipPath: avatar.jumpingElements
                                                                        ? "polygon(5% 0%, 95% 0%, 100% 5%, 100% 95%, 95% 100%, 5% 100%, 0% 95%, 0% 5%)"
                                                                        : undefined
                                                                } }), avatar.jumpingElements && (_jsxs(_Fragment, { children: [_jsx("div", { className: "jumping-element top-0 left-0 text-lg", style: { color: colors.accent }, children: "\uD83E\uDD18" }), _jsx("div", { className: "jumping-element top-0 right-0 text-orange-500 text-lg", children: "\u26A1" }), _jsx("div", { className: "jumping-element bottom-0 left-0 text-red-500 text-lg", children: "\uD83D\uDD25" }), _jsx("div", { className: "jumping-element bottom-0 right-0 text-purple-500 text-lg", children: "\uD83D\uDC80" })] }))] }), _jsx("p", { className: "text-xs text-center mt-2 truncate font-semibold", style: { color: colors.accent }, children: avatar.name }), selectedAvatar === avatar.url && (_jsx("div", { className: "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center shadow-lg border-2 border-white", style: {
                                                            backgroundColor: colors.primary,
                                                            zIndex: 30
                                                        }, children: _jsx("span", { className: "text-xs text-white font-bold", children: "\u2713" }) }))] }, avatar.id))) })] })] }), _jsx(TabsContent, { value: "upload", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "mx-auto w-32 h-32 rounded-full flex items-center justify-center cursor-pointer transition-colors", onClick: () => fileInputRef.current?.click(), style: {}, children: selectedAvatar && selectedAvatar.startsWith("data:") ? (_jsx("img", { src: selectedAvatar, alt: "Uploaded avatar", className: "w-full h-full rounded-full object-cover" })) : selectedAvatar &&
                                                    !selectedAvatar.startsWith("/avatars/") ? (_jsx("img", { src: selectedAvatar, alt: "Current avatar", className: "w-full h-full rounded-full object-cover" })) : (_jsxs("div", { className: "text-center", children: [_jsx(Camera, { className: "mx-auto h-8 w-8 mb-2", style: { color: colors.text } }), _jsx("p", { className: "text-sm", style: { color: colors.text }, children: uploading ? "Uploading..." : "Click to upload" })] })) }), _jsx("input", { ref: fileInputRef, type: "file", accept: "image/*", onChange: handleFileUpload, className: "hidden", disabled: uploading }), _jsxs(Button, { type: "button", variant: "outline", onClick: () => fileInputRef.current?.click(), disabled: uploading, className: "mt-4 focus:outline-none focus:ring-0", style: { borderColor: colors.primary, color: colors.primary }, children: [_jsx(Upload, { className: "h-4 w-4 mr-2" }), uploading ? "Uploading..." : "Choose File"] })] }), _jsxs("div", { className: "text-center text-sm opacity-75", style: { color: colors.text }, children: [_jsx("p", { children: "Supported formats: JPG, PNG, GIF" }), _jsx("p", { children: "Maximum size: 5MB" }), _jsx("p", { children: "Recommended: 200x200 pixels or larger" })] })] }) })] }), _jsxs("div", { className: "flex justify-between pt-4 border-t", style: { borderColor: "#374151" }, children: [_jsx(Button, { type: "button", variant: "ghost", onClick: onClose, className: "focus:outline-none focus:ring-0", style: { color: colors.text }, children: "Cancel" }), _jsx(Button, { type: "button", onClick: handleSave, disabled: !selectedAvatar || saving, className: "px-6 focus:outline-none focus:ring-0", style: {
                                backgroundColor: colors.primary,
                                color: "white",
                                opacity: !selectedAvatar || saving ? 0.6 : 1,
                            }, children: saving ? "Saving..." : "Save Avatar" })] })] }) }));
}

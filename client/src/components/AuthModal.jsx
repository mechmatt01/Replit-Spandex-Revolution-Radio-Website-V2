import { useState, useEffect } from "react";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, User, LogIn, UserPlus, Phone, } from "lucide-react";
import GoogleLogoPath from "@assets/GoogleLogoIcon.png";
export default function AuthModal({ isOpen, onClose, initialMode = "login", }) {
    const [mode, setMode] = useState(initialMode);
    // Update mode when initialMode prop changes
    useEffect(() => {
        setMode(initialMode);
    }, [initialMode]);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [loading, setLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState("");
    const { isAuthenticated, signInWithGoogle } = useAuth();
    const { getColors } = useTheme();
    const { toast } = useToast();
    const colors = getColors();
    const handleGoogleAuth = async () => {
        try {
            setLoading(true);
            await signInWithGoogle();
            // The redirect will happen automatically
            onClose();
        }
        catch (error) {
            toast({
                title: "Sign In Failed",
                description: error.message || "Failed to sign in with Google.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    // Phone number formatting
    const formatPhoneNumber = (value) => {
        const phoneNumber = value.replace(/[^\d]/g, "");
        const phoneNumberLength = phoneNumber.length;
        if (phoneNumberLength < 4)
            return phoneNumber;
        if (phoneNumberLength < 7) {
            return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
        }
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
    };
    const handlePhoneChange = (e) => {
        const formatted = formatPhoneNumber(e.target.value);
        setPhoneNumber(formatted);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "login") {
                const response = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Login failed");
                }
                toast({
                    title: "Welcome back!",
                    description: "You've successfully logged in.",
                });
                // Refresh the page to update authentication state
                window.location.reload();
            }
            else {
                const response = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        firstName,
                        lastName,
                        email,
                        phoneNumber: phoneNumber.replace(/[^\d]/g, ""),
                        username,
                        password,
                    }),
                });
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || "Registration failed");
                }
                toast({
                    title: "Account created!",
                    description: "Welcome to Spandex Salvation Radio.",
                });
                // Refresh the page to update authentication state
                window.location.reload();
            }
            onClose();
            resetForm();
        }
        catch (error) {
            toast({
                title: mode === "login" ? "Login failed" : "Registration failed",
                description: error.message || "Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setLoading(false);
        }
    };
    const resetForm = () => {
        setEmail("");
        setPassword("");
        setUsername("");
        setFirstName("");
        setLastName("");
        setPhoneNumber("");
    };
    const switchMode = () => {
        setMode(mode === "login" ? "register" : "login");
        resetForm();
    };
    return (<Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" style={{ zIndex: 9999 }}/>
        <DialogPrimitive.Content className="fixed left-[50%] top-[50%] grid w-full max-w-md translate-x-[-50%] translate-y-[-50%] gap-4 p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg backdrop-blur-md" style={{
            backgroundColor: "rgba(0, 0, 0, 0.95)",
            borderColor: colors.primary + "40",
            border: "1px solid",
            zIndex: 10000
        }}>
          {/* Custom Close Button */}
          <DialogPrimitive.Close className="absolute right-4 top-4 rounded-full opacity-70 transition-all duration-200 hover:opacity-100 focus:outline-none disabled:pointer-events-none flex items-center justify-center" style={{
            color: colors.text,
            backgroundColor: "transparent",
            border: "none",
            width: "32px",
            height: "32px",
        }} onMouseEnter={(e) => {
            e.currentTarget.style.color = colors.primary;
        }} onMouseLeave={(e) => {
            e.currentTarget.style.color = colors.text;
        }}>
            <X className="h-4 w-4"/>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>

          <DialogHeader>
            <DialogTitle className="flex items-center gap-2" style={{ color: colors.text }}>
              {mode === "login" ? (<>
                  <LogIn className="h-5 w-5" style={{ color: colors.primary }}/>
                  Sign In
                </>) : (<>
                  <UserPlus className="h-5 w-5" style={{ color: colors.primary }}/>
                  Create Account
                </>)}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (<>
                <div className="space-y-2">
                  <Label htmlFor="username" style={{ color: colors.text }}>
                    Username
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
                color: colors.text,
                borderColor: "#374151",
            }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="Username" required/>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" style={{ color: colors.text }}>
                      First Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
                color: colors.text,
                borderColor: "#374151",
            }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="John" required/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" style={{ color: colors.text }}>
                      Last Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
                color: colors.text,
                borderColor: "#374151",
            }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="Doe" required/>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" style={{ color: colors.text }}>
                    Phone Number
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                    <Input id="phoneNumber" type="tel" value={phoneNumber} onChange={handlePhoneChange} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
                color: colors.text,
                borderColor: "#374151",
            }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="+1 (111) 111-1111" required/>
                  </div>
                </div>
              </>)}

            <div className="space-y-2">
              <Label htmlFor="email" style={{ color: colors.text }}>
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
            color: colors.text,
            borderColor: "#374151",
        }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="johndoe@email.com" required/>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" style={{ color: colors.text }}>
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 bg-black/50 focus:ring-0 focus:ring-offset-0 placeholder:text-gray-400 placeholder:opacity-50" style={{
            color: colors.text,
            borderColor: "#374151",
        }} onFocus={(e) => (e.currentTarget.style.borderColor = colors.primary)} onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")} placeholder="Password" required/>
              </div>
            </div>

            <Button type="submit" className="w-full text-white" style={{
            backgroundColor: colors.primary,
        }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = colors.secondary)} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = colors.primary)} disabled={loading}>
              {loading ? (<>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                  {mode === "login" ? "Logging In..." : "Creating Account..."}
                </>) : mode === "login" ? ("Login") : ("Create Account")}
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-600"/>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-black px-2 text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button type="button" variant="outline" onClick={handleGoogleAuth} className="w-full bg-white text-black border-gray-300 hover:bg-gray-50" disabled={loading}>
              <img src={GoogleLogoPath} alt="Google" className="mr-2 h-4 w-4"/>
              {mode === "login"
            ? "Continue with Google"
            : "Sign Up with Google"}
            </Button>

            <div className="text-center">
              <button type="button" onClick={switchMode} className="text-sm transition-colors duration-200" style={{ color: colors.primary }} onMouseEnter={(e) => (e.currentTarget.style.color = colors.secondary)} onMouseLeave={(e) => (e.currentTarget.style.color = colors.primary)}>
                {mode === "login"
            ? "Don't have an account? Sign up"
            : "Already have an account? Sign in"}
              </button>
            </div>
          </form>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </Dialog>);
}

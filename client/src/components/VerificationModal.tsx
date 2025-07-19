import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Phone, Mail, CheckCircle, Shield } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRecaptcha } from "./RecaptchaV3";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "email" | "phone";
  contactInfo: string; // email or phone number
}

export default function VerificationModal({
  isOpen,
  onClose,
  type,
  contactInfo,
}: VerificationModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [sendingCode, setSendingCode] = useState(false);
  const { colors } = useTheme();
  const { toast } = useToast();

  // reCAPTCHA Enterprise integration for SMS fraud detection
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "";
  const { executeRecaptcha } = useRecaptcha();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCode("");
      setVerified(false);
      setLoading(false);
      setSendingCode(false);
    }
  }, [isOpen]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || !code.trim()) return;

    setLoading(true);

    try {
      if (type === "phone") {
        await apiRequest("POST", "/api/user/verify-phone", { code });
      } else {
        await apiRequest("POST", "/api/user/verify-email", { code });
      }

      setVerified(true);
      toast({
        title: "Verification Successful!",
        description: `Your ${type} has been verified.`,
      });

      setTimeout(() => {
        onClose();
        setCode("");
        setVerified(false);
      }, 2000);
    } catch (error: any) {
      toast({
        title: "Verification Failed",
        description:
          error.message || "Invalid verification code. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (sendingCode) return;

    setSendingCode(true);
    try {
      if (type === "phone") {
        let recaptchaToken = "";

        // Execute reCAPTCHA for SMS fraud detection
        if (siteKey) {
          try {
            recaptchaToken = await executeRecaptcha("phone_verification");
          } catch (recaptchaError) {
            console.warn("reCAPTCHA failed:", recaptchaError);
            // Continue without reCAPTCHA if it fails
          }
        }

        await apiRequest("POST", "/api/user/send-phone-verification", {
          phoneNumber: contactInfo,
          recaptchaToken,
        });
      } else {
        await apiRequest("POST", "/api/user/send-email-verification", {});
      }

      toast({
        title: "Code Sent",
        description: `A new verification code has been sent to your ${type}.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send verification code.",
        variant: "destructive",
      });
    } finally {
      setSendingCode(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-md"
        style={{
          backgroundColor: colors.cardBackground,
          borderColor: colors.primary,
          color: colors.text,
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl font-bold">
            {verified ? (
              <>
                <CheckCircle className="h-6 w-6" style={{ color: "#10B981" }} />
                Verified!
              </>
            ) : (
              <>
                {type === "phone" ? (
                  <Phone
                    className="h-6 w-6"
                    style={{ color: colors.primary }}
                  />
                ) : (
                  <Mail className="h-6 w-6" style={{ color: colors.primary }} />
                )}
                Verify {type === "phone" ? "Phone Number" : "Email Address"}
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        {verified ? (
          <div className="text-center py-8">
            <CheckCircle
              className="h-16 w-16 mx-auto mb-4"
              style={{ color: "#10B981" }}
            />
            <p className="text-lg" style={{ color: colors.text }}>
              Your {type} has been successfully verified!
            </p>
          </div>
        ) : (
          <form onSubmit={handleVerify} className="space-y-6">
            <div className="text-center space-y-2">
              <p style={{ color: colors.text }}>
                We sent a verification code to:
              </p>
              <p className="font-medium" style={{ color: colors.primary }}>
                {contactInfo}
              </p>
              <p className="text-sm opacity-75" style={{ color: colors.text }}>
                Enter the 6-digit code to verify your {type}.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="verification-code" style={{ color: colors.text }}>
                Verification Code
              </Label>
              <Input
                id="verification-code"
                type="text"
                value={code}
                onChange={(e) =>
                  setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                }
                className="text-center text-2xl tracking-wider bg-black/50"
                style={{
                  color: colors.text,
                  borderColor: "#374151",
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.borderColor = colors.primary)
                }
                onBlur={(e) => (e.currentTarget.style.borderColor = "#374151")}
                placeholder="000000"
                maxLength={6}
                required
              />
            </div>

            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 font-semibold transition-all duration-200"
                style={{
                  backgroundColor: colors.primary,
                  color: "white",
                  opacity: loading || code.length !== 6 ? 0.6 : 1,
                }}
              >
                {loading ? "Verifying..." : "Verify Code"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleResend}
                className="text-sm"
                style={{ color: colors.primary }}
              >
                Didn't receive the code? Resend
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Mail, Clock, Radio, Facebook, Twitter, Instagram, Youtube, Check, X, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useTheme } from "@/contexts/ThemeContext";
import type { InsertContact } from "@shared/schema";

export default function Contact() {
  const [formData, setFormData] = useState<InsertContact>({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");

  const { toast } = useToast();
  const { getColors } = useTheme();
  const colors = getColors();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      setOriginalMessage(formData.message);
      setShowSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
      setValidationErrors([]);
    },
    onError: () => {
      setOriginalMessage(formData.message);
      setShowError(true);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors: string[] = [];
    if (!formData.firstName.trim()) errors.push("First Name");
    if (!formData.lastName.trim()) errors.push("Last Name");
    if (!formData.email.trim()) errors.push("Email Address");
    if (!formData.subject.trim()) errors.push("Subject");
    if (!formData.message.trim()) errors.push("Message");
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setValidationErrors([]);
    contactMutation.mutate(formData);
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(originalMessage);
    toast({
      title: "Message Copied",
      description: "Your message has been copied to clipboard.",
    });
  };

  const handleTryAgain = () => {
    setShowError(false);
    setShowSuccess(false);
  };

  const handleInputChange = (field: keyof InsertContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-black dark:text-white">
            GET IN TOUCH
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            Have questions, feedback, or want to collaborate? We'd love to hear from you.
          </p>
        </div>

        <div className="flex justify-center items-center min-h-[500px]">
          <div className="w-full max-w-lg">
            <Card 
              className="bg-dark-surface/50 hover:bg-dark-surface/70 transition-all duration-300 mx-auto"
              style={{ borderColor: colors.primary }}
            >
              <CardContent className="p-8">
                {!showSuccess && !showError && (
                  <>
                    <h3 className="font-black text-xl mb-6 text-center text-metal-orange">Send us a Message</h3>
                    
                    {validationErrors.length > 0 && (
                      <div className="mb-4 p-3 bg-red-900/20 border border-red-500 rounded-md">
                        <p className="text-red-400 text-sm font-semibold">Please fill out the following required fields:</p>
                        <ul className="text-red-300 text-sm mt-1">
                          {validationErrors.map((field, index) => (
                            <li key={index}>• {field}</li>
                          ))}
                        </ul>
                      </div>
                    )}</>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300 font-semibold">First Name*</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder:text-gray-400 placeholder:opacity-60 focus:border-metal-orange"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300 font-semibold">Last Name*</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder:text-gray-400 placeholder:opacity-60 focus:border-metal-orange"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300 font-semibold">Email Address*</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder:text-gray-400 placeholder:opacity-60 focus:border-metal-orange"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-300 font-semibold">Subject*</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                    <SelectTrigger className="bg-dark-bg border-dark-border text-white focus:border-metal-orange data-[placeholder]:text-gray-400 data-[placeholder]:opacity-60">
                      <SelectValue placeholder="Select a subject" />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-bg/90">
                      <SelectItem value="general">General Inquiry</SelectItem>
                      <SelectItem value="technical">Technical Support</SelectItem>
                      <SelectItem value="partnership">Partnership/Collaboration</SelectItem>
                      <SelectItem value="feedback">Feedback</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contactMessage" className="text-gray-300 font-semibold">Message*</Label>
                  <Textarea
                    id="contactMessage"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder:text-gray-400 placeholder:opacity-60 focus:border-metal-orange resize-none"
                  /></div>

                <Button
                  type="submit"
                  disabled={contactMutation.isPending}
                  className="w-full px-6 py-3 rounded-full font-bold transition-all duration-300"
                  style={{
                    backgroundColor: colors.primary,
                    color: colors.primaryText || 'white'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primaryDark || colors.primary;
                    e.currentTarget.style.transform = 'scale(1.02)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = colors.primary;
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {contactMutation.isPending ? "SENDING..." : "SEND MESSAGE"}
                </Button>
                </form>
                </>
                )}

                {/* Success State */}
                {showSuccess && (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <div 
                        className="absolute w-16 h-16 rounded-full opacity-50"
                        style={{ backgroundColor: colors.primary }}
                      ></div>
                      <Check className="w-8 h-8 text-green-400 relative z-10" />
                    </div>
                    <h3 className="font-black text-xl mb-2 text-green-400">Message Sent Successfully!</h3>
                    <p className="text-gray-300 text-sm">We'll get back to you within 24-48 hours.</p>
                    <Button
                      onClick={handleTryAgain}
                      className="mt-4 px-6 py-2 rounded-full font-bold transition-all duration-300"
                      style={{
                        backgroundColor: colors.primary,
                        color: colors.primaryText || 'white'
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                )}

                {/* Error State */}
                {showError && (
                  <div className="text-center animate-in fade-in duration-500">
                    <div className="relative inline-flex items-center justify-center mb-4">
                      <div className="absolute w-16 h-16 rounded-full bg-red-600 opacity-50"></div>
                      <X className="w-8 h-8 text-red-400 relative z-10" />
                    </div>
                    <h3 className="font-black text-xl mb-2 text-red-400">Message Failed to Send</h3>
                    <p className="text-gray-300 text-sm mb-4">Please refresh the site and try again.</p>
                    
                    <div className="space-y-3">
                      <Button
                        onClick={handleCopyMessage}
                        className="w-full px-6 py-2 rounded-full font-bold transition-all duration-300 bg-gray-600 hover:bg-gray-500 text-white"
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Message to Clipboard
                      </Button>
                      
                      <Button
                        onClick={handleTryAgain}
                        className="w-full px-6 py-2 rounded-full font-bold transition-all duration-300"
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.primaryText || 'white'
                        }}
                      >
                        Try Again
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
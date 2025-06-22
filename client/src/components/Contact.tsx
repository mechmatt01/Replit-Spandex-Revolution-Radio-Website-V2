import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Mail, Clock, Radio, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
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

  const { toast } = useToast();
  const { getColors } = useTheme();
  const colors = getColors();

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "We'll get back to you within 24-48 hours.",
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
    },
    onError: () => {
      toast({
        title: "Message Failed",
        description: "Please check your information and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    contactMutation.mutate(formData);
  };

  const handleInputChange = (field: keyof InsertContact, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <section id="contact" className="py-20 bg-dark-bg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-orbitron font-black text-3xl md:text-4xl mb-4 text-black dark:text-white">
            GET IN TOUCH
          </h2>
          <p className="text-gray-400 text-lg font-semibold">
            Have questions, feedback, or want to collaborate? We'd love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <Card className="bg-dark-surface/50 hover:bg-dark-surface/70 transition-all duration-300">
            <CardContent className="p-8">
              <h3 className="font-black text-xl mb-6 text-metal-orange">Send us a Message</h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="firstName" className="text-gray-300 font-semibold">First Name *</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange("firstName", e.target.value)}
                      placeholder="John"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName" className="text-gray-300 font-semibold">Last Name *</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange("lastName", e.target.value)}
                      placeholder="Doe"
                      required
                      className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email" className="text-gray-300 font-semibold">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange"
                  />
                </div>

                <div>
                  <Label htmlFor="subject" className="text-gray-300 font-semibold">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange("subject", value)}>
                    <SelectTrigger className="bg-dark-bg/50 text-white focus:ring-2 focus:ring-metal-orange focus:ring-opacity-50">
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
                  <Label htmlFor="contactMessage" className="text-gray-300 font-semibold">Message *</Label>
                  <Textarea
                    id="contactMessage"
                    value={formData.message}
                    onChange={(e) => handleInputChange("message", e.target.value)}
                    placeholder="Tell us what's on your mind..."
                    rows={5}
                    required
                    className="bg-dark-bg border-dark-border text-white placeholder-gray-500 focus:border-metal-orange resize-none"
                  />
                </div>

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
            </CardContent>
          </Card>


        </div>
      </div>
    </section>
  );
}

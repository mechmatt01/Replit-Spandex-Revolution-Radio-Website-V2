import { useTheme } from "../contexts/ThemeContext";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  const { colors } = useTheme();
  const [, navigate] = useLocation();

  return (
    <div className="relative">
      <button
        className="fixed top-4 left-4 z-50 bg-black/70 hover:bg-black/90 text-white rounded-full p-2 shadow-lg"
        onClick={() => navigate("/")}
        aria-label="Back to Home"
        style={{ backdropFilter: "blur(4px)" }}
      >
        <ArrowLeft className="w-6 h-6" />
      </button>
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card
          style={{
            backgroundColor: colors.background,
            borderColor: colors.primary,
          }}
        >
          <CardHeader className="text-center">
            <CardTitle
              className="text-3xl font-bold"
              style={{ color: colors.text }}
            >
              Terms of Service
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6" style={{ color: colors.text }}>
                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    1. Acceptance of Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    By accessing and using Spandex Salvation Radio ("the
                    Service"), you accept and agree to be bound by the terms and
                    provision of this agreement. If you do not agree to abide by
                    the above, please do not use this service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    2. Description of Service
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Spandex Salvation Radio is an online streaming platform that
                    provides:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>24/7 metal music streaming</li>
                    <li>Interactive radio show schedules</li>
                    <li>Song submission system</li>
                    <li>Community features and chat</li>
                    <li>Premium subscription services</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    3. User Accounts and Registration
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    To access certain features, you must register for an
                    account. You agree to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Provide accurate and complete information</li>
                    <li>Maintain the security of your account credentials</li>
                    <li>
                      Accept responsibility for all activities under your
                      account
                    </li>
                    <li>Notify us immediately of any unauthorized use</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    4. Content and Submissions
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    When submitting content (songs, comments, etc.), you agree
                    that:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>You own or have rights to the submitted content</li>
                    <li>Content must comply with our community guidelines</li>
                    <li>We reserve the right to moderate and remove content</li>
                    <li>
                      Inappropriate content may result in account suspension
                    </li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    5. Premium Subscriptions
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Premium subscription terms:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Subscriptions are billed monthly or annually</li>
                    <li>
                      Cancellation takes effect at the end of current billing
                      period
                    </li>
                    <li>No refunds for partial months</li>
                    <li>Pricing subject to change with 30-day notice</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    6. Prohibited Uses
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You may not use our service to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Violate any applicable laws or regulations</li>
                    <li>Transmit malicious code or harmful content</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Interfere with or disrupt the service</li>
                    <li>Engage in harassment or abusive behavior</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    7. Intellectual Property
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    All content on Spandex Salvation Radio, including but not
                    limited to text, graphics, logos, and software, is protected
                    by copyright and other intellectual property laws. You may
                    not reproduce, distribute, or create derivative works
                    without permission.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    8. Limitation of Liability
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Spandex Salvation Radio shall not be liable for any
                    indirect, incidental, special, consequential, or punitive
                    damages, including but not limited to loss of profits, data,
                    or use, incurred by you or any third party.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    9. Termination
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may terminate or suspend your account immediately,
                    without prior notice, for conduct that we believe violates
                    these Terms of Service or is harmful to other users, us, or
                    third parties.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    10. Changes to Terms
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We reserve the right to modify these terms at any time. We
                    will notify users of significant changes via email or
                    prominent notice on our website. Continued use of the
                    service constitutes acceptance of modified terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2
                    className="text-xl font-semibold mb-3"
                    style={{ color: colors.primary }}
                  >
                    11. Contact Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    For questions about these Terms of Service, please contact
                    us at:
                    <br />
                    Email: legal@spandexsalvationradio.com
                    <br />
                    Address: [Your Business Address]
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
        </div>
      </div>
    </div>
  );
}

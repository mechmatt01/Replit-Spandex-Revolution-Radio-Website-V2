import { useTheme } from "../contexts/ThemeContext";
import { Card, CardContent, CardHeader, CardTitle, } from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import { Separator } from "../components/ui/separator";
export default function PrivacyPolicy() {
    const { colors } = useTheme();
    return (<div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Card style={{
            backgroundColor: colors.background,
            borderColor: colors.primary,
        }}>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold" style={{ color: colors.text }}>
              Privacy Policy
            </CardTitle>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6" style={{ color: colors.text }}>
                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    1. Information We Collect
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We collect information you provide directly to us, such as
                    when you:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Create an account or profile</li>
                    <li>Subscribe to our premium services</li>
                    <li>Submit song requests or feedback</li>
                    <li>Participate in chat or community features</li>
                    <li>Contact us for support</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    2. Personal Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    The types of personal information we may collect include:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Name and email address</li>
                    <li>Phone number (for verification)</li>
                    <li>Payment information (processed securely via Stripe)</li>
                    <li>Profile preferences and listening history</li>
                    <li>Location data (if you choose to share)</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    3. Automatic Information Collection
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We automatically collect certain information when you use
                    our service:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Device information (browser, operating system)</li>
                    <li>Usage data (pages visited, time spent)</li>
                    <li>IP address and approximate location</li>
                    <li>Cookies and similar tracking technologies</li>
                    <li>Streaming preferences and listening patterns</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    4. How We Use Your Information
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use the information we collect to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Provide and maintain our streaming service</li>
                    <li>Process payments and manage subscriptions</li>
                    <li>Personalize your listening experience</li>
                    <li>Send important updates and notifications</li>
                    <li>Improve our service and develop new features</li>
                    <li>Prevent fraud and ensure security</li>
                    <li>Comply with legal obligations</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    5. Information Sharing
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We do not sell, trade, or rent your personal information. We
                    may share information in these situations:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>
                      With service providers (Stripe for payments, Firebase for
                      authentication)
                    </li>
                    <li>When required by law or legal process</li>
                    <li>To protect our rights or safety</li>
                    <li>In connection with a business transfer</li>
                    <li>With your explicit consent</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    6. Data Security
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We implement appropriate security measures to protect your
                    personal information against unauthorized access,
                    alteration, disclosure, or destruction. This includes
                    encryption of sensitive data, secure server infrastructure,
                    and regular security assessments.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    7. Cookies and Tracking
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Remember your preferences and settings</li>
                    <li>Maintain your login session</li>
                    <li>Analyze usage patterns and improve our service</li>
                    <li>Provide personalized content recommendations</li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    You can control cookie preferences through your browser
                    settings.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    8. Third-Party Services
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    Our service integrates with third-party providers:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>
                      <strong>Google OAuth:</strong> For account authentication
                    </li>
                    <li>
                      <strong>Stripe:</strong> For payment processing
                    </li>
                    <li>
                      <strong>Firebase:</strong> For user data storage and
                      authentication
                    </li>
                    <li>
                      <strong>Google reCAPTCHA:</strong> For spam and fraud
                      prevention
                    </li>
                  </ul>
                  <p className="text-muted-foreground leading-relaxed mt-3">
                    These services have their own privacy policies that govern
                    their use of your information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    9. Your Rights and Choices
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-3">
                    You have the right to:
                  </p>
                  <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-4">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Object to certain processing activities</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    10. Data Retention
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We retain your personal information for as long as necessary
                    to provide our services, comply with legal obligations,
                    resolve disputes, and enforce our agreements. When you
                    delete your account, we will delete or anonymize your
                    personal information within 30 days.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    11. Children's Privacy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Our service is not intended for users under 13 years of age.
                    We do not knowingly collect personal information from
                    children under 13. If we become aware that we have collected
                    such information, we will take steps to delete it promptly.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    12. International Users
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you are accessing our service from outside the United
                    States, please be aware that your information may be
                    transferred to, stored, and processed in the United States
                    where our servers are located.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    13. Changes to This Policy
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We may update this Privacy Policy from time to time. We will
                    notify you of any material changes by posting the new policy
                    on this page and updating the "Last updated" date. We
                    encourage you to review this policy periodically.
                  </p>
                </section>

                <Separator />

                <section>
                  <h2 className="text-xl font-semibold mb-3" style={{ color: colors.primary }}>
                    14. Contact Us
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">
                    If you have any questions about this Privacy Policy or our
                    data practices, please contact us at:
                    <br />
                    Email: privacy@spandexsalvationradio.com
                    <br />
                    Address: [Your Business Address]
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>);
}

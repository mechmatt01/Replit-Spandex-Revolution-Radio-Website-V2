import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";
class RecaptchaService {
    client = null;
    projectId;
    constructor() {
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID || "";
        if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
            this.client = new RecaptchaEnterpriseServiceClient();
        }
    }
    async assessSMSDefense(request) {
        if (!this.client || !this.projectId) {
            console.warn("reCAPTCHA Enterprise not configured");
            return {
                valid: true, // Allow requests when not configured
                score: 0.5,
                reasons: ["Service not configured"],
            };
        }
        try {
            const projectPath = this.client.projectPath(this.projectId);
            const assessment = {
                event: {
                    token: request.token,
                    siteKey: request.siteKey,
                    userInfo: {
                        accountId: request.accountId || "",
                        userIds: request.phoneNumber
                            ? [
                                {
                                    phoneNumber: request.phoneNumber,
                                },
                            ]
                            : [],
                    },
                },
            };
            const [response] = await this.client.createAssessment({
                parent: projectPath,
                assessment,
            });
            const tokenProperties = response.tokenProperties;
            const riskAnalysis = response.riskAnalysis;
            const fraudSignals = response.fraudSignals;
            // Validate token
            if (!tokenProperties?.valid) {
                return {
                    valid: false,
                    score: 0,
                    reasons: tokenProperties?.invalidReason
                        ? [tokenProperties.invalidReason]
                        : ["Invalid token"],
                };
            }
            // Check action matches
            if (request.action && tokenProperties.action !== request.action) {
                return {
                    valid: false,
                    score: 0,
                    reasons: ["Action mismatch"],
                };
            }
            // Analyze phone number risk
            let phoneRisk;
            if (fraudSignals?.cardTestingSignals ||
                fraudSignals?.stolenInstrumentSignals) {
                phoneRisk = {
                    level: "HIGH",
                    reasons: ["Fraud signals detected"],
                };
            }
            return {
                valid: true,
                score: riskAnalysis?.score || 0.5,
                reasons: riskAnalysis?.reasons || [],
                phoneRisk,
            };
        }
        catch (error) {
            console.error("reCAPTCHA assessment failed:", error);
            return {
                valid: false,
                score: 0,
                reasons: ["Assessment failed"],
            };
        }
    }
    async assessRegistration(request) {
        return this.assessSMSDefense({
            ...request,
            action: "registration",
        });
    }
    async assessLogin(request) {
        return this.assessSMSDefense({
            ...request,
            action: "login",
        });
    }
}
export const recaptchaService = new RecaptchaService();

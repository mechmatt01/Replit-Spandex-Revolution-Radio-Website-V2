# Google reCAPTCHA Enterprise SMS Fraud Detection Setup

This guide walks you through setting up Google reCAPTCHA Enterprise for SMS fraud detection in your phone verification system.

## Prerequisites

1. Google Cloud Project with billing enabled
2. reCAPTCHA Enterprise API enabled
3. Service account with reCAPTCHA Enterprise permissions

## Setup Steps

### 1. Enable reCAPTCHA Enterprise API

```bash
gcloud services enable recaptchaenterprise.googleapis.com
```

### 2. Create a reCAPTCHA Site Key

1. Go to the [reCAPTCHA Enterprise console](https://console.cloud.google.com/security/recaptcha)
2. Click "Create Key"
3. Choose "Score-based (v3)" type
4. Add your domain (e.g., `yoursite.replit.app`)
5. Enable "SMS fraud protection" under Advanced Settings
6. Copy the generated site key

### 3. Create Service Account

1. Go to [IAM & Admin > Service Accounts](https://console.cloud.google.com/iam-admin/serviceaccounts)
2. Click "Create Service Account"
3. Give it a name like "recaptcha-sms-detection"
4. Grant the "reCAPTCHA Enterprise Agent" role
5. Create and download the JSON key file

### 4. Configure Environment Variables

Set these environment variables in your Replit secrets or `.env` file:

```bash
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
RECAPTCHA_SITE_KEY="your-site-key-from-step-2"

# Frontend Configuration
VITE_RECAPTCHA_SITE_KEY="your-site-key-from-step-2"
```

### 5. Upload Service Account Key

For Replit deployment:
1. Upload the service account JSON file to your project
2. Set `GOOGLE_APPLICATION_CREDENTIALS` to the file path
3. Ensure the file is not in your `.gitignore`

## How It Works

### Step 1: Assessment Creation (SMS Fraud Detection)

When a user requests phone verification, the system:

1. **Frontend**: Executes reCAPTCHA v3 with action `phone_verification`
2. **Backend**: Sends assessment request to reCAPTCHA Enterprise:

```javascript
const assessment = await recaptchaService.assessSMSDefense({
  token: recaptchaToken,
  siteKey: process.env.RECAPTCHA_SITE_KEY,
  accountId: user.userId,
  phoneNumber: formattedPhone, // E.164 format
  action: 'phone_verification'
});
```

3. **Risk Analysis**: Google analyzes:
   - Token validity
   - User behavior patterns
   - Phone number risk signals
   - Fraud indicators

4. **Decision**: System blocks high-risk requests or proceeds with SMS

### Step 2: SMS Annotation (Machine Learning Feedback)

When SMS verification succeeds:

```javascript
// Annotate successful verification as legitimate
console.log('SMS verification successful - annotating as legitimate:', {
  userId: user.userId,
  phoneNumber: phoneToVerify,
  timestamp: new Date().toISOString()
});
```

This feedback improves Google's ML models for future assessments.

## Security Features

### Risk Levels
- **LOW**: Normal user behavior, proceed with SMS
- **MEDIUM**: Suspicious but not definitively fraudulent
- **HIGH**: Block SMS sending, likely fraud attempt

### Protection Against
- Phone number abuse and testing
- Automated verification requests
- Suspicious user behavior patterns
- Known fraud indicators

### Response Example

```javascript
{
  valid: true,
  score: 0.8, // 0.0 (bot) to 1.0 (human)
  reasons: [],
  phoneRisk: {
    level: 'LOW',
    reasons: []
  }
}
```

## Implementation Details

### Frontend Integration
- Invisible reCAPTCHA v3 execution
- Automatic token generation on verification request
- Graceful fallback if reCAPTCHA fails

### Backend Integration
- E.164 phone number formatting
- Session-based verification code storage
- Comprehensive error handling
- Security logging for monitoring

### Error Handling
- Invalid tokens are rejected
- High-risk assessments block SMS
- Service failures allow fallback operation
- Detailed logging for debugging

## Monitoring

Monitor these metrics in Google Cloud Console:
- Assessment success rates
- Fraud detection accuracy
- SMS abuse patterns
- User experience impact

## Testing

1. **Normal Flow**: Valid user should receive SMS without issues
2. **High Risk**: Automated requests should be blocked
3. **Fallback**: Service works when reCAPTCHA is unavailable

## Cost Considerations

- reCAPTCHA Enterprise pricing: $1 per 1,000 assessments
- SMS fraud protection: Additional $1 per 1,000 phone assessments
- Monitor usage in Google Cloud Console

## Support

For issues with this implementation:
1. Check Google Cloud Console for API errors
2. Verify service account permissions
3. Ensure site key matches your domain
4. Review server logs for detailed error messages
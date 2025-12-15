# Gmail Setup for OTP Emails

## Quick Fix (Development Mode)
The system now works with console logging when Gmail is not configured. Check your terminal for OTP codes.

## Gmail Configuration (Production)

### 1. Enable 2-Factor Authentication
- Go to Google Account settings
- Security → 2-Step Verification → Turn On

### 2. Generate App Password
- Google Account → Security → App passwords
- Select app: Mail
- Select device: Other (custom name)
- Copy the 16-character password

### 3. Update .env file
```env
EMAIL=your-actual-gmail@gmail.com
EMAIL_PASS=your-16-character-app-password
```

### 4. Test Configuration
The system will automatically detect valid configuration and send real emails.

## Current Status
- ✅ OTP system works with console fallback
- ✅ Signup flow functional
- ✅ Forgot password functional
- ⚠️ Real emails require Gmail setup

## Testing
1. Try signup - OTP will appear in terminal
2. Copy OTP from terminal to form
3. Complete signup process
import nodemailer from 'nodemailer'

const email = process.env.EMAIL
const pass = process.env.EMAIL_PASS

// Check if email is properly configured
const isEmailConfigured = email && pass && 
  email !== 'your-email@gmail.com' && 
  pass !== 'your-app-specific-password' &&
  pass !== 'your-gmail-app-password'

let transporter: any = null

if (isEmailConfigured) {
  transporter = nodemailer.createTransport({
    secure: true,
    port: 465,
    service: "gmail",
    auth: {
      user: email,
      pass: pass
    }
  })
}

export async function sendOtp(useremail: string, otp: number, type: 'signup' | 'forgot-password' = 'signup'): Promise<boolean> {
  // Use fallback in development if email not configured
  if (!isEmailConfigured) {
    console.log(`\n=== OTP FALLBACK (${type.toUpperCase()}) ===`)
    console.log(`To: ${useremail}`)
    console.log(`OTP: ${otp}`)
    console.log(`Expires: 10 minutes`)
    console.log('========================\n')
    return true
  }

  try {
    const subject = type === 'signup' ? 'Advanced Bin - Account Verification OTP' : 'Advanced Bin - Password Reset OTP'
    const title = type === 'signup' ? 'Account Verification' : 'Password Reset'
    const message = type === 'signup' 
      ? 'Please use this code to complete your account registration.'
      : 'Please use this code to reset your password.'
    
    const mailOptions = {
      from: email,
      to: useremail,
      subject,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure OTP Verification</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
        .container { background-color: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; margin: auto; }
        .header { text-align: center; margin-bottom: 20px; }
        .otp-box { background-color: black; border-radius: 5px; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; color: white; margin: 20px 0; letter-spacing: 4px; }
        .footer { text-align: center; font-size: 12px; color: #777; margin-top: 20px; }
        .warning { color: #e74c3c; font-size: 14px; text-align: center; margin-top: 15px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title}</h1>
        </div>
        <p>Dear User,</p>
        <p>Your OTP code is:</p>
        <div class="otp-box">${otp}</div>
        <p>${message} This code will expire in 10 minutes.</p>
        <p class="warning">⚠️ Never share this code with anyone. We will never ask for your OTP.</p>
        <div class="footer">
            <p>Thank you for choosing us!</p>
            <p>&copy; 2025 Advanced Bin</p>
        </div>
    </div>
</body>
</html>
      `,
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    // In development, fall back to console logging
    if (process.env.NODE_ENV === 'development') {
      console.log(`\n=== OTP FALLBACK (${type.toUpperCase()}) ===`)
      console.log(`To: ${useremail}`)
      console.log(`OTP: ${otp}`)
      console.log(`Expires: 10 minutes`)
      console.log('========================\n')
      return true
    }
    throw new Error('Failed to send OTP email')
  }
}

export async function sendBugreport(
  name: string, 
  email: string, 
  id: string, 
  subject: string, 
  message: string, 
  relatedTo: string
): Promise<boolean> {
  try {
    const mailOptions = {
      from: email,
      to: "adarshpanditdev@gmail.com",
      replyTo: email, // Makes it easier to reply directly
      subject: `Bug Report from Bin - ${relatedTo}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>🐛 Bug Report Submitted</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 20px;
      color: #333;
    }

    .container {
      max-width: 620px;
      margin: auto;
      background-color: #ffffff;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
      border-top: 6px solid #e74c3c;
    }

    h2 {
      color: #e74c3c;
      font-size: 24px;
      margin-bottom: 10px;
    }

    .info-section {
      margin: 15px 0;
    }

    .label {
      display: inline-block;
      width: 100px;
      font-weight: bold;
      color: #2c3e50;
    }

    .value {
      display: inline-block;
      color: #555;
      word-break: break-word;
    }

    .highlight-box {
      background-color: #fef6f6;
      border-left: 4px solid #e74c3c;
      padding: 15px;
      margin-top: 10px;
      border-radius: 5px;
      white-space: pre-wrap;
      word-wrap: break-word;
      color: #c0392b;
    }

    .footer {
      margin-top: 30px;
      font-size: 12px;
      color: #999;
      text-align: center;
    }

    .button {
      display: inline-block;
      background-color: cadetblue;
      color: white;
      padding: 10px 20px;
      border-radius: 8px;
      font-size: 16px;
      text-decoration: none;
      margin-top: 20px;
    }

    .button:hover {
      background-color: #5f9ea0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h2>🐛 Bug Report Submitted</h2>

    <div class="info-section">
      <span class="label">Report ID:</span>
      <span class="value">${id}</span>
    </div>

    <div class="info-section">
      <span class="label">Name:</span>
      <span class="value">${name}</span>
    </div>

    <div class="info-section">
      <span class="label">Email:</span>
      <span class="value">${email}</span>
    </div>

    <div class="info-section">
      <span class="label">Subject:</span>
      <span class="value">${subject}</span>
    </div>

    <div class="info-section">
      <span class="label">Related To:</span>
      <span class="value">${relatedTo}</span>
    </div>

    <div class="info-section">
      <span class="label">Message:</span>
      <div class="highlight-box">${message}</div>
    </div>

    <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="button">Reply to Reporter</a>

    <div class="footer">
      This is an automated email. Please review the report and follow up as necessary.
    </div>
  </div>
</body>
</html>
      `,
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send bug report email:', error)
    throw new Error('Failed to send bug report email')
  }
}

// Optional: Add a function to verify the transporter configuration
export async function verifyEmailConfig(): Promise<boolean> {
  if (!isEmailConfigured) {
    console.log('Email not configured - using fallback mode')
    return false
  }
  
  try {
    await transporter.verify()
    console.log('Email server is ready to send messages')
    return true
  } catch (error) {
    console.error('Email server verification failed:', error)
    return false
  }
}
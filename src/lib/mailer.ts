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

export async function sendOtp(useremail: string, otp: number, type: 'signup' | 'login' | 'forgot-password' = 'signup'): Promise<boolean> {
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
    const subject = type === 'signup' ? 'Management@Arinova.Studio - Verify your email' : type === "login" ? "Management@Arinova.Studio - Get to your account" : 'Management@Arinova.Studio - Retrieve your password'
    const title = type === 'signup' ? 'Management@Arinova.studio - Account Verification' : type === "login" ? "Management@Arinova.studio - Login" : 'Management@Arinova.Studio - Password Reset'
    const message = type === 'signup' 
      ? 'Please use this code to complete your account registration.'
      : type === "login" ? 'Please use this code to login to your account.' : 'Please use this code to reset your password.'
    
    const signupTemplate = `<!DOCTYPE html>

<html>
<body style="margin:0; padding:0; background-color:#0F0A1F; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#18122B; margin-top:40px; border-radius:8px; border:1px solid #2E1065;">

      <tr>
        <td align="center" style="padding:32px;">
          <img src="cid:logo" alt="Company Logo" style="max-height:56px;" />
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px 36px 40px;">
          <h2 style="color:#EDE9FE; margin-bottom:16px;">
            ${title}
          </h2>

          <p style="color:#C4B5FD; font-size:14px;">
            Hello There,
          </p>

          <p style="color:#C4B5FD; font-size:14px;">
            Please confirm your email address to activate your <b>Arinova Studio</b> Management System.
            Use the verification code below:
          </p>

          <div style="text-align:center; margin:32px 0;">
            <div style="
              display:inline-block;
              padding:16px 28px;
              background:#2E1065;
              border-radius:6px;
              font-size:28px;
              letter-spacing:6px;
              font-weight:bold;
              color:#EDE9FE;">
              ${otp}
            </div>
          </div>
          
          <p style="color: #C4B5FD; font-size:14px;">${message}</p>
          <p style="color:#C4B5FD; font-size:14px;">
            This code expires in <span style="color: deeppink;"><b>10 min.</b></span> <br>
            If you did not sign up, you can safely ignore this email.
          </p>

          <p style="color:#9F8CFB; font-size:12px; margin-top:24px;">
            Support: support@arinova.studio
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:11px; color:#6D5BD0; margin-top:24px;">
      © Arinova Studio. All rights reserved.
    </p>
  </td>
</tr>

  </table>
</body>
</html>`

    const loginTemplate = `<!DOCTYPE html>

<html>
<body style="margin:0; padding:0; background-color:#0F0A1F; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#18122B; margin-top:40px; border-radius:8px; border:1px solid #2E1065;">


      <tr>
        <td align="center" style="padding:32px;">
          <img src="cid:logo" alt="Company Logo" style="max-height:56px;" />
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px 36px 40px;">
          <h2 style="color:#EDE9FE;">
                        ${title}
          </h2>

          <p style="color:#C4B5FD; font-size:14px;">
            Hello There,
          </p>

          <p style="color:#C4B5FD; font-size:14px;">
            A login attempt was made to your account.
            Enter the following OTP to continue:
          </p>

          <div style="text-align:center; margin:32px 0;">
            <div style="
              display:inline-block;
              padding:14px 26px;
              background:#7C3AED;
              border-radius:6px;
              font-size:26px;
              letter-spacing:5px;
              font-weight:bold;
              color:#FFFFFF;">
              ${otp}
            </div>
          </div>

          <p style="color: #C4B5FD; font-size:14px;">${message}</p>
          <p style="color:#C4B5FD; font-size:14px;">
            This code expires in <span style="color: deeppink;"><b>10 min.</b></span> <br>
            If you did not sign up, you can safely ignore this email.
          </p>

          <p style="color:#9F8CFB; font-size:12px; margin-top:24px;">
            Support: support@arinova.studio
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:11px; color:#6D5BD0; margin-top:24px;">
      © Arinova Studio. All rights reserved.
    </p>
  </td>
</tr>

  </table>
</body>
</html>`

    const forgetTemplate = `<!DOCTYPE html>

<html>
<body style="margin:0; padding:0; background-color:#0F0A1F; font-family:Arial, Helvetica, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:#18122B; margin-top:40px; border-radius:8px; border:1px solid #2E1065;">

      <tr>
        <td align="center" style="padding:32px;">
          <img src="cid:logo" alt="Company Logo" style="max-height:56px;" />
        </td>
      </tr>

      <tr>
        <td style="padding:0 40px 36px 40px;">
          <h2 style="color:#EDE9FE;">
            ${title}
          </h2>

          <p style="color:#C4B5FD; font-size:14px;">
            Hello There,
          </p>

          <p style="color:#C4B5FD; font-size:14px;">
            You requested to reset your password.
            Use the OTP below to proceed:
          </p>

          <div style="text-align:center; margin:32px 0;">
            <div style="
              display:inline-block;
              padding:16px 28px;
              background:#3B0764;
              border-radius:6px;
              font-size:28px;
              letter-spacing:6px;
              font-weight:bold;
              color:#F5F3FF;">
              ${otp}
            </div>
          </div>

          <p style="color: #C4B5FD; font-size:14px;">${message}</p>
          <p style="color:#C4B5FD; font-size:14px;">
            This code expires in <span style="color: deeppink;"><b>10 min.</b></span> <br>
            If you did not sign up, you can safely ignore this email.
          </p>

          <p style="color:#9F8CFB; font-size:12px; margin-top:24px;">
            Need help? support@arinova.studio
          </p>
        </td>
      </tr>
    </table>

    <p style="font-size:11px; color:#6D5BD0; margin-top:24px;">
      © Arinova Studio. All rights reserved.
    </p>
  </td>
</tr>

  </table>
</body>
</html>`

    const mailOptions = {
      from: email,
      to: useremail,
      subject,
      html: type === 'signup' ? signupTemplate : type === "login" ? loginTemplate : forgetTemplate,
      attachments: [
      {
      filename: "logo.jpg",
      path: "public/images/logo/logo.jpg",
      cid: "logo",
      },
      ]
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
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

// export async function sendBugreport(
//   name: string, 
//   email: string, 
//   id: string, 
//   subject: string, 
//   message: string, 
//   relatedTo: string
// ): Promise<boolean> {
//   try {
//     const mailOptions = {
//       from: email,
//       to: "adarshpanditdev@gmail.com",
//       replyTo: email, // Makes it easier to reply directly
//       subject: `Bug Report from Bin - ${relatedTo}`,
//       html: `
// <!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8" />
//   <title>🐛 Bug Report Submitted</title>
//   <style>
//     body {
//       font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//       background-color: #f4f6f8;
//       margin: 0;
//       padding: 20px;
//       color: #333;
//     }

//     .container {
//       max-width: 620px;
//       margin: auto;
//       background-color: #ffffff;
//       padding: 30px;
//       border-radius: 10px;
//       box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
//       border-top: 6px solid #e74c3c;
//     }

//     h2 {
//       color: #e74c3c;
//       font-size: 24px;
//       margin-bottom: 10px;
//     }

//     .info-section {
//       margin: 15px 0;
//     }

//     .label {
//       display: inline-block;
//       width: 100px;
//       font-weight: bold;
//       color: #2c3e50;
//     }

//     .value {
//       display: inline-block;
//       color: #555;
//       word-break: break-word;
//     }

//     .highlight-box {
//       background-color: #fef6f6;
//       border-left: 4px solid #e74c3c;
//       padding: 15px;
//       margin-top: 10px;
//       border-radius: 5px;
//       white-space: pre-wrap;
//       word-wrap: break-word;
//       color: #c0392b;
//     }

//     .footer {
//       margin-top: 30px;
//       font-size: 12px;
//       color: #999;
//       text-align: center;
//     }

//     .button {
//       display: inline-block;
//       background-color: cadetblue;
//       color: white;
//       padding: 10px 20px;
//       border-radius: 8px;
//       font-size: 16px;
//       text-decoration: none;
//       margin-top: 20px;
//     }

//     .button:hover {
//       background-color: #5f9ea0;
//     }
//   </style>
// </head>
// <body>
//   <div class="container">
//     <h2>🐛 Bug Report Submitted</h2>

//     <div class="info-section">
//       <span class="label">Report ID:</span>
//       <span class="value">${id}</span>
//     </div>

//     <div class="info-section">
//       <span class="label">Name:</span>
//       <span class="value">${name}</span>
//     </div>

//     <div class="info-section">
//       <span class="label">Email:</span>
//       <span class="value">${email}</span>
//     </div>

//     <div class="info-section">
//       <span class="label">Subject:</span>
//       <span class="value">${subject}</span>
//     </div>

//     <div class="info-section">
//       <span class="label">Related To:</span>
//       <span class="value">${relatedTo}</span>
//     </div>

//     <div class="info-section">
//       <span class="label">Message:</span>
//       <div class="highlight-box">${message}</div>
//     </div>

//     <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" class="button">Reply to Reporter</a>

//     <div class="footer">
//       This is an automated email. Please review the report and follow up as necessary.
//     </div>
//   </div>
// </body>
// </html>
//       `,
//     }
    
//     await transporter.sendMail(mailOptions)
//     return true
//   } catch (error) {
//     console.error('Failed to send bug report email:', error)
//     throw new Error('Failed to send bug report email')
//   }
// }

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
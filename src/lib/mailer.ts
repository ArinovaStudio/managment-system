import nodemailer from 'nodemailer'
import { forgetTemplate, loginTemplate, mailToClient, signupTemplate } from './node_mock'

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

export async function sendOtp(useremail: string, otp: number, type: 'signup' | 'login' | 'forgot-password' | 'to-client' | 'from-client' = 'signup', Client_Name?: string): Promise<boolean> {
  // Use fallback in development if email not configured

  try {
    const subject = type === 'signup' ? 'Management@Arinova.Studio - Verify your email' : type === "login" ? "Management@Arinova.Studio - Get to your account" : 'Management@Arinova.Studio - Retrieve your password'
    const title = type === 'signup' ? 'Management@Arinova.studio - Account Verification' : type === "login" ? "Management@Arinova.studio - Login" : 'Management@Arinova.Studio - Password Reset'
    const message = type === 'signup' 
      ? 'Please use this code to complete your account registration.'
      : type === "login" ? 'Please use this code to login to your account.' : 'Please use this code to reset your password.'
    


    let htmlTemplate: string

    switch (type) {
      case "signup":
        htmlTemplate = signupTemplate.replace("{{TITLE}}", title).replace("{{OTP}}", `${otp}`).replace("{{MESSAGE}}", message)
        break;

      case "login":
        htmlTemplate = loginTemplate.replace("{{TITLE}}", title).replace("{{OTP}}", `${otp}`).replace("{{MESSAGE}}", message)
        break;

      case "forgot-password":
        htmlTemplate = forgetTemplate.replace("{{TITLE}}", title).replace("{{OTP}}", `${otp}`).replace("{{MESSAGE}}", message)
        break;
      
      default:
        break;
    }
    const mailOptions = {
      from: email,
      to: useremail,
      subject,
      html: htmlTemplate,
      // attachments: [
      // {
      // filename: "logo.jpg",
      // path: "https://management.arinova.studio/images/logo/logo.jpg",
      // cid: "logo",
      // },
      // ]
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
    throw new Error('Failed to send OTP email')
  }
}


export async function sendMailToClient(useremail: string, Project_Name: string, Meeting_Date: string, Meeting_Time: string,  Duration_Minutes: string, Client_Name?: string, type: 'to-client' | 'from-client' = 'to-client'): Promise<boolean> {

  try {
    const subject = type === 'to-client' ? "Management@Arinova.Studio - You've got Meeting request." : type === "from-client" ? `Management@Arinova.Studio - ${Client_Name} has Requested for meet` : 'Management@Arinova.Studio - Welcome To Arinova Studio'


    let htmlTemplate: string

    switch (type) {
      case "to-client":
        htmlTemplate = mailToClient.replace("{{Client_Name}}", Client_Name).replace("{{Project_Name}}", Project_Name).replace("{{Meeting_Date}}", Meeting_Date).replace("{{Meeting_Time}}", Meeting_Time).replace("{{Duration_Minutes}}", Duration_Minutes)
        break;

      default:
        break;
    }
    const mailOptions = {
      from: email,
      to: useremail,
      subject,
      html: htmlTemplate,
    }
    
    await transporter.sendMail(mailOptions)
    return true
  } catch (error) {
    console.error('Failed to send OTP email:', error)
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
    return true
  } catch (error) {
    console.error('Email server verification failed:', error)
    return false
  }
}
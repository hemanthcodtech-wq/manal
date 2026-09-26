const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const sendVerificationEmail = async (to, token) => {
  const verificationLink = `http://localhost:${process.env.PORT || 3000}/api/auth/verify?token=${token}`;
  
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your Email Address',
    text: `Please click on the following link to verify your email: ${verificationLink}`,
    html: `<p>Please click on the following link to verify your email: <a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  await transporter.sendMail(mailOptions);
};

const sendOtpEmail = async (to, otp) => {
  const mailOptions = {
    from: `"Mana Local" <${process.env.EMAIL_FROM}>`,
    to,
    subject: 'Your OTP Code for Mana Local',
    text: `Your OTP for verification is: ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 40px 20px; color: #0f172a;">
        <div style="max-width: 500px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
          
          <div style="background-color: #2563eb; padding: 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: -0.5px;">Mana Local</h1>
          </div>
          
          <div style="padding: 32px;">
            <h2 style="margin-top: 0; font-size: 20px; color: #1e293b;">Verify your email address</h2>
            <p style="font-size: 16px; color: #475569; line-height: 1.5; margin-bottom: 24px;">
              You're almost there! We just need to verify your email address. Please use the verification code below to complete your registration.
            </p>
            
            <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 32px; font-weight: 800; color: #1d4ed8; letter-spacing: 4px;">${otp}</span>
            </div>
            
            <p style="font-size: 14px; color: #64748b; line-height: 1.5; margin: 0;">
              This code will expire in <strong>10 minutes</strong>. If you didn't request this code, you can safely ignore this email.
            </p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
            &copy; ${new Date().getFullYear()} Mana Local. All rights reserved.
          </div>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendOtpEmail
};

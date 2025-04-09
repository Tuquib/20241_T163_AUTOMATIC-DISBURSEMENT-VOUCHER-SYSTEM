import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create a transporter using Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendStaffInvitation = async (
  staffEmail,
  staffName,
  temporaryPassword
) => {
  try {
    const mailOptions = {
      from:
        '"Automatic Disbursement Voucher System" <' +
        process.env.GMAIL_USER +
        ">",
      to: staffEmail,
      subject: "Welcome to Automatic Disbursement Voucher System",
      html: `
        <h2>Welcome ${staffName}!</h2>
        <p>You have been invited to join the Automatic Disbursement Voucher System as an authorized staff member.</p>
        <p>Here are your login credentials:</p>
        <p><strong>Email:</strong> ${staffEmail}</p>
        <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
        <p>Please login and change your password immediately for security purposes.</p>
        <p>Login URL: <a href="${process.env.CLIENT_URL}/staff/login">Click here to login</a></p>
        <p>Best regards,<br>Admin Team</p>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
};

export const sendVerificationCode = async (email, verificationCode) => {
  try {
    const mailOptions = {
      from: '"Automatic Disbursement Voucher System" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Password Reset Verification Code',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Here is your verification code:</p>
        <div style="background-color: #f4f4f4; padding: 10px; margin: 20px 0; text-align: center; font-size: 24px; letter-spacing: 5px;">
          <strong>${verificationCode}</strong>
        </div>
        <p>This code will expire in 15 minutes.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Admin Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification code email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending verification code email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (email, resetToken) => {
  try {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: '"Automatic Disbursement Voucher System" <' + process.env.GMAIL_USER + '>',
      to: email,
      subject: 'Password Reset Request',
      html: `
        <h2>Password Reset Request</h2>
        <p>You have requested to reset your password. Click the link below to set a new password:</p>
        <p><a href="${resetUrl}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this password reset, please ignore this email.</p>
        <p>Best regards,<br>Admin Team</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

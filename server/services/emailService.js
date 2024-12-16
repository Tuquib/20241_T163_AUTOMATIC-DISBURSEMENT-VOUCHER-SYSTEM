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

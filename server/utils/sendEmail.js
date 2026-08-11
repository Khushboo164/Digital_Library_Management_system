const nodemailer = require("nodemailer"); // nodeemailer ek module hai joh backend ko allow karega to send emails

const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: `BookSphere <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "BookSphere Email Verification",
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fcfaff; border-radius: 12px; border: 1px solid #e9d5ff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #8b5cf6; margin: 0;">BookSphere</h1>
          <p style="color: #64748b; margin-top: 5px; font-size: 14px;">Explore • Learn • Grow</p>
        </div>
        <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(139, 92, 246, 0.05);">
          <h2 style="color: #1e293b; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.5;">Thank you for registering with BookSphere! Please use the verification code below to complete your registration.</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background-color: #f3e8ff; color: #7c3aed; font-size: 28px; font-weight: bold; letter-spacing: 5px; border-radius: 8px; border: 2px dashed #c4b5fd;">${otp}</span>
          </div>
          <p style="color: #64748b; font-size: 14px; text-align: center;">This code will expire in <strong>5 minutes</strong>.</p>
          <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 25px 0;" />
          <p style="color: #94a3b8; font-size: 12px; text-align: center; margin: 0;">If you did not request this account, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4, // Force IPv4
      connectionTimeout: 5000, // 5 seconds
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully via Gmail");
  } catch (error) {
    console.warn("Gmail authentication failed (likely needs App Password). Error:", error.message);
    throw error;
  }
};

const sendCustomEmail = async (email, subject, htmlContent, senderName = "Admin") => {
  const mailOptions = {
    from: `"BookSphere ${senderName}" <${process.env.EMAIL_USER || 'admin@booksphere.com'}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      },
      family: 4, // Force IPv4
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000,
    });
    await transporter.sendMail(mailOptions);
    console.log("Custom email sent successfully via Gmail");
  } catch (error) {
    console.warn("Gmail authentication failed (likely needs App Password). Error:", error.message);
    throw error;
  }
};

module.exports = { sendEmail, sendCustomEmail };

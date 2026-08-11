const axios = require("axios");

const sendEmail = async (email, otp) => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not defined in environment variables!");
    throw new Error("Email service is not configured");
  }

  const htmlContent = `
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
  `;

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: "BookSphere",
          email: process.env.EMAIL_USER || "teambooksphere@gmail.com",
        },
        to: [{ email: email }],
        subject: "BookSphere Email Verification",
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("OTP email sent successfully via Brevo API!");
    return response.data;
  } catch (error) {
    console.error("Brevo API error:", error.response?.data || error.message);
    throw new Error("Failed to send email via Brevo");
  }
};

const sendCustomEmail = async (email, subject, htmlContent, senderName = "Admin") => {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn("BREVO_API_KEY is not defined in environment variables!");
    throw new Error("Email service is not configured");
  }

  try {
    const response = await axios.post(
      "https://api.brevo.com/v3/smtp/email",
      {
        sender: {
          name: `BookSphere ${senderName}`,
          email: process.env.EMAIL_USER || "teambooksphere@gmail.com",
        },
        to: [{ email: email }],
        subject: subject,
        htmlContent: htmlContent,
      },
      {
        headers: {
          "api-key": apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    console.log("Custom email sent successfully via Brevo API!");
    return response.data;
  } catch (error) {
    console.error("Brevo API error:", error.response?.data || error.message);
    throw new Error("Failed to send email via Brevo");
  }
};

module.exports = { sendEmail, sendCustomEmail };

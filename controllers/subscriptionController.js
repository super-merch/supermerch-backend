// controllers/emailController.js (or wherever your handler lives)
import nodemailer from "nodemailer";

/**
 * Create a reusable transporter (create once, reuse across requests).
 * Using Gmail SMTP here. Ensure EMAIL_USER and EMAIL_PASS (app password) are set in env.
 */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // e.g. linkplayer259@gmail.com
    pass: process.env.EMAIL_PASS, // app password
  },
  // optional: increase connection pooling for high volume
  pool: true,
});

/**
 * Optional: verify transporter at startup (logs if SMTP credentials OK)
 */
transporter.verify((err, success) => {
  if (err) {
    console.error("Nodemailer verify failed:", err);
  } else {
    console.log("Nodemailer ready to send emails");
  }
});

const isValidEmail = (email) => {
  // Simple regex - use a stronger validator if needed
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const addEmail = async (req, res) => {
  try {
    const { email, coupon, discount } = req.body;

    // Basic validation
    if (!email || !coupon || typeof discount === "undefined") {
      return res
        .status(400)
        .json({ success: false, message: "email, coupon and discount are required" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    // Build message
    const mailSubject = `🎉 Congratulations — here's your coupon: ${coupon}`;
    const plainText = `Congratulations!\n\nYou have got a discount.\nUse code: ${coupon}\nGet discount: ${discount}\n\nUse this code at checkout. Cheers!`;
    const htmlBody = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height:1.4; color:#111;">
        <h2 style="color:#0b63d6;">Congratulations!</h2>
        <p>You have received a discount coupon:</p>
        <p style="font-size:18px; font-weight:700; margin:8px 0;">
          Code: <span style="background:#f1f5f9;padding:6px 10px;border-radius:6px;">${coupon}</span>
        </p>
        <p style="margin:4px 0;">Discount: <strong>${discount} %</strong></p>
        <p>Use this code during checkout to redeem your discount.</p>
        <hr style="border:none;border-top:1px solid #eee;margin:12px 0;" />
        <p style="font-size:13px;color:#6b7280">If you did not request this email, please ignore it.</p>
        <p style="margin-top:8px;">Best regards,<br/>Your Team</p>
      </div>
    `;

    const mailOptions = {
      from: `"Super Merch" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: mailSubject,
      text: plainText,
      html: htmlBody,
    };

    // Send mail
    const info = await transporter.sendMail(mailOptions);
    // optionally log info.messageId or info.response
    console.log("Coupon email sent:", info.messageId || info.response);

    return res
      .status(200)
      .json({ success: true, message: "Coupon email sent successfully" });
  } catch (error) {
    console.error("Error sending coupon email:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email", error: error.message });
  }
};

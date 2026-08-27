const Contact = require("../models/Contact");
const Setting = require("../models/Setting");
const transporter = require("../config/nodemailer");

// @desc    Get all inquiries
// @route   GET /api/contacts
// @access  Admin
const getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find({ isDeleted: false }).sort({ createdAt: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit new contact inquiry and send email to Support & Contact Email
// @route   POST /api/contacts
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: "Name, email and message are required" });
    }

    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.trim() : "";
    const cleanSubject = subject ? subject.trim() : "General Inquiry";
    const cleanMessage = message.trim();

    // Save contact record to MongoDB database
    const newContact = new Contact({
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone,
      subject: cleanSubject,
      message: cleanMessage,
    });

    const saved = await newContact.save();

    // Fetch the dynamically configured Support & Contact Email from Store Settings
    let recipientEmail = process.env.EMAIL_USER;
    let storeName = "CozyLoops";
    try {
      const setting = await Setting.findOne();
      if (setting) {
        if (setting.email && setting.email.trim()) {
          recipientEmail = setting.email.trim();
        }
        if (setting.storeName && setting.storeName.trim()) {
          storeName = setting.storeName.trim();
        }
      }
    } catch (settingErr) {
      console.warn("Could not fetch setting email, falling back to default:", settingErr.message);
    }

    // Send email to Support & Contact Email
    if (recipientEmail) {
      const receivedDate = new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      const mailOptions = {
        from: `"${storeName} Contact" <${process.env.EMAIL_USER}>`,
        to: recipientEmail,
        replyTo: cleanEmail,
        subject: `[Contact Form] ${cleanSubject} — ${cleanName}`,
        html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #F8FAFC; padding: 40px 16px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);">
          
          <!-- Header Bar -->
          <tr>
            <td style="padding: 24px 32px; border-bottom: 1px solid #F1F5F9;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <span style="font-size: 18px; font-weight: 800; color: #0F172A; letter-spacing: -0.3px;">
                      ${storeName}
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #EFF6FF; color: #2563EB; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 4px 10px; border-radius: 20px; border: 1px solid #DBEAFE;">
                      New Message
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 32px 32px 28px 32px;">
              
              <!-- Sender Details Table -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; width: 110px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
                    Sender
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #0F172A;">
                    ${cleanName}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
                    Email
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #2563EB;">
                    <a href="mailto:${cleanEmail}" style="color: #2563EB; text-decoration: none; font-weight: 500;">${cleanEmail}</a>
                  </td>
                </tr>
                ${
                  cleanPhone
                    ? `
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
                    Phone
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; color: #334155;">
                    ${cleanPhone}
                  </td>
                </tr>
                `
                    : ""
                }
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
                    Subject
                  </td>
                  <td style="padding: 6px 0; font-size: 14px; font-weight: 600; color: #334155;">
                    ${cleanSubject}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #64748B;">
                    Received
                  </td>
                  <td style="padding: 6px 0; font-size: 13px; color: #64748B;">
                    ${receivedDate}
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <div style="height: 1px; background-color: #F1F5F9; margin-bottom: 24px;"></div>

              <!-- Message Body Section -->
              <div style="margin-bottom: 28px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin-bottom: 10px;">
                  Customer Inquiry Message
                </div>
                <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 18px 20px; font-size: 14px; line-height: 1.6; color: #1E293B; white-space: pre-wrap; word-break: break-word;">${cleanMessage}</div>
              </div>

              <!-- Reply Action Button -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="left">
                    <a href="mailto:${cleanEmail}?subject=Re: ${encodeURIComponent(cleanSubject)}" 
                       style="display: inline-block; background-color: #0F172A; color: #FFFFFF; font-size: 13px; font-weight: 600; text-decoration: none; padding: 11px 24px; border-radius: 8px; text-align: center;">
                      Reply to ${cleanName} &rarr;
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Card Footer -->
          <tr>
            <td style="padding: 16px 32px; background-color: #F8FAFC; border-top: 1px solid #F1F5F9; font-size: 12px; color: #94A3B8; text-align: center; line-height: 1.5;">
              This inquiry was submitted on the <strong>${storeName}</strong> contact page and forwarded to <strong>${recipientEmail}</strong>.
            </td>
          </tr>

        </table>

        <!-- Sub footer -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 580px; margin-top: 16px;">
          <tr>
            <td align="center" style="font-size: 11px; color: #94A3B8;">
              &copy; ${new Date().getFullYear()} ${storeName}. All rights reserved.
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>
        `,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`📧 Contact message from ${cleanEmail} delivered to Support Email: ${recipientEmail}`);
      } catch (mailError) {
        console.error("⚠️ Failed to dispatch contact inquiry email:", mailError.message);
      }
    }

    res.status(201).json({
      message: "Thank you! Your message has been sent successfully. We will get back to you shortly.",
      contact: saved,
    });
  } catch (error) {
    console.error("Error in submitContact:", error);
    res.status(500).json({ message: error.message || "Failed to submit contact message" });
  }
};

module.exports = {
  getContacts,
  submitContact,
};

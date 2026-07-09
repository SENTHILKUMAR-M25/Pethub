import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const orderStatusTemplate = ({ name, order, newStatus }) => {
  const orderId = `#${order._id.toString().slice(-8).toUpperCase()}`;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const subjectMap = {
    confirmed: `Order Confirmed - ${orderId}`,
    shipped: `Order Shipped - ${orderId}`,
    delivered: `Order Delivered - ${orderId}`,
    cancelled: `Order Cancelled - ${orderId}`,
  };

  const templates = {
    confirmed: {
      heading: "Order Confirmed! 🎉",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Great news! Your order <strong style="color:#1F2937;">${orderId}</strong> has been successfully confirmed and is now being prepared.
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Our team is carefully picking and packing your items to ensure everything reaches you in perfect condition. We'll notify you as soon as your order ships.
        </p>`,
    },
    shipped: {
      heading: "Your Order is on the Way! 🚚",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your order <strong style="color:#1F2937;">${orderId}</strong> has been shipped and is on its way to you!
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Our delivery team is working hard to get your package to you as soon as possible. We'll notify you once it's delivered.
        </p>`,
    },
    delivered: {
      heading: "Order Delivered! 🎊",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your order <strong style="color:#1F2937;">${orderId}</strong> has been delivered successfully!
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          We hope you and your pet love everything! If you're happy with your purchase, we'd really appreciate it if you could leave a review on the product pages. Your feedback helps other pet parents make informed choices.
        </p>`,
    },
    cancelled: {
      heading: "Order Cancelled",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your order <strong style="color:#1F2937;">${orderId}</strong> has been cancelled.
        </p>
        ${order.cancellationReason ? `
        <table cellpadding="0" cellspacing="0" style="background-color:#FFF5F5;border-radius:12px;padding:16px;margin:0 0 16px 0;width:100%;border:1px solid #FECACA;">
          <tr>
            <td style="font-size:13px;color:#6B7280;padding-bottom:4px;">Reason for Cancellation</td>
          </tr>
          <tr>
            <td style="font-size:15px;font-weight:500;color:#DC2626;">${order.cancellationReason}</td>
          </tr>
        </table>` : ""}
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          If you have any questions or concerns regarding the cancellation, please don't hesitate to reach out to our support team. We're here to help!
        </p>`,
    },
  };

  const t = templates[newStatus] || templates.confirmed;

  return {
    subject: subjectMap[newStatus] || `Order Update - ${orderId}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Update - JodPetHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF80C7 0%,#FF6BB7 100%);padding:40px 30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.2);border-radius:12px;padding:12px;">
                    <span style="font-size:36px;">🐾</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:20px 0 0 0;letter-spacing:-0.5px;">
                ${t.heading}
              </h1>
              <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;line-height:1.5;">
                Order ${orderId}
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#1F2937;font-size:18px;font-weight:600;margin:0 0 16px 0;">
                Hi ${name},
              </p>
              ${t.body}

              <!-- Order Summary -->
              <table cellpadding="0" cellspacing="0" style="width:100%;background-color:#F8FAFC;border-radius:12px;padding:16px;margin:20px 0;">
                <tr>
                  <td style="font-size:13px;color:#6B7280;font-weight:600;padding-bottom:12px;border-bottom:1px solid #E5E7EB;">
                    Order Summary
                  </td>
                </tr>
                ${order.items.slice(0, 5).map((item) => `
                <tr>
                  <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size:14px;color:#1F2937;font-weight:500;">${item.name}</td>
                        <td align="right" style="font-size:14px;color:#1F2937;font-weight:600;">x${item.quantity}</td>
                        <td align="right" style="font-size:14px;color:#1F2937;font-weight:700;padding-left:16px;">₹${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>`).join("")}
                ${order.items.length > 5 ? `<tr><td style="padding:8px 0;font-size:13px;color:#9CA3AF;text-align:center;">+${order.items.length - 5} more item(s)</td></tr>` : ""}
                <tr>
                  <td style="padding:12px 0 0 0;">
                    <table cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="font-size:14px;color:#6B7280;">Total</td>
                        <td align="right" style="font-size:18px;color:#1F2937;font-weight:800;">₹${order.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td align="center" style="background-color:#FF80C7;border-radius:50px;padding:0;">
                    <a href="${frontendUrl}/orders" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      View My Orders
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:16px 0 0 0;">
                Warmly,<br />
                <strong style="color:#FF80C7;">The JodPetHub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:24px 30px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0;">
                You received this email because you have an account at JodPetHub.<br />
                &copy; ${new Date().getFullYear()} JodPetHub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

export const sendOrderStatusEmail = async ({ name, email, order, newStatus }) => {
  if (!email) return;

  const { subject, html } = orderStatusTemplate({ name, order, newStatus });

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"JodPetHub" <noreply@jodpethub.com>',
      to: email,
      subject,
      html,
    });
    console.log(`✅ Order status email sent to ${email} (${newStatus})`);
  } catch (err) {
    console.error(`❌ Failed to send order status email to ${email}:`, err.message);
  }
};

const refundTemplate = ({ name, order, newRefundStatus }) => {
  const orderId = `#${order._id.toString().slice(-8).toUpperCase()}`;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  const details = {
    refund_pending: {
      heading: "Refund Initiated",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your order <strong style="color:#1F2937;">${orderId}</strong> has been cancelled and a refund of <strong style="color:#1F2937;">₹${order.total.toFixed(2)}</strong> has been initiated.
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          The refund will be processed to your original payment method within 5-7 business days. We'll notify you once the refund is completed.
        </p>`,
    },
    refund_processing: {
      heading: "Refund Being Processed",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your refund of <strong style="color:#1F2937;">₹${order.total.toFixed(2)}</strong> for order <strong style="color:#1F2937;">${orderId}</strong> is now being processed.
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Your financial institution may take additional time to reflect the amount in your account.
        </p>`,
    },
    refund_completed: {
      heading: "Refund Completed! ✅",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Great news! Your refund of <strong style="color:#1F2937;">₹${order.total.toFixed(2)}</strong> for order <strong style="color:#1F2937;">${orderId}</strong> has been successfully completed.
        </p>
        ${order.refundHistory?.length > 0 ? `
        <table cellpadding="0" cellspacing="0" style="background-color:#F0FDF4;border-radius:12px;padding:16px;margin:0 0 16px 0;width:100%;border:1px solid #BBF7D0;">
          <tr>
            <td style="font-size:13px;color:#6B7280;padding-bottom:4px;">Transaction ID</td>
          </tr>
          <tr>
            <td style="font-size:16px;font-weight:700;color:#1F2937;font-family:monospace;">${order.refundHistory.filter(h => h.transactionId).pop()?.transactionId || "N/A"}</td>
          </tr>
        </table>` : ""}
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          The amount has been sent to your original payment method. Please allow a few days for it to appear in your account.
        </p>`,
    },
    refund_failed: {
      heading: "Refund Failed",
      body: `
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Unfortunately, the refund for order <strong style="color:#1F2937;">${orderId}</strong> has failed.
        </p>
        <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 16px 0;">
          Please contact our support team for assistance. We apologize for the inconvenience and will help resolve this as quickly as possible.
        </p>`,
    },
  };

  const d = details[newRefundStatus] || details.refund_pending;
  const subjectMap = {
    refund_pending: `Refund Initiated - ${orderId}`,
    refund_processing: `Refund Processing - ${orderId}`,
    refund_completed: `Refund Completed - ${orderId}`,
    refund_failed: `Refund Failed - ${orderId}`,
  };

  return {
    subject: subjectMap[newRefundStatus] || `Refund Update - ${orderId}`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Refund Update - JodPetHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#FF80C7 0%,#FF6BB7 100%);padding:40px 30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.2);border-radius:12px;padding:12px;">
                    <span style="font-size:36px;">🐾</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:20px 0 0 0;letter-spacing:-0.5px;">${d.heading}</h1>
              <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;line-height:1.5;">Order ${orderId}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#1F2937;font-size:18px;font-weight:600;margin:0 0 16px 0;">Hi ${name},</p>
              ${d.body}
              <table cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td align="center" style="background-color:#FF80C7;border-radius:50px;padding:0;">
                    <a href="${frontendUrl}/orders" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">View My Orders</a>
                  </td>
                </tr>
              </table>
              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:16px 0 0 0;">Warmly,<br /><strong style="color:#FF80C7;">The JodPetHub Team</strong></p>
            </td>
          </tr>
          <tr>
            <td style="background-color:#F8FAFC;padding:24px 30px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0;">You received this email because you have an account at JodPetHub.<br />&copy; ${new Date().getFullYear()} JodPetHub. All rights reserved.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`,
  };
};

export const sendRefundEmail = async ({ name, email, order, newRefundStatus }) => {
  if (!email) return;
  const { subject, html } = refundTemplate({ name, order, newRefundStatus });
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"JodPetHub" <noreply@jodpethub.com>',
      to: email,
      subject,
      html,
    });
    console.log(`✅ Refund email sent to ${email} (${newRefundStatus})`);
  } catch (err) {
    console.error(`❌ Failed to send refund email to ${email}:`, err.message);
  }
};

export const sendWelcomeEmail = async ({ name, email }) => {
  const subject = "Welcome to JodPetHub! 🐾";
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to JodPetHub</title>
</head>
<body style="margin:0;padding:0;background-color:#F8FAFC;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#F8FAFC;padding:20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#FF80C7 0%,#FF6BB7 100%);padding:40px 30px;text-align:center;">
              <table cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.2);border-radius:12px;padding:12px;">
                    <span style="font-size:36px;">🐾</span>
                  </td>
                </tr>
              </table>
              <h1 style="color:#ffffff;font-size:28px;font-weight:800;margin:20px 0 0 0;letter-spacing:-0.5px;">
                Welcome to JodPetHub!
              </h1>
              <p style="color:rgba(255,255,255,0.9);font-size:16px;margin:8px 0 0 0;line-height:1.5;">
                We're so glad to have you on board
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 30px;">
              <p style="color:#1F2937;font-size:18px;font-weight:600;margin:0 0 6px 0;">
                Hi ${name},
              </p>
              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
                Thank you for creating an account at <strong style="color:#1F2937;">JodPetHub</strong> — your one-stop destination for everything your furry, feathery, or scaly friends deserve!
              </p>
              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 20px 0;">
                At JodPetHub, we're passionate about helping pet parents provide the best for their companions. From premium pet food and treats to engaging toys and cozy accessories, every product in our collection is carefully curated with love and care.
              </p>

              <!-- CTA Button -->
              <table cellpadding="0" cellspacing="0" style="margin:30px auto;">
                <tr>
                  <td align="center" style="background-color:#FF80C7;border-radius:50px;padding:0;">
                    <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/shop" style="display:inline-block;padding:14px 40px;color:#ffffff;font-size:16px;font-weight:700;text-decoration:none;letter-spacing:0.3px;">
                      Start Shopping
                    </a>
                  </td>
                </tr>
              </table>

              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 8px 0;">
                Here's what you can do now:
              </p>
              <table cellpadding="0" cellspacing="0" style="margin:0 0 24px 0;">
                <tr>
                  <td style="padding:4px 0;color:#4B5563;font-size:14px;line-height:1.6;">
                    <span style="color:#FF80C7;font-weight:700;">✦</span> Browse our wide range of pet products
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#4B5563;font-size:14px;line-height:1.6;">
                    <span style="color:#FF80C7;font-weight:700;">✦</span> Enjoy fast, reliable delivery to your doorstep
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#4B5563;font-size:14px;line-height:1.6;">
                    <span style="color:#FF80C7;font-weight:700;">✦</span> Get exclusive deals and offers for our members
                  </td>
                </tr>
                <tr>
                  <td style="padding:4px 0;color:#4B5563;font-size:14px;line-height:1.6;">
                    <span style="color:#FF80C7;font-weight:700;">✦</span> Track your orders and manage your profile
                  </td>
                </tr>
              </table>

              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0 0 6px 0;">
                If you have any questions, feel free to reach out to our support team. We're always here to help!
              </p>
              <p style="color:#4B5563;font-size:15px;line-height:1.7;margin:0;">
                Warmly,<br />
                <strong style="color:#FF80C7;">The JodPetHub Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#F8FAFC;padding:24px 30px;text-align:center;border-top:1px solid #E5E7EB;">
              <p style="color:#9CA3AF;font-size:12px;line-height:1.6;margin:0;">
                You received this email because you created an account at JodPetHub.<br />
                &copy; ${new Date().getFullYear()} JodPetHub. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"JodPetHub" <noreply@jodpethub.com>',
      to: email,
      subject,
      html,
    });
    console.log(`✅ Welcome email sent to ${email}`);
  } catch (err) {
    console.error(`❌ Failed to send welcome email to ${email}:`, err.message);
  }
};

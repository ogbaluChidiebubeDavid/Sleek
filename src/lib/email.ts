import nodemailer from "nodemailer";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import fs from "fs";
import path from "path";

export async function sendEmailReceipt(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
        vendor: true,
      },
    });

    if (!order) {
      console.error(`[Email Receipt] Order ${orderId} not found.`);
      return;
    }

    const emailRecipient = order.shippingEmail || order.user.email;
    if (!emailRecipient) {
      console.warn(`[Email Receipt] No email address found for order ${orderId}. Skipping.`);
      return;
    }

    const itemsRows = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #1f2937; color: #f3f4f6;">
            <strong>${item.name}</strong><br/>
            <span style="font-size: 11px; color: #9ca3af;">Color: ${item.color} | Size: ${item.size}</span>
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: center; color: #f3f4f6;">
            ${item.quantity}
          </td>
          <td style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: right; color: #f3f4f6; font-family: monospace;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const vendorInfo = order.vendor
      ? `
        <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
          <h3 style="margin-top: 0; color: #00c980; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Vendor Partner</h3>
          <p style="margin: 4px 0; color: #e5e7eb;"><strong>${order.vendor.businessName}</strong></p>
          <p style="margin: 4px 0; color: #9ca3af; font-size: 12px;">Phone: ${order.vendor.phone || "N/A"}</p>
          <p style="margin: 4px 0; color: #9ca3af; font-size: 12px; font-family: monospace; word-break: break-all;">Settlement Address: ${order.vendor.walletAddress}</p>
        </div>
      `
      : "";

    const txExplorerLink = order.txHash
      ? `
        <p style="margin: 4px 0; color: #9ca3af; font-size: 12px;">
          Tx Hash: <a href="https://sepolia.basescan.org/tx/${order.txHash}" target="_blank" style="color: #00c980; font-family: monospace; text-decoration: underline;">${order.txHash.slice(0, 24)}...</a>
        </p>
      `
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Order Receipt - ${order.trackingNumber}</title>
        </head>
        <body style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; margin: 0;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1f2937; border-radius: 20px; padding: 32px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.4);">
            
            <!-- Header -->
            <div style="border-bottom: 1px solid #1f2937; padding-bottom: 20px; margin-bottom: 24px; text-align: center;">
              <span style="font-size: 24px; font-weight: bold; background: linear-gradient(to right, #00c980, #059669); -webkit-background-clip: text; color: transparent;">Sleek E-Commerce ⚡</span>
              <p style="color: #9ca3af; font-size: 12px; font-family: monospace; margin: 6px 0 0 0;">Order Ref: ${order.trackingNumber}</p>
            </div>

            <!-- Receipt Greeting -->
            <h2 style="margin-top: 0; color: #ffffff; font-size: 20px; font-weight: 600; text-align: center;">Payment Successful! 🎉</h2>
            <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 24px;">
              Thank you for shopping with us. Your smart checkout transaction has been processed on the Base Sepolia Testnet.
            </p>

            <!-- Vendor Summary Info -->
            ${vendorInfo}

            <!-- Items list -->
            <h3 style="color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px;">Items Purchased</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <thead>
                <tr style="background-color: #111827;">
                  <th style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: left; color: #9ca3af; font-size: 11px; text-transform: uppercase;">Product</th>
                  <th style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: center; color: #9ca3af; font-size: 11px; text-transform: uppercase;">Qty</th>
                  <th style="padding: 12px; border-bottom: 1px solid #1f2937; text-align: right; color: #9ca3af; font-size: 11px; text-transform: uppercase;">Price</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
                <tr>
                  <td colspan="2" style="padding: 16px 12px 12px 12px; text-align: right; font-weight: bold; color: #9ca3af;">Total Amount:</td>
                  <td style="padding: 16px 12px 12px 12px; text-align: right; font-weight: bold; color: #00c980; font-size: 18px; font-family: monospace;">
                    ${formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Shipping Summary -->
            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
              <h3 style="margin-top: 0; color: #ffffff; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Shipping Details</h3>
              <p style="margin: 4px 0; color: #e5e7eb;"><strong>${order.shippingName}</strong></p>
              <p style="margin: 4px 0; color: #e5e7eb;">Phone: ${order.user.phone || "N/A"}</p>
              <p style="margin: 4px 0; color: #9ca3af; font-size: 13px;">${order.shippingAddress}</p>
              <p style="margin: 4px 0; color: #9ca3af; font-size: 13px;">${order.shippingCity}, ${order.shippingCountry}</p>
            </div>

            <!-- Transaction Info -->
            <div style="border-top: 1px solid #1f2937; padding-top: 20px; text-align: center;">
              <p style="margin: 4px 0; color: #9ca3af; font-size: 12px;">Payment Method: <strong>On-Chain Base Sepolia</strong></p>
              ${txExplorerLink}
              <p style="margin: 12px 0 0 0; color: #4b5563; font-size: 10px;">
                Sleek split payment router • 0.01% platform fee • 99.99% direct vendor settlement
              </p>
            </div>

          </div>
        </body>
      </html>
    `;

    // 1. SMTP Dispatcher Check
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || "no-reply@sleek.ng";

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === "465",
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: `"Sleek Footwear" <${smtpFrom}>`,
        to: emailRecipient,
        subject: `Order Receipt ${order.trackingNumber} - Sleek Footwear ⚡`,
        html: htmlContent,
      });

      console.log(`[Email Receipt] Successfully sent to ${emailRecipient} for order ${order.trackingNumber}`);
    } else {
      console.warn("[Email Receipt] SMTP not configured. Writing HTML receipt to scratchpad...");
      
      // Save HTML to a local scratch file for testing/development
      const scratchDir = "C:\\Users\\USER\\.gemini\\antigravity-ide\\brain\\0781bf6e-36bb-459e-951c-873adbbdd8e8\\scratch";
      
      if (!fs.existsSync(scratchDir)) {
        fs.mkdirSync(scratchDir, { recursive: true });
      }

      const scratchPath = path.join(scratchDir, `receipt_${order.trackingNumber}.html`);
      fs.writeFileSync(scratchPath, htmlContent, "utf8");

      console.log(`[Email Receipt] Wrote receipt to local debug file: ${scratchPath}`);
    }
  } catch (err) {
    console.error("[Email Receipt Error]", err);
  }
}

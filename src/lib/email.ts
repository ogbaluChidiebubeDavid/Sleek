import nodemailer from "nodemailer";
import axios from "axios";
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

    // 1. Dispatch Email via Resend if RESEND_API_KEY is available
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await axios.post(
          "https://api.resend.com/emails",
          {
            from: process.env.EMAIL_FROM || "Sleek Footwear <orders@seekfeet.xyz>",
            to: [emailRecipient],
            subject: `Order Receipt ${order.trackingNumber} - Sleek Footwear ⚡`,
            html: htmlContent,
          },
          { headers: { Authorization: `Bearer ${resendApiKey}` } }
        );
        console.log(`[Email Receipt] Sent via Resend to ${emailRecipient}`);
        return;
      } catch (err: any) {
        console.error("[Email Receipt Resend Error]:", err.response?.data || err.message);
      }
    }

    // 2. SMTP Dispatcher Check
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@seekfeet.xyz";

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

      console.log(`[Email Receipt] Successfully sent via SMTP to ${emailRecipient} for order ${order.trackingNumber}`);
    } else {
      console.log(`[Email Receipt] SMTP / Resend not configured for live delivery to ${emailRecipient}.`);
    }
  } catch (err) {
    console.error("[Email Receipt Error]", err);
  }
}

/**
 * Dispatches an email notification whenever the vendor updates fulfillment status (packaging, shipped, delivered).
 */
export async function sendOrderStatusEmail(orderId: string, status: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true, vendor: true },
    });

    if (!order) return;

    const emailRecipient = order.shippingEmail || order.user.email;
    if (!emailRecipient) return;

    const statusTitles: Record<string, string> = {
      packaging: "📦 Your order is being packaged!",
      processing: "📦 Your order is being packaged!",
      shipped: "🚚 Your order has been shipped!",
      delivered: "🎉 Your order has been delivered!",
    };

    const statusTitle = statusTitles[status] || `Order Status Update: ${status}`;

    const itemsRows = order.items
      .map(
        (item) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; color: #f3f4f6;">
            <strong>${item.name}</strong> (${item.color}, Size ${item.size})
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; text-align: center; color: #f3f4f6;">
            ${item.quantity}
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #1f2937; text-align: right; color: #f3f4f6;">
            ${formatCurrency(item.price * item.quantity)}
          </td>
        </tr>
      `
      )
      .join("");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head><meta charset="utf-8"><title>${statusTitle}</title></head>
        <body style="background-color: #030712; color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #090d16; border: 1px solid #1f2937; border-radius: 20px; padding: 32px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #00c980; font-size: 24px; margin: 0;">Sleek Footwear ⚡</h1>
              <p style="color: #9ca3af; font-size: 12px; margin-top: 6px; font-family: monospace;">Tracking ID: ${order.trackingNumber}</p>
            </div>

            <div style="background-color: #111827; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <h2 style="color: #ffffff; font-size: 18px; margin: 0 0 8px 0;">${statusTitle}</h2>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                ${
                  status === "shipped"
                    ? "Your package has been dispatched with the courier and is on its way to you (expected within 3 working days)."
                    : status === "delivered"
                    ? "Your order has arrived! We hope you love your new footwear."
                    : "The vendor has received your payment and is currently packaging your items for courier dispatch."
                }
              </p>
            </div>

            ${
              order.vendor
                ? `
            <div style="margin-bottom: 24px; font-size: 13px; color: #9ca3af;">
              <p style="margin: 2px 0;"><strong>Vendor:</strong> ${order.vendor.businessName}</p>
              ${order.paymentRef ? `<p style="margin: 2px 0; font-family: monospace;"><strong>Payment Ref:</strong> ${order.paymentRef}</p>` : ""}
            </div>
            `
                : ""
            }

            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13px;">
              <thead>
                <tr style="background-color: #111827;">
                  <th style="padding: 10px; text-align: left; color: #9ca3af;">Product</th>
                  <th style="padding: 10px; text-align: center; color: #9ca3af;">Qty</th>
                  <th style="padding: 10px; text-align: right; color: #9ca3af;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsRows}
              </tbody>
            </table>

            <div style="text-align: center; border-top: 1px solid #1f2937; padding-top: 20px;">
              <p style="color: #9ca3af; font-size: 12px;">Track anytime in Telegram with: <code style="color: #00c980;">/track ${order.paymentRef || order.trackingNumber}</code></p>
            </div>
          </div>
        </body>
      </html>
    `;

    // 1. Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      try {
        await axios.post(
          "https://api.resend.com/emails",
          {
            from: process.env.EMAIL_FROM || "Sleek Footwear <orders@seekfeet.xyz>",
            to: [emailRecipient],
            subject: `${statusTitle} - ${order.trackingNumber}`,
            html: htmlContent,
          },
          { headers: { Authorization: `Bearer ${resendApiKey}` } }
        );
        console.log(`[Email Status] Sent via Resend to ${emailRecipient}`);
        return;
      } catch (err: any) {
        console.error("[Email Status Resend Error]:", err.response?.data || err.message);
      }
    }

    // 2. SMTP
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const smtpFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || "no-reply@seekfeet.xyz";

    if (smtpHost && smtpPort && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(smtpPort),
        secure: smtpPort === "465",
        auth: { user: smtpUser, pass: smtpPass },
      });

      await transporter.sendMail({
        from: `"Sleek Footwear" <${smtpFrom}>`,
        to: emailRecipient,
        subject: `${statusTitle} - ${order.trackingNumber}`,
        html: htmlContent,
      });

      console.log(`[Email Status] Successfully sent via SMTP to ${emailRecipient}`);
    } else {
      console.log(`[Email Status] SMTP / Resend not configured. Simulated status email for ${emailRecipient}.`);
    }
  } catch (err) {
    console.error("[sendOrderStatusEmail Error]", err);
  }
}

/**
 * Sends a live tracking summary email on demand when user clicks "Email Updates".
 */
export async function sendTrackingSummaryEmail(orderId: string, emailRecipient: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, vendor: true, user: true },
    });

    if (!order) return;

    await sendOrderStatusEmail(orderId, order.status);
  } catch (err) {
    console.error("[sendTrackingSummaryEmail Error]", err);
  }
}

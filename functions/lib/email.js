"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBookingConfirmationEmail = void 0;
const functions = __importStar(require("firebase-functions"));
const admin = __importStar(require("firebase-admin"));
const nodemailer = __importStar(require("nodemailer"));
const pdf_1 = require("./pdf");
const db = admin.firestore();
/**
 * Send booking confirmation email with PDFs
 */
async function sendBookingConfirmationEmail(bookingData, paymentData) {
    try {
        functions.logger.info(`Generating PDFs for booking: ${bookingData.id}`);
        // Generate PDFs
        const invoicePath = await (0, pdf_1.generateInvoicePDF)(bookingData, paymentData);
        const tripDetailsPath = await (0, pdf_1.generateTripDetailsPDF)(bookingData);
        // Upload PDFs to Firebase Storage and get URLs
        const invoiceUrl = await (0, pdf_1.uploadPDFAndGetURL)(invoicePath, bookingData.id, 'invoice');
        const tripDetailsUrl = await (0, pdf_1.uploadPDFAndGetURL)(tripDetailsPath, bookingData.id, 'trip-details');
        // Update booking with PDF URLs
        await db.collection('bookings').doc(bookingData.id).update({
            invoiceUrl,
            tripDetailsUrl,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        functions.logger.info(`PDFs generated and uploaded for booking: ${bookingData.id}`);
        // Send email with attachments
        await sendEmail(bookingData, paymentData, invoiceUrl, tripDetailsUrl);
        functions.logger.info(`Confirmation email sent for booking: ${bookingData.id}`);
    }
    catch (error) {
        functions.logger.error(`Error sending confirmation email for booking ${bookingData.id}:`, error);
        throw error;
    }
}
exports.sendBookingConfirmationEmail = sendBookingConfirmationEmail;
/**
 * Send email using Nodemailer
 */
async function sendEmail(bookingData, paymentData, invoiceUrl, tripDetailsUrl) {
    var _a, _b, _c, _d, _e, _f, _g;
    try {
        // Create transporter
        const transporter = nodemailer.createTransport({
            host: ((_a = functions.config().mail) === null || _a === void 0 ? void 0 : _a.host) || 'smtp.gmail.com',
            port: parseInt(((_b = functions.config().mail) === null || _b === void 0 ? void 0 : _b.port) || '587'),
            secure: false,
            auth: {
                user: ((_c = functions.config().mail) === null || _c === void 0 ? void 0 : _c.user) || 'your-email@gmail.com',
                pass: ((_d = functions.config().mail) === null || _d === void 0 ? void 0 : _d.pass) || 'your-app-password',
            },
        });
        // Email content
        const subject = `Your Himalayan Rides Booking Confirmation - #${bookingData.id}`;
        const htmlContent = generateEmailHTML(bookingData, paymentData, invoiceUrl, tripDetailsUrl);
        const textContent = generateEmailText(bookingData, paymentData);
        // Recipients
        const adminEmails = ((_e = functions.config().admin) === null || _e === void 0 ? void 0 : _e.emails) || 'amritob0327.roy@gmail.com,amritoballavroy@gmail.com';
        const recipients = [bookingData.email, ...adminEmails.split(',')].filter(Boolean);
        // Send email
        const mailOptions = {
            from: `"Himalayan Rides" <${((_f = functions.config().mail) === null || _f === void 0 ? void 0 : _f.from) || ((_g = functions.config().mail) === null || _g === void 0 ? void 0 : _g.user)}>`,
            to: recipients.join(','),
            subject,
            text: textContent,
            html: htmlContent,
        };
        const result = await transporter.sendMail(mailOptions);
        functions.logger.info(`Email sent successfully: ${result.messageId}`);
    }
    catch (error) {
        functions.logger.error('Error sending email:', error);
        throw error;
    }
}
/**
 * Generate HTML email content
 */
function generateEmailHTML(bookingData, paymentData, invoiceUrl, tripDetailsUrl) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Booking Confirmation</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
          background-color: #f8f9fa;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: white;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          background: linear-gradient(135deg, #FF6B35, #1B4965);
          color: white;
          padding: 30px 20px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
          font-weight: bold;
        }
        .header p {
          margin: 5px 0 0 0;
          font-size: 14px;
          opacity: 0.9;
        }
        .content {
          padding: 30px;
        }
        .booking-info {
          background-color: #f8f9fa;
          border-left: 4px solid #FF6B35;
          padding: 20px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .booking-info h3 {
          margin-top: 0;
          color: #1B4965;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          padding: 8px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .info-row:last-child {
          border-bottom: none;
        }
        .info-label {
          font-weight: 600;
          color: #495057;
        }
        .info-value {
          color: #1B4965;
          font-weight: 500;
        }
        .download-section {
          text-align: center;
          margin: 30px 0;
        }
        .download-btn {
          display: inline-block;
          background-color: #FF6B35;
          color: white;
          text-decoration: none;
          padding: 12px 24px;
          border-radius: 6px;
          margin: 0 10px;
          font-weight: 600;
          transition: background-color 0.3s;
        }
        .download-btn:hover {
          background-color: #e55a2b;
        }
        .footer {
          background-color: #1B4965;
          color: white;
          text-align: center;
          padding: 20px;
          font-size: 14px;
        }
        .status-badge {
          background-color: #28a745;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ HIMALAYAN RIDES</h1>
          <p>Ride the Adventure</p>
        </div>
        
        <div class="content">
          <h2>🎉 Booking Confirmed!</h2>
          <p>Dear ${bookingData.customerName},</p>
          <p>Thank you for choosing Himalayan Rides! Your booking has been confirmed and payment has been successfully processed.</p>
          
          <div class="booking-info">
            <h3>📋 Booking Details</h3>
            <div class="info-row">
              <span class="info-label">Booking ID:</span>
              <span class="info-value">${bookingData.id}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Experience:</span>
              <span class="info-value">${bookingData.experienceTitle || 'Adventure Experience'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Participants:</span>
              <span class="info-value">${bookingData.participants} people</span>
            </div>
            <div class="info-row">
              <span class="info-label">Start Date:</span>
              <span class="info-value">${bookingData.startDate ? new Date(bookingData.startDate.toDate()).toLocaleDateString() : 'TBD'}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Pickup Location:</span>
              <span class="info-value">${bookingData.pickupLocation}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Total Amount:</span>
              <span class="info-value">₹${bookingData.totalAmount.toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Status:</span>
              <span class="info-value"><span class="status-badge">✓ PAID</span></span>
            </div>
          </div>
          
          <div class="download-section">
            <h3>📄 Download Your Documents</h3>
            <p>Your invoice and trip details are ready for download:</p>
            <a href="${invoiceUrl}" class="download-btn" target="_blank">📋 Download Invoice</a>
            <a href="${tripDetailsUrl}" class="download-btn" target="_blank">🗺️ Download Trip Details</a>
          </div>
          
          <div style="background-color: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 6px; padding: 15px; margin: 20px 0;">
            <h4 style="margin-top: 0; color: #0056b3;">📞 Need Help?</h4>
            <p style="margin-bottom: 0;">Our team is here to help! Contact us at:</p>
            <p><strong>Phone:</strong> +91-9876543210 | <strong>Email:</strong> support@himalayanrides.com</p>
          </div>
          
          <p>We're excited to have you join us for this amazing adventure. Get ready for an unforgettable experience in the Himalayas!</p>
          
          <p>Best regards,<br>
          <strong>The Himalayan Rides Team</strong></p>
        </div>
        
        <div class="footer">
          <p>&copy; 2025 Himalayan Rides. All rights reserved.</p>
          <p>Contact us: support@himalayanrides.com | +91-9876543210</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
/**
 * Generate plain text email content
 */
function generateEmailText(bookingData, paymentData) {
    return `
HIMALAYAN RIDES - Booking Confirmation

Dear ${bookingData.customerName},

Thank you for choosing Himalayan Rides! Your booking has been confirmed and payment has been successfully processed.

BOOKING DETAILS:
- Booking ID: ${bookingData.id}
- Experience: ${bookingData.experienceTitle || 'Adventure Experience'}
- Participants: ${bookingData.participants} people
- Start Date: ${bookingData.startDate ? new Date(bookingData.startDate.toDate()).toLocaleDateString() : 'TBD'}
- Pickup Location: ${bookingData.pickupLocation}
- Total Amount: ₹${bookingData.totalAmount.toLocaleString()}
- Payment Status: PAID

Your invoice and trip details have been generated and are available for download from your account.

NEED HELP?
Our team is here to help!
Phone: +91-9876543210
Email: support@himalayanrides.com

We're excited to have you join us for this amazing adventure. Get ready for an unforgettable experience in the Himalayas!

Best regards,
The Himalayan Rides Team

---
© 2025 Himalayan Rides. All rights reserved.
Contact us: support@himalayanrides.com | +91-9876543210
  `;
}
//# sourceMappingURL=email.js.map
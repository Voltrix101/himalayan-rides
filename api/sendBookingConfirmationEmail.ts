import { VercelRequest, VercelResponse } from '@vercel/node';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import { db, storage, enableCors, handleOptions, errorResponse, successResponse } from '../_lib/firebase';
import { generateInvoicePDF, generateTripDetailsPDF } from '../_lib/pdf';
import { BookingData, PaymentData } from '../_lib/types';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  enableCors(res);
  if (handleOptions(req, res)) return;

  if (req.method !== 'POST') {
    return errorResponse(res, 405, 'Method not allowed');
  }

  try {
    const { bookingId, paymentId } = req.body;
    
    if (!bookingId || !paymentId) {
      return errorResponse(res, 400, 'Booking ID and Payment ID are required');
    }

    console.log(`Sending booking confirmation email for: ${bookingId}`);

    // Get booking data
    const bookingDoc = await db.collection('bookings').doc(bookingId).get();
    
    if (!bookingDoc.exists) {
      return errorResponse(res, 404, 'Booking not found');
    }

    const bookingData = { id: bookingId, ...bookingDoc.data() };

    // Get payment data
    const paymentQuery = await db
      .collection('payments')
      .where('bookingId', '==', bookingId)
      .limit(1)
      .get();
    
    if (paymentQuery.empty) {
      return errorResponse(res, 404, 'Payment not found');
    }

    const paymentData = paymentQuery.docs[0].data();

    // Generate PDFs
    const invoicePath = await generateInvoicePDF(bookingData, paymentData);
    const tripDetailsPath = await generateTripDetailsPDF(bookingData);

    // Upload PDFs to Firebase Storage and get URLs
    const invoiceUrl = await uploadPDFAndGetURL(invoicePath, bookingId, 'invoice');
    const tripDetailsUrl = await uploadPDFAndGetURL(tripDetailsPath, bookingId, 'trip-details');

    // Update booking with PDF URLs
    await db.collection('bookings').doc(bookingId).update({
      invoiceUrl,
      tripDetailsUrl,
      updatedAt: new Date(),
    });

    // Send email with attachments
    await sendEmail(bookingData, paymentData, invoiceUrl, tripDetailsUrl);

    console.log(`Confirmation email sent for booking: ${bookingId}`);

    return successResponse(res, {
      success: true,
      message: 'Booking confirmation email sent successfully',
      bookingId,
      invoiceUrl,
      tripDetailsUrl,
    });

  } catch (error: unknown) {
    console.error(`Error sending confirmation email for booking:`, error);
    return errorResponse(res, 500, 'Failed to send confirmation email', error);
  }
}

/**
 * Upload PDF to Firebase Storage and get download URL
 */
async function uploadPDFAndGetURL(filePath: string, bookingId: string, type: string): Promise<string> {
  try {
    const bucket = storage.bucket();
    const fileName = `bookings/${bookingId}/${type}-${Date.now()}.pdf`;
    const file = bucket.file(fileName);

    await file.save(fs.readFileSync(filePath));
    
    // Make file publicly accessible
    await file.makePublic();
    
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    
    console.log(`PDF uploaded to Storage: ${publicUrl}`);
    return publicUrl;

  } catch (error) {
    console.error('Error uploading PDF to Storage:', error);
    throw error;
  }
}

/**
 * Send email using Nodemailer
 */
async function sendEmail(
  bookingData: BookingData, 
  paymentData: PaymentData, 
  invoiceUrl: string, 
  tripDetailsUrl: string
): Promise<void> {
  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    // Email content
    const subject = `Your Himalayan Rides Booking Confirmation - #${bookingData.id}`;
    
    const htmlContent = generateEmailHTML(bookingData, paymentData, invoiceUrl, tripDetailsUrl);
    const textContent = generateEmailText(bookingData, paymentData);

    // Recipients
    const adminEmails = process.env.ADMIN_EMAILS || 'amritob0327.roy@gmail.com,amritoballavroy@gmail.com';
    const recipients = [bookingData.email, ...adminEmails.split(',')].filter(Boolean);

    // Send email
    const mailOptions = {
      from: `"Himalayan Rides" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
      to: recipients.join(','),
      subject,
      text: textContent,
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully: ${result.messageId}`);

  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(
  bookingData: any, 
  paymentData: any, 
  invoiceUrl: string, 
  tripDetailsUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .button { background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏔️ Himalayan Rides</h1>
          <h2>Booking Confirmation</h2>
        </div>
        
        <div class="content">
          <h3>Hello ${bookingData.customerName}!</h3>
          <p>Thank you for booking with Himalayan Rides. Your adventure is confirmed!</p>
          
          <h4>Booking Details:</h4>
          <ul>
            <li><strong>Booking ID:</strong> ${bookingData.id}</li>
            <li><strong>Experience:</strong> ${bookingData.experienceTitle}</li>
            <li><strong>Start Date:</strong> ${new Date(bookingData.startDate).toLocaleDateString()}</li>
            <li><strong>Duration:</strong> ${bookingData.duration} days</li>
            <li><strong>Participants:</strong> ${bookingData.participants}</li>
            <li><strong>Total Amount:</strong> ₹${bookingData.totalAmount}</li>
            <li><strong>Payment Status:</strong> Paid</li>
          </ul>
          
          <h4>Downloads:</h4>
          <p>
            <a href="${invoiceUrl}" class="button">Download Invoice</a>
            <a href="${tripDetailsUrl}" class="button">Download Trip Details</a>
          </p>
          
          <h4>What's Next?</h4>
          <p>Our team will contact you soon with pre-trip preparation details and final instructions.</p>
        </div>
        
        <div class="footer">
          <p>© 2025 Himalayan Rides. All rights reserved.</p>
          <p>Contact us: info@himalayanrides.com | +91-XXXXXXXXXX</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate plain text email content
 */
function generateEmailText(bookingData: any, paymentData: any): string {
  return `
Himalayan Rides - Booking Confirmation

Hello ${bookingData.customerName}!

Thank you for booking with Himalayan Rides. Your adventure is confirmed!

Booking Details:
- Booking ID: ${bookingData.id}
- Experience: ${bookingData.experienceTitle}
- Start Date: ${new Date(bookingData.startDate).toLocaleDateString()}
- Duration: ${bookingData.duration} days
- Participants: ${bookingData.participants}
- Total Amount: ₹${bookingData.totalAmount}
- Payment Status: Paid

Our team will contact you soon with pre-trip preparation details and final instructions.

Best regards,
Himalayan Rides Team
  `;
}

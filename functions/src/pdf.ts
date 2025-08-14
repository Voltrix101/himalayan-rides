import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import PDFDocument from 'pdfkit';
import * as fs from 'fs';
// import * as path from 'path'; // Temporarily disabled

const storage = admin.storage();
const bucket = storage.bucket();

// Colors for branding
const COLORS = {
  primary: '#FF6B35',    // Burnt orange
  secondary: '#1B4965',  // Deep blue
  accent: '#F8F9FA',     // Snow white
  text: '#333333',       // Dark text
  lightGray: '#F5F5F5',  // Light gray
};

/**
 * Generate Invoice PDF
 */
export async function generateInvoicePDF(bookingData: any, paymentData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Invoice - ${bookingData.id}`,
          Author: 'Himalayan Rides',
          Subject: 'Booking Invoice',
        }
      });

      const tempPath = `/tmp/invoice_${bookingData.id}.pdf`;
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      // Header with logo and company info
      drawHeader(doc, 'INVOICE');
      
      // Booking and customer information
      drawBookingInfo(doc, bookingData);
      
      // Payment details table
      drawPaymentTable(doc, bookingData, paymentData);
      
      // Footer
      drawFooter(doc, "Thank you for riding with us!");

      doc.end();

      stream.on('finish', () => {
        functions.logger.info(`Invoice PDF generated: ${tempPath}`);
        resolve(tempPath);
      });

      stream.on('error', (error) => {
        functions.logger.error('Error generating invoice PDF:', error);
        reject(error);
      });

    } catch (error) {
      functions.logger.error('Error creating invoice PDF:', error);
      reject(error);
    }
  });
}

/**
 * Generate Trip Details PDF
 */
export async function generateTripDetailsPDF(bookingData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Trip Details - ${bookingData.id}`,
          Author: 'Himalayan Rides',
          Subject: 'Trip Information',
        }
      });

      const tempPath = `/tmp/trip_details_${bookingData.id}.pdf`;
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      // Header
      drawHeader(doc, 'YOUR TRIP DETAILS');
      
      // Trip information
      drawTripDetails(doc, bookingData);
      
      // Emergency contacts and instructions
      drawEmergencyInfo(doc, bookingData);
      
      // Footer
      drawFooter(doc, "We'll see you soon!");

      doc.end();

      stream.on('finish', () => {
        functions.logger.info(`Trip details PDF generated: ${tempPath}`);
        resolve(tempPath);
      });

      stream.on('error', (error) => {
        functions.logger.error('Error generating trip details PDF:', error);
        reject(error);
      });

    } catch (error) {
      functions.logger.error('Error creating trip details PDF:', error);
      reject(error);
    }
  });
}

/**
 * Upload PDF to Firebase Storage and get signed URL
 */
export async function uploadPDFAndGetURL(filePath: string, bookingId: string, type: 'invoice' | 'trip-details'): Promise<string> {
  try {
    const fileName = `${type}.pdf`;
    const destination = `bookings/${bookingId}/${fileName}`;
    
    // Upload to Firebase Storage
    await bucket.upload(filePath, {
      destination,
      metadata: {
        contentType: 'application/pdf',
        metadata: {
          bookingId,
          type,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Get signed URL (valid for 1 year)
    const file = bucket.file(destination);
    const [url] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    // Clean up temp file
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    functions.logger.info(`PDF uploaded to Storage: ${destination}`);
    return url;

  } catch (error) {
    functions.logger.error('Error uploading PDF to Storage:', error);
    
    // Clean up temp file even on error
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    throw error;
  }
}

/**
 * Draw header with logo and branding
 */
function drawHeader(doc: PDFKit.PDFDocument, title: string) {
  // Background rectangle for header
  doc.rect(0, 0, doc.page.width, 120)
     .fill(COLORS.primary);

  // Reset to black for text
  doc.fillColor('white')
     .fontSize(28)
     .font('Helvetica-Bold')
     .text('HIMALAYAN RIDES', 50, 30);

  doc.fontSize(12)
     .font('Helvetica')
     .text('Ride the Adventure', 50, 65);

  // Title
  doc.fontSize(24)
     .font('Helvetica-Bold')
     .text(title, doc.page.width - 200, 40, { width: 150, align: 'right' });

  // Move down for content
  doc.y = 150;
  doc.fillColor(COLORS.text);
}

/**
 * Draw booking information section
 */
function drawBookingInfo(doc: PDFKit.PDFDocument, bookingData: any) {
  const startY = doc.y;
  
  // Booking info column
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Booking Information', 50, startY);

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Booking ID: ${bookingData.id}`, 50, startY + 25)
     .text(`Date: ${new Date(bookingData.createdAt.toDate()).toLocaleDateString()}`, 50, startY + 40)
     .text(`Experience: ${bookingData.experienceTitle || 'N/A'}`, 50, startY + 55)
     .text(`Participants: ${bookingData.participants}`, 50, startY + 70);

  // Customer info column
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .text('Customer Details', 300, startY);

  doc.fontSize(10)
     .font('Helvetica')
     .text(`Name: ${bookingData.customerName}`, 300, startY + 25)
     .text(`Email: ${bookingData.email}`, 300, startY + 40)
     .text(`Phone: ${bookingData.phone}`, 300, startY + 55)
     .text(`Pickup: ${bookingData.pickupLocation}`, 300, startY + 70);

  doc.y = startY + 110;
}

/**
 * Draw payment table
 */
function drawPaymentTable(doc: PDFKit.PDFDocument, bookingData: any, paymentData: any) {
  const tableTop = doc.y;
  const tableWidth = doc.page.width - 100;
  
  // Table header
  doc.rect(50, tableTop, tableWidth, 30)
     .fill(COLORS.primary);
     
  doc.fillColor('white')
     .fontSize(12)
     .font('Helvetica-Bold')
     .text('Description', 60, tableTop + 10)
     .text('Qty', 250, tableTop + 10)
     .text('Rate (₹)', 320, tableTop + 10)
     .text('Total (₹)', 450, tableTop + 10);

  // Table row
  const rowY = tableTop + 30;
  doc.rect(50, rowY, tableWidth, 25)
     .fill(COLORS.lightGray);
     
  doc.fillColor(COLORS.text)
     .fontSize(10)
     .font('Helvetica')
     .text(bookingData.experienceTitle || 'Experience Booking', 60, rowY + 8)
     .text(bookingData.participants.toString(), 250, rowY + 8)
     .text((bookingData.totalAmount / bookingData.participants).toLocaleString(), 320, rowY + 8)
     .text(bookingData.totalAmount.toLocaleString(), 450, rowY + 8);

  // Total section
  const totalY = rowY + 50;
  doc.fontSize(14)
     .font('Helvetica-Bold')
     .fillColor(COLORS.primary)
     .text(`Grand Total: ₹${bookingData.totalAmount.toLocaleString()}`, 350, totalY);

  // Payment status
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(COLORS.text)
     .text(`Payment ID: ${paymentData.paymentId || 'N/A'}`, 350, totalY + 25)
     .text(`Status: ${paymentData.status || 'N/A'}`, 350, totalY + 40);

  doc.y = totalY + 70;
}

/**
 * Draw trip details section
 */
function drawTripDetails(doc: PDFKit.PDFDocument, bookingData: any) {
  const startY = doc.y;
  
  // Trip overview
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.secondary)
     .text('Trip Overview', 50, startY);

  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(COLORS.text)
     .text(`Experience: ${bookingData.experienceTitle || 'Adventure Experience'}`, 50, startY + 30)
     .text(`Duration: ${bookingData.startDate ? new Date(bookingData.startDate.toDate()).toLocaleDateString() : 'TBD'}`, 50, startY + 50)
     .text(`Participants: ${bookingData.participants} people`, 50, startY + 70)
     .text(`Pickup Location: ${bookingData.pickupLocation}`, 50, startY + 90);

  // Special requests
  if (bookingData.specialRequests) {
    doc.fontSize(14)
       .font('Helvetica-Bold')
       .fillColor(COLORS.secondary)
       .text('Special Requests', 50, startY + 130);
       
    doc.fontSize(10)
       .font('Helvetica')
       .fillColor(COLORS.text)
       .text(bookingData.specialRequests, 50, startY + 155, { width: 500 });
  }

  doc.y = startY + 200;
}

/**
 * Draw emergency information
 */
function drawEmergencyInfo(doc: PDFKit.PDFDocument, bookingData: any) {
  const startY = doc.y;
  
  // Emergency contacts
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .fillColor(COLORS.secondary)
     .text('Emergency Information', 50, startY);

  doc.fontSize(11)
     .font('Helvetica')
     .fillColor(COLORS.text)
     .text('24/7 Emergency Helpline: +91-9876543210', 50, startY + 30)
     .text('Email: emergency@himalayanrides.com', 50, startY + 50);

  // Customer emergency contact
  if (bookingData.emergencyContact) {
    doc.text('Your Emergency Contact:', 50, startY + 80)
       .text(`${bookingData.emergencyContact.name} (${bookingData.emergencyContact.relationship})`, 50, startY + 100)
       .text(`Phone: ${bookingData.emergencyContact.phone}`, 50, startY + 120);
  }

  doc.y = startY + 150;
}

/**
 * Draw footer
 */
function drawFooter(doc: PDFKit.PDFDocument, message: string) {
  const footerY = doc.page.height - 100;
  
  // Footer background
  doc.rect(0, footerY, doc.page.width, 100)
     .fill(COLORS.accent);

  // Message
  doc.fontSize(14)
     .font('Helvetica-Oblique')
     .fillColor(COLORS.primary)
     .text(message, 50, footerY + 20, { align: 'center', width: doc.page.width - 100 });

  // Contact info
  doc.fontSize(10)
     .font('Helvetica')
     .fillColor(COLORS.text)
     .text('Himalayan Rides | Email: contact@himalayanrides.com | Phone: +91-9876543210', 
           50, footerY + 50, { align: 'center', width: doc.page.width - 100 });
}

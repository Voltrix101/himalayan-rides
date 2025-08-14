import PDFDocument from 'pdfkit';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * Generate invoice PDF
 */
export async function generateInvoicePDF(bookingData: any, paymentData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create temporary file path
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `invoice-${bookingData.id}-${Date.now()}.pdf`);
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Himalayan Rides', 50, 50);
      doc.fontSize(16).text('INVOICE', 450, 50);
      
      // Invoice details
      doc.fontSize(12);
      doc.text(`Invoice #: ${bookingData.id}`, 50, 120);
      doc.text(`Date: ${new Date().toLocaleDateString()}`, 50, 140);
      doc.text(`Payment ID: ${paymentData.paymentId || 'N/A'}`, 50, 160);
      
      // Customer details
      doc.text('Bill To:', 50, 200);
      doc.text(bookingData.customerName, 50, 220);
      doc.text(bookingData.email, 50, 240);
      doc.text(bookingData.phone, 50, 260);
      
      // Service details
      doc.text('Service Details:', 50, 300);
      doc.text(`Experience: ${bookingData.experienceTitle}`, 50, 320);
      doc.text(`Start Date: ${new Date(bookingData.startDate).toLocaleDateString()}`, 50, 340);
      doc.text(`Duration: ${bookingData.duration} days`, 50, 360);
      doc.text(`Participants: ${bookingData.participants}`, 50, 380);
      
      // Amount details
      doc.text('Amount Details:', 50, 420);
      doc.text(`Base Amount: ₹${bookingData.baseAmount || bookingData.totalAmount}`, 50, 440);
      doc.text(`Total Amount: ₹${bookingData.totalAmount}`, 50, 480);
      
      // Payment status
      doc.fontSize(14).text('Payment Status: PAID', 50, 520);
      
      // Footer
      doc.fontSize(10).text('Thank you for choosing Himalayan Rides!', 50, 700);
      
      doc.end();
      
      stream.on('finish', () => {
        console.log(`Invoice PDF generated: ${tempPath}`);
        resolve(tempPath);
      });
      
      stream.on('error', (error) => {
        console.error('Error generating invoice PDF:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('Error creating invoice PDF:', error);
      reject(error);
    }
  });
}

/**
 * Generate trip details PDF
 */
export async function generateTripDetailsPDF(bookingData: any): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Create temporary file path
      const tempDir = os.tmpdir();
      const tempPath = path.join(tempDir, `trip-details-${bookingData.id}-${Date.now()}.pdf`);
      
      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(tempPath);
      doc.pipe(stream);

      // Header
      doc.fontSize(20).text('Himalayan Rides', 50, 50);
      doc.fontSize(16).text('TRIP DETAILS', 400, 50);
      
      // Trip overview
      doc.fontSize(14).text(`${bookingData.experienceTitle}`, 50, 120);
      doc.fontSize(12);
      doc.text(`Booking ID: ${bookingData.id}`, 50, 150);
      doc.text(`Customer: ${bookingData.customerName}`, 50, 170);
      doc.text(`Start Date: ${new Date(bookingData.startDate).toLocaleDateString()}`, 50, 190);
      doc.text(`Duration: ${bookingData.duration} days`, 50, 210);
      doc.text(`Participants: ${bookingData.participants}`, 50, 230);
      
      // Itinerary (sample)
      doc.text('Itinerary:', 50, 270);
      doc.text('Day 1: Arrival and orientation', 70, 290);
      doc.text('Day 2-4: Main adventure activities', 70, 310);
      doc.text('Day 5: Departure', 70, 330);
      
      // What's included
      doc.text('What\'s Included:', 50, 370);
      doc.text('• Professional guide', 70, 390);
      doc.text('• Accommodation', 70, 410);
      doc.text('• Meals as per itinerary', 70, 430);
      doc.text('• Transportation', 70, 450);
      doc.text('• Safety equipment', 70, 470);
      
      // Important notes
      doc.text('Important Notes:', 50, 510);
      doc.text('• Carry valid ID proof', 70, 530);
      doc.text('• Follow safety guidelines', 70, 550);
      doc.text('• Weather conditions may affect schedule', 70, 570);
      
      // Contact info
      doc.text('Contact Information:', 50, 610);
      doc.text('Email: info@himalayanrides.com', 70, 630);
      doc.text('Phone: +91-XXXXXXXXXX', 70, 650);
      
      // Footer
      doc.fontSize(10).text('Have an amazing adventure with Himalayan Rides!', 50, 700);
      
      doc.end();
      
      stream.on('finish', () => {
        console.log(`Trip details PDF generated: ${tempPath}`);
        resolve(tempPath);
      });
      
      stream.on('error', (error) => {
        console.error('Error generating trip details PDF:', error);
        reject(error);
      });
      
    } catch (error) {
      console.error('Error creating trip details PDF:', error);
      reject(error);
    }
  });
}

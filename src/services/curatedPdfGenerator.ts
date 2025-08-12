import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { CuratedBooking } from '../types/curatedExperience';

export interface CuratedPDFData {
  booking: CuratedBooking;
  qrCodeData?: string;
}

export class CuratedPDFGenerator {
  private pdf: jsPDF;
  private readonly pageWidth = 210; // A4 width in mm
  private readonly pageHeight = 297; // A4 height in mm
  private readonly margin = 20;
  private readonly contentWidth = this.pageWidth - (this.margin * 2);

  constructor() {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
  }

  generateCuratedExperiencePDF(data: CuratedPDFData): Blob {
    this.pdf = new jsPDF('portrait', 'mm', 'a4');
    
    // Background gradient effect
    this.addGradientBackground();
    
    // Header with liquid glass effect
    this.addPremiumHeader(data.booking);
    
    // Booking confirmation section
    this.addBookingConfirmation(data.booking);
    
    // Experience details with neon highlights
    this.addExperienceDetails(data.booking);
    
    // Detailed itinerary
    this.addDetailedItinerary(data.booking);
    
    // Payment breakdown
    this.addPaymentBreakdown(data.booking);
    
    // QR code and support info
    this.addQRCodeAndSupport(data.qrCodeData);
    
    // Premium footer
    this.addPremiumFooter();

    return this.pdf.output('blob');
  }

  private addGradientBackground(): void {
    // Create gradient background effect
    const gradient = this.pdf.internal.newColorSpaces(
      'DeviceRGB',
      'DeviceRGB'
    );
    
    // Dark gradient from top to bottom
    this.pdf.setFillColor(15, 23, 42); // Slate-900
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F');
    
    // Add subtle texture overlay
    this.pdf.setFillColor(30, 41, 59, 0.3); // Slate-800 with transparency
    for (let i = 0; i < 20; i++) {
      this.pdf.circle(
        Math.random() * this.pageWidth,
        Math.random() * this.pageHeight,
        Math.random() * 2,
        'F'
      );
    }
  }

  private addPremiumHeader(booking: CuratedBooking): void {
    let yPos = this.margin;

    // Logo area with glow effect
    this.pdf.setFillColor(59, 130, 246); // Blue-500
    this.pdf.roundedRect(this.margin, yPos, 40, 12, 3, 3, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('🏔️ HIMALAYAN', this.margin + 2, yPos + 8);

    // Company name with neon effect
    this.pdf.setTextColor(34, 197, 94); // Green-500 (neon green)
    this.pdf.setFontSize(28);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('HIMALAYAN RIDES', this.pageWidth - this.margin - 80, yPos + 8);

    yPos += 20;

    // Premium experience badge
    this.pdf.setFillColor(147, 51, 234); // Purple-600
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 15, 5, 5, 'F');
    
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(18);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('✨ CURATED EXPERIENCE CONFIRMATION ✨', this.margin + 10, yPos + 10);

    yPos += 25;

    // Experience title with gradient text effect
    this.pdf.setTextColor(34, 197, 94); // Neon green
    this.pdf.setFontSize(24);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(booking.experienceDetails.title.toUpperCase(), this.margin, yPos);

    yPos += 15;

    // Booking ID and status
    this.pdf.setFillColor(30, 41, 59); // Slate-800
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 12, 3, 3, 'F');
    
    this.pdf.setTextColor(148, 163, 184); // Slate-400
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Booking ID: ${booking.id}`, this.margin + 5, yPos + 5);
    
    this.pdf.setTextColor(34, 197, 94); // Green-500
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Status: ${booking.status.toUpperCase()}`, this.margin + 5, yPos + 9);
  }

  private addBookingConfirmation(booking: CuratedBooking): void {
    let yPos = 90;

    // Section header
    this.addSectionHeader('BOOKING DETAILS', yPos);
    yPos += 20;

    // Customer info in glass card style
    this.pdf.setFillColor(30, 41, 59, 0.8); // Semi-transparent slate
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 30, 5, 5, 'F');

    // Customer details
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Customer Information:', this.margin + 5, yPos + 8);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(203, 213, 225); // Slate-300
    this.pdf.text(`Name: ${booking.userInfo.name}`, this.margin + 5, yPos + 15);
    this.pdf.text(`Email: ${booking.userInfo.email}`, this.margin + 5, yPos + 20);
    this.pdf.text(`Phone: ${booking.userInfo.phone}`, this.margin + 5, yPos + 25);

    // Experience dates
    const halfWidth = this.contentWidth / 2;
    this.pdf.text(`Start Date: ${booking.bookingInfo.startDate.toLocaleDateString()}`, this.margin + halfWidth, yPos + 15);
    this.pdf.text(`End Date: ${booking.bookingInfo.endDate.toLocaleDateString()}`, this.margin + halfWidth, yPos + 20);
    this.pdf.text(`Participants: ${booking.bookingInfo.participants}`, this.margin + halfWidth, yPos + 25);
  }

  private addExperienceDetails(booking: CuratedBooking): void {
    let yPos = 130;

    // Section header
    this.addSectionHeader('EXPERIENCE HIGHLIGHTS', yPos);
    yPos += 20;

    // Highlights in neon-bordered boxes
    const exp = booking.experienceDetails;
    
    this.pdf.setFillColor(30, 41, 59, 0.8);
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 40, 5, 5, 'F');

    // Category and difficulty badges
    this.pdf.setFillColor(59, 130, 246); // Blue badge
    this.pdf.roundedRect(this.margin + 5, yPos + 5, 25, 6, 2, 2, 'F');
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(exp.category, this.margin + 7, yPos + 9);

    this.pdf.setFillColor(147, 51, 234); // Purple badge
    this.pdf.roundedRect(this.margin + 35, yPos + 5, 25, 6, 2, 2, 'F');
    this.pdf.text(exp.difficulty, this.margin + 37, yPos + 9);

    // Duration and rating
    this.pdf.setTextColor(34, 197, 94); // Neon green
    this.pdf.setFontSize(10);
    this.pdf.text(`${exp.days} Days`, this.margin + 70, yPos + 9);
    this.pdf.text(`⭐ ${exp.rating}/5`, this.margin + 100, yPos + 9);

    // Highlights list
    this.pdf.setTextColor(203, 213, 225);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    
    let highlightY = yPos + 18;
    exp.highlights.slice(0, 4).forEach((highlight, index) => {
      this.pdf.setTextColor(34, 197, 94); // Green bullet
      this.pdf.text('•', this.margin + 5, highlightY);
      this.pdf.setTextColor(203, 213, 225);
      this.pdf.text(highlight, this.margin + 10, highlightY);
      highlightY += 5;
    });
  }

  private addDetailedItinerary(booking: CuratedBooking): void {
    let yPos = 180;

    // Section header
    this.addSectionHeader('DETAILED ITINERARY', yPos);
    yPos += 20;

    const exp = booking.experienceDetails;
    
    exp.itinerary.forEach((day, index) => {
      // Day card with liquid glass effect
      const cardHeight = 25;
      this.pdf.setFillColor(30, 41, 59, 0.9);
      this.pdf.roundedRect(this.margin, yPos, this.contentWidth, cardHeight, 4, 4, 'F');

      // Day number badge
      this.pdf.setFillColor(59, 130, 246);
      this.pdf.circle(this.margin + 8, yPos + 8, 6, 'F');
      this.pdf.setTextColor(255, 255, 255);
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(`${day.day}`, this.margin + 6, yPos + 10);

      // Day title
      this.pdf.setTextColor(34, 197, 94); // Neon green
      this.pdf.setFontSize(12);
      this.pdf.setFont('helvetica', 'bold');
      this.pdf.text(day.title, this.margin + 18, yPos + 8);

      // Activities
      this.pdf.setTextColor(203, 213, 225);
      this.pdf.setFontSize(9);
      this.pdf.setFont('helvetica', 'normal');
      const activitiesText = day.activities.join(' • ');
      this.pdf.text(activitiesText, this.margin + 18, yPos + 14, { maxWidth: this.contentWidth - 25 });

      // Accommodation and meals
      if (day.accommodation) {
        this.pdf.setTextColor(148, 163, 184);
        this.pdf.setFontSize(8);
        this.pdf.text(`🏠 ${day.accommodation}`, this.margin + 18, yPos + 19);
      }
      if (day.meals) {
        this.pdf.text(`🍽️ ${day.meals}`, this.margin + 100, yPos + 19);
      }

      yPos += cardHeight + 5;

      // Add new page if needed
      if (yPos > this.pageHeight - 50) {
        this.pdf.addPage();
        yPos = this.margin + 20;
      }
    });
  }

  private addPaymentBreakdown(booking: CuratedBooking): void {
    let yPos = this.pdf.internal.pageSize.height - 80;

    // Section header
    this.addSectionHeader('PAYMENT DETAILS', yPos);
    yPos += 20;

    // Payment card
    this.pdf.setFillColor(30, 41, 59, 0.9);
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 25, 5, 5, 'F');

    // Payment details
    this.pdf.setTextColor(255, 255, 255);
    this.pdf.setFontSize(12);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('Payment Information:', this.margin + 5, yPos + 8);

    this.pdf.setFont('helvetica', 'normal');
    this.pdf.setTextColor(203, 213, 225);
    const baseAmount = booking.payment.amount / 1.18; // Remove GST
    const gstAmount = booking.payment.amount - baseAmount;

    this.pdf.text(`Experience Cost: ₹${baseAmount.toLocaleString()}`, this.margin + 5, yPos + 15);
    this.pdf.text(`GST (18%): ₹${gstAmount.toLocaleString()}`, this.margin + 5, yPos + 20);

    // Total amount with neon effect
    this.pdf.setTextColor(34, 197, 94); // Neon green
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`Total Paid: ₹${booking.payment.amount.toLocaleString()}`, this.margin + 100, yPos + 15);

    this.pdf.setTextColor(148, 163, 184);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(`Payment ID: ${booking.payment.paymentId}`, this.margin + 100, yPos + 22);
  }

  private addQRCodeAndSupport(qrCodeData?: string): void {
    const yPos = this.pdf.internal.pageSize.height - 45;

    // Support section
    this.pdf.setFillColor(59, 130, 246, 0.2);
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 20, 3, 3, 'F');

    this.pdf.setTextColor(59, 130, 246);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text('24/7 CUSTOMER SUPPORT', this.margin + 5, yPos + 8);

    this.pdf.setTextColor(203, 213, 225);
    this.pdf.setFontSize(9);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('📞 +91 98765 43210 | 📧 support@himalayanrides.com', this.margin + 5, yPos + 14);
    this.pdf.text('🌐 www.himalayanrides.com | WhatsApp: +91 98765 43210', this.margin + 5, yPos + 18);

    // QR Code placeholder (in real implementation, generate actual QR code)
    if (qrCodeData) {
      this.pdf.setFillColor(255, 255, 255);
      this.pdf.rect(this.pageWidth - this.margin - 25, yPos + 2, 20, 16, 'F');
      this.pdf.setTextColor(0, 0, 0);
      this.pdf.setFontSize(8);
      this.pdf.text('QR Code', this.pageWidth - this.margin - 22, yPos + 12);
    }
  }

  private addPremiumFooter(): void {
    const yPos = this.pdf.internal.pageSize.height - 15;

    this.pdf.setFillColor(15, 23, 42); // Dark footer
    this.pdf.rect(0, yPos, this.pageWidth, 15, 'F');

    this.pdf.setTextColor(148, 163, 184);
    this.pdf.setFontSize(8);
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text('Generated on ' + new Date().toLocaleDateString(), this.margin, yPos + 8);
    this.pdf.text('Himalayan Rides - Premium Adventure Experiences', this.pageWidth - this.margin - 60, yPos + 8);

    // Decorative elements
    this.pdf.setDrawColor(34, 197, 94);
    this.pdf.setLineWidth(0.5);
    this.pdf.line(this.margin, yPos + 2, this.pageWidth - this.margin, yPos + 2);
  }

  private addSectionHeader(title: string, yPos: number): void {
    // Neon section header
    this.pdf.setFillColor(147, 51, 234, 0.3); // Purple glow
    this.pdf.roundedRect(this.margin, yPos, this.contentWidth, 12, 3, 3, 'F');

    this.pdf.setTextColor(34, 197, 94); // Neon green
    this.pdf.setFontSize(14);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(title, this.margin + 5, yPos + 8);

    // Accent line
    this.pdf.setDrawColor(34, 197, 94);
    this.pdf.setLineWidth(1);
    this.pdf.line(this.margin, yPos + 12, this.pageWidth - this.margin, yPos + 12);
  }
}

// Export singleton instance
export const curatedPDFGenerator = new CuratedPDFGenerator();

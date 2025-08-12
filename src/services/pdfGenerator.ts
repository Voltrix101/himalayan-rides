import jsPDF from 'jspdf';
import 'jspdf-autotable';

interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

interface TripInfo {
  name: string;
  duration: string;
  totalCost: number;
  baseAmount?: number;
  taxAmount?: number;
  type: string;
}

interface ItineraryDay {
  title: string;
  description: string;
  day?: number;
}

interface BookingData {
  userInfo: UserInfo;
  tripInfo: TripInfo;
  itinerary: ItineraryDay[];
  bookingId?: string;
  bookingDate?: Date;
  paymentId?: string;
}

export class HimalayanRidePDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { left: 20, right: 20, top: 20, bottom: 20 };

  constructor() {
    this.doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
  }

  generateRidePDF(data: BookingData): void {
    try {
      this.addHeader(data);
      this.addUserInfo(data.userInfo);
      this.addTripInfo(data.tripInfo);
      this.addItinerary(data.itinerary);
      this.addBillingSummary(data.tripInfo);
      this.addThankYouSection(data);
      this.addFooter();

      const fileName = this.generateFileName(data);
      this.doc.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to simple PDF
      this.generateSimplePDF(data);
    }
  }

  private addHeader(data: BookingData): void {
    // Add glassmorphism-style header background
    this.doc.setFillColor(65, 105, 225, 0.1); // Blue with transparency effect
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 30, 8, 8, 'F');

    // Add border for glass effect
    this.doc.setDrawColor(255, 255, 255, 0.3);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 30, 8, 8, 'S');

    // Brand logo/title with neon effect
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(28);
    this.doc.setTextColor(41, 255, 234); // Neon cyan
    this.doc.text('🏔️ HIMALAYAN RIDES', this.pageWidth / 2, this.currentY + 15, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Your Ultimate Mountain Adventure', this.pageWidth / 2, this.currentY + 25, { align: 'center' });

    this.currentY += 40;
  }

  private addUserInfo(userInfo: UserInfo): void {
    // Glass container for user info
    this.doc.setFillColor(255, 255, 255, 0.08);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 25, 6, 6, 'F');
    this.doc.setDrawColor(255, 255, 255, 0.2);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 25, 6, 6, 'S');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(255, 182, 193); // Light pink neon
    this.doc.text('✨ Rider Information', this.margins.left + 5, this.currentY + 8);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(240, 240, 240);
    
    this.doc.text(`👤 ${userInfo.name || 'Adventure Seeker'}`, this.margins.left + 5, this.currentY + 15);
    this.doc.text(`📧 ${userInfo.email || 'Not provided'}`, this.margins.left + 5, this.currentY + 20);
    this.doc.text(`📱 ${userInfo.phone || 'Not provided'}`, this.pageWidth / 2 + 10, this.currentY + 15);

    this.currentY += 35;
  }

  private addTripInfo(tripInfo: TripInfo): void {
    // Hero trip info section with gradient effect
    this.doc.setFillColor(255, 165, 0, 0.15); // Orange gradient simulation
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 35, 8, 8, 'F');
    this.doc.setDrawColor(255, 165, 0, 0.4);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 35, 8, 8, 'S');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.setTextColor(255, 215, 0); // Gold neon
    this.doc.text(`🚀 ${tripInfo.name}`, this.pageWidth / 2, this.currentY + 12, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text(`⏱️ Duration: ${tripInfo.duration}`, this.margins.left + 10, this.currentY + 22);
    this.doc.text(`🎯 Type: ${tripInfo.type?.toUpperCase() || 'ADVENTURE'}`, this.margins.left + 10, this.currentY + 28);

    // Price highlight
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(144, 238, 144); // Light green neon
    this.doc.text(`💰 ₹${tripInfo.totalCost.toLocaleString()}`, this.pageWidth - 60, this.currentY + 25);

    this.currentY += 45;
  }

  private addItinerary(itinerary: ItineraryDay[]): void {
    if (!itinerary || itinerary.length === 0) {
      this.addNoItineraryMessage();
      return;
    }

    // Itinerary header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(147, 112, 219); // Purple neon
    this.doc.text('📅 Your Adventure Itinerary', this.margins.left, this.currentY);
    this.currentY += 15;

    itinerary.forEach((day, index) => {
      if (this.currentY > this.pageHeight - 60) {
        this.doc.addPage();
        this.currentY = 30;
      }

      // Day container with frosted glass effect
      const containerHeight = this.calculateDayContainerHeight(day);
      
      this.doc.setFillColor(138, 43, 226, 0.1); // Purple glass
      this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, containerHeight, 6, 6, 'F');
      this.doc.setDrawColor(138, 43, 226, 0.3);
      this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, containerHeight, 6, 6, 'S');

      // Day number badge
      this.doc.setFillColor(255, 20, 147); // Deep pink
      this.doc.circle(this.margins.left + 10, this.currentY + 8, 6, 'F');
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(12);
      this.doc.setTextColor(255, 255, 255);
      this.doc.text(`${index + 1}`, this.margins.left + 10, this.currentY + 10, { align: 'center' });

      // Day title
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(14);
      this.doc.setTextColor(255, 215, 0); // Gold
      this.doc.text(day.title, this.margins.left + 20, this.currentY + 10);

      // Day description
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(10);
      this.doc.setTextColor(220, 220, 220);
      
      const description = day.description || 'Experience the beauty of the Himalayas!';
      const wrappedText = this.doc.splitTextToSize(description, this.pageWidth - 60);
      this.doc.text(wrappedText, this.margins.left + 20, this.currentY + 18);

      this.currentY += containerHeight + 8;
    });

    this.currentY += 10;
  }

  private addBillingSummary(tripInfo: TripInfo): void {
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = 30;
    }

    // Billing header
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(18);
    this.doc.setTextColor(50, 205, 50); // Lime green neon
    this.doc.text('💳 Billing Summary', this.margins.left, this.currentY);
    this.currentY += 15;

    // Billing container
    this.doc.setFillColor(34, 139, 34, 0.1); // Forest green glass
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 40, 8, 8, 'F');
    this.doc.setDrawColor(34, 139, 34, 0.4);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 40, 8, 8, 'S');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(240, 240, 240);

    const baseAmount = tripInfo.baseAmount || tripInfo.totalCost;
    const taxAmount = tripInfo.taxAmount || (baseAmount * 0.18);

    this.doc.text(`Base Amount:`, this.margins.left + 10, this.currentY + 12);
    this.doc.text(`₹${baseAmount.toLocaleString()}`, this.pageWidth - 60, this.currentY + 12);

    this.doc.text(`GST (18%):`, this.margins.left + 10, this.currentY + 20);
    this.doc.text(`₹${Math.round(taxAmount).toLocaleString()}`, this.pageWidth - 60, this.currentY + 20);

    // Total amount highlight
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 215, 0); // Gold
    this.doc.text(`Total Amount:`, this.margins.left + 10, this.currentY + 32);
    this.doc.text(`₹${tripInfo.totalCost.toLocaleString()}`, this.pageWidth - 60, this.currentY + 32);

    this.currentY += 50;
  }

  private addThankYouSection(data: BookingData): void {
    if (this.currentY > this.pageHeight - 100) {
      this.doc.addPage();
      this.currentY = 30;
    }

    // Thank you container with rainbow gradient simulation
    this.doc.setFillColor(255, 192, 203, 0.15); // Pink glass
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 60, 12, 12, 'F');
    this.doc.setDrawColor(255, 105, 180, 0.5);
    this.doc.roundedRect(this.margins.left, this.currentY, this.pageWidth - 40, 60, 12, 12, 'S');

    // Confetti effect (decorative elements)
    this.addConfettiElements();

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(255, 20, 147); // Deep pink neon
    this.doc.text('🎉 You\'re All Set!', this.pageWidth / 2, this.currentY + 20, { align: 'center' });

    this.doc.setFontSize(14);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('Get ready for the adventure of a lifetime!', this.pageWidth / 2, this.currentY + 30, { align: 'center' });

    this.doc.setFontSize(10);
    this.doc.setTextColor(200, 200, 200);
    const downloadDate = new Date().toLocaleDateString('en-IN');
    this.doc.text(`Generated on: ${downloadDate}`, this.pageWidth / 2, this.currentY + 40, { align: 'center' });

    if (data.bookingId) {
      this.doc.text(`Booking ID: ${data.bookingId}`, this.pageWidth / 2, this.currentY + 45, { align: 'center' });
    }

    if (data.paymentId) {
      this.doc.text(`Payment ID: ${data.paymentId}`, this.pageWidth / 2, this.currentY + 50, { align: 'center' });
    }

    this.currentY += 70;
  }

  private addConfettiElements(): void {
    const colors = [
      [255, 20, 147],   // Deep pink
      [41, 255, 234],   // Cyan
      [255, 215, 0],    // Gold
      [144, 238, 144],  // Light green
      [147, 112, 219]   // Purple
    ];

    for (let i = 0; i < 15; i++) {
      const x = this.margins.left + 10 + Math.random() * (this.pageWidth - 60);
      const y = this.currentY + 5 + Math.random() * 50;
      const colorIndex = Math.floor(Math.random() * colors.length);
      
      this.doc.setFillColor(colors[colorIndex][0], colors[colorIndex][1], colors[colorIndex][2]);
      
      if (Math.random() > 0.5) {
        this.doc.circle(x, y, 1, 'F');
      } else {
        this.doc.rect(x, y, 2, 2, 'F');
      }
    }
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Himalayan Rides - Where Adventure Meets Excellence', this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text('🌐 www.himalayanrides.com | 📞 +91-XXXX-XXXXXX', this.pageWidth / 2, footerY + 4, { align: 'center' });
  }

  private calculateDayContainerHeight(day: ItineraryDay): number {
    const description = day.description || 'Experience the beauty!';
    const wrappedText = this.doc.splitTextToSize(description, this.pageWidth - 60);
    return Math.max(25, 15 + (wrappedText.length * 4));
  }

  private addNoItineraryMessage(): void {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(12);
    this.doc.setTextColor(200, 200, 200);
    this.doc.text('🗓️ Detailed itinerary will be shared closer to your travel date.', this.margins.left, this.currentY);
    this.currentY += 20;
  }

  private generateFileName(data: BookingData): string {
    const tripName = data.tripInfo.name.replace(/[^a-zA-Z0-9]/g, '');
    const userName = data.userInfo.name.replace(/[^a-zA-Z0-9]/g, '');
    const date = new Date().toISOString().split('T')[0];
    return `HimalayanRide_${tripName}_${userName}_${date}.pdf`;
  }

  private generateSimplePDF(data: BookingData): void {
    // Fallback simple PDF
    this.doc = new jsPDF();
    
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(20);
    this.doc.text('🏔️ Himalayan Rides', 20, 20);
    
    this.doc.setFontSize(14);
    this.doc.text(`Trip: ${data.tripInfo.name}`, 20, 40);
    this.doc.text(`Customer: ${data.userInfo.name}`, 20, 50);
    this.doc.text(`Total: ₹${data.tripInfo.totalCost.toLocaleString()}`, 20, 60);
    
    const fileName = this.generateFileName(data);
    this.doc.save(fileName);
  }
}

// Export the main function for easy use
export const generateRidePDF = (data: BookingData): void => {
  const generator = new HimalayanRidePDFGenerator();
  generator.generateRidePDF(data);
};

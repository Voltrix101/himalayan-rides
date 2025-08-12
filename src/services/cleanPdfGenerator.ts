import jsPDF from 'jspdf';

export interface UserInfo {
  name: string;
  email: string;
  phone: string;
}

export class CleanPDFGenerator {
  private doc: jsPDF;

  constructor() {
    this.doc = new jsPDF();
  }

  private addCustomerInfo(userInfo: UserInfo) {
    if (!userInfo) {
      console.error('UserInfo is undefined in PDF generator');
      return;
    }

    this.addSectionHeader('Customer Information');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(55, 65, 81);

    this.doc.text(`Name: ${userInfo.name || 'Not provided'}`, this.margins.left + 5, this.currentY + 10);
    this.doc.text(`Email: ${userInfo.email || 'Not provided'}`, this.margins.left + 5, this.currentY + 18);
    this.doc.text(`Phone: ${userInfo.phone || 'Not provided'}`, this.margins.left + 5, this.currentY + 26);

    this.currentY += 40;ort interface TripInfo {
  name: string;
  type?: string;
  duration?: string;
  totalCost: number;
}

export interface ParticipantInfo {
  name: string;
  age: number;
  phone: string;
  idType: string;
  idNumber: string;
}

export interface PaymentInfo {
  paymentId: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: Date;
}

export interface BookingInfo {
  bookingId: string;
  userInfo: UserInfo;
  tripInfo: TripInfo;
  participants: ParticipantInfo[];
  startDate: Date;
  endDate?: Date;
  paymentInfo: PaymentInfo;
  specialRequests?: string;
}

export class CleanPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margins = { top: 20, right: 20, bottom: 20, left: 20 };
  private currentY: number;

  constructor() {
    this.doc = new jsPDF('portrait', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margins.top;
  }

  generateBookingConfirmation(booking: BookingInfo): Blob {
    // Set background color
    this.doc.setFillColor(248, 250, 252); // Light gray background
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, 'F');

    // Add sections
    this.addHeader();
    this.addBookingInfo(booking);
    this.addCustomerInfo(booking.userInfo);
    this.addTripDetails(booking.tripInfo);
    this.addParticipants(booking.participants);
    this.addPaymentDetails(booking.paymentInfo);
    this.addFooter();

    return this.doc.output('blob');
  }

  private addHeader(): void {
    // Header background
    this.doc.setFillColor(30, 41, 59); // Dark blue
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');

    // Company name
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(24);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('HIMALAYAN RIDES', this.pageWidth / 2, 25, { align: 'center' });

    // Subtitle
    this.doc.setFontSize(12);
    this.doc.setTextColor(203, 213, 225);
    this.doc.text('Your Ultimate Mountain Adventure', this.pageWidth / 2, 35, { align: 'center' });

    this.currentY = 55;
  }

  private addBookingInfo(booking: BookingInfo): void {
    // Booking confirmation box
    this.doc.setFillColor(34, 197, 94); // Green
    this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 25, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(16);
    this.doc.setTextColor(255, 255, 255);
    this.doc.text('BOOKING CONFIRMED', this.pageWidth / 2, this.currentY + 12, { align: 'center' });

    this.doc.setFontSize(12);
    this.doc.text(`Booking ID: ${booking.bookingId}`, this.pageWidth / 2, this.currentY + 20, { align: 'center' });

    this.currentY += 35;
  }

  private addCustomerInfo(userInfo: UserInfo): void {
    this.addSectionHeader('Customer Information');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(55, 65, 81);

    this.doc.text(`Name: ${userInfo.name}`, this.margins.left + 5, this.currentY + 10);
    this.doc.text(`Email: ${userInfo.email}`, this.margins.left + 5, this.currentY + 18);
    this.doc.text(`Phone: ${userInfo.phone}`, this.margins.left + 5, this.currentY + 26);

    this.currentY += 40;
  }

  private addTripDetails(tripInfo: TripInfo): void {
    this.addSectionHeader('Trip Details');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(tripInfo.name, this.margins.left + 5, this.currentY + 12);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(55, 65, 81);

    if (tripInfo.type) {
      this.doc.text(`Type: ${tripInfo.type.toUpperCase()}`, this.margins.left + 5, this.currentY + 22);
    }
    if (tripInfo.duration) {
      this.doc.text(`Duration: ${tripInfo.duration}`, this.margins.left + 5, this.currentY + 30);
    }

    // Price box
    this.doc.setFillColor(239, 246, 255);
    this.doc.rect(this.pageWidth - 80, this.currentY + 5, 60, 20, 'F');
    this.doc.setDrawColor(59, 130, 246);
    this.doc.rect(this.pageWidth - 80, this.currentY + 5, 60, 20);

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(30, 64, 175);
    this.doc.text(`₹${tripInfo.totalCost.toLocaleString()}`, this.pageWidth - 50, this.currentY + 18, { align: 'center' });

    this.currentY += 45;
  }

  private addParticipants(participants: ParticipantInfo[]): void {
    this.addSectionHeader(`Participants (${participants.length})`);

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(55, 65, 81);

    participants.forEach((participant, index) => {
      const yPos = this.currentY + 12 + (index * 20);
      
      // Check if we need a new page
      if (yPos > this.pageHeight - 50) {
        this.doc.addPage();
        this.currentY = this.margins.top;
        return;
      }

      this.doc.text(`${index + 1}. ${participant.name}`, this.margins.left + 5, yPos);
      this.doc.text(`Age: ${participant.age}`, this.margins.left + 80, yPos);
      this.doc.text(`Phone: ${participant.phone}`, this.margins.left + 120, yPos);
      this.doc.text(`${participant.idType}: ${participant.idNumber}`, this.margins.left + 5, yPos + 8);
    });

    this.currentY += 20 + (participants.length * 20);
  }

  private addPaymentDetails(paymentInfo: PaymentInfo): void {
    this.addSectionHeader('Payment Information');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(11);
    this.doc.setTextColor(55, 65, 81);

    this.doc.text(`Payment ID: ${paymentInfo.paymentId}`, this.margins.left + 5, this.currentY + 12);
    this.doc.text(`Amount: ₹${paymentInfo.amount.toLocaleString()} ${paymentInfo.currency}`, this.margins.left + 5, this.currentY + 20);
    this.doc.text(`Status: ${paymentInfo.status.toUpperCase()}`, this.margins.left + 5, this.currentY + 28);
    
    if (paymentInfo.paidAt) {
      this.doc.text(`Paid At: ${paymentInfo.paidAt.toLocaleString()}`, this.margins.left + 5, this.currentY + 36);
    }

    this.currentY += 50;
  }

  private addSectionHeader(title: string): void {
    this.doc.setFillColor(241, 245, 249);
    this.doc.rect(this.margins.left, this.currentY, this.pageWidth - 40, 12, 'F');

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(12);
    this.doc.setTextColor(30, 41, 59);
    this.doc.text(title, this.margins.left + 5, this.currentY + 8);

    this.currentY += 18;
  }

  private addFooter(): void {
    const footerY = this.pageHeight - 30;

    this.doc.setFillColor(30, 41, 59);
    this.doc.rect(0, footerY, this.pageWidth, 30, 'F');

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.setTextColor(203, 213, 225);
    this.doc.text('Thank you for choosing Himalayan Rides!', this.pageWidth / 2, footerY + 12, { align: 'center' });
    this.doc.text('Contact: info@himalayanrides.com | +91-XXXXXXXXXX', this.pageWidth / 2, footerY + 22, { align: 'center' });
  }
}

// Export the generator instance
export const cleanPDFGenerator = new CleanPDFGenerator();

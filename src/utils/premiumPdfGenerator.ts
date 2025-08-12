import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import QRCode from 'qrcode';
import { Booking } from '../types/booking';

// 🎨 Universal Booking Interface - Works for ALL booking types
interface UniversalBooking {
  id: string;
  type: 'bike-tour' | 'vehicle' | 'experience' | 'curated';
  title: string;
  duration?: string;
  user: {
    name: string;
    email: string;
    phone: string;
  };
  participants: Array<{
    name: string;
    age?: number;
    gender?: string;
    contact?: string;
  }>;
  itinerary?: Array<{
    day: string;
    title: string;
    description: string;
  }>;
  billing: {
    perPerson: number;
    total: number;
    tax: number;
    finalAmount: number;
  };
  dates?: {
    startDate: string;
    endDate: string;
  };
  vehicle?: {
    name: string;
    type: string;
  };
  experience?: {
    location: string;
    highlights: string[];
  };
}

export class PremiumPDFGenerator {
  private doc: jsPDF;
  private booking: UniversalBooking;

  constructor(booking: UniversalBooking) {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.booking = booking;
  }

  // Enhanced QR Code with booking URL
  private async addQRCode(bookingId: string, x: number, y: number, size: number = 40) {
    try {
      const qrData = await QRCode.toDataURL(`https://himalayanrides.com/booking/${bookingId}`, {
        width: size * 3,
        margin: 2,
        color: {
          dark: '#4A1C8D',
          light: '#FFFFFF'
        }
      });
      
      // Add decorative frame around QR code
      this.doc.setFillColor(139, 92, 246);
      this.doc.roundedRect(x - 2, y - 2, size + 4, size + 4, 4, 4, 'F');
      
      this.doc.addImage(qrData, 'PNG', x, y, size, size);
    } catch (error) {
      console.warn('QR Code generation failed:', error);
      // Fallback design
      this.doc.setFillColor(139, 92, 246);
      this.doc.roundedRect(x - 2, y - 2, size + 4, size + 4, 4, 4, 'F');
      this.doc.setTextColor(255, 255, 255);
      this.doc.setFontSize(8);
      this.doc.text('QR CODE', x + size/4, y + size/2);
    }
  }

  // Professional Header with Mountain Background
  private addProfessionalHeader(title: string) {
    // Background mountain gradient
    this.doc.setFillColor(74, 28, 141);
    this.doc.rect(0, 0, 210, 45, 'F');
    
    // Add mountain silhouette layers
    this.doc.setFillColor(99, 47, 168);
    this.doc.rect(0, 35, 210, 10, 'F');
    
    this.doc.setFillColor(139, 92, 246);
    this.doc.rect(0, 40, 210, 5, 'F');
    
    // Header text
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(22);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('HIMALAYAN RIDES', 15, 20);
    
    this.doc.setFontSize(14);
    this.doc.text(title, 15, 32);
  }

  // Enhanced Customer Information Section
  private addCustomerInfo(startY: number): number {
    this.doc.setFillColor(248, 250, 252);
    this.doc.roundedRect(10, startY, 190, 35, 4, 4, 'F');
    
    this.doc.setTextColor(0, 0, 0);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Customer Information', 15, startY + 10);
    
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Name: ${this.booking.user.name}`, 15, startY + 20);
    this.doc.text(`Email: ${this.booking.user.email}`, 15, startY + 27);
    this.doc.text(`Phone: ${this.booking.user.phone}`, 110, startY + 20);
    this.doc.text(`Booking: ${this.booking.id}`, 110, startY + 27);
    
    return startY + 40;
  }

  // Professional Participants Table
  private addParticipantsTable(startY: number): number {
    if (this.booking.participants.length === 0) return startY;
    
    autoTable(this.doc, {
      startY: startY,
      head: [['#', 'Name', 'Age', 'Gender', 'Contact']],
      body: this.booking.participants.map((participant, index) => [
        (index + 1).toString(),
        participant.name,
        participant.age?.toString() || 'N/A',
        participant.gender || 'N/A',
        participant.contact || 'N/A'
      ]),
      theme: 'grid',
      styles: {
        fillColor: [248, 250, 252],
        textColor: [30, 30, 30],
        fontSize: 10,
        cellPadding: 6,
        halign: 'center',
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 11,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
    });
    
    return (this.doc as any).lastAutoTable.finalY + 10;
  }

  // Smart Itinerary with Page Management
  private addItinerary(startY: number): number {
    if (!this.booking.itinerary || this.booking.itinerary.length === 0 || this.booking.type === 'curated') {
      return startY;
    }
    
    let currentY = startY;
    
    // Check if we need a new page
    if (currentY > 200) {
      this.doc.addPage();
      this.addProfessionalHeader('Your Epic Journey Itinerary');
      currentY = 55;
    }
    
    this.doc.setFillColor(168, 85, 247);
    this.doc.roundedRect(10, currentY - 5, 190, 15, 4, 4, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Daily Adventure Plan', 15, currentY + 5);
    
    currentY += 20;
    
    this.booking.itinerary.forEach((day) => {
      // Check if we need a new page
      if (currentY > 250) {
        this.doc.addPage();
        this.addProfessionalHeader('Itinerary (Continued)');
        currentY = 55;
      }
      
      this.doc.setFontSize(12);
      this.doc.setTextColor(168, 85, 247);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${day.day}: ${day.title}`, 15, currentY);
      
      this.doc.setFontSize(10);
      this.doc.setTextColor(80, 80, 80);
      this.doc.setFont('helvetica', 'normal');
      
      // Wrap long descriptions
      const splitText = this.doc.splitTextToSize(day.description, 180);
      this.doc.text(splitText, 20, currentY + 7);
      
      currentY += 7 + (splitText.length * 4) + 8;
    });
    
    return currentY + 10;
  }

  // Enhanced Billing Section
  private addBilling(startY: number): number {
    // Check if we need a new page
    if (startY > 200) {
      this.doc.addPage();
      this.addProfessionalHeader('Investment Summary');
      startY = 55;
    }
    
    autoTable(this.doc, {
      startY: startY,
      head: [['Description', 'Amount (₹)']],
      body: [
        ['Cost per Adventurer', this.booking.billing.perPerson.toLocaleString('en-IN')],
        ['Total Adventurers', this.booking.participants.length.toString()],
        ['Subtotal', this.booking.billing.total.toLocaleString('en-IN')],
        ['Taxes & Fees', this.booking.billing.tax.toLocaleString('en-IN')],
        ['**TOTAL INVESTMENT**', `**₹${this.booking.billing.finalAmount.toLocaleString('en-IN')}**`]
      ],
      theme: 'grid',
      styles: {
        fillColor: [248, 250, 252],
        textColor: [30, 30, 30],
        fontSize: 12,
        cellPadding: 10,
      },
      headStyles: {
        fillColor: [6, 182, 212],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 14,
      },
      alternateRowStyles: {
        fillColor: [255, 255, 255],
      },
      columnStyles: {
        0: { cellWidth: 120 },
        1: { cellWidth: 60, halign: 'right', fontStyle: 'bold' },
      },
    });
    
    return (this.doc as any).lastAutoTable.finalY + 15;
  }

  // Professional Footer
  private addFooter(currentY: number) {
    // Check if we need space for footer
    if (currentY > 240) {
      this.doc.addPage();
      currentY = 50;
    }
    
    this.doc.setFillColor(30, 30, 30);
    this.doc.roundedRect(10, currentY, 190, 40, 8, 8, 'F');
    
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Thank You for Choosing Himalayan Rides!', 15, currentY + 15);
    
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Emergency: +91-9876543210 | Email: support@himalayanrides.com', 15, currentY + 25);
    this.doc.text('Website: www.himalayanrides.com | Follow: @HimalayanRides', 15, currentY + 32);
  }

  async generateBookingConfirmation() {
    try {
      // Professional Header
      this.addProfessionalHeader('Booking Confirmation');
      
      // QR Code in top right
      await this.addQRCode(this.booking.id, 160, 10, 40);
      
      // Booking Overview Card
      let currentY = 55;
      this.doc.setFillColor(245, 245, 250);
      this.doc.roundedRect(10, currentY, 190, 45, 6, 6, 'F');
      
      // Add border
      this.doc.setDrawColor(139, 92, 246);
      this.doc.setLineWidth(0.5);
      this.doc.roundedRect(10, currentY, 190, 45, 6, 6, 'S');
      
      this.doc.setTextColor(0, 0, 0);
      this.doc.setFontSize(16);
      this.doc.setFont('helvetica', 'bold');
      
      // Adventure emoji based on type
      let typePrefix = '';
      switch(this.booking.type) {
        case 'bike-tour': typePrefix = 'Bike Tour: '; break;
        case 'vehicle': typePrefix = 'Vehicle: '; break;
        case 'experience': typePrefix = 'Experience: '; break;
        case 'curated': typePrefix = 'Curated: '; break;
      }
      
      this.doc.text(`${typePrefix}${this.booking.title}`, 15, currentY + 12);
      
      this.doc.setFontSize(11);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(`Type: ${this.booking.type.toUpperCase()}`, 15, currentY + 22);
      if (this.booking.duration) {
        this.doc.text(`Duration: ${this.booking.duration}`, 15, currentY + 30);
      }
      if (this.booking.dates) {
        this.doc.text(`${this.booking.dates.startDate} → ${this.booking.dates.endDate}`, 15, currentY + 38);
      }
      
      currentY += 55;
      
      // Customer Information
      currentY = this.addCustomerInfo(currentY);
      
      // Participants Table
      currentY = this.addParticipantsTable(currentY);
      
      // Vehicle or Experience Details
      if (this.booking.vehicle) {
        this.doc.setFillColor(99, 102, 241);
        this.doc.roundedRect(10, currentY, 190, 25, 4, 4, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Vehicle: ${this.booking.vehicle.name} (${this.booking.vehicle.type})`, 15, currentY + 15);
        
        currentY += 35;
      }
      
      if (this.booking.experience) {
        this.doc.setFillColor(236, 72, 153);
        this.doc.roundedRect(10, currentY, 190, 15 + (this.booking.experience.highlights?.length || 0) * 5, 4, 4, 'F');
        
        this.doc.setTextColor(255, 255, 255);
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'bold');
        this.doc.text(`Location: ${this.booking.experience.location}`, 15, currentY + 10);
        
        if (this.booking.experience.highlights?.length > 0) {
          this.doc.setFontSize(10);
          this.doc.setFont('helvetica', 'normal');
          this.booking.experience.highlights.forEach((highlight, index) => {
            this.doc.text(`• ${highlight}`, 15, currentY + 20 + (index * 5));
          });
        }
        
        currentY += 25 + (this.booking.experience.highlights?.length || 0) * 5;
      }
      
      // Itinerary (smart page management)
      currentY = this.addItinerary(currentY);
      
      // Billing Summary
      currentY = this.addBilling(currentY);
      
      // Professional Footer
      this.addFooter(currentY);
      
      // Save with premium naming
      const fileName = `HimalayanRides-${this.booking.type}-${this.booking.id}.pdf`;
      this.doc.save(fileName);
      
    } catch (error) {
      console.error('PDF Generation Error:', error);
      throw new Error('Failed to generate booking confirmation PDF');
    }
  }
}

// Helper function to convert any booking to UniversalBooking format
export function transformToUniversalBooking(booking: any): UniversalBooking {
  return {
    id: booking.id || `HR-${Date.now()}`,
    type: booking.type || 'experience',
    title: booking.title || booking.name || booking.tourName || 'Himalayan Adventure',
    duration: booking.duration || booking.days,
    user: {
      name: booking.user?.name || booking.userName || 'Guest',
      email: booking.user?.email || booking.userEmail || 'guest@himalayanrides.com',
      phone: booking.user?.phone || booking.userPhone || '+91-0000000000',
    },
    participants: booking.participants || [
      {
        name: booking.user?.name || booking.userName || 'Guest',
        age: 25,
        gender: 'N/A'
      }
    ],
    itinerary: booking.itinerary || [],
    billing: {
      perPerson: booking.pricing?.basePrice || booking.price || 0,
      total: booking.totalAmount || booking.amount || 0,
      tax: booking.tax || 0,
      finalAmount: booking.finalAmount || booking.totalAmount || booking.amount || 0,
    },
    dates: booking.dates ? {
      startDate: booking.dates.startDate || booking.startDate || 'TBD',
      endDate: booking.dates.endDate || booking.endDate || 'TBD',
    } : undefined,
    vehicle: booking.vehicle ? {
      name: booking.vehicle.name || booking.vehicleName || 'Vehicle',
      type: booking.vehicle.type || booking.vehicleType || 'Standard',
    } : undefined,
    experience: booking.experience ? {
      location: booking.experience.location || booking.location || 'Ladakh',
      highlights: booking.experience.highlights || booking.highlights || [],
    } : undefined,
  };
}

// 🎯 Transform unified Booking type to UniversalBooking
export function transformUnifiedBooking(booking: Booking): UniversalBooking {
  return {
    id: booking.id,
    type: booking.type as UniversalBooking['type'],
    title: booking.item.title,
    duration: '7 days', // Could be dynamic based on booking type
    user: booking.userInfo,
    participants: booking.bookingDetails.participants.map(p => ({
      name: p.name,
      age: parseInt(p.age) || undefined,
      gender: 'N/A',
      contact: p.phone
    })),
    billing: {
      perPerson: Math.round(booking.paymentInfo.amount / booking.bookingDetails.participantCount),
      total: booking.paymentInfo.amount,
      tax: Math.round(booking.paymentInfo.amount * 0.18), // 18% GST
      finalAmount: booking.paymentInfo.amount
    },
    dates: {
      startDate: booking.bookingDetails.startDate instanceof Date 
        ? booking.bookingDetails.startDate.toLocaleDateString() 
        : new Date((booking.bookingDetails.startDate as any).seconds * 1000).toLocaleDateString(),
      endDate: booking.bookingDetails.endDate 
        ? (booking.bookingDetails.endDate instanceof Date 
            ? booking.bookingDetails.endDate.toLocaleDateString() 
            : new Date((booking.bookingDetails.endDate as any).seconds * 1000).toLocaleDateString())
        : 'TBD'
    },
    experience: {
      location: 'Ladakh',
      highlights: ['Adventure of a lifetime', 'Breathtaking landscapes', 'Cultural immersion']
    }
  };
}

import { jsPDF } from 'jspdf';

interface TripBooking {
  id: string;
  tripPlanId: string;
  userId: string;
  tripDetails: {
    id: string;
    title: string;
    type: 'tour' | 'vehicle' | 'experience';
    price: number;
    duration?: string;
    image?: string;
    description?: string;
  };
  paymentInfo: {
    paymentId: string;
    orderId?: string;
    amount: number;
    currency: string;
    status: string;
    paidAt: Date;
  };
  bookingDetails: {
    startDate: Date;
    endDate?: Date;
    participantCount: number;
    participants: Array<{
      name: string;
      age: string;
      phone: string;
      email: string;
      idType: string;
      idNumber: string;
    }>;
    primaryContact: {
      name: string;
      phone: string;
      email: string;
    };
    emergencyContact: {
      name: string;
      phone: string;
    };
    specialRequests?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  };
  createdAt: Date;
  updatedAt: Date;
}

export const generateTripPDF = async (trip: TripBooking): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPosition = margin;

    // Header
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('HIMALAYAN RIDES', pageWidth / 2, yPosition, { align: 'center' });
    
    yPosition += 10;
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text('Trip Booking Confirmation', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Trip Details Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Trip Details', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    // Trip Title
    doc.text(`Trip: ${trip.tripDetails.title}`, margin, yPosition);
    yPosition += 8;

    // Trip Type
    doc.text(`Type: ${trip.tripDetails.type.toUpperCase()}`, margin, yPosition);
    yPosition += 8;

    // Duration
    if (trip.tripDetails.duration) {
      doc.text(`Duration: ${trip.tripDetails.duration}`, margin, yPosition);
      yPosition += 8;
    }

    yPosition += 10;

    // Booking Information Section
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 40);
    doc.text('Booking Information', margin, yPosition);
    yPosition += 10;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);

    // Booking ID
    doc.text(`Booking ID: ${trip.id}`, margin, yPosition);
    yPosition += 8;

    // Start Date
    const startDate = trip.bookingDetails.startDate.toLocaleDateString();
    doc.text(`Start Date: ${startDate}`, margin, yPosition);
    yPosition += 8;

    // End Date
    if (trip.bookingDetails.endDate) {
      const endDate = trip.bookingDetails.endDate.toLocaleDateString();
      doc.text(`End Date: ${endDate}`, margin, yPosition);
      yPosition += 8;
    }

    // Participants
    doc.text(`Participants: ${trip.bookingDetails.participantCount}`, margin, yPosition);
    yPosition += 8;

    // Status
    doc.text(`Status: ${trip.bookingDetails.status.toUpperCase()}`, margin, yPosition);
    yPosition += 8;

    // Total Amount
    doc.setFontSize(14);
    doc.setTextColor(40, 40, 40);
    doc.text(`Total Amount: ₹${trip.paymentInfo.amount.toLocaleString()}`, margin, yPosition);
    yPosition += 15;

    // Description
    if (trip.tripDetails.description) {
      doc.setFontSize(16);
      doc.text('Description', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(11);
      doc.setTextColor(60, 60, 60);
      
      // Split long description into multiple lines
      const splitDescription = doc.splitTextToSize(trip.tripDetails.description, pageWidth - (margin * 2));
      doc.text(splitDescription, margin, yPosition);
      yPosition += splitDescription.length * 5;
    }

    yPosition += 20;

    // Footer
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text('Thank you for choosing Himalayan Rides!', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text('For support, contact us at support@himalayanrides.com', pageWidth / 2, yPosition, { align: 'center' });

    // Generated timestamp
    yPosition += 10;
    const generatedDate = new Date().toLocaleString();
    doc.text(`Generated: ${generatedDate}`, pageWidth / 2, yPosition, { align: 'center' });

    // Save the PDF
    const fileName = `himalayan-rides-booking-${trip.id}.pdf`;
    doc.save(fileName);

  } catch (error) {
    console.error('Error generating PDF:', error);
    throw new Error('Failed to generate PDF');
  }
};

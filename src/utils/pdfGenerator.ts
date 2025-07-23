import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
  };
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: Date;
}

export const generateTripPDF = async (trip: TripBooking) => {
  // Create a temporary div for PDF content
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'absolute';
  tempDiv.style.left = '-9999px';
  tempDiv.style.width = '800px';
  tempDiv.style.padding = '40px';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.fontFamily = 'Arial, sans-serif';

  // Create the voucher HTML content
  tempDiv.innerHTML = `
    <div style="width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; margin-bottom: 30px; border-radius: 10px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <h1 style="margin: 0; font-size: 32px; font-weight: bold;">🏔️ Himalayan Rides</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Trip Booking Voucher</p>
        </div>
        <div style="text-align: right;">
          <div style="background: rgba(255,255,255,0.2); padding: 15px; border-radius: 8px;">
            <div style="font-size: 14px; opacity: 0.8;">Booking ID</div>
            <div style="font-size: 18px; font-weight: bold;">${trip.id}</div>
          </div>
        </div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
      <div>
        <h2 style="color: #2d3748; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Trip Details</h2>
        <div style="background: #f7fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h3 style="color: #4a5568; margin: 0 0 15px 0; font-size: 24px;">${trip.tripDetails.title}</h3>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
            <div>
              <strong style="color: #2d3748;">Type:</strong> 
              <span style="color: #4a5568; text-transform: capitalize;">${trip.tripDetails.type}</span>
            </div>
            <div>
              <strong style="color: #2d3748;">Duration:</strong> 
              <span style="color: #4a5568;">${trip.tripDetails.duration || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #2d3748;">Start Date:</strong> 
              <span style="color: #4a5568;">${trip.bookingDetails.startDate.toLocaleDateString()}</span>
            </div>
            <div>
              <strong style="color: #2d3748;">End Date:</strong> 
              <span style="color: #4a5568;">${trip.bookingDetails.endDate?.toLocaleDateString() || 'N/A'}</span>
            </div>
            <div>
              <strong style="color: #2d3748;">Participants:</strong> 
              <span style="color: #4a5568;">${trip.bookingDetails.participantCount} people</span>
            </div>
            <div>
              <strong style="color: #2d3748;">Status:</strong> 
              <span style="color: #38a169; text-transform: uppercase; font-weight: bold;">${trip.status}</span>
            </div>
          </div>
        </div>

        <h3 style="color: #2d3748; margin-bottom: 15px;">Primary Contact</h3>
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
          <div><strong>Name:</strong> ${trip.bookingDetails.primaryContact.name}</div>
          <div><strong>Email:</strong> ${trip.bookingDetails.primaryContact.email}</div>
          <div><strong>Phone:</strong> ${trip.bookingDetails.primaryContact.phone}</div>
        </div>
      </div>

      <div>
        <h2 style="color: #2d3748; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Payment Information</h2>
        <div style="background: linear-gradient(135deg, #48bb78, #38a169); color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 14px; opacity: 0.8; margin-bottom: 5px;">Amount Paid</div>
          <div style="font-size: 28px; font-weight: bold;">₹${trip.paymentInfo.amount.toLocaleString()}</div>
        </div>
        
        <div style="background: #f7fafc; padding: 15px; border-radius: 8px; font-size: 14px;">
          <div style="margin-bottom: 10px;">
            <strong>Payment ID:</strong><br>
            <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${trip.paymentInfo.paymentId}</code>
          </div>
          <div style="margin-bottom: 10px;">
            <strong>Payment Date:</strong><br>
            ${trip.paymentInfo.paidAt.toLocaleDateString()} ${trip.paymentInfo.paidAt.toLocaleTimeString()}
          </div>
          <div>
            <strong>Currency:</strong> ${trip.paymentInfo.currency}
          </div>
        </div>
      </div>
    </div>

    ${trip.bookingDetails.participants.length > 0 ? `
    <div style="margin-bottom: 30px;">
      <h2 style="color: #2d3748; margin-bottom: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Participants</h2>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 15px;">
        ${trip.bookingDetails.participants.map((participant, index) => `
          <div style="background: #f7fafc; padding: 15px; border-radius: 8px;">
            <h4 style="color: #2d3748; margin: 0 0 10px 0;">Participant ${index + 1}</h4>
            <div style="font-size: 14px; line-height: 1.6;">
              <div><strong>Name:</strong> ${participant.name}</div>
              <div><strong>Age:</strong> ${participant.age}</div>
              <div><strong>Phone:</strong> ${participant.phone}</div>
              <div><strong>Email:</strong> ${participant.email || 'N/A'}</div>
              <div><strong>ID Type:</strong> ${participant.idType}</div>
              <div><strong>ID Number:</strong> ${participant.idNumber}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e2e8f0; text-align: center; color: #718096; font-size: 12px;">
      <p>This is an electronic voucher generated on ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
      <p>For any queries, contact us at support@himalayanrides.com | +91 9876543210</p>
      <p style="margin-top: 20px; font-weight: bold; color: #2d3748;">Thank you for choosing Himalayan Rides! Have a safe and memorable journey! 🏔️</p>
    </div>
  `;

  document.body.appendChild(tempDiv);

  try {
    // Generate canvas from the HTML
    const canvas = await html2canvas(tempDiv, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 800,
      height: tempDiv.scrollHeight
    });

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

    // Download the PDF
    const fileName = `himalayan-rides-${trip.tripDetails.title.replace(/\s+/g, '-').toLowerCase()}-${trip.id}.pdf`;
    pdf.save(fileName);

  } finally {
    // Clean up
    document.body.removeChild(tempDiv);
  }
};

// Demo data generator for testing the trips page
// This can be run in the browser console to add test trip data

export const addDemoTrips = (userId: string) => {
  const demoTrips = [
    {
      id: 'trip_demo_1',
      tripPlanId: 'leh-5day',
      userId: userId,
      tripDetails: {
        id: 'leh-5day',
        title: '5-Day Himalayan Circuit Ride',
        type: 'tour',
        price: 10500,
        duration: '5 Days',
        description: 'Experience the ultimate motorcycle adventure through the Himalayas.'
      },
      paymentInfo: {
        paymentId: 'pay_demo_123456789',
        orderId: 'order_demo_987654321',
        amount: 12390,
        currency: 'INR',
        status: 'paid',
        paidAt: new Date('2025-01-15T10:30:00')
      },
      bookingDetails: {
        startDate: new Date('2025-02-15'),
        endDate: new Date('2025-02-20'),
        participantCount: 2,
        participants: [
          {
            name: 'John Doe',
            age: '28',
            phone: '+91 9876543210',
            email: 'john@example.com',
            idType: 'passport',
            idNumber: 'A1234567'
          },
          {
            name: 'Jane Smith',
            age: '26',
            phone: '+91 9876543211',
            email: 'jane@example.com',
            idType: 'aadhar',
            idNumber: '123456789012'
          }
        ],
        primaryContact: {
          name: 'John Doe',
          phone: '+91 9876543210',
          email: 'john@example.com'
        },
        emergencyContact: {
          name: 'Emergency Contact',
          phone: '+91 9876543200'
        },
        specialRequests: 'Vegetarian meals preferred'
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-10T14:20:00')
    },
    {
      id: 'trip_demo_2',
      tripPlanId: 'royal-enfield-himalayan',
      userId: userId,
      tripDetails: {
        id: 'royal-enfield-himalayan',
        title: 'Royal Enfield Himalayan',
        type: 'vehicle',
        price: 2500,
        description: 'Rent our Royal Enfield Himalayan for your adventure.'
      },
      paymentInfo: {
        paymentId: 'pay_demo_987654321',
        orderId: 'order_demo_123456789',
        amount: 2950,
        currency: 'INR',
        status: 'paid',
        paidAt: new Date('2025-01-20T16:45:00')
      },
      bookingDetails: {
        startDate: new Date('2025-03-01'),
        endDate: new Date('2025-03-07'),
        participantCount: 1,
        participants: [
          {
            name: 'Alex Johnson',
            age: '32',
            phone: '+91 9876543220',
            email: 'alex@example.com',
            idType: 'license',
            idNumber: 'DL1234567890'
          }
        ],
        primaryContact: {
          name: 'Alex Johnson',
          phone: '+91 9876543220',
          email: 'alex@example.com'
        },
        emergencyContact: {
          name: 'Emergency Contact 2',
          phone: '+91 9876543222'
        }
      },
      status: 'confirmed',
      createdAt: new Date('2025-01-18T11:30:00')
    }
  ];

  // Store in localStorage
  localStorage.setItem(`trips_${userId}`, JSON.stringify(demoTrips));
  console.log('Demo trips added successfully!');
};

// Usage: Call this function with the current user ID in browser console
// addDemoTrips('1');

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Users, User, Phone, CreditCard, Plus, Minus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { saveTripBooking } from '../../utils/tripStorage';
import toast from 'react-hot-toast';

interface PersonInfo {
  id: string;
  name: string;
  age: string;
  phone: string;
  email: string;
  idType: 'passport' | 'aadhar' | 'license';
  idNumber: string;
}

interface UniversalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    title: string;
    type: 'tour' | 'vehicle' | 'experience';
    price: number;
    duration?: string;
    image?: string;
    description?: string;
  } | null;
}

export function UniversalBookingModal({ isOpen, onClose, item }: UniversalBookingModalProps) {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [bookingData, setBookingData] = useState({
    startDate: '',
    endDate: '',
    participantCount: 1,
    primaryContact: {
      name: user?.name || '',
      phone: user?.phone || '',
      email: user?.email || '',
    },
    emergencyContact: {
      name: '',
      phone: '',
    },
    specialRequests: '',
  });

  const [participants, setParticipants] = useState<PersonInfo[]>([
    {
      id: '1',
      name: user?.name || '',
      age: '',
      phone: user?.phone || '',
      email: user?.email || '',
      idType: 'aadhar',
      idNumber: '',
    }
  ]);

  if (!item) return null;

  const calculateTotal = () => {
    const basePrice = item.price * bookingData.participantCount;
    const tax = basePrice * 0.18; // 18% GST
    return basePrice + tax;
  };

  const handleParticipantCountChange = (newCount: number) => {
    if (newCount < 1 || newCount > 10) return;
    
    setBookingData(prev => ({ ...prev, participantCount: newCount }));
    
    // Adjust participants array
    if (newCount > participants.length) {
      const newParticipants = [...participants];
      for (let i = participants.length; i < newCount; i++) {
        newParticipants.push({
          id: (i + 1).toString(),
          name: '',
          age: '',
          phone: '',
          email: '',
          idType: 'aadhar',
          idNumber: '',
        });
      }
      setParticipants(newParticipants);
    } else {
      setParticipants(participants.slice(0, newCount));
    }
    
    // Sync primary participant data
    if (participants.length > 0) {
      setParticipants(prev => prev.map((p, index) => 
        index === 0 ? {
          ...p,
          name: bookingData.primaryContact.name,
          phone: bookingData.primaryContact.phone,
          email: bookingData.primaryContact.email,
        } : p
      ));
    }
  };

  const updateParticipant = (id: string, field: keyof PersonInfo, value: string) => {
    setParticipants(prev => 
      prev.map(p => p.id === id ? { ...p, [field]: value } : p)
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setBookingData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof typeof prev] as any),
          [child]: value
        }
      }));

      // If updating primary contact, also update first participant
      if (parent === 'primaryContact' && participants.length > 0) {
        const fieldMap: Record<string, string> = {
          'name': 'name',
          'phone': 'phone',
          'email': 'email'
        };
        
        if (fieldMap[child]) {
          setParticipants(prev => prev.map((p, index) => 
            index === 0 ? { ...p, [fieldMap[child]]: value } : p
          ));
        }
      }
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleBookingSubmit = async () => {
    if (!user) return;

    setIsProcessing(true);
    
    try {
      const total = calculateTotal();
      
      const booking = {
        id: Date.now().toString(),
        userId: user.id,
        itemId: item.id,
        itemType: item.type,
        item,
        startDate: new Date(bookingData.startDate),
        endDate: bookingData.endDate ? new Date(bookingData.endDate) : null,
        participantCount: bookingData.participantCount,
        participants,
        primaryContact: bookingData.primaryContact,
        emergencyContact: bookingData.emergencyContact,
        specialRequests: bookingData.specialRequests,
        totalAmount: total,
        baseAmount: item.price * bookingData.participantCount,
        taxAmount: (item.price * bookingData.participantCount) * 0.18,
        status: 'confirmed',
        paymentId: '',
        createdAt: new Date()
      };

      // Initialize Razorpay directly without backend order creation for testing
      initializeRazorpay(booking);
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const initializeRazorpay = (booking: any) => {
    console.log('Initializing Razorpay with booking:', booking);

    // For testing, let's use a simplified approach
    const options = {
      key: 'rzp_test_QAjfeo4L3cO7s8', // Public test key
      amount: Math.round(booking.totalAmount * 100), // Amount in paise
      currency: 'INR',
      name: 'Himalayan Rides',
      description: `${item.title} - ${item.type.toUpperCase()}`,
      image: '/favicon.ico',
      handler: async function (response: any) {
        console.log('Payment successful:', response);
        
        // Save trip using Firebase
        const tripBooking = {
          tripPlanId: item.id,
          userId: booking.userId,
          tripDetails: item,
          paymentInfo: {
            paymentId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id || `order_${Date.now()}`,
            amount: booking.totalAmount,
            currency: 'INR',
            status: 'paid',
            paidAt: new Date()
          },
          bookingDetails: {
            startDate: booking.startDate,
            endDate: booking.endDate,
            participantCount: booking.participantCount,
            participants: booking.participants,
            primaryContact: booking.primaryContact,
            emergencyContact: booking.emergencyContact,
            specialRequests: booking.specialRequests
          },
          status: 'confirmed' as const
        };

        try {
          await saveTripBooking(tripBooking);
          
          toast.success(`🎉 Payment Successful!\n\nPayment ID: ${response.razorpay_payment_id}\nBooking confirmed for ${item.title}\nTotal Amount: ₹${booking.totalAmount.toLocaleString()}`);
          
          onClose();
          resetForm();
          setIsProcessing(false);
          
          // Redirect to Your Trips page
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('navigateToTrips'));
          }, 1000);
        } catch (error) {
          console.error('Error saving trip:', error);
          toast.error('Payment successful but failed to save trip. Please contact support.');
          setIsProcessing(false);
        }
      },
      prefill: {
        name: bookingData.primaryContact.name,
        email: bookingData.primaryContact.email,
        contact: bookingData.primaryContact.phone
      },
      notes: {
        item_id: item.id,
        item_type: item.type,
        participants: bookingData.participantCount.toString()
      },
      theme: {
        color: '#3B82F6'
      },
      modal: {
        ondismiss: function() {
          console.log('Razorpay modal dismissed');
          setIsProcessing(false);
        },
        escape: true,
        backdropClose: false
      }
    };

    // Simplified initialization
    if (typeof window !== 'undefined') {
      if ((window as any).Razorpay) {
        try {
          const razorpay = new (window as any).Razorpay(options);
          razorpay.on('payment.failed', function (response: any) {
            console.error('Payment failed:', response);
            alert(`Payment Failed!\n\nError: ${response.error.description}\nPlease try again.`);
            setIsProcessing(false);
          });
          razorpay.open();
        } catch (error) {
          console.error('Razorpay initialization error:', error);
          // Fallback to demo mode
          setTimeout(async () => {
            const demoResponse = {
              razorpay_payment_id: `pay_demo_${Date.now()}`,
              razorpay_order_id: `order_demo_${Date.now()}`
            };
            
            // Save trip using Firebase
            const tripBooking = {
              tripPlanId: item.id,
              userId: booking.userId,
              tripDetails: item,
              paymentInfo: {
                paymentId: demoResponse.razorpay_payment_id,
                orderId: demoResponse.razorpay_order_id,
                amount: booking.totalAmount,
                currency: 'INR',
                status: 'paid',
                paidAt: new Date()
              },
              bookingDetails: {
                startDate: booking.startDate,
                endDate: booking.endDate,
                participantCount: booking.participantCount,
                participants: booking.participants,
                primaryContact: booking.primaryContact,
                emergencyContact: booking.emergencyContact,
                specialRequests: booking.specialRequests
              },
              status: 'confirmed' as const
            };

            try {
              await saveTripBooking(tripBooking);
              
              toast.success(`🎉 Demo Payment Successful!\\n\\nThis is a demo payment.\\nBooking confirmed for ${item.title}\\nTotal Amount: ₹${booking.totalAmount.toLocaleString()}`);
              
              onClose();
              resetForm();
              setIsProcessing(false);
              
              // Redirect to Your Trips page
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('navigateToTrips'));
              }, 1000);
            } catch (error) {
              console.error('Error saving trip:', error);
              toast.error('Demo payment successful but failed to save trip. Please contact support.');
              setIsProcessing(false);
            }
          }, 1000);
        }
      } else {
        // Load Razorpay script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => {
          try {
            const razorpay = new (window as any).Razorpay(options);
            razorpay.on('payment.failed', function (response: any) {
              console.error('Payment failed:', response);
              alert(`Payment Failed!\n\nError: ${response.error.description}\nPlease try again.`);
              setIsProcessing(false);
            });
            razorpay.open();
          } catch (error) {
            console.error('Razorpay initialization error:', error);
            // Fallback to demo mode
            setTimeout(() => {
              const demoResponse = {
                razorpay_payment_id: `pay_demo_${Date.now()}`,
                razorpay_order_id: `order_demo_${Date.now()}`
              };
              
              // Save trip to localStorage (simulating Firestore)
              const tripBooking = {
                id: booking.id,
                tripPlanId: item.id,
                userId: booking.userId,
                tripDetails: item,
                paymentInfo: {
                  paymentId: demoResponse.razorpay_payment_id,
                  orderId: demoResponse.razorpay_order_id,
                  amount: booking.totalAmount,
                  currency: 'INR',
                  status: 'paid',
                  paidAt: new Date()
                },
                bookingDetails: {
                  startDate: booking.startDate,
                  endDate: booking.endDate,
                  participantCount: booking.participantCount,
                  participants: booking.participants,
                  primaryContact: booking.primaryContact,
                  emergencyContact: booking.emergencyContact,
                  specialRequests: booking.specialRequests
                },
                status: 'confirmed',
                createdAt: new Date()
              };

              // Store in localStorage (in real app, this would be Firestore)
              const existingTrips = JSON.parse(localStorage.getItem(`trips_${booking.userId}`) || '[]');
              existingTrips.push(tripBooking);
              localStorage.setItem(`trips_${booking.userId}`, JSON.stringify(existingTrips));

              alert(`🎉 Demo Payment Successful!\n\nThis is a demo payment (script failed to load).\nBooking confirmed for ${item.title}\nTotal Amount: ₹${booking.totalAmount.toLocaleString()}\n\nRedirecting to Your Trips...`);
              onClose();
              resetForm();
              setIsProcessing(false);
              
              // Redirect to Your Trips page
              setTimeout(() => {
                window.dispatchEvent(new CustomEvent('navigateToTrips'));
              }, 1000);
            }, 1000);
          }
        };
        script.onerror = () => {
          console.error('Failed to load Razorpay script');
          // Fallback to demo mode
          const demoResponse = {
            razorpay_payment_id: `pay_demo_${Date.now()}`,
            razorpay_order_id: `order_demo_${Date.now()}`
          };
          
          // Save trip to localStorage (simulating Firestore)
          const tripBooking = {
            id: booking.id,
            tripPlanId: item.id,
            userId: booking.userId,
            tripDetails: item,
            paymentInfo: {
              paymentId: demoResponse.razorpay_payment_id,
              orderId: demoResponse.razorpay_order_id,
              amount: booking.totalAmount,
              currency: 'INR',
              status: 'paid',
              paidAt: new Date()
            },
            bookingDetails: {
              startDate: booking.startDate,
              endDate: booking.endDate,
              participantCount: booking.participantCount,
              participants: booking.participants,
              primaryContact: booking.primaryContact,
              emergencyContact: booking.emergencyContact,
              specialRequests: booking.specialRequests
            },
            status: 'confirmed',
            createdAt: new Date()
          };

          // Store in localStorage (in real app, this would be Firestore)
          const existingTrips = JSON.parse(localStorage.getItem(`trips_${booking.userId}`) || '[]');
          existingTrips.push(tripBooking);
          localStorage.setItem(`trips_${booking.userId}`, JSON.stringify(existingTrips));

          alert(`🎉 Demo Payment Successful!\n\nThis is a demo payment (script failed to load).\nBooking confirmed for ${item.title}\nTotal Amount: ₹${booking.totalAmount.toLocaleString()}\n\nRedirecting to Your Trips...`);
          onClose();
          resetForm();
          setIsProcessing(false);
          
          // Redirect to Your Trips page
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('navigateToTrips'));
          }, 1000);
        };
        document.head.appendChild(script);
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setBookingData({
      startDate: '',
      endDate: '',
      participantCount: 1,
      primaryContact: {
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
      },
      emergencyContact: {
        name: '',
        phone: '',
      },
      specialRequests: '',
    });
    setParticipants([{
      id: '1',
      name: user?.name || '',
      age: '',
      phone: user?.phone || '',
      email: user?.email || '',
      idType: 'aadhar',
      idNumber: '',
    }]);
  };

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const isFormValid = () => {
    if (step === 1) {
      const basicDetailsValid = bookingData.startDate && 
             bookingData.primaryContact.name && 
             bookingData.primaryContact.phone && 
             bookingData.primaryContact.email &&
             bookingData.emergencyContact.name &&
             bookingData.emergencyContact.phone;
      
      // For single participant, also validate verification details
      if (bookingData.participantCount === 1) {
        return basicDetailsValid && 
               participants[0]?.age && 
               participants[0]?.idNumber;
      }
      
      return basicDetailsValid;
    }
    
    if (step === 2) {
      // Only validate additional participants (skip first one)
      return participants.slice(1).every(p => p.name && p.age && p.phone && p.idNumber);
    }
    
    return true;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto"
          onClick={onClose}
        >
          <div className="flex items-center justify-center min-h-full w-full">
            <GlassCard 
              className="w-full max-w-4xl my-8 relative"
              hover={false}
              onClick={handleModalClick}
            >
              <div className="p-6">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 text-white/60 hover:text-white z-10"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Book {item.title}</h2>
                  <div className="flex items-center gap-4 text-white/80">
                    <span className="bg-blue-500/20 px-3 py-1 rounded-full text-xs uppercase">
                      {item.type}
                    </span>
                    <span>₹{item.price.toLocaleString()}/person</span>
                    {item.duration && (
                      <>
                        <span>•</span>
                        <span>{item.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Step Progress */}
                <div className="flex items-center justify-center mb-8">
                  <div className="flex items-center space-x-4">
                    {(bookingData.participantCount === 1 ? [1, 2] : [1, 2, 3]).map((stepNumber, index, array) => (
                      <div key={stepNumber} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          (bookingData.participantCount === 1 ? 
                            (step >= (stepNumber === 2 ? 3 : stepNumber)) : 
                            (step >= stepNumber)
                          ) ? 'bg-blue-500 text-white' : 'bg-white/20 text-white/60'
                        }`}>
                          {bookingData.participantCount === 1 && stepNumber === 2 ? '2' : stepNumber}
                        </div>
                        {index < array.length - 1 && (
                          <div className={`w-16 h-1 mx-2 ${
                            (bookingData.participantCount === 1 ? 
                              (step > (stepNumber === 1 ? 1 : 2)) : 
                              (step > stepNumber)
                            ) ? 'bg-blue-500' : 'bg-white/20'
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Step 1: Basic Details */}
                {step === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Booking Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white mb-2 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Start Date *
                        </label>
                        <input
                          type="date"
                          name="startDate"
                          value={bookingData.startDate}
                          onChange={handleInputChange}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                          required
                        />
                      </div>
                      
                      {item.type === 'vehicle' && (
                        <div>
                          <label className="block text-white mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            End Date *
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={bookingData.endDate}
                            onChange={handleInputChange}
                            min={bookingData.startDate || new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                      )}

                      <div className="md:col-span-2">
                        <label className="block text-white mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Number of Participants *
                        </label>
                        <div className="flex items-center space-x-4">
                          <button
                            type="button"
                            onClick={() => handleParticipantCountChange(bookingData.participantCount - 1)}
                            disabled={bookingData.participantCount <= 1}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:bg-white/20 transition-colors flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-2xl font-bold text-white min-w-[3rem] text-center">
                            {bookingData.participantCount}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleParticipantCountChange(bookingData.participantCount + 1)}
                            disabled={bookingData.participantCount >= 10}
                            className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg text-white disabled:opacity-50 hover:bg-white/20 transition-colors flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <div className="text-white/80 text-sm">
                            (Max 10 people)
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Primary Contact */}
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Primary Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 mb-2">Full Name *</label>
                          <input
                            type="text"
                            name="primaryContact.name"
                            value={bookingData.primaryContact.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">Phone Number *</label>
                          <input
                            type="tel"
                            name="primaryContact.phone"
                            value={bookingData.primaryContact.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-white/80 mb-2">Email Address *</label>
                          <input
                            type="email"
                            name="primaryContact.email"
                            value={bookingData.primaryContact.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                        
                        {/* Verification Details for Single Participant */}
                        {bookingData.participantCount === 1 && (
                          <>
                            <div>
                              <label className="block text-white/80 mb-2">Age *</label>
                              <input
                                type="number"
                                value={participants[0]?.age || ''}
                                onChange={(e) => updateParticipant('1', 'age', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                                min="1"
                                max="100"
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">ID Type *</label>
                              <select
                                value={participants[0]?.idType || 'aadhar'}
                                onChange={(e) => updateParticipant('1', 'idType', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                                required
                              >
                                <option value="aadhar">Aadhar Card</option>
                                <option value="passport">Passport</option>
                                <option value="license">Driving License</option>
                              </select>
                            </div>
                            <div className="md:col-span-2">
                              <label className="block text-white/80 mb-2">ID Number *</label>
                              <input
                                type="text"
                                value={participants[0]?.idNumber || ''}
                                onChange={(e) => updateParticipant('1', 'idNumber', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                                placeholder="Enter your ID number"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-white/10 rounded-xl p-4">
                      <h4 className="text-white font-bold mb-3 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Emergency Contact
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white/80 mb-2">Emergency Contact Name *</label>
                          <input
                            type="text"
                            name="emergencyContact.name"
                            value={bookingData.emergencyContact.name}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-white/80 mb-2">Emergency Contact Phone *</label>
                          <input
                            type="tel"
                            name="emergencyContact.phone"
                            value={bookingData.emergencyContact.phone}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    {/* Cost Breakdown */}
                    <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-xl p-4">
                      <h4 className="text-white font-bold mb-3">Cost Breakdown</h4>
                      <div className="space-y-2 text-white/80">
                        <div className="flex justify-between">
                          <span>Base Cost ({bookingData.participantCount} × ₹{item.price.toLocaleString()}):</span>
                          <span>₹{(item.price * bookingData.participantCount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%):</span>
                          <span>₹{((item.price * bookingData.participantCount) * 0.18).toLocaleString()}</span>
                        </div>
                        <hr className="border-white/20" />
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total Amount:</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => bookingData.participantCount === 1 ? setStep(3) : setStep(2)}
                      className="w-full"
                      disabled={!isFormValid()}
                    >
                      {bookingData.participantCount === 1 ? 'Continue to Payment' : 'Continue to Participant Details'}
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Additional Participant Details */}
                {step === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Additional Participant Information</h3>
                    <p className="text-white/80 mb-4">
                      Please provide details for the additional {bookingData.participantCount - 1} participant(s). 
                      Primary contact details have already been captured.
                    </p>
                    
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {participants.slice(1).map((participant, index) => (
                        <div key={participant.id} className="bg-white/10 rounded-xl p-4">
                          <h5 className="text-white font-semibold mb-3">
                            Participant {index + 2}
                          </h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/80 mb-2">Full Name *</label>
                              <input
                                type="text"
                                value={participant.name}
                                onChange={(e) => updateParticipant(participant.id, 'name', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">Age *</label>
                              <input
                                type="number"
                                value={participant.age}
                                onChange={(e) => updateParticipant(participant.id, 'age', e.target.value)}
                                min="1"
                                max="100"
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">Phone Number *</label>
                              <input
                                type="tel"
                                value={participant.phone}
                                onChange={(e) => updateParticipant(participant.id, 'phone', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">Email</label>
                              <input
                                type="email"
                                value={participant.email}
                                onChange={(e) => updateParticipant(participant.id, 'email', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                              />
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">ID Type *</label>
                              <select
                                value={participant.idType}
                                onChange={(e) => updateParticipant(participant.id, 'idType', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                                required
                              >
                                <option value="aadhar">Aadhar Card</option>
                                <option value="passport">Passport</option>
                                <option value="license">Driving License</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-white/80 mb-2">ID Number *</label>
                              <input
                                type="text"
                                value={participant.idNumber}
                                onChange={(e) => updateParticipant(participant.id, 'idNumber', e.target.value)}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                                required
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-white/80 mb-2">Special Requests</label>
                      <textarea
                        name="specialRequests"
                        value={bookingData.specialRequests}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:border-white/40"
                        placeholder="Any special requirements or requests..."
                      />
                    </div>

                    <div className="flex gap-4">
                      <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                        Back
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        className="flex-1"
                        disabled={!isFormValid()}
                      >
                        Continue to Payment
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Payment Summary */}
                {step === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="space-y-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                      <CreditCard className="w-5 h-5" />
                      Payment Summary
                    </h3>
                    
                    <div className="bg-white/10 rounded-xl p-6">
                      <div className="space-y-3 text-white/80">
                        <div className="flex justify-between">
                          <span>Service:</span>
                          <span className="text-white">{item.title}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Type:</span>
                          <span className="text-white capitalize">{item.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Start Date:</span>
                          <span className="text-white">{new Date(bookingData.startDate).toLocaleDateString()}</span>
                        </div>
                        {bookingData.endDate && (
                          <div className="flex justify-between">
                            <span>End Date:</span>
                            <span className="text-white">{new Date(bookingData.endDate).toLocaleDateString()}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Participants:</span>
                          <span className="text-white">{bookingData.participantCount} people</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Primary Contact:</span>
                          <span className="text-white">{bookingData.primaryContact.name}</span>
                        </div>
                        <hr className="border-white/20" />
                        <div className="flex justify-between">
                          <span>Base Amount:</span>
                          <span className="text-white">₹{(item.price * bookingData.participantCount).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>GST (18%):</span>
                          <span className="text-white">₹{((item.price * bookingData.participantCount) * 0.18).toLocaleString()}</span>
                        </div>
                        <hr className="border-white/20" />
                        <div className="flex justify-between text-white font-bold text-lg">
                          <span>Total Amount:</span>
                          <span>₹{calculateTotal().toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-orange-500 to-pink-500 p-6 rounded-xl text-white">
                      <h4 className="font-bold mb-2">Razorpay Payment Gateway</h4>
                      <p className="text-sm opacity-90 mb-4">
                        Secure payment powered by Razorpay. Your payment information is encrypted and secure.
                      </p>
                      <div className="text-xs opacity-75">
                        Test Mode: Use any UPI ID or card 4111 1111 1111 1111
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="secondary" onClick={() => setStep(bookingData.participantCount === 1 ? 1 : 2)} className="flex-1">
                        Back
                      </Button>
                      <Button 
                        onClick={handleBookingSubmit} 
                        className="flex-1"
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Processing...' : `Pay ₹${calculateTotal().toLocaleString()}`}
                      </Button>
                    </div>
                  </motion.div>
                )}
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

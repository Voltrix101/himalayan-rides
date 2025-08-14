import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, CreditCard, Download, Clock, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import toast from 'react-hot-toast';

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

export function YourTrips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState<TripBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingPDF, setDownloadingPDF] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrips = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // First check localStorage for demo data (backwards compatibility)
        const storedTrips = localStorage.getItem(`trips_${user.id}`);
        
        if (storedTrips) {
          const parsedTrips = JSON.parse(storedTrips).map((trip: any) => ({
            ...trip,
            createdAt: new Date(trip.createdAt),
            paymentInfo: {
              ...trip.paymentInfo,
              paidAt: new Date(trip.paymentInfo.paidAt)
            },
            bookingDetails: {
              ...trip.bookingDetails,
              startDate: new Date(trip.bookingDetails.startDate),
              endDate: trip.bookingDetails.endDate ? new Date(trip.bookingDetails.endDate) : undefined
            }
          }));
          setTrips(parsedTrips);
        } else {
          // Fetch from Firebase Firestore
          const firebaseTrips = await authService.getUserTrips(user.id);
          setTrips(firebaseTrips);
        }
      } catch (error) {
        console.error('Error fetching trips:', error);
        toast.error('Failed to load your trips');
        toast.error('Failed to load your trips');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchTrips();
    }
  }, [user]);

  const handleDownloadPDF = async (trip: TripBooking) => {
    setDownloadingPDF(trip.id);
    try {
      // Call backend service to generate and email PDF
      const response = await fetch('/api/generateTripPDF', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: trip.id,
          email: trip.bookingDetails.primaryContact.email,
        }),
      });

      if (response.ok) {
        toast.success('Trip details PDF has been sent to your email!');
      } else {
        throw new Error('Failed to generate PDF');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF. Please try again.');
    } finally {
      setDownloadingPDF(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-green-400';
      case 'pending': return 'text-yellow-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <Star className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white/80">Loading your trips...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-12">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">Your Trips</h1>
          <p className="text-white/80 text-lg">
            Manage your booked adventures and download your trip vouchers
          </p>
        </motion.div>

        {trips.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <GlassCard className="max-w-md mx-auto p-8">
              <MapPin className="w-16 h-16 text-white/40 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">No trips booked yet</h3>
              <p className="text-white/80 mb-6">
                Start planning your Himalayan adventure! Browse our amazing tours and vehicles.
              </p>
              <Button onClick={() => window.history.back()}>
                Explore Tours
              </Button>
            </GlassCard>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trips.map((trip, index) => (
              <motion.div
                key={trip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-6 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white mb-2">
                        {trip.tripDetails.title}
                      </h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 capitalize">
                        {trip.tripDetails.type}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(trip.status)}`}>
                      {getStatusIcon(trip.status)}
                      <span className="text-sm font-medium capitalize">{trip.status}</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-white/80">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {trip.bookingDetails.startDate.toLocaleDateString()}
                        {trip.bookingDetails.endDate && 
                          ` - ${trip.bookingDetails.endDate.toLocaleDateString()}`
                        }
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/80">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{trip.bookingDetails.participantCount} participants</span>
                    </div>

                    {trip.tripDetails.duration && (
                      <div className="flex items-center gap-2 text-white/80">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{trip.tripDetails.duration}</span>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      Payment Details
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Amount Paid:</span>
                        <span className="text-white font-medium">
                          ₹{trip.paymentInfo.amount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Payment ID:</span>
                        <span className="text-white font-mono text-xs">
                          {trip.paymentInfo.paymentId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Payment Date:</span>
                        <span className="text-white">
                          {trip.paymentInfo.paidAt.toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Status:</span>
                        <span className="text-green-400 font-medium">
                          {trip.paymentInfo.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/10 rounded-xl p-4 mb-6">
                    <h4 className="text-white font-semibold mb-3">Primary Contact</h4>
                    <div className="space-y-1 text-sm">
                      <div className="text-white">{trip.bookingDetails.primaryContact.name}</div>
                      <div className="text-white/70">{trip.bookingDetails.primaryContact.email}</div>
                      <div className="text-white/70">{trip.bookingDetails.primaryContact.phone}</div>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleDownloadPDF(trip)}
                    className="w-full"
                    disabled={downloadingPDF === trip.id}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {downloadingPDF === trip.id ? 'Generating PDF...' : 'Download Trip Voucher'}
                  </Button>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

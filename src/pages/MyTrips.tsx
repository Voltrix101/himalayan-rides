import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Download, Eye, Clock, CreditCard, AlertCircle } from 'lucide-react';
import { OptimizedGlass } from '../components/ui/OptimizedGlass';
import { useApp } from '../context/AppContext';
import { db } from '../config/firebase';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { Booking } from '../types';
import toast from 'react-hot-toast';

const MyTrips: React.FC = () => {
  const { state } = useApp();
  const user = state.user;
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // Listen to user's bookings
    const q = query(
      collection(db, 'bookings'),
      where('userId', '==', user.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userBookings: Booking[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        // Convert Firestore timestamps to Date objects
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        startDate: doc.data().startDate?.toDate() || new Date(),
        endDate: doc.data().endDate?.toDate() || new Date(),
      })) as Booking[];

      setBookings(userBookings);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load your trips');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-400 bg-green-400/20';
      case 'pending_payment':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'draft':
        return 'text-gray-400 bg-gray-400/20';
      case 'failed':
        return 'text-red-400 bg-red-400/20';
      case 'refunded':
        return 'text-purple-400 bg-purple-400/20';
      case 'completed':
        return 'text-blue-400 bg-blue-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CreditCard className="w-4 h-4" />;
      case 'pending_payment':
        return <Clock className="w-4 h-4" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleDownload = (url: string, filename: string) => {
    if (!url) {
      toast.error('Document not available yet');
      return;
    }
    
    window.open(url, '_blank');
    toast.success(`Opening ${filename}...`);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
        <OptimizedGlass intensity="medium" className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Login</h2>
          <p className="text-white/70">You need to login to view your trips.</p>
        </OptimizedGlass>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 pt-20">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">My Trips</h1>
          <p className="text-white/70">Manage your bookings and download trip documents</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <OptimizedGlass key={i} intensity="medium" className="bg-white/10 border border-white/20 rounded-xl p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-white/20 rounded mb-4"></div>
                  <div className="h-4 bg-white/20 rounded mb-2"></div>
                  <div className="h-4 bg-white/20 rounded mb-4"></div>
                  <div className="h-10 bg-white/20 rounded"></div>
                </div>
              </OptimizedGlass>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <OptimizedGlass intensity="medium" className="bg-white/10 border border-white/20 rounded-xl p-8 text-center">
            <div className="text-6xl mb-4">🏔️</div>
            <h3 className="text-xl font-semibold text-white mb-2">No trips yet!</h3>
            <p className="text-white/70 mb-6">
              Ready for your first Himalayan adventure? Browse our experiences and book your dream trip.
            </p>
            <button
              onClick={() => window.location.href = '/#explore'}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
            >
              Explore Adventures
            </button>
          </OptimizedGlass>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {bookings.map((booking, index) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <OptimizedGlass intensity="medium" className="bg-white/10 border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {getStatusIcon(booking.status)}
                      {booking.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <span className="text-xs text-white/50">
                      #{booking.id.slice(-6)}
                    </span>
                  </div>

                  {/* Trip Details */}
                  <h3 className="text-lg font-semibold text-white mb-3">
                    {booking.experienceTitle || 'Adventure Experience'}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-2 text-white/70">
                      <Calendar className="w-4 h-4" />
                      <span className="text-sm">
                        {booking.startDate.toLocaleDateString('en-IN', { 
                          weekday: 'short', 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/70">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">{booking.pickupLocation}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-white/70">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{booking.participants} participants</span>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="bg-white/5 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Total Amount</span>
                      <span className="text-white font-semibold">
                        ₹{booking.totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Download Buttons */}
                  {booking.status === 'confirmed' && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-white/80 mb-2">Documents</h4>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleDownload(booking.invoiceUrl || '', 'Invoice')}
                          disabled={!booking.invoiceUrl}
                          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download className="w-4 h-4" />
                          Invoice
                        </button>
                        <button
                          onClick={() => handleDownload(booking.tripDetailsUrl || '', 'Trip Details')}
                          disabled={!booking.tripDetailsUrl}
                          className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white text-sm py-2 px-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Eye className="w-4 h-4" />
                          Details
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Booking Date */}
                  <div className="mt-4 pt-4 border-t border-white/20">
                    <span className="text-xs text-white/50">
                      Booked on {booking.createdAt.toLocaleDateString('en-IN')}
                    </span>
                  </div>
                </OptimizedGlass>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyTrips;

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit3,
  Calendar,
  User,
  MapPin,
  DollarSign
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import toast from 'react-hot-toast';

interface BookingData {
  id: string;
  userEmail: string;
  userName: string;
  tripName: string;
  bookingDate: Date;
  startDate: Date;
  endDate?: Date;
  participants: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  amount: number;
  paymentId?: string;
  tripDetails: any;
  contactInfo: any;
}

export function BookingsPage() {
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<BookingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<BookingData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchTerm, statusFilter]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsData = await loadBookingsData();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsData = async (): Promise<BookingData[]> => {
    try {
      // Try Firestore first
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userEmail: data.userEmail || 'Unknown',
            userName: data.userName || data.bookingDetails?.primaryContact?.name || 'Unknown User',
            tripName: data.tripDetails?.title || 'Unknown Trip',
            bookingDate: data.createdAt?.toDate() || new Date(),
            startDate: data.bookingDetails?.startDate?.toDate() || new Date(),
            endDate: data.bookingDetails?.endDate?.toDate(),
            participants: data.bookingDetails?.participantCount || 1,
            status: data.status || 'pending',
            amount: data.paymentInfo?.amount || data.totalAmount || 0,
            paymentId: data.paymentInfo?.paymentId,
            tripDetails: data.tripDetails,
            contactInfo: data.bookingDetails?.primaryContact
          };
        });
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
    }

    // Fallback to localStorage
    const allBookings: BookingData[] = [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    users.forEach((user: any) => {
      const userTrips = JSON.parse(localStorage.getItem(`trips_${user.id}`) || '[]');
      userTrips.forEach((trip: any) => {
        allBookings.push({
          id: trip.id,
          userEmail: user.email || 'Unknown',
          userName: trip.bookingDetails?.primaryContact?.name || user.name || 'Unknown User',
          tripName: trip.tripDetails?.title || 'Unknown Trip',
          bookingDate: trip.createdAt ? new Date(trip.createdAt) : new Date(),
          startDate: trip.bookingDetails?.startDate ? new Date(trip.bookingDetails.startDate) : new Date(),
          endDate: trip.bookingDetails?.endDate ? new Date(trip.bookingDetails.endDate) : undefined,
          participants: trip.bookingDetails?.participantCount || 1,
          status: trip.status || 'confirmed',
          amount: trip.paymentInfo?.amount || 0,
          paymentId: trip.paymentInfo?.paymentId,
          tripDetails: trip.tripDetails,
          contactInfo: trip.bookingDetails?.primaryContact
        });
      });
    });

    return allBookings.sort((a, b) => b.bookingDate.getTime() - a.bookingDate.getTime());
  };

  const filterBookings = () => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(booking =>
        booking.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking.tripName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    setFilteredBookings(filtered);
  };

  const updateBookingStatus = async (bookingId: string, newStatus: BookingData['status']) => {
    try {
      // Update in Firestore if available
      try {
        const bookingRef = doc(db, 'bookings', bookingId);
        await updateDoc(bookingRef, { status: newStatus });
      } catch (error) {
        // Fallback to localStorage update
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        users.forEach((user: any) => {
          const userTrips = JSON.parse(localStorage.getItem(`trips_${user.id}`) || '[]');
          const tripIndex = userTrips.findIndex((trip: any) => trip.id === bookingId);
          if (tripIndex !== -1) {
            userTrips[tripIndex].status = newStatus;
            localStorage.setItem(`trips_${user.id}`, JSON.stringify(userTrips));
          }
        });
      }

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId ? { ...booking, status: newStatus } : booking
      ));

      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  const downloadVoucher = (booking: BookingData) => {
    // Simple voucher generation
    const voucherContent = `
HIMALAYAN RIDES - BOOKING VOUCHER
================================

Booking ID: ${booking.id}
Customer: ${booking.userName}
Email: ${booking.userEmail}
Trip: ${booking.tripName}
Booking Date: ${booking.bookingDate.toLocaleDateString()}
Start Date: ${booking.startDate.toLocaleDateString()}
${booking.endDate ? `End Date: ${booking.endDate.toLocaleDateString()}` : ''}
Participants: ${booking.participants}
Amount Paid: ₹${booking.amount.toLocaleString()}
Status: ${booking.status.toUpperCase()}
${booking.paymentId ? `Payment ID: ${booking.paymentId}` : ''}

Thank you for choosing Himalayan Rides!
    `;

    const element = document.createElement('a');
    const file = new Blob([voucherContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `voucher-${booking.id}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    toast.success('Voucher downloaded successfully');
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'active':
        return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      case 'completed':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20 border-red-500/30';
      default:
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
        <GlassCard className="animate-pulse">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Bookings Management</h1>
        <p className="text-white/60">View and manage all customer bookings</p>
      </div>

      {/* Filters */}
      <GlassCard>
        <div className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer name, email, or trip..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:border-white/40 appearance-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Bookings Table */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              All Bookings ({filteredBookings.length})
            </h2>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No bookings found</p>
              <p className="text-white/40">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'Bookings will appear here once customers start booking'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-medium pb-3">Customer</th>
                    <th className="text-left text-white/60 font-medium pb-3">Trip</th>
                    <th className="text-left text-white/60 font-medium pb-3">Dates</th>
                    <th className="text-left text-white/60 font-medium pb-3">Participants</th>
                    <th className="text-left text-white/60 font-medium pb-3">Status</th>
                    <th className="text-right text-white/60 font-medium pb-3">Amount</th>
                    <th className="text-center text-white/60 font-medium pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium">{booking.userName}</p>
                          <p className="text-white/60 text-sm">{booking.userEmail}</p>
                        </div>
                      </td>
                      <td className="py-4 text-white/80">{booking.tripName}</td>
                      <td className="py-4">
                        <div className="text-white/80 text-sm">
                          <p>Start: {booking.startDate.toLocaleDateString()}</p>
                          {booking.endDate && (
                            <p>End: {booking.endDate.toLocaleDateString()}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-white/80">{booking.participants}</td>
                      <td className="py-4">
                        <select
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value as BookingData['status'])}
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(booking.status)} focus:outline-none focus:ring-2 focus:ring-white/20`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-4 text-right text-white font-medium">
                        ₹{booking.amount.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => downloadVoucher(booking)}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="Download Voucher"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Booking Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Customer Information
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p className="text-white"><span className="text-white/60">Name:</span> {selectedBooking.userName}</p>
                      <p className="text-white"><span className="text-white/60">Email:</span> {selectedBooking.userEmail}</p>
                      {selectedBooking.contactInfo?.phone && (
                        <p className="text-white"><span className="text-white/60">Phone:</span> {selectedBooking.contactInfo.phone}</p>
                      )}
                    </div>
                  </div>

                  {/* Trip Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Trip Information
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p className="text-white"><span className="text-white/60">Trip:</span> {selectedBooking.tripName}</p>
                      <p className="text-white"><span className="text-white/60">Start Date:</span> {selectedBooking.startDate.toLocaleDateString()}</p>
                      {selectedBooking.endDate && (
                        <p className="text-white"><span className="text-white/60">End Date:</span> {selectedBooking.endDate.toLocaleDateString()}</p>
                      )}
                      <p className="text-white"><span className="text-white/60">Participants:</span> {selectedBooking.participants}</p>
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      Payment Information
                    </h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-2">
                      <p className="text-white"><span className="text-white/60">Amount:</span> ₹{selectedBooking.amount.toLocaleString()}</p>
                      {selectedBooking.paymentId && (
                        <p className="text-white"><span className="text-white/60">Payment ID:</span> {selectedBooking.paymentId}</p>
                      )}
                      <p className="text-white">
                        <span className="text-white/60">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedBooking.status)}`}>
                          {selectedBooking.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => downloadVoucher(selectedBooking)}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Voucher
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}

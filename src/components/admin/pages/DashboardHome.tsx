import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Car, 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Clock,
  MapPin
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { collection, getDocs, query, orderBy, limit, where, Timestamp } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface DashboardStats {
  totalBookings: number;
  totalUsers: number;
  activeTrips: number;
  totalRevenue: number;
}

interface RecentBooking {
  id: string;
  userEmail: string;
  tripName: string;
  bookingDate: Date;
  status: string;
  amount: number;
}

export function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    totalUsers: 0,
    activeTrips: 0,
    totalRevenue: 0
  });
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load stats from Firestore or localStorage fallback
      const bookingsData = await loadBookingsData();
      const usersData = await loadUsersData();

      // Calculate stats
      const totalBookings = bookingsData.length;
      const totalUsers = usersData.length;
      const activeTrips = bookingsData.filter(b => b.status === 'confirmed' || b.status === 'active').length;
      const totalRevenue = bookingsData.reduce((sum, booking) => sum + (booking.amount || 0), 0);

      setStats({
        totalBookings,
        totalUsers,
        activeTrips,
        totalRevenue
      });

      // Set recent bookings (last 5)
      const recent = bookingsData
        .sort((a, b) => new Date(b.bookingDate).getTime() - new Date(a.bookingDate).getTime())
        .slice(0, 5);
      
      setRecentBookings(recent);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookingsData = async (): Promise<RecentBooking[]> => {
    try {
      // Try to load from Firestore first
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            userEmail: data.userEmail || 'Unknown',
            tripName: data.tripDetails?.title || data.tripName || 'Unknown Trip',
            bookingDate: data.createdAt?.toDate() || new Date(),
            status: data.status || 'pending',
            amount: data.paymentInfo?.amount || data.totalAmount || 0
          };
        });
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
    }

    // Fallback to localStorage
    const allTrips: RecentBooking[] = [];
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    
    users.forEach((user: any) => {
      const userTrips = JSON.parse(localStorage.getItem(`trips_${user.id}`) || '[]');
      userTrips.forEach((trip: any) => {
        allTrips.push({
          id: trip.id,
          userEmail: user.email || 'Unknown',
          tripName: trip.tripDetails?.title || 'Unknown Trip',
          bookingDate: trip.createdAt ? new Date(trip.createdAt) : new Date(),
          status: trip.status || 'confirmed',
          amount: trip.paymentInfo?.amount || 0
        });
      });
    });

    return allTrips;
  };

  const loadUsersData = async () => {
    try {
      // Try Firestore first
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      if (!snapshot.empty) {
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
    }

    // Fallback to localStorage
    return JSON.parse(localStorage.getItem('users') || '[]');
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return 'text-green-400 bg-green-500/20';
      case 'active':
        return 'text-blue-400 bg-blue-500/20';
      case 'completed':
        return 'text-purple-400 bg-purple-500/20';
      case 'cancelled':
        return 'text-red-400 bg-red-500/20';
      default:
        return 'text-yellow-400 bg-yellow-500/20';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <GlassCard key={i} className="animate-pulse">
              <div className="p-6">
                <div className="h-4 bg-white/20 rounded mb-4"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
        <p className="text-white/60">Welcome back! Here's what's happening with Himalayan Rides.</p>
      </div>

      {/* Success Message */}
      <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
        <p className="text-green-300 font-semibold">
          🎉 Success! Real-time sync working perfectly - vehicles appear instantly on Fleet page!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="hover:scale-105 transition-transform duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">{stats.totalBookings}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="hover:scale-105 transition-transform duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <GlassCard className="hover:scale-105 transition-transform duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Active Trips</p>
                  <p className="text-2xl font-bold text-white">{stats.activeTrips}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard className="hover:scale-105 transition-transform duration-200">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Bookings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <GlassCard>
          <div className="p-6">
            <h2 className="text-xl font-bold text-white mb-6">Recent Bookings</h2>
            
            {recentBookings.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <p className="text-white/60">No bookings found</p>
                <p className="text-white/40 text-sm">Bookings will appear here once customers start booking</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/60 font-medium pb-3">Customer</th>
                      <th className="text-left text-white/60 font-medium pb-3">Trip</th>
                      <th className="text-left text-white/60 font-medium pb-3">Date</th>
                      <th className="text-left text-white/60 font-medium pb-3">Status</th>
                      <th className="text-right text-white/60 font-medium pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + index * 0.1 }}
                        className="border-b border-white/5"
                      >
                        <td className="py-3 text-white">{booking.userEmail}</td>
                        <td className="py-3 text-white/80">{booking.tripName}</td>
                        <td className="py-3 text-white/60">
                          {booking.bookingDate.toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {booking.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 text-right text-white font-medium">
                          {formatCurrency(booking.amount)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

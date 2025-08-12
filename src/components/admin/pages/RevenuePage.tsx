import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  MapPin,
  Download,
  CreditCard,
  PieChart,
  BarChart3
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../../config/firebase';

interface RevenueData {
  totalRevenue: number;
  monthlyRevenue: { month: string; amount: number; bookings: number }[];
  topDestinations: { name: string; revenue: number; bookings: number }[];
  recentPayments: {
    id: string;
    amount: number;
    date: Date;
    customerName: string;
    tripName: string;
    paymentId: string;
  }[];
  averageBookingValue: number;
  growthRate: number;
}

export function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData>({
    totalRevenue: 0,
    monthlyRevenue: [],
    topDestinations: [],
    recentPayments: [],
    averageBookingValue: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevenueData();
  }, []);

  const loadRevenueData = async () => {
    try {
      setLoading(true);
      const data = await calculateRevenueData();
      setRevenueData(data);
    } catch (error) {
      console.error('Error loading revenue data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateRevenueData = async (): Promise<RevenueData> => {
    let allBookings: any[] = [];
    
    try {
      // Try Firestore first
      const bookingsRef = collection(db, 'bookings');
      const snapshot = await getDocs(bookingsRef);
      
      if (!snapshot.empty) {
        allBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        }));
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
      
      // Fallback to localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      users.forEach((user: any) => {
        const userTrips = JSON.parse(localStorage.getItem(`trips_${user.id}`) || '[]');
        userTrips.forEach((trip: any) => {
          allBookings.push({
            id: trip.id,
            userEmail: user.email,
            userName: trip.bookingDetails?.primaryContact?.name || user.name,
            tripDetails: trip.tripDetails,
            paymentInfo: trip.paymentInfo,
            createdAt: trip.createdAt ? new Date(trip.createdAt) : new Date(),
            status: trip.status
          });
        });
      });
    }

    // Filter successful payments only
    const successfulBookings = allBookings.filter(booking => 
      booking.paymentInfo?.status === 'paid' || 
      booking.status === 'confirmed' || 
      booking.status === 'active' || 
      booking.status === 'completed'
    );

    // Calculate total revenue
    const totalRevenue = successfulBookings.reduce((sum, booking) => {
      return sum + (booking.paymentInfo?.amount || booking.totalAmount || 0);
    }, 0);

    // Calculate monthly revenue
    const monthlyRevenue = calculateMonthlyRevenue(successfulBookings);

    // Calculate top destinations
    const topDestinations = calculateTopDestinations(successfulBookings);

    // Recent payments (last 10)
    const recentPayments = successfulBookings
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)
      .map(booking => ({
        id: booking.id,
        amount: booking.paymentInfo?.amount || booking.totalAmount || 0,
        date: new Date(booking.createdAt),
        customerName: booking.userName || 'Unknown Customer',
        tripName: booking.tripDetails?.title || 'Unknown Trip',
        paymentId: booking.paymentInfo?.paymentId || `pay_${booking.id}`
      }));

    // Calculate average booking value
    const averageBookingValue = successfulBookings.length > 0 
      ? totalRevenue / successfulBookings.length 
      : 0;

    // Calculate growth rate (comparing last 2 months)
    const growthRate = calculateGrowthRate(monthlyRevenue);

    return {
      totalRevenue,
      monthlyRevenue,
      topDestinations,
      recentPayments,
      averageBookingValue,
      growthRate
    };
  };

  const calculateMonthlyRevenue = (bookings: any[]) => {
    const monthlyData: { [key: string]: { amount: number; bookings: number } } = {};
    
    // Get last 6 months
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      months.push(monthKey);
      monthlyData[monthKey] = { amount: 0, bookings: 0 };
    }

    bookings.forEach(booking => {
      const bookingDate = new Date(booking.createdAt);
      const monthKey = bookingDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (monthlyData[monthKey] !== undefined) {
        monthlyData[monthKey].amount += booking.paymentInfo?.amount || booking.totalAmount || 0;
        monthlyData[monthKey].bookings += 1;
      }
    });

    return months.map(month => ({
      month,
      amount: monthlyData[month].amount,
      bookings: monthlyData[month].bookings
    }));
  };

  const calculateTopDestinations = (bookings: any[]) => {
    const destinations: { [key: string]: { revenue: number; bookings: number } } = {};

    bookings.forEach(booking => {
      const tripName = booking.tripDetails?.title || 'Unknown Destination';
      const amount = booking.paymentInfo?.amount || booking.totalAmount || 0;

      if (!destinations[tripName]) {
        destinations[tripName] = { revenue: 0, bookings: 0 };
      }

      destinations[tripName].revenue += amount;
      destinations[tripName].bookings += 1;
    });

    return Object.entries(destinations)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const calculateGrowthRate = (monthlyData: any[]) => {
    if (monthlyData.length < 2) return 0;
    
    const currentMonth = monthlyData[monthlyData.length - 1];
    const previousMonth = monthlyData[monthlyData.length - 2];
    
    if (previousMonth.amount === 0) return currentMonth.amount > 0 ? 100 : 0;
    
    return ((currentMonth.amount - previousMonth.amount) / previousMonth.amount) * 100;
  };

  const exportRevenueReport = () => {
    const csvContent = [
      ['Month', 'Revenue (₹)', 'Bookings'],
      ...revenueData.monthlyRevenue.map(item => [
        item.month,
        item.amount.toString(),
        item.bookings.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `revenue-report-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString()}`;
  };

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-400';
    if (rate < 0) return 'text-red-400';
    return 'text-white/60';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Revenue Analytics</h1>
          <p className="text-white/60">Track your financial performance and growth</p>
        </div>
        <Button onClick={exportRevenueReport} className="flex items-center gap-2">
          <Download className="w-5 h-5" />
          Export Report
        </Button>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Revenue</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenueData.totalRevenue)}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-green-400" />
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
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Growth Rate</p>
                  <p className={`text-2xl font-bold ${getGrowthColor(revenueData.growthRate)}`}>
                    {revenueData.growthRate > 0 ? '+' : ''}{revenueData.growthRate.toFixed(1)}%
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
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
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Avg. Booking Value</p>
                  <p className="text-2xl font-bold text-white">{formatCurrency(revenueData.averageBookingValue)}</p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-purple-400" />
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
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Transactions</p>
                  <p className="text-2xl font-bold text-white">{revenueData.recentPayments.length}</p>
                </div>
                <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-orange-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <GlassCard>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Monthly Revenue Trend
              </h3>
              
              {revenueData.monthlyRevenue.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.monthlyRevenue.map((item, index) => {
                    const maxAmount = Math.max(...revenueData.monthlyRevenue.map(i => i.amount));
                    const widthPercentage = maxAmount > 0 ? (item.amount / maxAmount) * 100 : 0;
                    
                    return (
                      <div key={item.month} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">{item.month}</span>
                          <span className="text-white">{formatCurrency(item.amount)}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercentage}%` }}
                            transition={{ delay: 0.6 + index * 0.1, duration: 0.8 }}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                          />
                        </div>
                        <div className="text-xs text-white/60">
                          {item.bookings} booking{item.bookings !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <BarChart3 className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No revenue data available</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* Top Destinations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <GlassCard>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Top Revenue Destinations
              </h3>
              
              {revenueData.topDestinations.length > 0 ? (
                <div className="space-y-4">
                  {revenueData.topDestinations.map((destination, index) => {
                    const maxRevenue = Math.max(...revenueData.topDestinations.map(d => d.revenue));
                    const widthPercentage = maxRevenue > 0 ? (destination.revenue / maxRevenue) * 100 : 0;
                    
                    return (
                      <div key={destination.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-yellow-400' :
                              index === 1 ? 'bg-gray-300' :
                              index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                            }`} />
                            <span className="text-white/80 text-sm">{destination.name}</span>
                          </div>
                          <span className="text-white text-sm">{formatCurrency(destination.revenue)}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${widthPercentage}%` }}
                            transition={{ delay: 0.7 + index * 0.1, duration: 0.8 }}
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-yellow-400' :
                              index === 1 ? 'bg-gray-300' :
                              index === 2 ? 'bg-orange-400' : 'bg-blue-400'
                            }`}
                          />
                        </div>
                        <div className="text-xs text-white/60">
                          {destination.bookings} booking{destination.bookings !== 1 ? 's' : ''}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPin className="w-12 h-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">No destination data available</p>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recent Payments */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <GlassCard>
          <div className="p-6">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Payments
            </h3>
            
            {revenueData.recentPayments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-white/60 font-medium pb-3">Customer</th>
                      <th className="text-left text-white/60 font-medium pb-3">Trip</th>
                      <th className="text-left text-white/60 font-medium pb-3">Date</th>
                      <th className="text-left text-white/60 font-medium pb-3">Payment ID</th>
                      <th className="text-right text-white/60 font-medium pb-3">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.recentPayments.map((payment, index) => (
                      <motion.tr
                        key={payment.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="border-b border-white/5"
                      >
                        <td className="py-3 text-white">{payment.customerName}</td>
                        <td className="py-3 text-white/80">{payment.tripName}</td>
                        <td className="py-3 text-white/60">{payment.date.toLocaleDateString()}</td>
                        <td className="py-3 text-white/60 font-mono text-sm">{payment.paymentId}</td>
                        <td className="py-3 text-right text-white font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <CreditCard className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <p className="text-white/60 text-lg">No recent payments</p>
                <p className="text-white/40">Payments will appear here once customers start booking</p>
              </div>
            )}
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}

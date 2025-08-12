import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '../ui/Button';
import { Vehicle } from '../../types';

interface BookingModalContentProps {
  vehicle?: Vehicle;
  onClose?: () => void;
  onBookingComplete?: (bookingData: any) => void;
}

const BookingModalContent = memo<BookingModalContentProps>(({ 
  vehicle, 
  onClose, 
  onBookingComplete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    startDate: '',
    endDate: '',
    passengers: 1,
    specialRequests: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = useCallback((field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate booking process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const bookingData = {
        ...formData,
        vehicle,
        bookingId: `BK${Date.now()}`,
        totalAmount: vehicle?.price ? vehicle.price * getDaysDifference() : 0
      };

      onBookingComplete?.(bookingData);
      onClose?.();
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysDifference = () => {
    if (!formData.startDate || !formData.endDate) return 1;
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
  };

  if (!vehicle) {
    return (
      <div className="p-8 text-center">
        <p className="text-white">No vehicle selected</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2">Book Your Ride</h2>
        <p className="text-purple-200">{vehicle.name}</p>
        <p className="text-2xl font-bold text-purple-300">₹{vehicle.price}/day</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Full Name"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="Email Address"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Phone Number"
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <select
              value={formData.passengers}
              onChange={(e) => handleInputChange('passengers', parseInt(e.target.value))}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {[...Array(vehicle.seats)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-800">
                  {i + 1} Passenger{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-purple-300" size={20} />
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Special requests or pickup location..."
            rows={3}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {formData.startDate && formData.endDate && (
          <div className="bg-purple-500/20 p-4 rounded-lg">
            <p className="text-white">
              <span className="font-semibold">Total: ₹{(vehicle.price * getDaysDifference()).toLocaleString()}</span>
              <span className="text-purple-200 ml-2">({getDaysDifference()} days)</span>
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        >
          {loading ? 'Processing...' : 'Confirm Booking'}
        </Button>
      </form>
    </div>
  );
});

BookingModalContent.displayName = 'BookingModalContent';

export default BookingModalContent;

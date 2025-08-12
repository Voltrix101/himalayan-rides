import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Phone, Mail, MapPin, Star, Clock } from 'lucide-react';
import { Button } from '../ui/Button';

interface Experience {
  id: string;
  title: string;
  description: string;
  image: string;
  duration: string;
  price: number;
  rating: number;
  category: string;
  highlights?: string[];
}

interface ExperienceModalContentProps {
  experience?: Experience;
  onClose?: () => void;
  onBookingComplete?: (bookingData: any) => void;
}

const ExperienceModalContent = memo<ExperienceModalContentProps>(({ 
  experience, 
  onClose, 
  onBookingComplete 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    participants: 1,
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
        experience,
        bookingId: `EXP${Date.now()}`,
        totalAmount: experience?.price ? experience.price * formData.participants : 0
      };

      onBookingComplete?.(bookingData);
      onClose?.();
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!experience) {
    return (
      <div className="p-8 text-center">
        <p className="text-white">No experience selected</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative h-48 mb-6 rounded-lg overflow-hidden">
          <img
            src={experience.image}
            alt={experience.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <h2 className="text-2xl font-bold mb-1">{experience.title}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                <span>{experience.rating}</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                <span>{experience.duration}</span>
              </div>
              <span className="px-2 py-1 bg-purple-500/20 rounded text-xs">
                {experience.category}
              </span>
            </div>
          </div>
          <div className="absolute bottom-4 right-4 text-white">
            <span className="text-2xl font-bold">₹{experience.price.toLocaleString()}</span>
            <span className="text-sm opacity-80">/person</span>
          </div>
        </div>

        <p className="text-purple-200 text-lg leading-relaxed">
          {experience.description}
        </p>

        {experience.highlights && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-3">Highlights</h3>
            <div className="flex flex-wrap gap-2">
              {experience.highlights.map((highlight, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-full border border-purple-400/30"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Booking Form */}
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
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
              required
            />
          </div>

          <div className="relative md:col-span-2">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300" size={20} />
            <select
              value={formData.participants}
              onChange={(e) => handleInputChange('participants', parseInt(e.target.value))}
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              {[...Array(10)].map((_, i) => (
                <option key={i + 1} value={i + 1} className="bg-gray-800">
                  {i + 1} Participant{i > 0 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="relative">
          <MapPin className="absolute left-3 top-3 text-purple-300" size={20} />
          <textarea
            value={formData.specialRequests}
            onChange={(e) => handleInputChange('specialRequests', e.target.value)}
            placeholder="Special requests, dietary preferences, or questions..."
            rows={3}
            className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {formData.participants > 1 && (
          <div className="bg-purple-500/20 p-4 rounded-lg">
            <p className="text-white">
              <span className="font-semibold">
                Total: ₹{(experience.price * formData.participants).toLocaleString()}
              </span>
              <span className="text-purple-200 ml-2">
                ({formData.participants} participants × ₹{experience.price.toLocaleString()})
              </span>
            </p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-lg py-3"
        >
          {loading ? 'Processing...' : `Book Experience - ₹${(experience.price * formData.participants).toLocaleString()}`}
        </Button>
      </form>
    </div>
  );
});

ExperienceModalContent.displayName = 'ExperienceModalContent';

export default ExperienceModalContent;

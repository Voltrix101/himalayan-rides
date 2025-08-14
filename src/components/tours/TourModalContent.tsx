import { memo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Mountain, Route, Star, Camera } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { useApp } from '../../context/AppContext';
import { razorpayService, type BookingData, type RazorpayPaymentData } from '../../services/razorpayService';
import { functions } from '../../config/firebase';
import UniversalModal from '../ui/UniversalModal';
import toast from 'react-hot-toast';

interface Tour {
  id: number | string;
  name: string;
  duration: string;
  distance: string;
  difficulty: string;
  price: string | number;
  rating: number;
  image: string;
  highlights: string[];
  includes: string[];
  route: string;
}

interface TourModalContentProps {
  preSelectedTour?: Tour;
  autoOpenBooking?: boolean;
}

// Popular bike tour packages
const bikeTours = [
  {
    id: 1,
    name: "Leh-Ladakh Ultimate Adventure",
    duration: "14 Days",
    distance: "2,500 km",
    difficulty: "Advanced",
    price: "₹85,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
    highlights: ["Khardung La Pass", "Nubra Valley", "Pangong Lake", "Tso Moriri"],
    includes: ["Royal Enfield 350/500", "Fuel", "Accommodation", "Meals", "Guide"],
    route: "Delhi → Manali → Leh → Nubra → Pangong → Delhi"
  },
  {
    id: 2,
    name: "Himalayan Base Camp Ride",
    duration: "12 Days",
    distance: "2,200 km",
    difficulty: "Expert",
    price: "₹95,000",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800",
    highlights: ["Everest Base Camp View", "Rongbuk Monastery", "Mount Kailash", "Mansarovar"],
    includes: ["Premium Bikes", "Oxygen Support", "Expert Guide", "All Permits"],
    route: "Kathmandu → Tingri → EBC → Kailash → Kathmandu"
  }
];

// Coming soon tours
const comingSoonTours = [
  {
    id: 'spiti-soon',
    name: "Spiti Valley Circuit",
    duration: "10 Days",
    price: "₹65,000",
    image: "https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=800",
    comingSoon: true
  },
  {
    id: 'sikkim-soon', 
    name: "Sikkim Silk Route",
    duration: "8 Days",
    price: "₹55,000",
    image: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=800",
    comingSoon: true
  }
];

const TourModalContent = memo<TourModalContentProps>(({ preSelectedTour, autoOpenBooking = false }) => {
  const { state } = useApp();
  const [selectedTour, setSelectedTour] = useState<Tour>(preSelectedTour || bikeTours[0]);
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'booking'>(autoOpenBooking ? 'booking' : 'overview');
  const [bookingData, setBookingData] = useState({
    startDate: '',
    participants: 1,
    bikePreference: 'Royal Enfield 350',
    addOns: [] as string[],
    phone: state.user?.phone || '',
    emergencyContact: {
      name: '',
      phone: '',
      relationship: 'spouse'
    }
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successBookingData, setSuccessBookingData] = useState<any>(null);

  // Helper function to parse price from string or number
  const parsePrice = (price: string | number): number => {
    if (typeof price === 'number') return price;
    return parseInt(price.replace('₹', '').replace(',', ''));
  };

  const addOns = [
    { id: 'photography', name: 'Professional Photography', price: '₹15,000' },
    { id: 'camping', name: 'Premium Camping Gear', price: '₹8,000' },
    { id: 'meals', name: 'Gourmet Meal Package', price: '₹12,000' },
    { id: 'insurance', name: 'Travel Insurance', price: '₹5,000' }
  ];

  const handleBooking = useCallback(async () => {
    try {
      setLoading(true);

      // Validation
      if (!bookingData.startDate || !bookingData.phone) {
        toast.error('Please fill in all required fields');
        return;
      }

      if (!state.user) {
        toast.error('Please login to make a booking');
        return;
      }

      // Calculate total price
      const basePrice = parsePrice(selectedTour.price);
      const addOnPrice = bookingData.addOns.reduce((total, addOnId) => {
        const addOn = addOns.find(a => a.id === addOnId);
        return total + (addOn ? parseInt(addOn.price.replace('₹', '').replace(',', '')) : 0);
      }, 0);
      const totalAmount = (basePrice + addOnPrice) * bookingData.participants;

      const bookingPayload: BookingData = {
        experienceId: selectedTour.id.toString(),
        experienceTitle: selectedTour.name,
        customerName: state.user.name || state.user.email || 'Customer',
        email: state.user.email || '',
        phone: bookingData.phone,
        participants: bookingData.participants,
        startDate: new Date(bookingData.startDate),
        totalAmount: totalAmount,
        pickupLocation: 'Delhi (as per tour route)',
        specialRequests: `Bike preference: ${bookingData.bikePreference}. Add-ons: ${bookingData.addOns.join(', ')}`,
        emergencyContact: bookingData.emergencyContact.name ? bookingData.emergencyContact : undefined,
      };

      // Create Razorpay order
      const orderData = await razorpayService.createOrder(bookingPayload, state.user.id);

      // Open Razorpay checkout
      await razorpayService.openCheckout(
        orderData,
        bookingPayload,
        async (paymentData: RazorpayPaymentData) => {
          // Payment successful
          setLoading(false);
          
          // Prepare success modal data
          const successData = {
            bookingId: paymentData.razorpay_order_id,
            type: 'tour' as const,
            title: selectedTour.name,
            totalAmount: totalAmount,
            participants: bookingData.participants,
            startDate: bookingData.startDate,
            customerEmail: state.user?.email || '',
            customerName: state.user?.name || state.user?.email || 'Customer',
          };
          
          setSuccessBookingData(successData);
          
          // Send booking confirmation email
          try {
            const sendConfirmationFunction = httpsCallable(functions, 'sendBookingConfirmation');
            await sendConfirmationFunction({
              paymentId: paymentData.razorpay_payment_id,
              orderId: paymentData.razorpay_order_id
            });
            console.log('Booking confirmation email sent successfully');
          } catch (error) {
            console.error('Error sending booking confirmation email:', error);
            // Don't block success flow for email errors
          }
          
          setShowSuccessModal(true);
          
          toast.success('🎉 Booking confirmed! You will receive confirmation emails with your trip details and invoice.');
        },
        (error: any) => {
          // Payment failed
          console.error('Payment failed:', error);
          setLoading(false);
          toast.error('Payment failed. Please try again.');
        }
      );
      
    } catch (error) {
      console.error('Booking failed:', error);
      setLoading(false);
      toast.error('Failed to initiate payment. Please try again.');
    }
  }, [selectedTour, bookingData, state.user, addOns]);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Himalayan Bike Tours</h2>
          <p className="text-gray-300">Epic motorcycle adventures through the world's highest mountains</p>
        </div>

        {/* Tour Selection */}
        <div className="space-y-6">
          {/* Available Tours */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Available Tours</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {bikeTours.map((tour) => (
                <motion.div
                  key={tour.id}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedTour(tour)}
                  className={`cursor-pointer rounded-lg overflow-hidden ${
                    selectedTour.id === tour.id ? 'ring-2 ring-purple-400' : ''
                  }`}
                >
                  <OptimizedGlass intensity="medium" className="p-4">
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                    <h4 className="text-white font-bold text-sm mb-2">{tour.name}</h4>
                    <div className="flex justify-between text-xs text-gray-300 mb-2">
                      <span>{tour.duration}</span>
                      <span>{tour.price}</span>
                    </div>
                    <div className="flex items-center text-xs text-yellow-400">
                      <Star className="w-3 h-3 mr-1 fill-current" />
                      {tour.rating}
                    </div>
                  </OptimizedGlass>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Coming Soon Tours */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Coming Soon</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {comingSoonTours.map((tour) => (
                <motion.div
                  key={tour.id}
                  className="cursor-not-allowed rounded-lg overflow-hidden opacity-75"
                >
                  <OptimizedGlass intensity="light" className="p-4 relative">
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                      <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Coming Soon
                      </span>
                    </div>
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-32 object-cover rounded-lg mb-3 grayscale"
                    />
                    <h4 className="text-gray-400 font-bold text-sm mb-2">{tour.name}</h4>
                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                      <span>{tour.duration}</span>
                      <span>{tour.price}</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Launching Soon - Stay Tuned!
                    </div>
                  </OptimizedGlass>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-white/10 rounded-lg p-1">
          {(['overview', 'itinerary', 'booking'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <OptimizedGlass intensity="medium" className="min-h-[400px] p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tour Image */}
                <div>
                  <img
                    src={selectedTour.image}
                    alt={selectedTour.name}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Tour Details */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-white">{selectedTour.name}</h3>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      {selectedTour.duration}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Route className="w-4 h-4 mr-2" />
                      {selectedTour.distance}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <Mountain className="w-4 h-4 mr-2" />
                      {selectedTour.difficulty}
                    </div>
                    <div className="flex items-center text-yellow-400">
                      <Star className="w-4 h-4 mr-2 fill-current" />
                      {selectedTour.rating} Rating
                    </div>
                  </div>

                  <div className="text-3xl font-bold text-purple-400">{selectedTour.price}</div>
                  <p className="text-gray-400 text-sm">Per person (All inclusive)</p>
                </div>
              </div>

              {/* Route */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Route Overview
                </h4>
                <p className="text-gray-300 bg-white/5 p-3 rounded-lg">{selectedTour.route}</p>
              </div>

              {/* Highlights */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Tour Highlights</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTour.highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <Camera className="w-4 h-4 mr-2 text-purple-400" />
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              {/* Includes */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-3">Package Includes</h4>
                <div className="grid grid-cols-2 gap-2">
                  {selectedTour.includes.map((item, index) => (
                    <div key={index} className="flex items-center text-gray-300">
                      <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'itinerary' && (
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Detailed Itinerary</h3>
              {/* Sample itinerary - you can expand this */}
              {Array.from({ length: parseInt(selectedTour.duration) }, (_, i) => (
                <div key={i} className="border-l-2 border-purple-400 pl-4 pb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                      {i + 1}
                    </div>
                    <h4 className="text-white font-semibold">Day {i + 1}</h4>
                  </div>
                  <p className="text-gray-300 text-sm">
                    {i === 0 && "Departure from Delhi - Journey begins to the mountains"}
                    {i === 1 && "Acclimatization day - Local sightseeing and bike setup"}
                    {i > 1 && i < parseInt(selectedTour.duration) - 1 && "Mountain pass crossing - Scenic routes and adventure"}
                    {i === parseInt(selectedTour.duration) - 1 && "Return journey - Memories and safe return"}
                  </p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-white mb-4">Book Your Adventure</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Booking Form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Start Date</label>
                    <input
                      type="date"
                      value={bookingData.startDate}
                      onChange={(e) => setBookingData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Participants</label>
                    <select
                      value={bookingData.participants}
                      onChange={(e) => setBookingData(prev => ({ ...prev, participants: parseInt(e.target.value) }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'Person' : 'People'}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Bike Preference</label>
                    <select
                      value={bookingData.bikePreference}
                      onChange={(e) => setBookingData(prev => ({ ...prev, bikePreference: e.target.value }))}
                      className="w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-400"
                    >
                      <option value="Royal Enfield 350">Royal Enfield 350</option>
                      <option value="Royal Enfield 500">Royal Enfield 500</option>
                      <option value="Royal Enfield Himalayan">Royal Enfield Himalayan</option>
                      <option value="KTM Adventure">KTM Adventure</option>
                    </select>
                  </div>
                </div>

                {/* Add-ons */}
                <div>
                  <h4 className="text-white font-semibold mb-3">Optional Add-ons</h4>
                  <div className="space-y-3">
                    {addOns.map((addon) => (
                      <label key={addon.id} className="flex items-center space-x-3 text-gray-300">
                        <input
                          type="checkbox"
                          checked={bookingData.addOns.includes(addon.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setBookingData(prev => ({ ...prev, addOns: [...prev.addOns, addon.id] }));
                            } else {
                              setBookingData(prev => ({ ...prev, addOns: prev.addOns.filter(id => id !== addon.id) }));
                            }
                          }}
                          className="w-4 h-4 text-purple-600 bg-white/10 border-white/20 rounded focus:ring-purple-400"
                        />
                        <span className="flex-1">{addon.name}</span>
                        <span className="text-purple-400 font-medium">{addon.price}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Total Price */}
              <div className="bg-white/5 p-4 rounded-lg">
                <div className="flex justify-between items-center text-lg">
                  <span className="text-white font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-purple-400">
                    ₹{(parsePrice(selectedTour.price) * bookingData.participants).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-400 text-sm mt-1">For {bookingData.participants} participant(s)</p>
              </div>

              {/* Book Button */}
              <Button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Book This Adventure Now'}
              </Button>
            </div>
          )}
        </OptimizedGlass>
      </motion.div>

      {/* Success Modal */}
      <UniversalModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        type="success"
        data={successBookingData}
      />
    </div>
  );
});

TourModalContent.displayName = 'TourModalContent';

export default TourModalContent;

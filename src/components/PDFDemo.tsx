
import { motion } from 'framer-motion';
import { Download, FileText, Sparkles } from 'lucide-react';
import { PremiumPDFGenerator, transformToUniversalBooking } from '../utils/premiumPdfGenerator';
import { FluidButton } from '../components/ui/FluidButton';
import { LiquidGlass } from '../components/ui/LiquidGlass';
import { NeonText } from '../components/ui/NeonText';
import toast from 'react-hot-toast';

export function PDFDemo() {
  const generateSamplePDF = async (type: string) => {
    try {
      let sampleBooking;
      
      switch (type) {
        case 'bike-tour':
          sampleBooking = transformToUniversalBooking({
            id: 'HR-DEMO-BIKE-001',
            type: 'bike-tour',
            title: '7-Day Ladakh Bike Adventure',
            duration: '7 days / 6 nights',
            user: {
              name: 'John Adventure',
              email: 'john@adventure.com',
              phone: '+91-9876543210',
            },
            participants: [
              {
                name: 'John Adventure',
                age: 28,
                gender: 'Male',
                contact: '+91-9876543210',
              },
              {
                name: 'Sarah Explorer',
                age: 26,
                gender: 'Female',
                contact: '+91-9876543211',
              }
            ],
            itinerary: [
              { day: 'Day 1', title: 'Arrival in Leh', description: 'Acclimatization and local sightseeing' },
              { day: 'Day 2', title: 'Leh to Nubra Valley', description: 'Ride via Khardung La Pass (18,380 ft)' },
              { day: 'Day 3', title: 'Nubra Valley Exploration', description: 'Desert safari and Camel ride at Hunder' },
              { day: 'Day 4', title: 'Nubra to Pangong Tso', description: 'Journey to the beautiful Pangong Lake' },
              { day: 'Day 5', title: 'Pangong to Leh', description: 'Return via Chang La Pass' },
              { day: 'Day 6', title: 'Local Leh Exploration', description: 'Monasteries and local markets' },
              { day: 'Day 7', title: 'Departure', description: 'Transfer to airport' }
            ],
            billing: {
              perPerson: 25999,
              total: 51998,
              tax: 4680,
              finalAmount: 56678,
            },
            dates: {
              startDate: '2025-08-15',
              endDate: '2025-08-22',
            },
            vehicle: {
              name: 'Royal Enfield Himalayan 411cc',
              type: 'Adventure Motorcycle',
            },
          });
          break;
          
        case 'vehicle':
          sampleBooking = transformToUniversalBooking({
            id: 'HR-DEMO-VEH-002',
            type: 'vehicle',
            title: '5-Day Ladakh SUV Package',
            duration: '5 days / 4 nights',
            user: {
              name: 'Family Traveler',
              email: 'family@travels.com',
              phone: '+91-9876543212',
            },
            participants: [
              { name: 'Family Traveler', age: 35, gender: 'Male' },
              { name: 'Mrs. Traveler', age: 32, gender: 'Female' },
              { name: 'Kid Traveler', age: 8, gender: 'Male' },
            ],
            billing: {
              perPerson: 15999,
              total: 47997,
              tax: 4320,
              finalAmount: 52317,
            },
            vehicle: {
              name: 'Toyota Innova Crysta',
              type: 'Premium SUV',
            },
          });
          break;
          
        case 'experience':
          sampleBooking = transformToUniversalBooking({
            id: 'HR-DEMO-EXP-003',
            type: 'experience',
            title: 'Luxury Glamping Under Stars',
            duration: '3 days / 2 nights',
            user: {
              name: 'Romantic Couple',
              email: 'couple@romance.com',
              phone: '+91-9876543213',
            },
            participants: [
              { name: 'Romantic Couple', age: 29, gender: 'Male' },
              { name: 'Partner Love', age: 27, gender: 'Female' },
            ],
            billing: {
              perPerson: 18999,
              total: 37998,
              tax: 3420,
              finalAmount: 41418,
            },
            experience: {
              location: 'Nubra Valley, Ladakh',
              highlights: [
                'Luxury Swiss tents with valley views',
                'Private bonfire and stargazing',
                'Gourmet local cuisine',
                'Camel safari in sand dunes',
                'Photography workshop'
              ],
            },
          });
          break;
          
        default:
          sampleBooking = transformToUniversalBooking({
            id: 'HR-DEMO-CUR-004',
            type: 'curated',
            title: '💎 Premium Curated Ladakh Experience',
            duration: '10 days / 9 nights',
            user: {
              name: 'VIP Traveler',
              email: 'vip@premium.com',
              phone: '+91-9876543214',
            },
            participants: [
              { name: 'VIP Traveler', age: 45, gender: 'Male' },
              { name: 'Mrs. VIP', age: 42, gender: 'Female' },
            ],
            // No itinerary for curated experiences
            itinerary: [],
            billing: {
              perPerson: 85999,
              total: 171998,
              tax: 15480,
              finalAmount: 187478,
            },
            dates: {
              startDate: '2025-09-01',
              endDate: '2025-09-11',
            },
            experience: {
              location: 'Complete Ladakh Circuit',
              highlights: [
                '🏨 Luxury accommodations throughout',
                '🚗 Private vehicles and expert guides',
                '🍽️ Exclusive dining experiences',
                '📸 Photography and adventure activities',
                '🏛️ Cultural immersion programs',
                '🏔️ High-altitude acclimatization support',
                '🎭 Traditional Ladakhi cultural shows',
                '🧘‍♂️ Meditation sessions in monasteries'
              ],
            },
          });
      }
      
      const pdfGenerator = new PremiumPDFGenerator(sampleBooking);
      await pdfGenerator.generateBookingConfirmation();
      
      toast.success(`🎉 ${type.toUpperCase()} Premium PDF Generated!`);
      
    } catch (error) {
      console.error('PDF Demo Error:', error);
      toast.error('Failed to generate demo PDF');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <NeonText className="text-5xl font-bold mb-4">
            🎨 Premium PDF Generator
          </NeonText>
          <p className="text-xl text-gray-300">
            Experience the ultimate booking confirmation PDFs with iOS 18 design
          </p>
        </motion.div>
        
        {/* Demo Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Bike Tour PDF */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <LiquidGlass className="p-8 h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🏍️</div>
                <h3 className="text-2xl font-bold text-white mb-4">Bike Tour PDF</h3>
                <p className="text-gray-300 mb-6">
                  Complete 7-day Ladakh bike adventure with itinerary, QR codes, and premium styling
                </p>
                <FluidButton 
                  onClick={() => generateSamplePDF('bike-tour')}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Bike Tour PDF
                </FluidButton>
              </div>
            </LiquidGlass>
          </motion.div>
          
          {/* Vehicle Rental PDF */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <LiquidGlass className="p-8 h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-2xl font-bold text-white mb-4">Vehicle Rental PDF</h3>
                <p className="text-gray-300 mb-6">
                  Family-friendly SUV package with vehicle details and billing breakdown
                </p>
                <FluidButton 
                  onClick={() => generateSamplePDF('vehicle')}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Vehicle PDF
                </FluidButton>
              </div>
            </LiquidGlass>
          </motion.div>
          
          {/* Experience PDF */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <LiquidGlass className="p-8 h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="text-2xl font-bold text-white mb-4">Experience PDF</h3>
                <p className="text-gray-300 mb-6">
                  Luxury glamping experience with highlights and location details
                </p>
                <FluidButton 
                  onClick={() => generateSamplePDF('experience')}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Experience PDF
                </FluidButton>
              </div>
            </LiquidGlass>
          </motion.div>
          
          {/* Curated PDF */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
          >
            <LiquidGlass className="p-8 h-full">
              <div className="text-center">
                <div className="text-6xl mb-4">💎</div>
                <h3 className="text-2xl font-bold text-white mb-4">Curated Experience PDF</h3>
                <p className="text-gray-300 mb-6">
                  Premium 10-day curated experience with full itinerary and luxury details
                </p>
                <FluidButton 
                  onClick={() => generateSamplePDF('curated')}
                  className="w-full"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Generate Curated PDF
                </FluidButton>
              </div>
            </LiquidGlass>
          </motion.div>
          
        </div>
        
        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <LiquidGlass className="p-8">
            <h3 className="text-3xl font-bold text-white text-center mb-8">
              ✨ Premium PDF Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">iOS 18 Design</h4>
                <p className="text-gray-300">
                  Glassmorphic backgrounds, neon colors, and premium typography
                </p>
              </div>
              <div className="text-center">
                <FileText className="w-12 h-12 text-green-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">Multi-page Layout</h4>
                <p className="text-gray-300">
                  Title page, detailed info, itinerary, and billing breakdown
                </p>
              </div>
              <div className="text-center">
                <Download className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-xl font-bold text-white mb-2">QR Codes & Tables</h4>
                <p className="text-gray-300">
                  Booking ID QR codes and styled tables for all information
                </p>
              </div>
            </div>
          </LiquidGlass>
        </motion.div>
        
      </div>
    </div>
  );
}

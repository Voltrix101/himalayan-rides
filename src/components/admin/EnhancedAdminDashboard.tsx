import { memo, useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Route,
  Camera,
  Settings, 
  Search,
  Plus,
  Edit,
  Trash2,
  Download,
  RefreshCw
} from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { VehicleForm } from './forms/VehicleForm';
import { DestinationForm } from './forms/DestinationForm';
import { ExperienceForm } from './forms/ExperienceForm';
import { BikeTourForm } from './forms/BikeTourForm';
import { BikeToursPreloader } from './components/BikeToursPreloader';
import { ExperiencesPreloader } from './components/ExperiencesPreloader';
import { UserManagement } from './UserManagement';
import { 
  adminFirebaseService, 
  User, 
  Vehicle, 
  Destination, 
  BikeTour,
  Experience,
  Booking 
} from '../../services/adminFirebaseService';
import { populateSampleData } from '../../utils/sampleDataPopulator';
import toast from 'react-hot-toast';

interface AdminStats {
  totalBookings: number;
  totalUsers: number;
  totalVehicles: number;
  revenue: number;
  activeTrips: number;
}

interface TabConfig {
  id: string;
  label: string;
  icon: any;
  count?: number;
}

const tabConfigs: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'vehicles', label: 'Vehicles', icon: Car },
  { id: 'destinations', label: 'Destinations', icon: MapPin },
  { id: 'experiences', label: 'Experiences', icon: Camera },
  { id: 'biketours', label: 'Bike Tours', icon: Route },
  { id: 'settings', label: 'Settings', icon: Settings }
];

export const EnhancedAdminDashboard = memo(() => {
  // State management
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState<AdminStats>({
    totalBookings: 0,
    totalUsers: 0,
    totalVehicles: 0,
    revenue: 0,
    activeTrips: 0
  });

  // Data states
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [bikeTours, setBikeTours] = useState<BikeTour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);

  // Modal states
  const [vehicleFormOpen, setVehicleFormOpen] = useState(false);
  const [destinationFormOpen, setDestinationFormOpen] = useState(false);
  const [experienceFormOpen, setExperienceFormOpen] = useState(false);
  const [bikeTourFormOpen, setBikeTourFormOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [selectedExperience, setSelectedExperience] = useState<Experience | null>(null);
  const [selectedBikeTour, setSelectedBikeTour] = useState<BikeTour | null>(null);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Initialize real-time listeners
  useEffect(() => {
    const initializeData = async () => {
      console.log('🚀 Initializing admin dashboard data...');
      setIsLoading(true);
      
      try {
        // Setup real-time listeners
        console.log('📊 Setting up dashboard stats listener...');
        await adminFirebaseService.getDashboardStats(setStats);
        
        console.log('👥 Setting up users listener...');
        await adminFirebaseService.getUsers(setUsers);
        
        console.log('🚗 Setting up vehicles listener...');
        await adminFirebaseService.getVehicles(setVehicles);
        
        console.log('🏔️ Setting up destinations listener...');
        await adminFirebaseService.getDestinations(setDestinations);
        
        console.log('📸 Setting up experiences listener...');
        await adminFirebaseService.getExperiences(setExperiences);
        
        console.log('🏍️ Setting up bike tours listener...');
        await adminFirebaseService.getBikeTours(setBikeTours);
        
        console.log('📅 Setting up bookings listener...');
        await adminFirebaseService.getBookings(setBookings);
        
        console.log('✅ All listeners set up successfully');
      } catch (error) {
        console.error('❌ Error initializing admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners on unmount
    return () => {
      console.log('🧹 Cleaning up admin dashboard listeners');
      adminFirebaseService.cleanup();
    };
  }, []);

  // Vehicle management
  const handleCreateVehicle = useCallback(() => {
    setSelectedVehicle(null);
    setFormMode('create');
    setVehicleFormOpen(true);
  }, []);

  const handleEditVehicle = useCallback((vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormMode('edit');
    setVehicleFormOpen(true);
  }, []);

  const handleDeleteVehicle = useCallback(async (vehicleId: string) => {
    if (window.confirm('Are you sure you want to delete this vehicle?')) {
      try {
        await adminFirebaseService.deleteVehicle(vehicleId);
      } catch (error) {
        console.error('Error deleting vehicle:', error);
      }
    }
  }, []);

  // Destination management
  const handleCreateDestination = useCallback(() => {
    setSelectedDestination(null);
    setFormMode('create');
    setDestinationFormOpen(true);
  }, []);

  const handleEditDestination = useCallback((destination: Destination) => {
    setSelectedDestination(destination);
    setFormMode('edit');
    setDestinationFormOpen(true);
  }, []);

  const handleDeleteDestination = useCallback(async (destinationId: string) => {
    if (window.confirm('Are you sure you want to delete this destination?')) {
      try {
        await adminFirebaseService.deleteDestination(destinationId);
      } catch (error) {
        console.error('Error deleting destination:', error);
      }
    }
  }, []);

  // Experience management
  const handleCreateExperience = useCallback(() => {
    setSelectedExperience(null);
    setFormMode('create');
    setExperienceFormOpen(true);
  }, []);

  const handleEditExperience = useCallback((experience: Experience) => {
    setSelectedExperience(experience);
    setFormMode('edit');
    setExperienceFormOpen(true);
  }, []);

  const handleDeleteExperience = useCallback(async (experienceId: string) => {
    if (window.confirm('Are you sure you want to delete this experience?')) {
      try {
        await adminFirebaseService.deleteExperience(experienceId);
      } catch (error) {
        console.error('Error deleting experience:', error);
      }
    }
  }, []);

  // Bike Tour management
  const handleCreateBikeTour = useCallback(() => {
    setSelectedBikeTour(null);
    setFormMode('create');
    setBikeTourFormOpen(true);
  }, []);

  const handleEditBikeTour = useCallback((bikeTour: BikeTour) => {
    setSelectedBikeTour(bikeTour);
    setFormMode('edit');
    setBikeTourFormOpen(true);
  }, []);

  const handleDeleteBikeTour = useCallback(async (bikeTourId: string) => {
    if (window.confirm('Are you sure you want to delete this bike tour?')) {
      try {
        await adminFirebaseService.deleteBikeTour(bikeTourId);
      } catch (error) {
        console.error('Error deleting bike tour:', error);
      }
    }
  }, []);

  // User management
  const handleUpdateUser = useCallback(async (userId: string, updates: Partial<User>) => {
    try {
      await adminFirebaseService.updateUser(userId, updates);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, ...updates } : user
      ));
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }, []);

  // Filter data based on search
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDestinations = destinations.filter(destination =>
    destination.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBikeTours = bikeTours.filter(bikeTour =>
    bikeTour.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bikeTour.region?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Export data
  const handleExportData = useCallback(async (type: string) => {
    try {
      const data = await adminFirebaseService.exportData(type);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`${type} data exported successfully`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export data');
    }
  }, []);

  // Populate sample data
  const handlePopulateSampleData = useCallback(async () => {
    if (window.confirm('This will add sample data to your Firebase collections. Continue?')) {
      try {
        setIsLoading(true);
        const success = await populateSampleData();
        if (success) {
          toast.success('Sample data populated successfully!');
        } else {
          toast.error('Failed to populate sample data');
        }
      } catch (error) {
        console.error('Error populating sample data:', error);
        toast.error('Failed to populate sample data');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Render stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <OptimizedGlass intensity="medium" className="p-6 text-center">
          <div className="text-3xl font-bold text-green-400 mb-2">{stats.totalBookings}</div>
          <div className="text-white/70 text-sm">Total Bookings</div>
          <div className="text-green-300 text-xs mt-1">+12% from last month</div>
        </OptimizedGlass>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <OptimizedGlass intensity="medium" className="p-6 text-center">
          <div className="text-3xl font-bold text-blue-400 mb-2">{stats.totalUsers}</div>
          <div className="text-white/70 text-sm">Total Users</div>
          <div className="text-blue-300 text-xs mt-1">+8% from last month</div>
        </OptimizedGlass>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <OptimizedGlass intensity="medium" className="p-6 text-center">
          <div className="text-3xl font-bold text-purple-400 mb-2">{stats.totalVehicles}</div>
          <div className="text-white/70 text-sm">Vehicles</div>
          <div className="text-purple-300 text-xs mt-1">Fleet size</div>
        </OptimizedGlass>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <OptimizedGlass intensity="medium" className="p-6 text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-2">₹{(stats.revenue / 100000).toFixed(1)}L</div>
          <div className="text-white/70 text-sm">Revenue</div>
          <div className="text-yellow-300 text-xs mt-1">+15% from last month</div>
        </OptimizedGlass>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <OptimizedGlass intensity="medium" className="p-6 text-center">
          <div className="text-3xl font-bold text-emerald-400 mb-2">{stats.activeTrips}</div>
          <div className="text-white/70 text-sm">Active Trips</div>
          <div className="text-emerald-300 text-xs mt-1">Ongoing adventures</div>
        </OptimizedGlass>
      </motion.div>
    </div>
  );

  // Render content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div>
            {renderStatsCards()}
            
            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <OptimizedGlass intensity="medium" className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Bookings</h3>
                <div className="space-y-3">
                  {bookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{booking.userName}</div>
                        <div className="text-white/60 text-sm">{booking.itemName}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">₹{booking.totalAmount}</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                          booking.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {booking.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </OptimizedGlass>

              {/* Recent Users */}
              <OptimizedGlass intensity="medium" className="p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Users</h3>
                <div className="space-y-3">
                  {users.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-white/60 text-sm">{user.email}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-400 text-sm">{user.totalBookings} bookings</div>
                        <div className={`text-xs px-2 py-1 rounded-full ${
                          user.status === 'active' ? 'bg-green-400/20 text-green-400' :
                          user.status === 'inactive' ? 'bg-gray-400/20 text-gray-400' :
                          'bg-red-400/20 text-red-400'
                        }`}>
                          {user.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </OptimizedGlass>
            </div>
          </div>
        );

      case 'users':
        return (
          <UserManagement 
            users={users} 
            onUpdateUser={handleUpdateUser}
          />
        );

      case 'vehicles':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Vehicle Management</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExportData('vehicles')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleCreateVehicle}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Vehicle
                </Button>
              </div>
            </div>

            <OptimizedGlass intensity="medium" className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search vehicles..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map((vehicle) => (
                  <div key={vehicle.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={vehicle.image} 
                        alt={vehicle.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{vehicle.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{vehicle.brand} {vehicle.model}</p>
                    <p className="text-purple-400 font-medium mb-3">₹{vehicle.pricePerDay}/day</p>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        vehicle.isAvailable ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {vehicle.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditVehicle(vehicle)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </OptimizedGlass>
          </div>
        );

      case 'destinations':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Destination Management</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExportData('destinations')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleCreateDestination}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Destination
                </Button>
              </div>
            </div>

            <OptimizedGlass intensity="medium" className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDestinations.map((destination) => (
                  <div key={destination.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={destination.image} 
                        alt={destination.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{destination.name}</h3>
                    <p className="text-white/60 text-sm mb-2 line-clamp-2">{destination.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400 font-medium">₹{destination.price}</span>
                      <span className="text-yellow-400 text-sm">★ {destination.rating}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        destination.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {destination.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditDestination(destination)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteDestination(destination.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </OptimizedGlass>
          </div>
        );

      case 'experiences':
        const filteredExperiences = experiences.filter(exp =>
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.category.toLowerCase().includes(searchTerm.toLowerCase())
        );

        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Experience Management</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExportData('experiences')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleCreateExperience}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </div>

            <ExperiencesPreloader />

            <OptimizedGlass intensity="medium" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {filteredExperiences.length} Experience{filteredExperiences.length !== 1 ? 's' : ''}
                </h3>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search experiences..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExperiences.map((experience) => (
                  <div key={experience.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={experience.image} 
                        alt={experience.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{experience.title}</h3>
                    <p className="text-white/60 text-sm mb-2 line-clamp-2">{experience.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400 font-medium">₹{experience.price}</span>
                      <span className="text-white/60 text-sm">{experience.duration}</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs bg-blue-400/20 text-blue-400`}>
                        {experience.category}
                      </span>
                      <div className="flex items-center text-yellow-400 text-sm">
                        <span>★ {experience.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        experience.isActive ? 'bg-green-400/20 text-green-400' : 'bg-red-400/20 text-red-400'
                      }`}>
                        {experience.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditExperience(experience)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteExperience(experience.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </OptimizedGlass>
          </div>
        );

      case 'biketours':
        return (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Bike Tour Management</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleExportData('bikeTours')}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button
                  onClick={handleCreateBikeTour}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tour
                </Button>
              </div>
            </div>

            {/* Preloader for sample data */}
            <BikeToursPreloader />

            <OptimizedGlass intensity="medium" className="p-6">{filteredBikeTours.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-white/60 mb-4">
                    <Route className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg">No bike tours available</p>
                    <p className="text-sm">Use the preloader above to add sample tours or create your own!</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
                      <input
                        type="text"
                        placeholder="Search bike tours..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{filteredBikeTours.map((tour) => (
                  <div key={tour.id} className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <div className="aspect-video bg-white/10 rounded-lg mb-4 overflow-hidden">
                      <img 
                        src={tour.image} 
                        alt={tour.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{tour.name}</h3>
                    <p className="text-white/60 text-sm mb-2">{tour.region}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-purple-400 font-medium">₹{tour.pricePerPerson}/person</span>
                      <span className="text-white/60 text-sm">{tour.duration} days</span>
                    </div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tour.difficulty === 'Easy' ? 'bg-green-400/20 text-green-400' :
                        tour.difficulty === 'Moderate' ? 'bg-yellow-400/20 text-yellow-400' :
                        tour.difficulty === 'Challenging' ? 'bg-orange-400/20 text-orange-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {tour.difficulty}
                      </span>
                      <span className="text-white/60 text-xs">Max: {tour.maxGroupSize}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        tour.isActive ? 'bg-green-400/20 text-green-400' : 'bg-gray-400/20 text-gray-400'
                      }`}>
                        {tour.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditBikeTour(tour)}
                          className="text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBikeTour(tour.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>
                </>
              )}
            </OptimizedGlass>
          </div>
        );

      default:
        return <div className="text-white">Settings panel coming soon...</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <Button
              onClick={handlePopulateSampleData}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Populate Sample Data
            </Button>
            <div className="text-white/60 text-sm">
              Real-time sync with Firebase
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-2 mb-8">
          {tabConfigs.map((tab) => (
            <Button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              variant={activeTab === tab.id ? 'primary' : 'ghost'}
              className={`flex items-center gap-2 ${
                activeTab === tab.id 
                  ? 'bg-purple-600 text-white' 
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full ml-1">
                  {tab.count}
                </span>
              )}
            </Button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>

        {/* Forms */}
        <VehicleForm
          isOpen={vehicleFormOpen}
          onClose={() => setVehicleFormOpen(false)}
          vehicle={selectedVehicle}
          mode={formMode}
        />

        <DestinationForm
          isOpen={destinationFormOpen}
          onClose={() => setDestinationFormOpen(false)}
          destination={selectedDestination}
          mode={formMode}
        />

        <ExperienceForm
          isOpen={experienceFormOpen}
          onClose={() => setExperienceFormOpen(false)}
          experience={selectedExperience}
          mode={formMode}
        />

        <BikeTourForm
          isOpen={bikeTourFormOpen}
          onClose={() => setBikeTourFormOpen(false)}
          bikeTour={selectedBikeTour}
          mode={formMode}
        />
      </div>
    </div>
  );
});

EnhancedAdminDashboard.displayName = 'EnhancedAdminDashboard';

export default EnhancedAdminDashboard;

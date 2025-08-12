import { memo, useState, useCallback, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Settings, 
  Search,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Menu,
  Bike,
  Mountain
} from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { UniversalModal } from '../ui/UniversalModal';
import { 
  adminFirebaseService, 
  User, 
  Vehicle, 
  Destination, 
  BikeTour,
  Booking 
} from '../../services/adminFirebaseService';
import toast from 'react-hot-toast';

// Types for admin data
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





// Memoized Stats Card Component
const StatsCard = memo<{
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color: string;
}>(({ title, value, icon: Icon, trend, color }) => (
  <motion.div
    whileHover={{ y: -2, scale: 1.02 }}
    className="cursor-pointer"
  >
    <OptimizedGlass intensity="medium" className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {trend && (
            <p className={`text-sm mt-1 ${color}`}>
              {trend}
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color.includes('green') ? 'bg-green-500/20' : 
          color.includes('blue') ? 'bg-blue-500/20' : 
          color.includes('purple') ? 'bg-purple-500/20' : 'bg-orange-500/20'}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </OptimizedGlass>
  </motion.div>
));

StatsCard.displayName = 'StatsCard';

// Memoized Data Table Component
const DataTable = memo<{
  data: any[];
  columns: string[];
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onView?: (item: any) => void;
}>(({ data, columns, onEdit, onDelete, onView }) => {
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = useMemo(() => {
    let filtered = data.filter(item =>
      Object.values(item).some(value =>
        value?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );

    if (sortColumn) {
      filtered.sort((a, b) => {
        const aVal = a[sortColumn];
        const bVal = b[sortColumn];
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
    }

    return filtered;
  }, [data, searchTerm, sortColumn, sortDirection]);

  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  }, [sortColumn]);

  return (
    <OptimizedGlass intensity="medium" className="overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-white/10">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              {columns.map(column => (
                <th
                  key={column}
                  onClick={() => handleSort(column)}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-1">
                    <span>{column}</span>
                    {sortColumn === column && (
                      <ChevronDown 
                        className={`w-4 h-4 transition-transform ${
                          sortDirection === 'desc' ? 'transform rotate-180' : ''
                        }`} 
                      />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredData.map((item, index) => (
              <tr key={index} className="hover:bg-white/5 transition-colors">
                {columns.map(column => (
                  <td key={column} className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    {item[column]}
                  </td>
                ))}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <div className="flex items-center justify-end space-x-2">
                    {onView && (
                      <Button
                        onClick={() => onView(item)}
                        className="p-2 bg-blue-500/20 hover:bg-blue-500/40 text-blue-300"
                      >
                        <Eye size={16} />
                      </Button>
                    )}
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(item)}
                        className="p-2 bg-green-500/20 hover:bg-green-500/40 text-green-300"
                      >
                        <Edit size={16} />
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={() => onDelete(item)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 text-red-300"
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && (
        <div className="p-8 text-center text-gray-400">
          No data found
        </div>
      )}
    </OptimizedGlass>
  );
});

DataTable.displayName = 'DataTable';

// Memoized Sidebar Component
const AdminSidebar = memo<{
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  tabs: TabConfig[];
}>(({ activeTab, onTabChange, isCollapsed, onToggleCollapse, tabs }) => (
  <motion.div
    animate={{ width: isCollapsed ? 64 : 256 }}
    className="bg-black/20 backdrop-blur-md border-r border-white/10 h-full"
  >
    <div className="p-4">
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && (
          <h2 className="text-xl font-bold text-white">Admin Panel</h2>
        )}
        <Button
          onClick={onToggleCollapse}
          className="p-2 bg-white/10 hover:bg-white/20"
        >
          <Menu size={20} />
        </Button>
      </div>

      <nav className="space-y-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={20} />
              {!isCollapsed && (
                <>
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count && (
                    <span className="px-2 py-1 text-xs bg-white/20 rounded-full">
                      {tab.count}
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  </motion.div>
));

AdminSidebar.displayName = 'AdminSidebar';

// Mock data for demonstration


// Main Streamlined Admin Dashboard
export const NewAdminDashboard = memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
    const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: string;
    data: any;
  }>({ isOpen: false, type: '', data: {} });

  // State management
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
  const [bikeTours, setBikeTours] = useState<BikeTour[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize real-time listeners
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      try {
        // Setup real-time listeners
        await adminFirebaseService.getDashboardStats(setStats);
        await adminFirebaseService.getUsers(setUsers);
        await adminFirebaseService.getVehicles(setVehicles);
        await adminFirebaseService.getDestinations(setDestinations);
        await adminFirebaseService.getBikeTours(setBikeTours);
        await adminFirebaseService.getBookings(setBookings);
      } catch (error) {
        console.error('Error initializing admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();

    // Cleanup listeners on unmount
    return () => {
      adminFirebaseService.cleanup();
    };
  }, []);

  const dynamicTabConfigs = useMemo(() => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'bookings', label: 'Bookings', icon: MapPin, count: bookings.length },
    { id: 'users', label: 'Users', icon: Users, count: users.length },
    { id: 'vehicles', label: 'Vehicles', icon: Car, count: vehicles.length },
    { id: 'destinations', label: 'Destinations', icon: Mountain, count: destinations.length },
    { id: 'tours', label: 'Tours', icon: Bike, count: bikeTours.length },
    { id: 'settings', label: 'Settings', icon: Settings }
  ], [bookings.length, users.length, vehicles.length, destinations.length, bikeTours.length]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab);
  }, []);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  const openModal = useCallback((type: string, data: any = {}) => {
    setModalState({ isOpen: true, type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const renderContent = useMemo(() => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatsCard title="Total Bookings" value={stats.totalBookings} icon={MapPin} trend="+12%" color="text-green-400" />
              <StatsCard title="Total Users" value={stats.totalUsers} icon={Users} trend="+8%" color="text-blue-400" />
              <StatsCard title="Vehicles" value={stats.totalVehicles} icon={Car} color="text-purple-400" />
              <StatsCard title="Revenue" value={`₹${(stats.revenue / 100000).toFixed(1)}L`} icon={LayoutDashboard} trend="+15%" color="text-orange-400" />
              <StatsCard title="Active Trips" value={stats.activeTrips} icon={MapPin} color="text-green-400" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
                <DataTable data={bookings.slice(0, 5)} columns={['id', 'user', 'vehicle', 'amount', 'status']} onView={(item) => openModal('booking-detail', item)} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
                <DataTable data={users.slice(0, 5)} columns={['name', 'email', 'bookings', 'status']} onEdit={(item) => openModal('edit-user', item)} />
              </div>
            </div>
          </div>
        );
      case 'bookings':
        return <DataTable data={bookings} columns={['id', 'user', 'vehicle', 'date', 'amount', 'status']} onView={(item) => openModal('booking-detail', item)} onEdit={(item) => openModal('edit-booking', item)} onDelete={(item) => openModal('delete-booking', item)} />;
      case 'users':
        return <DataTable data={users} columns={['name', 'email', 'phone', 'bookings', 'status']} onView={(item) => openModal('user-detail', item)} onEdit={(item) => openModal('edit-user', item)} onDelete={(item) => openModal('delete-user', item)} />;
      case 'vehicles':
        return <DataTable data={vehicles} columns={['name', 'type', 'price', 'status']} onView={(item) => openModal('vehicle-detail', item)} onEdit={(item) => openModal('edit-vehicle', item)} onDelete={(item) => openModal('delete-vehicle', item)} />;
      case 'destinations':
        return <DataTable data={destinations} columns={['name', 'region', 'rating']} onView={(item) => openModal('destination-detail', item)} onEdit={(item) => openModal('edit-destination', item)} onDelete={(item) => openModal('delete-destination', item)} />;
      case 'tours':
        return <DataTable data={bikeTours} columns={['name', 'duration', 'price', 'difficulty']} onView={(item) => openModal('tour-detail', item)} onEdit={(item) => openModal('edit-tour', item)} onDelete={(item) => openModal('delete-tour', item)} />;
      case 'settings':
        return <div className="text-white">Settings Page - Coming Soon</div>;
      default:
        return null;
    }
  }, [activeTab, stats, bookings, users, vehicles, destinations, bikeTours, openModal]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="flex flex-col items-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-t-transparent border-blue-500 rounded-full"
          />
          <p className="mt-4 text-lg">Loading Admin Console...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar 
          activeTab={activeTab} 
          onTabChange={handleTabChange} 
          isCollapsed={isCollapsed} 
          onToggleCollapse={toggleCollapse} 
          tabs={dynamicTabConfigs}
        />

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Universal Modal for Admin Actions */}
      <UniversalModal
        type="custom"
        isOpen={modalState.isOpen}
        onClose={closeModal}
        customContent={
          <div className="p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalState.type.replace('-', ' ').toUpperCase()}
            </h3>
            <p className="text-gray-300 mb-6">
              Detailed {modalState.type} interface will be implemented here.
            </p>
            <Button onClick={closeModal} className="bg-purple-600 hover:bg-purple-700">
              Close
            </Button>
          </div>
        }
      />
    </div>
  );
});

NewAdminDashboard.displayName = 'NewAdminDashboard';

export default NewAdminDashboard;

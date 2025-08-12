import { memo, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  MapPin, 
  Settings, 
  Search,
  Filter,
  Download,
  ChevronDown,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Eye,
  Menu,
  X
} from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { UniversalModal } from '../ui/UniversalModal';

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

// Performance-optimized admin data
const mockStats: AdminStats = {
  totalBookings: 1247,
  totalUsers: 892,
  totalVehicles: 45,
  revenue: 2847500,
  activeTrips: 23
};

const tabConfigs: TabConfig[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'bookings', label: 'Bookings', icon: MapPin, count: 1247 },
  { id: 'users', label: 'Users', icon: Users, count: 892 },
  { id: 'vehicles', label: 'Vehicles', icon: Car, count: 45 },
  { id: 'settings', label: 'Settings', icon: Settings }
];

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
}>(({ activeTab, onTabChange, isCollapsed, onToggleCollapse }) => (
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
        {tabConfigs.map(tab => {
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
const mockBookings = Array.from({ length: 50 }, (_, i) => ({
  id: `BK${1000 + i}`,
  user: `User ${i + 1}`,
  vehicle: `Vehicle ${(i % 10) + 1}`,
  date: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toLocaleDateString(),
  amount: `₹${(Math.random() * 50000 + 10000).toFixed(0)}`,
  status: ['Confirmed', 'Pending', 'Completed', 'Cancelled'][Math.floor(Math.random() * 4)]
}));

const mockUsers = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
  bookings: Math.floor(Math.random() * 10),
  status: ['Active', 'Inactive'][Math.floor(Math.random() * 2)]
}));

// Main Streamlined Admin Dashboard
export const StreamlinedAdminDashboard = memo(() => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    type: string;
    data: any;
  }>({ isOpen: false, type: '', data: {} });

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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <StatsCard
                title="Total Bookings"
                value={mockStats.totalBookings}
                icon={MapPin}
                trend="+12% from last month"
                color="text-green-400"
              />
              <StatsCard
                title="Total Users"
                value={mockStats.totalUsers}
                icon={Users}
                trend="+8% from last month"
                color="text-blue-400"
              />
              <StatsCard
                title="Vehicles"
                value={mockStats.totalVehicles}
                icon={Car}
                color="text-purple-400"
              />
              <StatsCard
                title="Revenue"
                value={`₹${(mockStats.revenue / 100000).toFixed(1)}L`}
                icon={LayoutDashboard}
                trend="+15% from last month"
                color="text-orange-400"
              />
              <StatsCard
                title="Active Trips"
                value={mockStats.activeTrips}
                icon={MapPin}
                color="text-green-400"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Bookings</h3>
                <DataTable
                  data={mockBookings.slice(0, 5)}
                  columns={['id', 'user', 'vehicle', 'amount', 'status']}
                  onView={(item) => openModal('booking-detail', item)}
                />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white mb-4">Recent Users</h3>
                <DataTable
                  data={mockUsers.slice(0, 5)}
                  columns={['name', 'email', 'bookings', 'status']}
                  onEdit={(item) => openModal('edit-user', item)}
                />
              </div>
            </div>
          </div>
        );

      case 'bookings':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Bookings</h2>
              <div className="flex space-x-4">
                <Button className="bg-green-600 hover:bg-green-700">
                  <Download size={20} className="mr-2" />
                  Export
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Plus size={20} className="mr-2" />
                  Add Booking
                </Button>
              </div>
            </div>
            <DataTable
              data={mockBookings}
              columns={['id', 'user', 'vehicle', 'date', 'amount', 'status']}
              onView={(item) => openModal('booking-detail', item)}
              onEdit={(item) => openModal('edit-booking', item)}
              onDelete={(item) => openModal('confirm-delete', item)}
            />
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">All Users</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus size={20} className="mr-2" />
                Add User
              </Button>
            </div>
            <DataTable
              data={mockUsers}
              columns={['name', 'email', 'phone', 'bookings', 'status']}
              onView={(item) => openModal('user-detail', item)}
              onEdit={(item) => openModal('edit-user', item)}
              onDelete={(item) => openModal('confirm-delete', item)}
            />
          </div>
        );

      case 'vehicles':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Fleet Management</h2>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Plus size={20} className="mr-2" />
                Add Vehicle
              </Button>
            </div>
            <OptimizedGlass intensity="medium" className="p-8 text-center">
              <p className="text-gray-300">Vehicle management interface coming soon...</p>
            </OptimizedGlass>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Settings</h2>
            <OptimizedGlass intensity="medium" className="p-8 text-center">
              <p className="text-gray-300">Settings interface coming soon...</p>
            </OptimizedGlass>
          </div>
        );

      default:
        return null;
    }
  }, [activeTab, openModal]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/95 via-blue-900/95 to-indigo-900/95">
      <div className="flex h-screen">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
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

StreamlinedAdminDashboard.displayName = 'StreamlinedAdminDashboard';

export default StreamlinedAdminDashboard;

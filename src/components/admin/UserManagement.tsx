import { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Ban, 
  CheckCircle, 
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Download,
  RefreshCw
} from 'lucide-react';
import { OptimizedGlass } from '../ui/OptimizedGlass';
import { Button } from '../ui/Button';
import { adminFirebaseService, User, Booking } from '../../services/adminFirebaseService';
import toast from 'react-hot-toast';

interface UserManagementProps {
  users: User[];
  onUpdateUser: (userId: string, updates: Partial<User>) => void;
}

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  userBookings: Booking[];
}

const UserDetailModal = memo(({ user, isOpen, onClose, userBookings }: UserDetailModalProps) => {
  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
        >
          <OptimizedGlass intensity="high" className="relative">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h2 className="text-2xl font-bold text-white">User Details</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="text-white/60 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </Button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6">
              {/* User Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="text-white font-medium">{user.name}</div>
                          <div className="text-white/60 text-sm">Member since {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-white/80">
                        <Mail className="w-4 h-4" />
                        <span>{user.email}</span>
                      </div>
                      
                      {user.phone && (
                        <div className="flex items-center gap-3 text-white/80">
                          <Phone className="w-4 h-4" />
                          <span>{user.phone}</span>
                        </div>
                      )}
                      
                      {user.address && (
                        <div className="flex items-center gap-3 text-white/80">
                          <MapPin className="w-4 h-4" />
                          <span>{user.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white mb-4">Account Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Status:</span>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        user.status === 'active' ? 'bg-green-400/20 text-green-400' :
                        user.status === 'inactive' ? 'bg-gray-400/20 text-gray-400' :
                        'bg-red-400/20 text-red-400'
                      }`}>
                        {user.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Total Bookings:</span>
                      <span className="text-purple-400 font-medium">{user.totalBookings}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Total Spent:</span>
                      <span className="text-green-400 font-medium">₹{user.totalSpent?.toLocaleString() || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Last Login:</span>
                      <span className="text-white/60 text-sm">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Preferences */}
              {user.preferences && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-white mb-4">Preferences</h3>
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.preferences.preferredVehicleType && (
                        <div>
                          <span className="text-white/60 text-sm">Preferred Vehicle:</span>
                          <div className="text-white">{user.preferences.preferredVehicleType}</div>
                        </div>
                      )}
                      {user.preferences.preferredRegions && user.preferences.preferredRegions.length > 0 && (
                        <div>
                          <span className="text-white/60 text-sm">Preferred Regions:</span>
                          <div className="text-white">{user.preferences.preferredRegions.join(', ')}</div>
                        </div>
                      )}
                      <div>
                        <span className="text-white/60 text-sm">Marketing Emails:</span>
                        <div className="text-white">{user.preferences.emailNotifications ? 'Enabled' : 'Disabled'}</div>
                      </div>
                      <div>
                        <span className="text-white/60 text-sm">SMS Notifications:</span>
                        <div className="text-white">{user.preferences.smsNotifications ? 'Enabled' : 'Disabled'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Booking History */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Booking History</h3>
                <div className="space-y-3">
                  {userBookings.length > 0 ? (
                    userBookings.map((booking) => (
                      <div key={booking.id} className="bg-white/5 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="text-white font-medium">{booking.itemName}</div>
                            <div className="text-white/60 text-sm">{booking.itemType}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-green-400 font-medium">₹{booking.totalAmount.toLocaleString()}</div>
                            <div className={`text-xs px-2 py-1 rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-400/20 text-green-400' :
                              booking.status === 'pending' ? 'bg-yellow-400/20 text-yellow-400' :
                              booking.status === 'cancelled' ? 'bg-red-400/20 text-red-400' :
                              'bg-blue-400/20 text-blue-400'
                            }`}>
                              {booking.status}
                            </div>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-white/70">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Start: {new Date(booking.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>End: {new Date(booking.endDate).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span>Guests: {booking.guests}</span>
                          </div>
                        </div>
                        
                        {booking.specialRequests && (
                          <div className="mt-3 pt-3 border-t border-white/10">
                            <span className="text-white/60 text-sm">Special Requests: </span>
                            <span className="text-white/80 text-sm">{booking.specialRequests}</span>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-white/5 rounded-lg p-8 text-center">
                      <Calendar className="w-12 h-12 text-white/40 mx-auto mb-4" />
                      <p className="text-white/60">No bookings found</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </OptimizedGlass>
        </motion.div>
      </div>
    </AnimatePresence>
  );
});

UserDetailModal.displayName = 'UserDetailModal';

export const UserManagement = memo(({ users, onUpdateUser }: UserManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt' | 'totalBookings' | 'lastLogin'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Filter and sort users
  const filteredAndSortedUsers = users
    .filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];
      
      if (sortBy === 'createdAt' || sortBy === 'lastLogin') {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  // Handle user status update
  const handleStatusUpdate = async (userId: string, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      await adminFirebaseService.updateUser(userId, { status: newStatus });
      onUpdateUser(userId, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  // Handle view user details
  const handleViewUser = async (user: User) => {
    setSelectedUser(user);
    setIsLoading(true);
    
    try {
      // Fetch user's bookings
      const bookings = await adminFirebaseService.getUserBookings(user.id);
      setUserBookings(bookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      setUserBookings([]);
    } finally {
      setIsLoading(false);
      setUserModalOpen(true);
    }
  };

  // Export user data
  const handleExportUsers = async () => {
    try {
      const data = filteredAndSortedUsers.map(user => ({
        name: user.name,
        email: user.email,
        phone: user.phone,
        status: user.status,
        totalBookings: user.totalBookings,
        totalSpent: user.totalSpent,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }));
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('User data exported successfully');
    } catch (error) {
      console.error('Error exporting users:', error);
      toast.error('Failed to export user data');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'inactive':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      case 'suspended':
        return <Ban className="w-4 h-4 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">User Management</h2>
        <div className="flex gap-3">
          <Button
            onClick={handleExportUsers}
            className="bg-green-600 hover:bg-green-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export Users
          </Button>
        </div>
      </div>

      <OptimizedGlass intensity="medium" className="p-6">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white"
            >
              <option value="createdAt">Sort by Join Date</option>
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="totalBookings">Sort by Bookings</option>
              <option value="lastLogin">Sort by Last Login</option>
            </select>
            
            <Button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              variant="ghost"
              className="text-white/70 hover:text-white"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">{users.length}</div>
            <div className="text-white/60 text-sm">Total Users</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {users.filter(u => u.status === 'active').length}
            </div>
            <div className="text-white/60 text-sm">Active Users</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {users.filter(u => u.totalBookings > 0).length}
            </div>
            <div className="text-white/60 text-sm">With Bookings</div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">
              {users.filter(u => u.status === 'suspended').length}
            </div>
            <div className="text-white/60 text-sm">Suspended</div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/20">
                <th className="text-left text-white/80 py-3 px-4">User</th>
                <th className="text-left text-white/80 py-3 px-4">Contact</th>
                <th className="text-left text-white/80 py-3 px-4">Bookings</th>
                <th className="text-left text-white/80 py-3 px-4">Status</th>
                <th className="text-left text-white/80 py-3 px-4">Last Login</th>
                <th className="text-left text-white/80 py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedUsers.map((user) => (
                <tr key={user.id} className="border-b border-white/10 hover:bg-white/5">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-medium">{user.name}</div>
                        <div className="text-white/60 text-sm">
                          Member since {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white/80 text-sm">{user.email}</div>
                    {user.phone && (
                      <div className="text-white/60 text-xs">{user.phone}</div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-purple-400 font-medium">{user.totalBookings}</div>
                    <div className="text-green-400 text-sm">
                      ₹{(user.totalSpent || 0).toLocaleString()}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <select
                        value={user.status}
                        onChange={(e) => handleStatusUpdate(user.id, e.target.value as any)}
                        className="bg-white/10 border border-white/20 text-white text-sm rounded px-2 py-1"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white/60 text-sm">
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'
                      }
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewUser(user)}
                        size="sm"
                        variant="ghost"
                        className="text-blue-400 hover:text-blue-300"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAndSortedUsers.length === 0 && (
          <div className="text-center py-8">
            <div className="text-white/60">No users found matching your criteria</div>
          </div>
        )}
      </OptimizedGlass>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        userBookings={userBookings}
      />
    </div>
  );
});

UserManagement.displayName = 'UserManagement';

export default UserManagement;

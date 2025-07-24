import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Users as UsersIcon, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  Activity,
  Eye,
  Shield,
  ShieldOff
} from 'lucide-react';
import { GlassCard } from '../../ui/GlassCard';
import { Button } from '../../ui/Button';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import toast from 'react-hot-toast';

interface UserData {
  id: string;
  name: string;
  email: string;
  phone: string;
  region: string;
  emergencyContact?: string;
  createdAt: Date;
  lastLogin?: Date;
  totalBookings: number;
  totalSpent: number;
  isActive: boolean;
  status: 'active' | 'blocked';
}

export function UsersPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const usersData = await loadUsersData();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadUsersData = async (): Promise<UserData[]> => {
    try {
      // Try Firestore first
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      
      if (!snapshot.empty) {
        const firestoreUsers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Unknown',
            email: data.email || '',
            phone: data.phone || '',
            region: data.region || '',
            emergencyContact: data.emergencyContact,
            createdAt: data.createdAt?.toDate() || new Date(),
            lastLogin: data.lastLogin?.toDate(),
            isActive: data.isActive !== false,
            status: data.status || 'active',
            totalBookings: 0,
            totalSpent: 0
          };
        });

        // Calculate booking stats for each user
        const bookingsRef = collection(db, 'bookings');
        const bookingsSnapshot = await getDocs(bookingsRef);
        
        firestoreUsers.forEach(user => {
          const userBookings = bookingsSnapshot.docs.filter(doc => 
            doc.data().userId === user.id || doc.data().userEmail === user.email
          );
          
          user.totalBookings = userBookings.length;
          user.totalSpent = userBookings.reduce((sum, booking) => {
            const data = booking.data();
            return sum + (data.paymentInfo?.amount || data.totalAmount || 0);
          }, 0);
        });

        return firestoreUsers;
      }
    } catch (error) {
      console.log('Firestore not available, using localStorage fallback');
    }

    // Fallback to localStorage
    const allUsers: UserData[] = [];
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    
    storedUsers.forEach((user: any) => {
      const userTrips = JSON.parse(localStorage.getItem(`trips_${user.id}`) || '[]');
      
      const totalBookings = userTrips.length;
      const totalSpent = userTrips.reduce((sum: number, trip: any) => {
        return sum + (trip.paymentInfo?.amount || 0);
      }, 0);

      allUsers.push({
        id: user.id,
        name: user.name || 'Unknown',
        email: user.email || '',
        phone: user.phone || '',
        region: user.region || '',
        emergencyContact: user.emergencyContact,
        createdAt: user.createdAt ? new Date(user.createdAt) : new Date(),
        lastLogin: user.lastLogin ? new Date(user.lastLogin) : undefined,
        isActive: user.isActive !== false,
        status: user.status || 'active',
        totalBookings,
        totalSpent
      });
    });

    return allUsers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.includes(searchTerm) ||
        user.region.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredUsers(filtered);
  };

  const toggleUserStatus = async (userId: string, currentStatus: 'active' | 'blocked') => {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active';
    
    try {
      // Update in Firestore if available
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, { 
          status: newStatus,
          isActive: newStatus === 'active'
        });
      } catch (error) {
        // Fallback to localStorage update
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const userIndex = storedUsers.findIndex((user: any) => user.id === userId);
        if (userIndex !== -1) {
          storedUsers[userIndex].status = newStatus;
          storedUsers[userIndex].isActive = newStatus === 'active';
          localStorage.setItem('users', JSON.stringify(storedUsers));
        }
      }

      // Update local state
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, status: newStatus, isActive: newStatus === 'active' } : user
      ));

      toast.success(`User ${newStatus === 'active' ? 'activated' : 'blocked'} successfully`);
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'text-green-400 bg-green-500/20 border-green-500/30'
      : 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-white/20 rounded animate-pulse"></div>
        <GlassCard className="animate-pulse">
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-white/10 rounded"></div>
            ))}
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Users Management</h1>
        <p className="text-white/60">View and manage all registered users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/60 text-sm">Total Users</p>
                  <p className="text-2xl font-bold text-white">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-blue-400" />
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
                  <p className="text-white/60 text-sm">Active Users</p>
                  <p className="text-2xl font-bold text-white">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-400" />
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
                  <p className="text-white/60 text-sm">Total Bookings</p>
                  <p className="text-2xl font-bold text-white">
                    {users.reduce((sum, user) => sum + user.totalBookings, 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Search */}
      <GlassCard>
        <div className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search users by name, email, phone, or region..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/40"
            />
          </div>
        </div>
      </GlassCard>

      {/* Users Table */}
      <GlassCard>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">
              All Users ({filteredUsers.length})
            </h2>
          </div>

          {filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-16 h-16 text-white/30 mx-auto mb-4" />
              <p className="text-white/60 text-lg">No users found</p>
              <p className="text-white/40">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Users will appear here once they register'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-white/60 font-medium pb-3">User</th>
                    <th className="text-left text-white/60 font-medium pb-3">Contact</th>
                    <th className="text-left text-white/60 font-medium pb-3">Region</th>
                    <th className="text-left text-white/60 font-medium pb-3">Bookings</th>
                    <th className="text-left text-white/60 font-medium pb-3">Total Spent</th>
                    <th className="text-left text-white/60 font-medium pb-3">Status</th>
                    <th className="text-center text-white/60 font-medium pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/5 hover:bg-white/5"
                    >
                      <td className="py-4">
                        <div>
                          <p className="text-white font-medium">{user.name}</p>
                          <p className="text-white/60 text-sm">
                            Joined {user.createdAt.toLocaleDateString()}
                          </p>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-white/80 text-sm">
                          <p className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                          {user.phone && (
                            <p className="flex items-center gap-1 mt-1">
                              <Phone className="w-3 h-3" />
                              {user.phone}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="flex items-center gap-1 text-white/80">
                          <MapPin className="w-3 h-3" />
                          {user.region || 'Not specified'}
                        </span>
                      </td>
                      <td className="py-4 text-white/80">{user.totalBookings}</td>
                      <td className="py-4 text-white/80">
                        ₹{user.totalSpent.toLocaleString()}
                      </td>
                      <td className="py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                          {user.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setShowDetailsModal(true);
                            }}
                            className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => toggleUserStatus(user.id, user.status)}
                            className={`p-2 rounded-lg transition-colors ${
                              user.status === 'active'
                                ? 'text-red-400 hover:bg-red-500/20'
                                : 'text-green-400 hover:bg-green-500/20'
                            }`}
                            title={user.status === 'active' ? 'Block User' : 'Activate User'}
                          >
                            {user.status === 'active' ? (
                              <ShieldOff className="w-4 h-4" />
                            ) : (
                              <Shield className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </GlassCard>

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <GlassCard>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">User Details</h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Basic Information</h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Name</p>
                          <p className="text-white">{selectedUser.name}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Email</p>
                          <p className="text-white">{selectedUser.email}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Phone</p>
                          <p className="text-white">{selectedUser.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Region</p>
                          <p className="text-white">{selectedUser.region || 'Not specified'}</p>
                        </div>
                      </div>
                      {selectedUser.emergencyContact && (
                        <div>
                          <p className="text-white/60 text-sm">Emergency Contact</p>
                          <p className="text-white">{selectedUser.emergencyContact}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Info */}
                  <div>
                    <h4 className="text-white font-semibold mb-3">Account Information</h4>
                    <div className="bg-white/5 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-white/60 text-sm">Joined Date</p>
                          <p className="text-white">{selectedUser.createdAt.toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Status</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                            {selectedUser.status.toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Total Bookings</p>
                          <p className="text-white">{selectedUser.totalBookings}</p>
                        </div>
                        <div>
                          <p className="text-white/60 text-sm">Total Spent</p>
                          <p className="text-white">₹{selectedUser.totalSpent.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => toggleUserStatus(selectedUser.id, selectedUser.status)}
                    variant={selectedUser.status === 'active' ? 'secondary' : 'primary'}
                    className="flex-1"
                  >
                    {selectedUser.status === 'active' ? (
                      <>
                        <ShieldOff className="w-4 h-4 mr-2" />
                        Block User
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Activate User
                      </>
                    )}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowDetailsModal(false)}
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      )}
    </div>
  );
}

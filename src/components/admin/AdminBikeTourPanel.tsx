import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// Using simple SVG icons instead of heroicons
const PlusIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
  </svg>
);

const PencilIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const TrashIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const EyeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const SearchIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const RefreshIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const ClockIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CurrencyRupeeIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const MapPinIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const StarIcon = ({ className }: { className: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
  </svg>
);
import { BikeTourPlan } from '../../data/bikeTourPlans';
import BikeTourPlanService from '../../services/bikeTourPlanService';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { GlassCard } from '../ui/GlassCard';

interface AdminBikeTourPanelProps {
  onClose?: () => void;
}

const AdminBikeTourPanel: React.FC<AdminBikeTourPanelProps> = ({ onClose }) => {
  const { isAdmin } = useAuth();
  const [plans, setPlans] = useState<BikeTourPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<BikeTourPlan | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Form component placeholder
  const BikeTourPlanForm = ({ plan, onSubmit, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">
          {plan ? 'Edit Plan' : 'Create Plan'}
        </h3>
        <p className="text-gray-600 mb-4">Form component will be implemented here</p>
        <div className="flex gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Cancel</button>
        </div>
      </div>
    </div>
  );

  // Details component placeholder
  const BikeTourPlanDetails = ({ plan, onEdit, onClose }: any) => (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <h3 className="text-lg font-bold mb-4">{plan?.name}</h3>
        <p className="text-gray-600 mb-4">Details component will be implemented here</p>
        <div className="flex gap-2">
          <button onClick={onEdit} className="px-4 py-2 bg-blue-500 text-white rounded">Edit</button>
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">Close</button>
        </div>
      </div>
    </div>
  );

  // Real-time subscription to bike tour plans
  useEffect(() => {
    if (!isAdmin) return;

    const unsubscribe = BikeTourPlanService.subscribeToBikeTourPlans((updatedPlans) => {
      setPlans(updatedPlans);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Initialize default plans if collection is empty
  useEffect(() => {
    if (isAdmin) {
      BikeTourPlanService.autoSyncIfEmpty();
    }
  }, [isAdmin]);

  // Filter plans based on search and filters
  const filteredPlans = plans.filter(plan => {
    const matchesSearch = plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         plan.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDifficulty = filterDifficulty === 'all' || plan.difficulty === filterDifficulty;
    
    const matchesDuration = filterDuration === 'all' || (() => {
      const duration = parseInt(plan.duration.split(' ')[0]);
      switch (filterDuration) {
        case 'short': return duration <= 7;
        case 'medium': return duration > 7 && duration <= 10;
        case 'long': return duration > 10;
        default: return true;
      }
    })();

    return matchesSearch && matchesDifficulty && matchesDuration;
  });

  const handleCreatePlan = () => {
    setSelectedPlan(null);
    setShowForm(true);
  };

  const handleEditPlan = (plan: BikeTourPlan) => {
    setSelectedPlan(plan);
    setShowForm(true);
  };

  const handleViewPlan = (plan: BikeTourPlan) => {
    setSelectedPlan(plan);
    setShowDetails(true);
  };

  const handleDeletePlan = async (planId: string) => {
    if (deleteConfirm === planId) {
      const success = await BikeTourPlanService.deleteBikeTourPlan(planId);
      if (success) {
        setDeleteConfirm(null);
      }
    } else {
      setDeleteConfirm(planId);
      // Auto-cancel confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleFormSubmit = async (planData: Omit<BikeTourPlan, 'id' | 'created_at' | 'updated_at'>) => {
    let success = false;
    
    if (selectedPlan) {
      // Update existing plan
      success = await BikeTourPlanService.updateBikeTourPlan(selectedPlan.id, planData);
    } else {
      // Create new plan
      const planId = await BikeTourPlanService.createBikeTourPlan(planData);
      success = !!planId;
    }

    if (success) {
      setShowForm(false);
      setSelectedPlan(null);
    }
  };

  const refreshPlans = async () => {
    setLoading(true);
    await BikeTourPlanService.initializeDefaultPlans();
    const updatedPlans = await BikeTourPlanService.getAllBikeTourPlans();
    setPlans(updatedPlans);
    setLoading(false);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
        <GlassCard className="p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-gray-300 mb-6">You don't have permission to access the admin panel.</p>
          <Button onClick={onClose} variant="secondary">
            Go Back
          </Button>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Bike Tour Plans Admin</h1>
            <p className="text-gray-300">Manage your Ladakh bike tour offerings</p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={refreshPlans}
              variant="secondary"
              className="flex items-center gap-2"
            >
              <RefreshIcon className="w-4 h-4" />
              Refresh
            </Button>
            <Button
              onClick={handleCreatePlan}
              className="flex items-center gap-2"
            >
              <PlusIcon className="w-4 h-4" />
              Create Plan
            </Button>
            {onClose && (
              <Button onClick={onClose} variant="secondary">
                Close
              </Button>
            )}
          </div>
        </div>

        {/* Filters and Search */}
        <GlassCard className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search plans by name or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Difficulties</option>
                <option value="easy">Easy</option>
                <option value="moderate">Moderate</option>
                <option value="challenging">Challenging</option>
              </select>
              
              <select
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Durations</option>
                <option value="short">Short (≤7 days)</option>
                <option value="medium">Medium (8-10 days)</option>
                <option value="long">Long (&gt;10 days)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 text-sm text-gray-300">
            Showing {filteredPlans.length} of {plans.length} plans
          </div>
        </GlassCard>

        {/* Plans Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredPlans.map((plan) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <GlassCard className="p-6 hover:bg-white/10 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-bold text-white truncate pr-2">{plan.name}</h3>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleViewPlan(plan)}
                          className="p-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditPlan(plan)}
                          className="p-1 text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletePlan(plan.id)}
                          className={`p-1 transition-colors ${
                            deleteConfirm === plan.id 
                              ? 'text-red-500 bg-red-500/20 rounded' 
                              : 'text-red-400 hover:text-red-300'
                          }`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{plan.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-blue-400" />
                        <span className="text-gray-300">{plan.duration}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <CurrencyRupeeIcon className="w-4 h-4 text-green-400" />
                        <span className="text-gray-300">₹{plan.price.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <StarIcon className="w-4 h-4 text-yellow-400" />
                        <span className="text-gray-300 capitalize">{plan.difficulty}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPinIcon className="w-4 h-4 text-red-400" />
                        <span className="text-gray-300">{plan.itinerary.length} destinations</span>
                      </div>
                    </div>

                    {deleteConfirm === plan.id && (
                      <div className="mt-4 p-2 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs">
                        Click delete again to confirm
                      </div>
                    )}
                  </GlassCard>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredPlans.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl text-white mb-2">No plans found</h3>
            <p className="text-gray-300">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BikeTourPlanForm
          plan={selectedPlan}
          onSubmit={handleFormSubmit}
          onClose={() => {
            setShowForm(false);
            setSelectedPlan(null);
          }}
        />
      )}

      {/* Details Modal */}
      {showDetails && selectedPlan && (
        <BikeTourPlanDetails
          plan={selectedPlan}
          onEdit={() => {
            setShowDetails(false);
            setShowForm(true);
          }}
          onClose={() => {
            setShowDetails(false);
            setSelectedPlan(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminBikeTourPanel;

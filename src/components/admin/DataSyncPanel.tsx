import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { syncExploreDataToFirebase, autoSyncIfEmpty, isCollectionEmpty } from '../../utils/exploreDataSync';
import toast from 'react-hot-toast';

interface CollectionStatus {
  vehicles: boolean;
  destinations: boolean;
  bikeTours: boolean;
  users: boolean;
  bookings: boolean;
}

export function DataSyncPanel() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [collectionStatus, setCollectionStatus] = useState<CollectionStatus>({
    vehicles: false,
    destinations: false,
    bikeTours: false,
    users: false,
    bookings: false
  });

  // Check collection status on component mount
  useEffect(() => {
    checkCollectionStatus();
  }, []);

  const checkCollectionStatus = async () => {
    setIsLoading(true);
    try {
      const [vehicles, destinations, bikeTours, users, bookings] = await Promise.all([
        isCollectionEmpty('vehicles'),
        isCollectionEmpty('destinations'),
        isCollectionEmpty('bikeTours'),
        isCollectionEmpty('users'),
        isCollectionEmpty('bookings')
      ]);

      setCollectionStatus({
        vehicles: !vehicles, // Invert because we want to show if data EXISTS
        destinations: !destinations,
        bikeTours: !bikeTours,
        users: !users,
        bookings: !bookings
      });
    } catch (error) {
      console.error('Error checking collection status:', error);
      toast.error('Failed to check collection status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncData = async () => {
    setIsSyncing(true);
    try {
      const success = await syncExploreDataToFirebase();
      if (success) {
        toast.success('Data synchronized successfully!');
        // Refresh collection status
        await checkCollectionStatus();
      }
    } catch (error) {
      console.error('Sync error:', error);
      toast.error('Failed to sync data');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleAutoSync = async () => {
    setIsSyncing(true);
    try {
      await autoSyncIfEmpty();
      toast.success('Auto-sync completed!');
      // Refresh collection status
      await checkCollectionStatus();
    } catch (error) {
      console.error('Auto-sync error:', error);
      toast.error('Failed to auto-sync');
    } finally {
      setIsSyncing(false);
    }
  };

  const getStatusColor = (hasData: boolean) => {
    return hasData ? 'text-green-600' : 'text-red-600';
  };

  const getStatusText = (hasData: boolean) => {
    return hasData ? 'Has Data' : 'Empty';
  };

  const getStatusIcon = (hasData: boolean) => {
    return hasData ? '✅' : '❌';
  };

  const allHaveData = Object.values(collectionStatus).every(status => status);
  const someEmpty = Object.values(collectionStatus).some(status => !status);

  return (
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Data Synchronization</h3>
        <Button
          onClick={checkCollectionStatus}
          disabled={isLoading}
          variant="secondary"
          size="sm"
        >
          {isLoading ? 'Checking...' : 'Refresh Status'}
        </Button>
      </div>

      {/* Collection Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {Object.entries(collectionStatus).map(([collection, hasData]) => (
          <div 
            key={collection}
            className="bg-white/5 rounded-lg p-4 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="text-white/80 capitalize font-medium">
                {collection === 'bikeTours' ? 'Bike Tours' : collection}
              </span>
              <span className="text-xl">
                {getStatusIcon(hasData)}
              </span>
            </div>
            <div className={`text-sm font-semibold ${getStatusColor(hasData)}`}>
              {getStatusText(hasData)}
            </div>
          </div>
        ))}
      </div>

      {/* Status Summary */}
      <div className="mb-6">
        {allHaveData ? (
          <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <div>
                <h4 className="text-green-400 font-semibold">All Collections Populated</h4>
                <p className="text-green-300/80 text-sm">
                  All Firebase collections have data. Admin panel should be fully functional.
                </p>
              </div>
            </div>
          </div>
        ) : someEmpty ? (
          <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚠️</span>
              <div>
                <h4 className="text-yellow-400 font-semibold">Partial Data</h4>
                <p className="text-yellow-300/80 text-sm">
                  Some collections are empty. Consider syncing explore page data.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🚨</span>
              <div>
                <h4 className="text-red-400 font-semibold">No Data Found</h4>
                <p className="text-red-300/80 text-sm">
                  All collections are empty. Sync explore page data to populate Firebase.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            onClick={handleAutoSync}
            disabled={isSyncing || isLoading}
            variant="primary"
            className="w-full"
          >
            {isSyncing ? 'Syncing...' : 'Auto Sync (Smart)'}
          </Button>
          
          <Button
            onClick={handleSyncData}
            disabled={isSyncing || isLoading}
            variant="secondary"
            className="w-full"
          >
            {isSyncing ? 'Syncing...' : 'Force Sync All'}
          </Button>
        </div>

        <div className="text-sm text-white/60 space-y-1">
          <p><strong>Auto Sync:</strong> Only syncs if collections are empty (recommended)</p>
          <p><strong>Force Sync:</strong> Syncs all data regardless of existing data</p>
        </div>
      </div>

      {/* Technical Details */}
      <div className="mt-6 pt-4 border-t border-white/10">
        <details className="text-sm">
          <summary className="text-white/80 cursor-pointer hover:text-white">
            Technical Details
          </summary>
          <div className="mt-2 text-white/60 space-y-1">
            <p>• Syncs vehicles from mockData.ts</p>
            <p>• Syncs destinations from OptimizedExploreLadakh.tsx</p>
            <p>• Syncs bike tours from both explore page and mock data</p>
            <p>• Creates sample users and bookings for testing</p>
            <p>• Uses Firestore batch operations for efficiency</p>
          </div>
        </details>
      </div>
    </div>
  );
}

export default DataSyncPanel;

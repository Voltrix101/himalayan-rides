import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { BikeTourPlanService } from '../../services/bikeTourPlanService';

interface AdminInitializerProps {
  onComplete?: () => void;
}

export const AdminBikeTourInitializer: React.FC<AdminInitializerProps> = ({ onComplete }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInitialize = async () => {
    setIsInitializing(true);
    setError(null);
    
    try {
      // Check if collection is empty
      const isEmpty = await BikeTourPlanService.isCollectionEmpty();
      
      if (isEmpty) {
        await BikeTourPlanService.initializeDefaultPlans();
        setIsCompleted(true);
        onComplete?.();
      } else {
        setError('Bike tours already exist in the database');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize bike tours');
    } finally {
      setIsInitializing(false);
    }
  };

  if (isCompleted) {
    return (
      <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 text-center">
        <div className="text-green-400 mb-2">✅ Bike Tours Initialized Successfully!</div>
        <div className="text-sm text-gray-300">
          All default bike tour plans have been added to the database.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-6 text-center">
      <h3 className="text-xl font-bold text-white mb-4">🏍️ Initialize Bike Tours</h3>
      <p className="text-gray-300 mb-6">
        Click the button below to add the default bike tour plans to the database.
        This only needs to be done once.
      </p>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4">
          <div className="text-red-400 text-sm">{error}</div>
        </div>
      )}
      
      <Button
        onClick={handleInitialize}
        disabled={isInitializing}
        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 px-6 py-3"
      >
        {isInitializing ? '🔄 Initializing...' : '🚀 Initialize Bike Tours'}
      </Button>
    </div>
  );
};

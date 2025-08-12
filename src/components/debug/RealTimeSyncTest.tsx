import React, { useState } from 'react';
import { vehiclesService } from '../../services/vehiclesService';
import { Vehicle } from '../../types';

const RealTimeSyncTest: React.FC = () => {
  const [isAdding, setIsAdding] = useState(false);

  const addTestVehicle = async () => {
    setIsAdding(true);
    try {
      const testVehicle: Omit<Vehicle, 'id'> = {
        name: `Test Bike ${Date.now()}`,
        type: 'bike',
        region: 'Leh-Ladakh',
        price: 1500,
        image: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=500',
        rating: 4.5,
        fuel: 'Petrol',
        gearbox: 'Manual',
        features: ['Test Feature 1', 'Test Feature 2'],
        available: true
      };

      await vehiclesService.addVehicle(testVehicle);
      alert('Test vehicle added! Check the Fleet page to see real-time sync.');
    } catch (error) {
      console.error('Error adding test vehicle:', error);
      alert('Error adding vehicle. Check console for details.');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🧪 Real-Time Sync Test</h3>
      
      <p className="text-white/80 mb-4">
        Click the button below to add a test vehicle and see the real-time sync in action:
      </p>
      
      <ol className="text-white/80 text-sm mb-4 space-y-1">
        <li>1. Open Fleet page in another tab: <a href="/fleet" target="_blank" className="text-blue-300 underline">localhost:5174/fleet</a></li>
        <li>2. Click "Add Test Vehicle" below</li>
        <li>3. Watch the vehicle appear instantly on Fleet page! 🚀</li>
      </ol>
      
      <button
        onClick={addTestVehicle}
        disabled={isAdding}
        className="px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-500 text-white font-semibold rounded-lg transition-colors"
      >
        {isAdding ? 'Adding Vehicle...' : '🚀 Add Test Vehicle'}
      </button>
      
      <div className="mt-4 p-3 bg-blue-500/20 rounded border border-blue-300/30">
        <p className="text-blue-200 text-sm">
          💡 <strong>Expected Result:</strong> Vehicle appears instantly on Fleet page without refresh!
        </p>
      </div>
    </div>
  );
};

export default RealTimeSyncTest;

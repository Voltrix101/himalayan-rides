import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { Vehicle } from '../../types';

const FirestoreDebugger: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const checkFirestore = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('🔍 Checking Firestore vehicles collection...');
      const vehiclesSnapshot = await getDocs(collection(db, 'vehicles'));
      
      console.log('📊 Raw Firestore documents:', vehiclesSnapshot.docs.length);
      
      const vehicleData = vehiclesSnapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📄 Document ID:', doc.id, 'Data:', data);
        return {
          id: doc.id,
          ...data
        } as Vehicle;
      });
      
      setVehicles(vehicleData);
      console.log('✅ Processed vehicles:', vehicleData);
    } catch (err: any) {
      console.error('❌ Error checking Firestore:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkFirestore();
  }, []);

  return (
    <div className="p-6 bg-white/10 backdrop-blur-md rounded-lg border border-white/20">
      <h3 className="text-xl font-bold text-white mb-4">🔍 Firestore Debug Panel</h3>
      
      <button
        onClick={checkFirestore}
        disabled={loading}
        className="mb-4 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-500 text-white rounded"
      >
        {loading ? 'Checking...' : 'Check Firestore'}
      </button>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-400/30 rounded">
          <p className="text-red-300">❌ Error: {error}</p>
        </div>
      )}

      <div className="space-y-3">
        <p className="text-white">
          <strong>Total vehicles in database:</strong> {vehicles.length}
        </p>
        
        {vehicles.length > 0 ? (
          <div className="space-y-2">
            <p className="text-green-300 font-semibold">✅ Vehicles found:</p>
            {vehicles.map((vehicle, index) => (
              <div key={vehicle.id} className="p-2 bg-white/5 rounded border border-white/10">
                <p className="text-white text-sm">
                  <strong>{index + 1}. {vehicle.name}</strong> 
                  <span className="text-white/60"> | Type: {vehicle.type} | Region: {vehicle.region}</span>
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-yellow-300">⚠️ No vehicles found in database</p>
        )}

        <div className="mt-4 p-3 bg-blue-500/20 rounded border border-blue-300/30">
          <p className="text-blue-200 text-sm">
            💡 Open browser console (F12) to see detailed logs
          </p>
        </div>
      </div>
    </div>
  );
};

export default FirestoreDebugger;

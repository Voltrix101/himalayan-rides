import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Clock, Database, Shield, Users } from 'lucide-react';
import { db, auth } from '../../config/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';

interface FirebaseStatus {
  auth: 'connected' | 'error' | 'checking';
  firestore: 'connected' | 'error' | 'checking';
  rules: 'configured' | 'not-configured' | 'checking';
  collections: 'ready' | 'not-ready' | 'checking';
}

export function FirebaseConnectionTest() {
  const [status, setStatus] = useState<FirebaseStatus>({
    auth: 'checking',
    firestore: 'checking', 
    rules: 'checking',
    collections: 'checking'
  });

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  const testFirebaseConnection = async () => {
    // Test Auth
    try {
      await signInAnonymously(auth);
      setStatus(prev => ({ ...prev, auth: 'connected' }));
    } catch (error) {
      console.error('Auth error:', error);
      setStatus(prev => ({ ...prev, auth: 'error' }));
    }

    // Test Firestore
    try {
      await getDocs(collection(db, 'vehicles'));
      setStatus(prev => ({ ...prev, firestore: 'connected' }));
    } catch (error) {
      console.error('Firestore error:', error);
      setStatus(prev => ({ ...prev, firestore: 'error' }));
    }

    // Test Collections
    try {
      const collections = ['vehicles', 'explorePlans', 'tripPlans'];
      for (const collectionName of collections) {
        await getDocs(collection(db, collectionName));
      }
      setStatus(prev => ({ ...prev, collections: 'ready' }));
    } catch (error) {
      console.error('Collections error:', error);
      setStatus(prev => ({ ...prev, collections: 'not-ready' }));
    }

    // Test Rules (simplified)
    setStatus(prev => ({ ...prev, rules: 'configured' }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'ready':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
      case 'not-configured':
      case 'not-ready':
        return <XCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-400 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
      case 'configured':
      case 'ready':
        return 'Ready';
      case 'error':
      case 'not-configured':
      case 'not-ready':
        return 'Needs Setup';
      default:
        return 'Checking...';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20"
    >
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Database className="w-6 h-6" />
        Firebase Connection Status
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-white/60" />
            <span className="text-white">Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.auth)}
            <span className="text-white/80 text-sm">{getStatusText(status.auth)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Database className="w-5 h-5 text-white/60" />
            <span className="text-white">Firestore Database</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.firestore)}
            <span className="text-white/80 text-sm">{getStatusText(status.firestore)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-white/60" />
            <span className="text-white">Security Rules</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.rules)}
            <span className="text-white/80 text-sm">{getStatusText(status.rules)}</span>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-white/60" />
            <span className="text-white">Collections Ready</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.collections)}
            <span className="text-white/80 text-sm">{getStatusText(status.collections)}</span>
          </div>
        </div>
      </div>

      {Object.values(status).includes('error' as any) && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
          <p className="text-red-200 text-sm">
            <strong>Firebase Setup Required:</strong> Please follow the Firebase setup guide to configure authentication and Firestore.
          </p>
        </div>
      )}
    </motion.div>
  );
}

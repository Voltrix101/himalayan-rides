import { useState } from 'react';
import { Button } from '../../ui/Button';
import { GlassCard } from '../../ui/GlassCard';
import preloadExperiencesForAdmin from '../../../utils/preloadExperiences';
import { Play, CheckCircle, AlertCircle } from 'lucide-react';

export function ExperiencesPreloader() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handlePreload = async () => {
    setLoading(true);
    setStatus('idle');
    
    try {
      await preloadExperiencesForAdmin();
      setStatus('success');
    } catch (error) {
      console.error('Preload failed:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Experiences Data Preloader
          </h3>
          <p className="text-white/70 text-sm">
            Load the sample Ladakh experiences into the admin dashboard
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">Loaded successfully!</span>
            </div>
          )}
          
          {status === 'error' && (
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">Failed to load</span>
            </div>
          )}
          
          <Button
            onClick={handlePreload}
            disabled={loading}
            variant="glass"
            className="flex items-center gap-2"
          >
            <Play className="w-4 h-4" />
            {loading ? 'Loading...' : 'Preload Experiences'}
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}

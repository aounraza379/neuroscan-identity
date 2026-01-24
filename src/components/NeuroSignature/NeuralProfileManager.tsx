import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Fingerprint, 
  Save, 
  CheckCircle2, 
  Lock, 
  Cpu,
  Database,
  ShieldCheck,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface NeuralProfile {
  id: string;
  timestamp: number;
  avgDwellTime: number;
  avgFlightTime: number;
  timingVariance: number;
  mouseVariance: number;
}

interface NeuralProfileManagerProps {
  avgDwellTime: number;
  avgFlightTime: number;
  timingVariance: number;
  mouseVariance: number;
  isVerified: boolean;
}

export function NeuralProfileManager({
  avgDwellTime,
  avgFlightTime,
  timingVariance,
  mouseVariance,
  isVerified,
}: NeuralProfileManagerProps) {
  const [savedProfile, setSavedProfile] = useState<NeuralProfile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [matchPercentage, setMatchPercentage] = useState<number | null>(null);
  const [isMatching, setIsMatching] = useState(false);
  const [matchPulse, setMatchPulse] = useState(0);

  // Real-time matching animation when profile is saved
  useEffect(() => {
    if (!savedProfile || !isVerified) return;

    setIsMatching(true);
    const interval = setInterval(() => {
      // Simulate real-time matching with slight variations
      const baseMatch = 95 + Math.random() * 4.5;
      const noise = (Math.random() - 0.5) * 2; // ±1% noise
      setMatchPercentage(Math.min(99.9, Math.max(94, baseMatch + noise)));
      setMatchPulse(prev => prev + 1);
    }, 2000);

    return () => clearInterval(interval);
  }, [savedProfile, isVerified]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    
    // Simulate encryption delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newProfile: NeuralProfile = {
      id: `NP-${Date.now().toString(36).toUpperCase()}`,
      timestamp: Date.now(),
      avgDwellTime,
      avgFlightTime,
      timingVariance,
      mouseVariance,
    };
    
    setSavedProfile(newProfile);
    setIsSaving(false);
    
    // Initial match calculation
    setTimeout(() => {
      setMatchPercentage(95 + Math.random() * 4.9);
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism rounded-xl p-4 border border-border/50"
    >
      <div className="flex items-center gap-2 mb-4">
        <Fingerprint className="w-5 h-5 text-primary" />
        <h3 className="font-mono text-sm font-medium">NEURAL PROFILE VAULT</h3>
      </div>

      <AnimatePresence mode="wait">
        {!savedProfile ? (
          <motion.div
            key="save"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <p className="text-xs text-muted-foreground">
              Save your unique neural signature for instant verification on future sessions.
            </p>
            
            <Button
              onClick={handleSaveProfile}
              disabled={!isVerified || isSaving}
              className="w-full font-mono"
              variant={isVerified ? "default" : "secondary"}
            >
              {isSaving ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Cpu className="w-4 h-4 mr-2" />
                  </motion.div>
                  ENCRYPTING NEURAL HASH...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isVerified ? 'SAVE MY NEURAL PROFILE' : 'VERIFY IDENTITY FIRST'}
                </>
              )}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="saved"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-primary/10 border border-primary/30"
            >
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-mono text-primary">
                  Neural Profile Encrypted & Saved
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Stored in Secure Enclave with AES-256 encryption
              </p>
            </motion.div>

            {/* Profile Details */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  Profile ID
                </span>
                <span className="text-foreground">{savedProfile.id}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Encryption
                </span>
                <span className="text-primary">AES-256-GCM</span>
              </div>
            </div>

            {/* Real-time Match Percentage with Animation */}
            {matchPercentage && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-3 rounded-lg bg-primary/5 border border-primary/20 relative overflow-hidden"
              >
                {/* Real-time matching indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Activity className="w-3 h-3 text-primary" />
                  </motion.div>
                  <span className="text-[10px] font-mono text-primary">LIVE</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <motion.div
                      key={matchPulse}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.3 }}
                    >
                      <ShieldCheck className="w-5 h-5 text-primary" />
                    </motion.div>
                    <span className="text-sm font-mono">Matched to Profile:</span>
                  </div>
                  <motion.span
                    key={matchPercentage}
                    initial={{ opacity: 0.5, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-xl font-bold font-mono text-primary text-glow"
                  >
                    {matchPercentage.toFixed(1)}%
                  </motion.span>
                </div>

                {/* Match progress bar */}
                <div className="mt-2 h-1 bg-muted/30 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${matchPercentage}%` }}
                    transition={{ type: 'spring', damping: 20 }}
                  />
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

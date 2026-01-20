import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Fingerprint, Brain, Dna } from 'lucide-react';
import type { BiometricResult } from '@/hooks/useBiometricTracker';

interface VerdictDisplayProps {
  result: BiometricResult | null;
  isVisible: boolean;
}

export function VerdictDisplay({ result, isVisible }: VerdictDisplayProps) {
  if (!result) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className={`glassmorphism rounded-2xl p-6 text-center space-y-4 ${
            result.isHuman ? 'cyber-glow' : 'cyber-glow-danger'
          }`}
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', damping: 10 }}
            className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center ${
              result.isHuman 
                ? 'bg-primary/20 text-primary' 
                : 'bg-destructive/20 text-destructive'
            }`}
          >
            {result.isHuman ? (
              <ShieldCheck className="w-10 h-10" />
            ) : (
              <ShieldAlert className="w-10 h-10" />
            )}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className={`text-2xl font-bold font-mono tracking-wider ${
              result.isHuman ? 'text-primary text-glow' : 'text-destructive'
            }`}>
              {result.isHuman ? 'HUMAN AUTHENTICATED' : 'BOT DETECTED'}
            </h2>
            <p className="text-sm text-muted-foreground mt-2 font-mono">
              {result.reason}
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center gap-6 pt-2"
          >
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Fingerprint className="w-4 h-4" />
              <span>Keystroke DNA</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Brain className="w-4 h-4" />
              <span>Neural Pattern</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Dna className="w-4 h-4" />
              <span>CNS Signature</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldX, Skull } from 'lucide-react';

interface SystemBreachAlertProps {
  isVisible: boolean;
}

export function SystemBreachAlert({ isVisible }: SystemBreachAlertProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ y: 50 }}
            animate={{ y: 0 }}
            className="glassmorphism cyber-glow-danger rounded-2xl p-8 max-w-md mx-4 text-center border-2 border-destructive/50"
          >
            <motion.div
              animate={{ 
                scale: [1, 1.1, 1],
                rotate: [0, -5, 5, 0]
              }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center mb-4"
            >
              <Skull className="w-10 h-10 text-destructive" />
            </motion.div>
            
            <motion.h2
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 0.3, repeat: Infinity }}
              className="text-2xl font-bold font-mono text-destructive mb-2 tracking-wider"
            >
              🚨 SYSTEM BREACH 🚨
            </motion.h2>
            
            <p className="text-sm font-mono text-muted-foreground mb-4">
              Automated input pattern detected. Identity verification FAILED.
            </p>
            
            <div className="flex items-center justify-center gap-4 text-xs font-mono text-destructive">
              <div className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>CONFIDENCE: 0%</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldX className="w-3 h-3" />
                <span>BOT CONFIRMED</span>
              </div>
            </div>
            
            <div className="mt-4 p-2 bg-destructive/10 rounded border border-destructive/30">
              <p className="text-xs font-mono text-destructive/80">
                REASON: Zero timing variance. Mechanical execution confirmed.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

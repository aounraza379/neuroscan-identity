import { motion } from 'framer-motion';
import { ShieldX, AlertTriangle, Lock, Skull, Phone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SecurityBreachLockProps {
  isVisible: boolean;
  onReset: () => void;
}

export function SecurityBreachLock({ isVisible, onReset }: SecurityBreachLockProps) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] bg-background flex items-center justify-center"
    >
      {/* Animated danger background */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ 
            opacity: [0.1, 0.3, 0.1],
            scale: [1, 1.1, 1] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-br from-destructive/30 via-transparent to-destructive/20"
        />
        <div className="absolute inset-0 cyber-grid opacity-30" />
        
        {/* Animated scan lines */}
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute left-0 right-0 h-px bg-destructive/50"
            initial={{ top: `${i * 10}%`, opacity: 0 }}
            animate={{ 
              top: `${i * 10 + 100}%`,
              opacity: [0, 1, 0],
            }}
            transition={{ 
              duration: 3, 
              repeat: Infinity, 
              delay: i * 0.3,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Lock Icon Animation */}
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="relative z-10"
      >
        <div className="glassmorphism border-2 border-destructive/50 rounded-2xl p-8 max-w-lg mx-4 text-center cyber-glow-danger">
          {/* Header Icons */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <AlertTriangle className="w-10 h-10 text-destructive" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              <Skull className="w-16 h-16 text-destructive" />
            </motion.div>
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            >
              <ShieldX className="w-10 h-10 text-destructive" />
            </motion.div>
          </div>

          {/* Main Title */}
          <motion.h1
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-3xl md:text-4xl font-bold font-mono text-destructive mb-4 tracking-wider"
          >
            🔒 ACCOUNT LOCKED 🔒
          </motion.h1>

          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30">
              <h2 className="text-xl font-mono font-bold text-destructive mb-2">
                SECURITY BREACH DETECTED
              </h2>
              <p className="text-sm text-muted-foreground">
                Automated attack pattern identified. Your session has been terminated 
                to protect your financial assets.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs font-mono text-muted-foreground">THREAT LEVEL</p>
                <p className="text-lg font-bold text-destructive">CRITICAL</p>
              </div>
              <div className="p-3 bg-card/50 rounded-lg border border-border/50">
                <p className="text-xs font-mono text-muted-foreground">BOT CONFIDENCE</p>
                <p className="text-lg font-bold text-destructive">100%</p>
              </div>
            </div>

            <div className="p-3 bg-destructive/5 rounded-lg border border-destructive/20">
              <div className="flex items-center gap-2 text-destructive mb-2">
                <Lock className="w-4 h-4" />
                <span className="text-sm font-mono font-bold">REASON FOR LOCKOUT:</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Zero timing variance detected. Mechanical input patterns confirm 
                automated bot execution. Human CNS cannot produce such precision.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                onClick={onReset}
                variant="outline"
                className="w-full font-mono border-destructive/50 hover:bg-destructive/10"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                RESTART VERIFICATION
              </Button>
              
              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Phone className="w-3 h-3" />
                <span>Contact fraud department: 1-800-SECURE</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

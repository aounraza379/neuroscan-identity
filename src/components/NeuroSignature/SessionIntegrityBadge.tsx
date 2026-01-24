import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ShieldX, Cpu } from 'lucide-react';

interface SessionIntegrityBadgeProps {
  isVerified: boolean;
  isBreached: boolean;
  confidence: number;
  isStaticDevice?: boolean;
}

export function SessionIntegrityBadge({ 
  isVerified, 
  isBreached, 
  confidence,
  isStaticDevice = false
}: SessionIntegrityBadgeProps) {
  const getStatus = () => {
    if (isBreached || isStaticDevice) {
      return {
        icon: ShieldX,
        label: 'SECURITY LOCKDOWN',
        color: 'text-destructive',
        bg: 'bg-destructive/20',
        border: 'border-destructive',
        pulse: true,
      };
    }
    if (isVerified && confidence >= 85) {
      return {
        icon: ShieldCheck,
        label: 'SESSION SECURE',
        color: 'text-primary',
        bg: 'bg-primary/20',
        border: 'border-primary/50',
        pulse: false,
      };
    }
    if (confidence > 50) {
      return {
        icon: Shield,
        label: 'VERIFYING...',
        color: 'text-warning',
        bg: 'bg-warning/20',
        border: 'border-warning/50',
        pulse: true,
      };
    }
    return {
      icon: ShieldAlert,
      label: 'UNVERIFIED',
      color: 'text-muted-foreground',
      bg: 'bg-muted/20',
      border: 'border-muted',
      pulse: false,
    };
  };

  const status = getStatus();
  const StatusIcon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 px-4 py-2 rounded-full 
        ${status.bg} ${status.border} border backdrop-blur-md shadow-lg`}
    >
      <motion.div
        animate={status.pulse ? { scale: [1, 1.2, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <StatusIcon className={`w-4 h-4 ${status.color}`} />
      </motion.div>
      
      <span className={`text-xs font-mono ${status.color}`}>
        {status.label}
      </span>
      
      <div className="w-px h-4 bg-border/50" />
      
      <div className="flex items-center gap-1">
        <Cpu className="w-3 h-3 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">
          {Math.round(confidence)}%
        </span>
      </div>

      {/* Breach animation overlay */}
      <AnimatePresence>
        {(isBreached || isStaticDevice) && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            className="absolute inset-0 bg-destructive/10 rounded-full -z-10"
            style={{ originX: 0 }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

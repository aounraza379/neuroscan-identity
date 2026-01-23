import { motion } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react';

interface ShieldStatusProps {
  isVerified: boolean;
  isBreached: boolean;
  confidence: number;
}

export function ShieldStatus({ isVerified, isBreached, confidence }: ShieldStatusProps) {
  const getStatus = () => {
    if (isBreached) {
      return {
        icon: ShieldX,
        color: 'text-destructive',
        bg: 'bg-destructive/20',
        border: 'border-destructive/50',
        glow: 'cyber-glow-danger',
        label: 'BREACHED',
        pulse: true,
      };
    }
    if (isVerified && confidence >= 85) {
      return {
        icon: ShieldCheck,
        color: 'text-primary',
        bg: 'bg-primary/20',
        border: 'border-primary/50',
        glow: 'cyber-glow',
        label: 'PROTECTED',
        pulse: false,
      };
    }
    if (confidence > 50) {
      return {
        icon: ShieldAlert,
        color: 'text-warning',
        bg: 'bg-warning/20',
        border: 'border-warning/50',
        glow: '',
        label: 'VERIFYING',
        pulse: true,
      };
    }
    return {
      icon: Shield,
      color: 'text-muted-foreground',
      bg: 'bg-muted/20',
      border: 'border-border/50',
      glow: '',
      label: 'INACTIVE',
      pulse: false,
    };
  };

  const status = getStatus();
  const Icon = status.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`fixed top-4 right-4 z-40 ${status.glow}`}
    >
      <motion.div
        animate={status.pulse ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
        className={`glassmorphism rounded-xl p-3 border ${status.border} ${status.bg}`}
      >
        <div className="flex items-center gap-2">
          <motion.div
            animate={status.pulse ? { opacity: [1, 0.6, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Icon className={`w-6 h-6 ${status.color}`} />
          </motion.div>
          <div className="text-right">
            <p className={`text-xs font-mono font-bold ${status.color}`}>
              {status.label}
            </p>
            <p className="text-[10px] font-mono text-muted-foreground">
              {Math.round(confidence)}% confidence
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

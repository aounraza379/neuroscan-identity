import { motion } from 'framer-motion';
import { Smartphone, AlertTriangle, Hand, CheckCircle } from 'lucide-react';

interface GripStabilityMeterProps {
  gripStability: number;
  isStaticDevice: boolean;
  isSupported: boolean;
  tiltData: { alpha: number; beta: number; gamma: number };
  staticDuration?: number;
}

export function GripStabilityMeter({ 
  gripStability, 
  isStaticDevice, 
  isSupported,
  tiltData,
  staticDuration = 0
}: GripStabilityMeterProps) {
  const getStabilityStatus = () => {
    // Only flag as attack if truly static for 3+ seconds
    if (isStaticDevice) {
      return {
        label: 'STATIC ATTACK',
        color: 'text-destructive',
        bg: 'bg-destructive/20',
        border: 'border-destructive/50',
        description: `Device frozen for ${staticDuration.toFixed(1)}s - Bot detected!`,
        icon: AlertTriangle,
      };
    }
    
    // Perfect 100% stability is suspicious, but only after 3 seconds
    if (gripStability >= 100 && staticDuration >= 3) {
      return {
        label: 'SUSPICIOUS',
        color: 'text-warning',
        bg: 'bg-warning/20',
        border: 'border-warning/50',
        description: 'Unnaturally stable - analyzing...',
        icon: AlertTriangle,
      };
    }
    
    // Normal human range - any micro-movement is good
    if (gripStability >= 50) {
      return {
        label: 'SECURE',
        color: 'text-primary',
        bg: 'bg-primary/20',
        border: 'border-primary/50',
        description: 'Natural human grip pattern detected',
        icon: CheckCircle,
      };
    }
    
    return {
      label: 'ACTIVE',
      color: 'text-primary',
      bg: 'bg-primary/20',
      border: 'border-primary/50',
      description: 'Normal device movement',
      icon: Hand,
    };
  };

  const status = getStabilityStatus();
  const StatusIcon = status.icon;

  if (!isSupported) {
    return (
      <div className="glassmorphism rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Smartphone className="w-4 h-4" />
          <span className="text-xs font-mono">HMOG: Desktop Mode (No Sensors)</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glassmorphism rounded-lg p-4 ${status.border} border`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Hand className={`w-4 h-4 ${status.color}`} />
          <span className="text-xs font-mono text-muted-foreground">GRIP STABILITY</span>
        </div>
        <motion.span
          key={status.label}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-xs font-mono px-2 py-0.5 rounded ${status.bg} ${status.color}`}
        >
          {status.label}
        </motion.span>
      </div>

      {/* Stability Bar */}
      <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`absolute inset-y-0 left-0 rounded-full ${
            isStaticDevice ? 'bg-destructive' : 
            gripStability >= 100 && staticDuration >= 3 ? 'bg-warning' : 'bg-primary'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, gripStability)}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
        
        {/* Danger zone marker (only at 100%) */}
        <div className="absolute inset-y-0 right-0 w-[2%] bg-destructive/30" />
      </div>

      {/* Tilt Data */}
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="text-center">
          <p className="text-[10px] font-mono text-muted-foreground">α (Z)</p>
          <p className="text-xs font-mono">{tiltData.alpha.toFixed(1)}°</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-mono text-muted-foreground">β (X)</p>
          <p className="text-xs font-mono">{tiltData.beta.toFixed(1)}°</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-mono text-muted-foreground">γ (Y)</p>
          <p className="text-xs font-mono">{tiltData.gamma.toFixed(1)}°</p>
        </div>
      </div>

      <div className={`flex items-center gap-1 text-[10px] font-mono ${status.color}`}>
        <StatusIcon className="w-3 h-3" />
        <span>{status.description}</span>
      </div>
    </motion.div>
  );
}

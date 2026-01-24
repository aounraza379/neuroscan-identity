import { motion } from 'framer-motion';
import { Smartphone, AlertTriangle, Hand } from 'lucide-react';

interface GripStabilityMeterProps {
  gripStability: number;
  isStaticDevice: boolean;
  isSupported: boolean;
  tiltData: { alpha: number; beta: number; gamma: number };
}

export function GripStabilityMeter({ 
  gripStability, 
  isStaticDevice, 
  isSupported,
  tiltData 
}: GripStabilityMeterProps) {
  const getStabilityStatus = () => {
    if (isStaticDevice) {
      return {
        label: 'STATIC ATTACK',
        color: 'text-destructive',
        bg: 'bg-destructive/20',
        border: 'border-destructive/50',
        description: 'Device is completely static - Bot detected!',
      };
    }
    if (gripStability > 95) {
      return {
        label: 'SUSPICIOUS',
        color: 'text-warning',
        bg: 'bg-warning/20',
        border: 'border-warning/50',
        description: 'Unnaturally stable grip detected',
      };
    }
    if (gripStability > 70) {
      return {
        label: 'STABLE',
        color: 'text-primary',
        bg: 'bg-primary/20',
        border: 'border-primary/50',
        description: 'Natural human grip pattern',
      };
    }
    return {
      label: 'ACTIVE',
      color: 'text-primary',
      bg: 'bg-primary/20',
      border: 'border-primary/50',
      description: 'Normal device movement',
    };
  };

  const status = getStabilityStatus();

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
            gripStability > 95 ? 'bg-warning' : 'bg-primary'
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${gripStability}%` }}
          transition={{ type: 'spring', damping: 20 }}
        />
        
        {/* Danger zone marker */}
        <div className="absolute inset-y-0 right-0 w-[5%] bg-destructive/30" />
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

      <p className={`text-[10px] font-mono ${status.color}`}>
        {isStaticDevice && <AlertTriangle className="w-3 h-3 inline mr-1" />}
        {status.description}
      </p>
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

interface ConfidenceGaugeProps {
  confidence: number;
  isHuman: boolean;
  isComplete: boolean;
}

export function ConfidenceGauge({ confidence, isHuman, isComplete }: ConfidenceGaugeProps) {
  const getColor = () => {
    if (!isComplete) return 'hsl(var(--muted-foreground))';
    return isHuman ? 'hsl(var(--primary))' : 'hsl(var(--destructive))';
  };

  const getIcon = () => {
    if (!isComplete) return <Shield className="w-8 h-8" />;
    return isHuman 
      ? <ShieldCheck className="w-8 h-8" /> 
      : <ShieldAlert className="w-8 h-8" />;
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (confidence / 100) * circumference;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center gap-3"
    >
      <div className="relative w-28 h-28">
        {/* Background circle */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="56"
            cy="56"
            r="45"
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="8"
          />
          <motion.circle
            cx="56"
            cy="56"
            r="45"
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              filter: isComplete ? `drop-shadow(0 0 8px ${getColor()})` : 'none',
            }}
          />
        </svg>
        
        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            animate={isComplete ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 0.3 }}
            style={{ color: getColor() }}
          >
            {getIcon()}
          </motion.div>
          <span 
            className="text-lg font-mono font-bold"
            style={{ color: getColor() }}
          >
            {Math.round(confidence)}%
          </span>
        </div>
      </div>
      
      <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
        Confidence Score
      </span>
    </motion.div>
  );
}
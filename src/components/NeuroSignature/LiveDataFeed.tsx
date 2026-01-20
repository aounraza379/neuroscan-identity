import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface LiveDataFeedProps {
  latency: number;
  jitter: number;
  flightTime: number;
  isActive: boolean;
}

export function LiveDataFeed({ latency, jitter, flightTime, isActive }: LiveDataFeedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-center gap-3"
    >
      <div className="flex items-center gap-2">
        <motion.div
          animate={isActive ? { opacity: [1, 0.3, 1] } : { opacity: 0.3 }}
          transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
        >
          <Activity className="w-4 h-4 text-primary" />
        </motion.div>
        <span className="text-xs font-mono text-muted-foreground">LIVE DATA</span>
      </div>
      
      <div className="flex items-center gap-4 font-mono text-xs">
        <motion.div
          key={latency}
          initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.2 }}
          className="bg-muted/50 px-2 py-1 rounded border border-border/50"
        >
          <span className="text-muted-foreground">Lat:</span>{' '}
          <span className="text-foreground">{latency.toFixed(0)}ms</span>
        </motion.div>
        
        <motion.div
          key={`jitter-${jitter}`}
          initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.2 }}
          className="bg-muted/50 px-2 py-1 rounded border border-border/50"
        >
          <span className="text-muted-foreground">Jitter:</span>{' '}
          <span className="text-foreground">{jitter.toFixed(1)}px</span>
        </motion.div>
        
        <motion.div
          key={`flight-${flightTime}`}
          initial={{ scale: 1.2, color: 'hsl(var(--primary))' }}
          animate={{ scale: 1, color: 'hsl(var(--foreground))' }}
          transition={{ duration: 0.2 }}
          className="bg-muted/50 px-2 py-1 rounded border border-border/50"
        >
          <span className="text-muted-foreground">Flight:</span>{' '}
          <span className="text-foreground">{flightTime.toFixed(0)}ms</span>
        </motion.div>
      </div>
    </motion.div>
  );
}

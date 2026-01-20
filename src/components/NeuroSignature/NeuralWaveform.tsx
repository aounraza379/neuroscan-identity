import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';

interface NeuralWaveformProps {
  data: { time: number; value: number }[];
  isScanning: boolean;
}

export function NeuralWaveform({ data, isScanning }: NeuralWaveformProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism rounded-xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <Activity className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono text-muted-foreground">NEURAL WAVEFORM</span>
        {isScanning && (
          <motion.div
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="ml-auto flex items-center gap-1"
          >
            <div className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-xs text-primary font-mono">LIVE</span>
          </motion.div>
        )}
      </div>
      
      <div className="h-32 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="time" hide />
            <YAxis hide domain={['auto', 'auto']} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {data.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-mono">AWAITING INPUT...</span>
        </div>
      )}
    </motion.div>
  );
}
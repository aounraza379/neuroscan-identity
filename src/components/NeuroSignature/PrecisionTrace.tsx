import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Target } from 'lucide-react';

interface PrecisionTraceProps {
  onMouseMove: (x: number, y: number) => void;
  mouseVariance: number;
  isComplete: boolean;
}

export function PrecisionTrace({ onMouseMove, mouseVariance, isComplete }: PrecisionTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [isTracing, setIsTracing] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!containerRef.current || !isTracing) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    onMouseMove(x, y);
    setPath(prev => [...prev, { x, y }].slice(-100));
  }, [onMouseMove, isTracing]);

  const handleMouseEnter = () => setIsTracing(true);
  const handleMouseLeave = () => setIsTracing(false);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <MousePointer2 className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono text-muted-foreground">PRECISION TRACE ANALYSIS</span>
      </div>
      
      <div className="glassmorphism rounded-lg p-4 space-y-3">
        <div className="text-xs font-mono text-muted-foreground">
          TRACE THE CIRCLE PATH:
        </div>
        
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="relative w-full h-40 bg-background/30 rounded-lg border border-border/50 overflow-hidden cursor-crosshair"
        >
          {/* Target circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={isTracing ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full border-2 border-dashed border-primary/40 flex items-center justify-center"
            >
              <Target className="w-6 h-6 text-primary/40" />
            </motion.div>
          </div>
          
          {/* Traced path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {path.length > 1 && (
              <motion.path
                d={`M ${path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                style={{
                  filter: 'drop-shadow(0 0 4px hsl(var(--primary)))',
                }}
              />
            )}
          </svg>
          
          {/* Cursor indicator */}
          {path.length > 0 && (
            <motion.div
              className="absolute w-3 h-3 bg-primary rounded-full"
              style={{
                left: path[path.length - 1].x - 6,
                top: path[path.length - 1].y - 6,
                boxShadow: '0 0 10px hsl(var(--primary))',
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          
          {/* Instruction overlay */}
          {!isTracing && path.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono bg-background/80 px-2 py-1 rounded">
                HOVER TO BEGIN TRACING
              </span>
            </div>
          )}
        </div>
        
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>Variance: {mouseVariance.toFixed(2)}px</span>
          <span>{path.length} points captured</span>
        </div>
      </div>
    </motion.div>
  );
}
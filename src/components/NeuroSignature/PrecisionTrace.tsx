import { useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { MousePointer2, Target, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PrecisionTraceProps {
  onMouseMove: (x: number, y: number) => void;
  mouseVariance: number;
  isComplete: boolean;
  onSimulateBotCircle?: () => void;
  onCircleComplete?: () => void;
}

export function PrecisionTrace({ onMouseMove, mouseVariance, isComplete, onSimulateBotCircle, onCircleComplete }: PrecisionTraceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [path, setPath] = useState<{ x: number; y: number }[]>([]);
  const [isTracing, setIsTracing] = useState(false);
  const [isSimulatingBot, setIsSimulatingBot] = useState(false);
  const [hasNotifiedComplete, setHasNotifiedComplete] = useState(false);

  // Notify when circle is complete (enough points with natural variance)
  const checkCircleComplete = useCallback((pathLength: number, variance: number) => {
    // Require at least 30 points with natural variance (> 3px)
    if (pathLength >= 30 && variance > 3 && !hasNotifiedComplete) {
      setHasNotifiedComplete(true);
      onCircleComplete?.();
    }
  }, [hasNotifiedComplete, onCircleComplete]);

  // Use pointer events for both mouse and touch
  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!containerRef.current || !isTracing || isSimulatingBot) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if within bounds (with 20px tolerance for mobile)
    const tolerance = e.pointerType === 'touch' ? 20 : 5;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const targetRadius = 48; // Target circle radius (w-24 = 96px / 2)
    
    // Distance from center
    const distFromCenter = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
    
    // Check if within tolerance of the circle path
    const isOnPath = Math.abs(distFromCenter - targetRadius) <= tolerance;
    
    onMouseMove(x, y);
    
    // Only add to visual path if on or near the target
    if (isOnPath || path.length > 0) {
      const newPath = [...path, { x, y }].slice(-100);
      setPath(newPath);
      
      // Check if circle trace is complete
      checkCircleComplete(newPath.length, mouseVariance);
    }
  }, [onMouseMove, isTracing, isSimulatingBot, path, checkCircleComplete, mouseVariance]);

  const handlePointerEnter = () => {
    if (!isSimulatingBot) {
      setIsTracing(true);
    }
  };
  
  const handlePointerLeave = () => {
    if (!isSimulatingBot) {
      setIsTracing(false);
    }
  };

  // Touch-specific handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while tracing
    setIsTracing(true);
  };

  const handleTouchEnd = () => {
    setIsTracing(false);
  };

  // Simulate perfect bot circle
  const simulateBotCircle = useCallback(() => {
    if (!containerRef.current) return;
    
    setIsSimulatingBot(true);
    setPath([]);
    
    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const radius = 40;
    
    let step = 0;
    const totalSteps = 60;
    
    const interval = setInterval(() => {
      const angle = (step / totalSteps) * 2 * Math.PI;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Report exact mathematical position (0% jitter)
      onMouseMove(x, y);
      setPath(prev => [...prev, { x, y }]);
      
      step++;
      
      if (step >= totalSteps) {
        clearInterval(interval);
        setIsSimulatingBot(false);
        if (onSimulateBotCircle) onSimulateBotCircle();
      }
    }, 30);
  }, [onMouseMove, onSimulateBotCircle]);

  const isPerfectCircle = mouseVariance < 1 && path.length > 20;

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
      
      <div className={`glassmorphism rounded-lg p-4 space-y-3 ${
        isPerfectCircle ? 'border-destructive/50 cyber-glow-danger' : ''
      }`}>
        <div className="text-xs font-mono text-muted-foreground">
          TRACE THE CIRCLE PATH:
        </div>
        
        <div
          ref={containerRef}
          onPointerMove={handlePointerMove}
          onPointerEnter={handlePointerEnter}
          onPointerLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className={`relative w-full h-40 bg-background/30 rounded-lg border overflow-hidden cursor-crosshair touch-none ${
            isPerfectCircle ? 'border-destructive/50' : 'border-border/50'
          }`}
          style={{ touchAction: 'none' }} // Prevent browser gestures
        >
          {/* Target circle */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={isTracing || isSimulatingBot ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-24 h-24 rounded-full border-2 border-dashed flex items-center justify-center ${
                isPerfectCircle ? 'border-destructive/40' : 'border-primary/40'
              }`}
            >
              <Target className={`w-6 h-6 ${isPerfectCircle ? 'text-destructive/40' : 'text-primary/40'}`} />
            </motion.div>
          </div>
          
          {/* Traced path */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {path.length > 1 && (
              <motion.path
                d={`M ${path.map(p => `${p.x},${p.y}`).join(' L ')}`}
                fill="none"
                stroke={isPerfectCircle ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                style={{
                  filter: `drop-shadow(0 0 4px ${isPerfectCircle ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'})`,
                }}
              />
            )}
          </svg>
          
          {/* Cursor indicator */}
          {path.length > 0 && (
            <motion.div
              className={`absolute w-4 h-4 rounded-full ${isPerfectCircle ? 'bg-destructive' : 'bg-primary'}`}
              style={{
                left: path[path.length - 1].x - 8,
                top: path[path.length - 1].y - 8,
                boxShadow: `0 0 12px ${isPerfectCircle ? 'hsl(var(--destructive))' : 'hsl(var(--primary))'}`,
              }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          
          {/* Bot simulation indicator */}
          {isSimulatingBot && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute top-2 right-2 flex items-center gap-1 bg-destructive/80 px-2 py-1 rounded text-[10px] font-mono text-destructive-foreground"
            >
              <Bot className="w-3 h-3" />
              <span>BOT MODE</span>
            </motion.div>
          )}
          
          {/* Instruction overlay */}
          {!isTracing && !isSimulatingBot && path.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-muted-foreground font-mono bg-background/80 px-2 py-1 rounded">
                TAP & DRAG TO TRACE
              </span>
            </div>
          )}
        </div>
        
        {/* Perfect Circle Warning */}
        {isPerfectCircle && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-mono text-destructive bg-destructive/10 px-3 py-2 rounded"
          >
            <Bot className="w-3 h-3" />
            <span>PERFECT CIRCLE DETECTED: Variance &lt;1px indicates automation</span>
          </motion.div>
        )}
        
        <div className="flex justify-between items-center text-xs font-mono text-muted-foreground">
          <span className={isPerfectCircle ? 'text-destructive' : ''}>
            Variance: {mouseVariance.toFixed(2)}px {isPerfectCircle && '⚠️'}
          </span>
          <span>{path.length} points captured</span>
        </div>
        
        {/* Simulate Bot Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={simulateBotCircle}
          disabled={isSimulatingBot}
          className="w-full text-xs font-mono border-warning/50 text-warning hover:bg-warning/10"
        >
          <Bot className="w-3 h-3 mr-2" />
          {isSimulatingBot ? 'SIMULATING...' : 'SIMULATE BOT (0% JITTER)'}
        </Button>
      </div>
    </motion.div>
  );
}

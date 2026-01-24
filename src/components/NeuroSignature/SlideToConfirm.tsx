import { useState, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, AlertTriangle, Lock, Fingerprint, Loader2 } from 'lucide-react';
import { TransactionReceipt } from './TransactionReceipt';

interface SlideToConfirmProps {
  onConfirm: () => void;
  onBotDetected: () => void;
  disabled?: boolean;
  isVerified: boolean;
  confidence: number;
}

interface SlideMetrics {
  velocities: number[];
  positions: number[];
  timestamps: number[];
}

export function SlideToConfirm({ 
  onConfirm, 
  onBotDetected, 
  disabled = false,
  isVerified,
  confidence
}: SlideToConfirmProps) {
  const [isSliding, setIsSliding] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isBotDetected, setIsBotDetected] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [sessionData, setSessionData] = useState({ sessionId: '', timestamp: '' });
  
  const containerRef = useRef<HTMLDivElement>(null);
  const metricsRef = useRef<SlideMetrics>({ velocities: [], positions: [], timestamps: [] });
  const lastPositionRef = useRef(0);
  const lastTimeRef = useRef(0);
  
  const x = useMotionValue(0);
  const progress = useTransform(x, [0, 240], [0, 100]);
  const bgOpacity = useTransform(x, [0, 240], [0.3, 1]);

  const generateSessionId = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'NS-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  const analyzeSlide = useCallback((metrics: SlideMetrics): boolean => {
    if (metrics.velocities.length < 5) return true; // Not enough data, assume human

    // Calculate velocity variance
    const avgVelocity = metrics.velocities.reduce((a, b) => a + b, 0) / metrics.velocities.length;
    const velocityVariance = metrics.velocities.reduce(
      (sum, v) => sum + Math.pow(v - avgVelocity, 2), 0
    ) / metrics.velocities.length;

    // Check for perfectly straight slide (bot indicator)
    const positionDeltas = metrics.positions.slice(1).map((p, i) => 
      Math.abs(p - metrics.positions[i])
    );
    const avgDelta = positionDeltas.reduce((a, b) => a + b, 0) / positionDeltas.length;
    const deltaVariance = positionDeltas.reduce(
      (sum, d) => sum + Math.pow(d - avgDelta, 2), 0
    ) / positionDeltas.length;

    // Bot detection: Zero velocity variance AND zero position delta variance
    const isPerfectVelocity = velocityVariance < 0.1;
    const isPerfectLine = deltaVariance < 0.001;
    
    return !(isPerfectVelocity && isPerfectLine);
  }, []);

  const handleDragStart = () => {
    if (disabled || !isVerified) return;
    
    setIsSliding(true);
    metricsRef.current = { velocities: [], positions: [], timestamps: [] };
    lastPositionRef.current = 0;
    lastTimeRef.current = Date.now();
  };

  const handleDrag = (_: any, info: { point: { x: number } }) => {
    if (!containerRef.current || disabled || !isVerified) return;

    const currentTime = Date.now();
    const currentPosition = info.point.x;
    
    const timeDelta = currentTime - lastTimeRef.current;
    const positionDelta = currentPosition - lastPositionRef.current;
    
    if (timeDelta > 0) {
      const velocity = Math.abs(positionDelta / timeDelta);
      metricsRef.current.velocities.push(velocity);
      metricsRef.current.positions.push(currentPosition);
      metricsRef.current.timestamps.push(currentTime);
    }

    lastPositionRef.current = currentPosition;
    lastTimeRef.current = currentTime;
  };

  const handleDragEnd = () => {
    setIsSliding(false);
    
    if (disabled || !isVerified) {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
      return;
    }

    const currentX = x.get();
    
    if (currentX >= 220) {
      // Check if slide was human-like
      const isHuman = analyzeSlide(metricsRef.current);
      
      if (isHuman) {
        setIsAnalyzing(true);
        animate(x, 240, { type: 'spring', stiffness: 500, damping: 30 });
        
        // Show analyzing state for 1.5 seconds
        setTimeout(() => {
          setIsAnalyzing(false);
          setIsComplete(true);
          
          // Generate session data
          const now = new Date();
          setSessionData({
            sessionId: generateSessionId(),
            timestamp: now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC'
          });
          
          // Show receipt after brief delay
          setTimeout(() => {
            setShowReceipt(true);
            onConfirm();
          }, 500);
        }, 1500);
      } else {
        setIsBotDetected(true);
        animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
        onBotDetected();
      }
    } else {
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
    // Reset for next transaction
    setTimeout(() => {
      setIsComplete(false);
      animate(x, 0, { type: 'spring', stiffness: 500, damping: 30 });
    }, 300);
  };

  const isDisabledState = disabled || !isVerified;

  return (
    <div className="space-y-2">
      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <TransactionReceipt
              sessionId={sessionData.sessionId}
              timestamp={sessionData.timestamp}
              confidence={Math.round(confidence)}
              amount="$500.00"
              onClose={handleCloseReceipt}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className={`relative h-16 rounded-xl overflow-hidden transition-all duration-300 ${
          isBotDetected 
            ? 'bg-destructive/20 border-2 border-destructive' 
            : isComplete
              ? 'bg-primary/20 border-2 border-primary'
              : isAnalyzing
                ? 'bg-primary/10 border-2 border-primary/50'
                : isDisabledState
                  ? 'bg-muted/30 border-2 border-muted cursor-not-allowed'
                  : 'bg-muted/50 border-2 border-border hover:border-primary/50'
        }`}
      >
        {/* Progress Background */}
        <motion.div
          className={`absolute inset-0 ${
            isComplete ? 'bg-primary/30' : 'bg-primary/20'
          }`}
          style={{ opacity: bgOpacity }}
        />

        {/* Track Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-primary font-mono"
            >
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Analyzing Neural Signature...</span>
            </motion.div>
          ) : isComplete ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-primary font-mono"
            >
              <Check className="w-5 h-5" />
              <span>AUTHENTICATED</span>
            </motion.div>
          ) : isBotDetected ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2 text-destructive font-mono"
            >
              <AlertTriangle className="w-5 h-5" />
              <span>BOT DETECTED - SLIDE REJECTED</span>
            </motion.div>
          ) : isDisabledState ? (
            <span className="text-muted-foreground font-mono text-sm flex items-center gap-2">
              <Lock className="w-4 h-4" />
              VERIFY IDENTITY FIRST
            </span>
          ) : (
            <span className="text-muted-foreground font-mono text-sm">
              SLIDE TO TRANSFER →
            </span>
          )}
        </div>

        {/* Draggable Thumb */}
        {!isComplete && !isBotDetected && !isAnalyzing && (
          <motion.div
            drag={isDisabledState ? false : "x"}
            dragConstraints={{ left: 0, right: 240 }}
            dragElastic={0}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className={`absolute left-1 top-1 bottom-1 w-14 rounded-lg flex items-center justify-center transition-colors ${
              isDisabledState 
                ? 'bg-muted cursor-not-allowed' 
                : isSliding 
                  ? 'bg-primary cursor-grabbing' 
                  : 'bg-primary/80 cursor-grab hover:bg-primary'
            }`}
          >
            {isDisabledState ? (
              <Lock className="w-5 h-5 text-muted-foreground" />
            ) : (
              <Fingerprint className={`w-5 h-5 ${isSliding ? 'text-primary-foreground' : 'text-primary-foreground/80'}`} />
            )}
          </motion.div>
        )}

        {/* Success Check */}
        {(isComplete || isAnalyzing) && (
          <motion.div
            initial={{ scale: 0, x: 240 }}
            animate={{ scale: 1 }}
            className={`absolute right-1 top-1 bottom-1 w-14 rounded-lg flex items-center justify-center ${
              isAnalyzing ? 'bg-primary/50' : 'bg-primary'
            }`}
          >
            {isAnalyzing ? (
              <Loader2 className="w-6 h-6 text-primary-foreground animate-spin" />
            ) : (
              <Check className="w-6 h-6 text-primary-foreground" />
            )}
          </motion.div>
        )}
      </div>

      {/* Helper Text */}
      <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-muted-foreground">
        <ArrowRight className="w-3 h-3" />
        <span>
          {isDisabledState 
            ? 'Complete neural verification to enable transfers'
            : 'Natural slide velocity analyzed for authenticity'
          }
        </span>
      </div>
    </div>
  );
}

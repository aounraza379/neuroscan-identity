import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, AlertTriangle, ShieldCheck, Eye, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LivenessChallengeProps {
  simulateDeepfake: boolean;
  onLivenessResult?: (passed: boolean) => void;
}

interface DotPosition {
  x: number;
  y: number;
}

export function LivenessChallenge({ simulateDeepfake, onLivenessResult }: LivenessChallengeProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const [dotPosition, setDotPosition] = useState<DotPosition>({ x: 50, y: 50 });
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle');
  const [trackingScore, setTrackingScore] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const challengeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 320 },
          height: { ideal: 240 },
          facingMode: 'user'
        } 
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasPermission(true);
      setIsActive(true);
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasPermission(false);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
    setChallengeActive(false);
    setLivenessStatus('idle');
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (challengeTimeoutRef.current) {
        clearTimeout(challengeTimeoutRef.current);
      }
    };
  }, [stopCamera]);

  // Move the dot during challenge
  useEffect(() => {
    if (!challengeActive) return;

    const positions: DotPosition[] = [
      { x: 25, y: 25 },
      { x: 75, y: 25 },
      { x: 75, y: 75 },
      { x: 25, y: 75 },
      { x: 50, y: 50 },
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setDotPosition(positions[index]);
      
      // Simulate tracking detection (in real app, this would use face tracking)
      if (!simulateDeepfake) {
        setTrackingScore(prev => Math.min(prev + 25, 100));
      }
    }, 800);

    return () => clearInterval(interval);
  }, [challengeActive, simulateDeepfake]);

  const startChallenge = () => {
    setChallengeActive(true);
    setLivenessStatus('checking');
    setTrackingScore(0);

    // End challenge after 4 seconds
    challengeTimeoutRef.current = setTimeout(() => {
      setChallengeActive(false);
      
      if (simulateDeepfake) {
        setLivenessStatus('failed');
        onLivenessResult?.(false);
      } else {
        setLivenessStatus('passed');
        onLivenessResult?.(true);
      }
    }, 4000);
  };

  const toggleCamera = () => {
    if (isActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Camera Preview with Liveness Challenge */}
      <div className="relative">
        <div 
          className={`w-40 h-32 rounded-xl overflow-hidden border-2 ${
            isActive 
              ? livenessStatus === 'failed' || simulateDeepfake
                ? 'border-destructive cyber-glow-danger' 
                : livenessStatus === 'passed'
                  ? 'border-primary cyber-glow'
                  : 'border-primary/50'
              : 'border-border'
          } bg-muted/30 flex items-center justify-center relative`}
        >
          {isActive ? (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              
              {/* Face Tracking Box Overlay */}
              <motion.div
                animate={{
                  scale: [1, 1.02, 1],
                  opacity: [0.8, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-4 border-2 border-primary/60 rounded-lg pointer-events-none"
              >
                {/* Corner brackets */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary" />
              </motion.div>

              {/* Liveness Challenge Dot */}
              <AnimatePresence>
                {challengeActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ 
                      scale: 1,
                      left: `${dotPosition.x}%`,
                      top: `${dotPosition.y}%`
                    }}
                    exit={{ scale: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="absolute w-4 h-4 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div className="w-full h-full rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
                    <Target className="w-6 h-6 text-primary absolute -top-1 -left-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Lock-on Label */}
              <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-background/80 text-[9px] font-mono text-primary flex items-center gap-1">
                <Eye className="w-2.5 h-2.5" />
                AI TRACKING
              </div>
            </>
          ) : (
            <CameraOff className="w-8 h-8 text-muted-foreground" />
          )}
        </div>
        
        {/* Status Label */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                livenessStatus === 'failed' || simulateDeepfake
                  ? 'bg-destructive text-destructive-foreground'
                  : livenessStatus === 'passed'
                    ? 'bg-primary text-primary-foreground'
                    : livenessStatus === 'checking'
                      ? 'bg-primary/50 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
              }`}
            >
              {livenessStatus === 'failed' || simulateDeepfake ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  LIVENESS FAILED
                </motion.span>
              ) : livenessStatus === 'passed' ? (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  HUMAN VERIFIED
                </span>
              ) : livenessStatus === 'checking' ? (
                <span className="flex items-center gap-1">
                  <Target className="w-2.5 h-2.5 animate-spin" />
                  FOLLOW THE DOT
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Eye className="w-2.5 h-2.5" />
                  READY
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Challenge Instructions */}
      {isActive && challengeActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center px-2"
        >
          <p className="text-[10px] font-mono text-primary">
            Move your head to follow the green dot
          </p>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${trackingScore}%` }}
            />
          </div>
        </motion.div>
      )}
      
      {/* Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCamera}
          className="text-xs font-mono h-7 px-2"
        >
          {isActive ? (
            <>
              <CameraOff className="w-3 h-3 mr-1" />
              OFF
            </>
          ) : (
            <>
              <Camera className="w-3 h-3 mr-1" />
              VISION GUARD
            </>
          )}
        </Button>

        {isActive && !challengeActive && livenessStatus !== 'passed' && (
          <Button
            variant="outline"
            size="sm"
            onClick={startChallenge}
            className="text-xs font-mono h-7 px-2 border-primary/50 text-primary hover:bg-primary/10"
          >
            <Target className="w-3 h-3 mr-1" />
            LIVENESS CHECK
          </Button>
        )}
      </div>
      
      {hasPermission === false && (
        <span className="text-[10px] text-destructive font-mono">
          Camera denied
        </span>
      )}
    </motion.div>
  );
}

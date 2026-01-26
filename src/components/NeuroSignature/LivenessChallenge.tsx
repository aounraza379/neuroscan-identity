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

interface FramePixelData {
  brightness: number;
  timestamp: number;
}

export function LivenessChallenge({ simulateDeepfake, onLivenessResult }: LivenessChallengeProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [challengeActive, setChallengeActive] = useState(false);
  const [dotPosition, setDotPosition] = useState<DotPosition>({ x: 50, y: 50 });
  const [livenessStatus, setLivenessStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle');
  const [trackingScore, setTrackingScore] = useState(0);
  const [pixelChangePercent, setPixelChangePercent] = useState(0);
  const [isStaticImage, setIsStaticImage] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const challengeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const frameDataRef = useRef<FramePixelData[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  // Analyze video frames for pixel changes (face movement detection)
  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !challengeActive) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx || video.videoWidth === 0) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth / 4; // Downsample for performance
    canvas.height = video.videoHeight / 4;
    
    // Draw current frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get pixel data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    
    // Calculate average brightness (simple metric)
    let totalBrightness = 0;
    for (let i = 0; i < pixels.length; i += 16) { // Sample every 4th pixel
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      totalBrightness += (r + g + b) / 3;
    }
    const avgBrightness = totalBrightness / (pixels.length / 16);
    
    // Store frame data
    const frameData: FramePixelData = {
      brightness: avgBrightness,
      timestamp: Date.now()
    };
    frameDataRef.current.push(frameData);
    
    // Keep only last 30 frames
    if (frameDataRef.current.length > 30) {
      frameDataRef.current = frameDataRef.current.slice(-30);
    }
    
    // Calculate change from previous frames
    if (frameDataRef.current.length >= 5) {
      const recentFrames = frameDataRef.current.slice(-10);
      const firstBrightness = recentFrames[0].brightness;
      
      // Calculate max deviation
      let maxChange = 0;
      for (const frame of recentFrames) {
        const change = Math.abs(frame.brightness - firstBrightness);
        if (change > maxChange) maxChange = change;
      }
      
      // Convert to percentage (0-100)
      const changePercent = Math.min(100, (maxChange / 255) * 100 * 5); // Amplify for visibility
      setPixelChangePercent(changePercent);
      
      // If change is < 15% during entire challenge, it's a static image
      if (changePercent < 15 && frameDataRef.current.length >= 20) {
        setIsStaticImage(true);
      } else if (changePercent >= 15) {
        setIsStaticImage(false);
        // Add to tracking score based on movement
        setTrackingScore(prev => Math.min(100, prev + 5));
      }
    }
    
    // Continue analyzing
    if (challengeActive) {
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    }
  }, [challengeActive]);

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
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsActive(false);
    setChallengeActive(false);
    setLivenessStatus('idle');
    setPixelChangePercent(0);
    setIsStaticImage(false);
    frameDataRef.current = [];
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
      if (challengeTimeoutRef.current) {
        clearTimeout(challengeTimeoutRef.current);
      }
    };
  }, [stopCamera]);

  // Start frame analysis when challenge begins
  useEffect(() => {
    if (challengeActive && isActive) {
      frameDataRef.current = [];
      animationFrameRef.current = requestAnimationFrame(analyzeFrame);
    }
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [challengeActive, isActive, analyzeFrame]);

  // Move the dot during challenge - 4 corners
  useEffect(() => {
    if (!challengeActive) return;

    const positions: DotPosition[] = [
      { x: 20, y: 20 },   // Top left
      { x: 80, y: 20 },   // Top right
      { x: 80, y: 80 },   // Bottom right
      { x: 20, y: 80 },   // Bottom left
      { x: 50, y: 50 },   // Center
    ];

    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % positions.length;
      setDotPosition(positions[index]);
    }, 800);

    return () => clearInterval(interval);
  }, [challengeActive]);

  const startChallenge = () => {
    setChallengeActive(true);
    setLivenessStatus('checking');
    setTrackingScore(0);
    setPixelChangePercent(0);
    setIsStaticImage(false);
    frameDataRef.current = [];

    // End challenge after 4 seconds
    challengeTimeoutRef.current = setTimeout(() => {
      setChallengeActive(false);
      
      // Check results: deepfake simulation OR static image detected
      if (simulateDeepfake || isStaticImage || pixelChangePercent < 15) {
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

  const showStaticWarning = challengeActive && (isStaticImage || pixelChangePercent < 10);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-3"
    >
      {/* Hidden canvas for pixel analysis */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Camera Preview with Liveness Challenge */}
      <div className="relative">
        <div 
          className={`w-40 h-32 rounded-xl overflow-hidden border-2 ${
            isActive 
              ? livenessStatus === 'failed' || simulateDeepfake || showStaticWarning
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
                className={`absolute inset-4 border-2 rounded-lg pointer-events-none ${
                  showStaticWarning ? 'border-destructive/60' : 'border-primary/60'
                }`}
              >
                {/* Corner brackets */}
                <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 ${showStaticWarning ? 'border-destructive' : 'border-primary'}`} />
                <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 ${showStaticWarning ? 'border-destructive' : 'border-primary'}`} />
                <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 ${showStaticWarning ? 'border-destructive' : 'border-primary'}`} />
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 ${showStaticWarning ? 'border-destructive' : 'border-primary'}`} />
              </motion.div>

              {/* Liveness Challenge Dot - moves to 4 corners */}
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

              {/* Static Image Warning */}
              <AnimatePresence>
                {showStaticWarning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-destructive/20 flex items-center justify-center"
                  >
                    <motion.span
                      animate={{ opacity: [1, 0.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="text-[8px] font-mono text-destructive font-bold px-1 py-0.5 bg-background/80 rounded"
                    >
                      STATIC IMAGE
                    </motion.span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Lock-on Label */}
              <div className={`absolute top-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-mono flex items-center gap-1 ${
                showStaticWarning 
                  ? 'bg-destructive/80 text-destructive-foreground' 
                  : 'bg-background/80 text-primary'
              }`}>
                <Eye className="w-2.5 h-2.5" />
                {showStaticWarning ? 'STATIC' : 'AI TRACKING'}
              </div>
              
              {/* Pixel Change Indicator */}
              {challengeActive && (
                <div className="absolute bottom-1 right-1 px-1 py-0.5 rounded bg-background/80 text-[8px] font-mono">
                  <span className={pixelChangePercent >= 15 ? 'text-primary' : 'text-destructive'}>
                    Δ{pixelChangePercent.toFixed(0)}%
                  </span>
                </div>
              )}
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
                livenessStatus === 'failed' || simulateDeepfake || showStaticWarning
                  ? 'bg-destructive text-destructive-foreground'
                  : livenessStatus === 'passed'
                    ? 'bg-primary text-primary-foreground'
                    : livenessStatus === 'checking'
                      ? 'bg-primary/50 text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
              }`}
            >
              {livenessStatus === 'failed' || simulateDeepfake || (livenessStatus === 'checking' && showStaticWarning) ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  {showStaticWarning ? 'STATIC IMAGE DETECTED' : 'LIVENESS FAILED'}
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
          <p className={`text-[10px] font-mono ${showStaticWarning ? 'text-destructive' : 'text-primary'}`}>
            {showStaticWarning 
              ? '⚠ No movement detected! Move your head!'
              : 'Move your head to follow the green dot'
            }
          </p>
          <div className="mt-1 h-1 bg-muted rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${showStaticWarning ? 'bg-destructive' : 'bg-primary'}`}
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

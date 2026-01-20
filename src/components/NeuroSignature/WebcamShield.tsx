import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, CameraOff, Eye, EyeOff, AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WebcamShieldProps {
  simulateDeepfake: boolean;
}

export function WebcamShield({ simulateDeepfake }: WebcamShieldProps) {
  const [isActive, setIsActive] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 200 },
          height: { ideal: 200 },
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
  }, []);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

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
      className="flex flex-col items-center gap-2"
    >
      {/* Camera Preview */}
      <div className="relative">
        <div 
          className={`w-20 h-20 rounded-full overflow-hidden border-2 ${
            isActive 
              ? simulateDeepfake 
                ? 'border-destructive cyber-glow-danger' 
                : 'border-primary cyber-glow'
              : 'border-border'
          } bg-muted/30 flex items-center justify-center`}
        >
          {isActive ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <CameraOff className="w-6 h-6 text-muted-foreground" />
          )}
        </div>
        
        {/* Status Label */}
        <AnimatePresence>
          {isActive && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className={`absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                simulateDeepfake
                  ? 'bg-destructive text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              }`}
            >
              {simulateDeepfake ? (
                <motion.span
                  animate={{ opacity: [1, 0.3, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="flex items-center gap-1"
                >
                  <AlertTriangle className="w-2.5 h-2.5" />
                  SYNTHETIC
                </motion.span>
              ) : (
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  REAL
                </span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={toggleCamera}
        className="text-xs font-mono h-7 px-2"
      >
        {isActive ? (
          <>
            <EyeOff className="w-3 h-3 mr-1" />
            DISABLE
          </>
        ) : (
          <>
            <Eye className="w-3 h-3 mr-1" />
            VISION GUARD
          </>
        )}
      </Button>
      
      {hasPermission === false && (
        <span className="text-[10px] text-destructive font-mono">
          Camera denied
        </span>
      )}
    </motion.div>
  );
}

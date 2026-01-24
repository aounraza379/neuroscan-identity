import { useState, useEffect, useCallback, useRef } from 'react';

interface HMOGData {
  alpha: number; // Z-axis rotation (0-360)
  beta: number;  // X-axis rotation (-180 to 180)
  gamma: number; // Y-axis rotation (-90 to 90)
  tiltHistory: number[];
  gripStability: number; // 0-100, higher = more stable
  isStaticDevice: boolean; // True if completely static for 3+ seconds (bot indicator)
  isSupported: boolean;
  staticDuration: number; // How long the device has been static (in seconds)
}

export function useHMOG() {
  const [data, setData] = useState<HMOGData>({
    alpha: 0,
    beta: 0,
    gamma: 0,
    tiltHistory: [],
    gripStability: 50,
    isStaticDevice: false,
    isSupported: false,
    staticDuration: 0,
  });

  const [simulateRoboticHand, setSimulateRoboticHand] = useState(false);
  const lastOrientation = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const staticStartTime = useRef<number | null>(null);
  const hasAnyMovement = useRef(false);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    if (simulateRoboticHand) return; // Don't process real data in simulation mode

    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // Calculate tilt change from last reading
    const deltaAlpha = Math.abs(alpha - lastOrientation.current.alpha);
    const deltaBeta = Math.abs(beta - lastOrientation.current.beta);
    const deltaGamma = Math.abs(gamma - lastOrientation.current.gamma);
    
    const totalDelta = deltaAlpha + deltaBeta + deltaGamma;
    
    lastOrientation.current = { alpha, beta, gamma };

    // NEW LOGIC: Only flag as static if 100% frozen for 3+ seconds
    const isCurrentlyStatic = totalDelta < 0.001; // Truly zero movement
    
    if (isCurrentlyStatic && !hasAnyMovement.current) {
      // Device has never moved - could be desktop or mounted device
      // Don't flag as suspicious until we've waited 3 seconds
      if (staticStartTime.current === null) {
        staticStartTime.current = Date.now();
      }
    } else if (!isCurrentlyStatic) {
      // Any movement detected - this is human
      hasAnyMovement.current = true;
      staticStartTime.current = null;
    }

    const staticDurationMs = staticStartTime.current 
      ? Date.now() - staticStartTime.current 
      : 0;
    const staticDurationSec = staticDurationMs / 1000;
    
    // Only flag as bot if truly static for 3+ seconds
    const isStatic = staticDurationSec >= 3;

    setData(prev => {
      const newHistory = [...prev.tiltHistory, totalDelta].slice(-30);
      
      // Calculate grip stability based on variance
      const avgTilt = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      const variance = newHistory.reduce((sum, val) => sum + Math.pow(val - avgTilt, 2), 0) / newHistory.length;
      
      // Higher stability value = more stable grip (0-100 scale)
      // Any micro-movement shows human grip
      const stability = totalDelta > 0.01 
        ? Math.max(50, Math.min(95, 80 - variance * 5)) // Human range: 50-95
        : 100; // Perfectly still = suspicious

      return {
        alpha,
        beta,
        gamma,
        tiltHistory: newHistory,
        gripStability: stability,
        isStaticDevice: isStatic,
        isSupported: true,
        staticDuration: staticDurationSec,
      };
    });
  }, [simulateRoboticHand]);

  // Simulate robotic hand - perfectly static readings
  useEffect(() => {
    if (!simulateRoboticHand) return;

    // Immediately start counting static time
    const startTime = Date.now();
    
    const interval = setInterval(() => {
      const staticDurationSec = (Date.now() - startTime) / 1000;
      
      setData(prev => ({
        ...prev,
        alpha: 0,
        beta: 90, // Perfectly level
        gamma: 0,
        tiltHistory: [...prev.tiltHistory, 0].slice(-30),
        gripStability: 100, // Perfectly stable (suspicious!)
        isStaticDevice: staticDurationSec >= 3, // Flag after 3 seconds
        isSupported: true,
        staticDuration: staticDurationSec,
      }));
    }, 100);

    return () => clearInterval(interval);
  }, [simulateRoboticHand]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      // Check if permission is needed (iOS 13+)
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        // Permission needs to be requested on user gesture
        setData(prev => ({ ...prev, isSupported: true }));
      } else {
        window.addEventListener('deviceorientation', handleOrientation);
        setData(prev => ({ ...prev, isSupported: true }));
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [handleOrientation]);

  const requestPermission = useCallback(async () => {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          return true;
        }
      } catch (error) {
        console.error('DeviceOrientation permission denied:', error);
        return false;
      }
    }
    return true;
  }, [handleOrientation]);

  const reset = useCallback(() => {
    setData({
      alpha: 0,
      beta: 0,
      gamma: 0,
      tiltHistory: [],
      gripStability: 50,
      isStaticDevice: false,
      isSupported: data.isSupported,
      staticDuration: 0,
    });
    staticStartTime.current = null;
    hasAnyMovement.current = false;
    setSimulateRoboticHand(false);
  }, [data.isSupported]);

  return {
    data,
    simulateRoboticHand,
    setSimulateRoboticHand,
    requestPermission,
    reset,
  };
}

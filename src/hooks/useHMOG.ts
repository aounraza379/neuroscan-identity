import { useState, useEffect, useCallback, useRef } from 'react';

interface HMOGData {
  alpha: number; // Z-axis rotation (0-360)
  beta: number;  // X-axis rotation (-180 to 180)
  gamma: number; // Y-axis rotation (-90 to 90)
  tiltHistory: number[];
  gripStability: number; // 0-100, lower is more stable
  isStaticDevice: boolean; // True if completely static (bot indicator)
  isSupported: boolean;
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
  });

  const [simulateRoboticHand, setSimulateRoboticHand] = useState(false);
  const lastOrientation = useRef({ alpha: 0, beta: 0, gamma: 0 });
  const staticCounter = useRef(0);

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

    // Check for static device (bot indicator)
    if (totalDelta < 0.01) {
      staticCounter.current += 1;
    } else {
      staticCounter.current = Math.max(0, staticCounter.current - 1);
    }

    const isStatic = staticCounter.current > 50; // 50 consecutive static readings

    setData(prev => {
      const newHistory = [...prev.tiltHistory, totalDelta].slice(-30);
      
      // Calculate grip stability (variance in tilt changes)
      const avgTilt = newHistory.reduce((a, b) => a + b, 0) / newHistory.length;
      const variance = newHistory.reduce((sum, val) => sum + Math.pow(val - avgTilt, 2), 0) / newHistory.length;
      
      // Lower variance = more stable grip (0-100 scale, inverted so higher = more stable)
      const stability = Math.max(0, Math.min(100, 100 - variance * 10));

      return {
        alpha,
        beta,
        gamma,
        tiltHistory: newHistory,
        gripStability: stability,
        isStaticDevice: isStatic,
        isSupported: true,
      };
    });
  }, [simulateRoboticHand]);

  // Simulate robotic hand - perfectly static readings
  useEffect(() => {
    if (!simulateRoboticHand) return;

    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        alpha: 0,
        beta: 90, // Perfectly level
        gamma: 0,
        tiltHistory: [...prev.tiltHistory, 0].slice(-30),
        gripStability: 100, // Perfectly stable (suspicious!)
        isStaticDevice: true,
        isSupported: true,
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
    });
    staticCounter.current = 0;
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

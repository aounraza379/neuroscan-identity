import { useState, useCallback, useRef } from 'react';

export interface BiometricData {
  dwellTimes: number[];
  flightTimes: number[];
  mousePositions: { x: number; y: number; time: number }[];
  mouseVariance: number;
  avgDwellTime: number;
  avgFlightTime: number;
  timingVariance: number;
  neuralWaveform: { time: number; value: number }[];
}

export interface BiometricResult {
  isHuman: boolean;
  confidence: number;
  reason: string;
}

export function useBiometricTracker() {
  const [data, setData] = useState<BiometricData>({
    dwellTimes: [],
    flightTimes: [],
    mousePositions: [],
    mouseVariance: 0,
    avgDwellTime: 0,
    avgFlightTime: 0,
    timingVariance: 0,
    neuralWaveform: [],
  });

  const keyDownTime = useRef<number>(0);
  const lastKeyUpTime = useRef<number>(0);
  const waveformIndex = useRef<number>(0);

  const calculateVariance = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  };

  const calculateMouseVariance = (positions: { x: number; y: number }[]): number => {
    if (positions.length < 3) return 0;
    
    // Calculate deviation from ideal circle path
    const centerX = positions.reduce((a, p) => a + p.x, 0) / positions.length;
    const centerY = positions.reduce((a, p) => a + p.y, 0) / positions.length;
    
    const distances = positions.map(p => 
      Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    );
    
    return calculateVariance(distances);
  };

  const handleKeyDown = useCallback(() => {
    keyDownTime.current = performance.now();
  }, []);

  const handleKeyUp = useCallback(() => {
    const now = performance.now();
    const dwellTime = now - keyDownTime.current;
    const flightTime = lastKeyUpTime.current > 0 ? keyDownTime.current - lastKeyUpTime.current : 0;
    lastKeyUpTime.current = now;

    setData(prev => {
      const newDwellTimes = [...prev.dwellTimes, dwellTime];
      const newFlightTimes = flightTime > 0 ? [...prev.flightTimes, flightTime] : prev.flightTimes;
      
      const avgDwell = newDwellTimes.reduce((a, b) => a + b, 0) / newDwellTimes.length;
      const avgFlight = newFlightTimes.length > 0 
        ? newFlightTimes.reduce((a, b) => a + b, 0) / newFlightTimes.length 
        : 0;
      
      const allTimings = [...newDwellTimes, ...newFlightTimes];
      const timingVar = calculateVariance(allTimings);
      
      // Add waveform data point
      waveformIndex.current += 1;
      const newWaveform = [
        ...prev.neuralWaveform,
        {
          time: waveformIndex.current,
          value: dwellTime + (Math.random() * 10 - 5), // Add slight noise for visual effect
        }
      ].slice(-50); // Keep last 50 points

      return {
        ...prev,
        dwellTimes: newDwellTimes,
        flightTimes: newFlightTimes,
        avgDwellTime: avgDwell,
        avgFlightTime: avgFlight,
        timingVariance: timingVar,
        neuralWaveform: newWaveform,
      };
    });
  }, []);

  const handleMouseMove = useCallback((x: number, y: number) => {
    const now = performance.now();
    
    setData(prev => {
      const newPositions = [...prev.mousePositions, { x, y, time: now }].slice(-100);
      const mouseVar = calculateMouseVariance(newPositions);
      
      // Add waveform data for mouse movement
      waveformIndex.current += 1;
      const newWaveform = [
        ...prev.neuralWaveform,
        {
          time: waveformIndex.current,
          value: mouseVar * 2 + (Math.random() * 5),
        }
      ].slice(-50);

      return {
        ...prev,
        mousePositions: newPositions,
        mouseVariance: mouseVar,
        neuralWaveform: newWaveform,
      };
    });
  }, []);

  const analyzeResult = useCallback((): BiometricResult => {
    const { timingVariance, mouseVariance, dwellTimes, flightTimes } = data;
    
    // Check for bot-like patterns (extremely consistent timing)
    if (timingVariance < 2 && dwellTimes.length > 5) {
      return {
        isHuman: false,
        confidence: 95,
        reason: 'Mechanical timing detected: variance < 2ms indicates automated input',
      };
    }
    
    // Check for human-like patterns (natural variation)
    if (timingVariance > 10 && dwellTimes.length > 5) {
      const confidence = Math.min(98, 70 + timingVariance + mouseVariance * 0.5);
      return {
        isHuman: true,
        confidence,
        reason: 'Neural micro-patterns confirmed: natural CNS timing variance detected',
      };
    }
    
    // Intermediate state
    if (dwellTimes.length <= 5) {
      return {
        isHuman: true,
        confidence: 50 + dwellTimes.length * 5,
        reason: 'Analyzing biometric signature...',
      };
    }
    
    // Suspicious but not conclusive
    return {
      isHuman: true,
      confidence: 60 + timingVariance * 2,
      reason: 'Moderate timing variance detected: continuing analysis...',
    };
  }, [data]);

  const reset = useCallback(() => {
    setData({
      dwellTimes: [],
      flightTimes: [],
      mousePositions: [],
      mouseVariance: 0,
      avgDwellTime: 0,
      avgFlightTime: 0,
      timingVariance: 0,
      neuralWaveform: [],
    });
    keyDownTime.current = 0;
    lastKeyUpTime.current = 0;
    waveformIndex.current = 0;
  }, []);

  return {
    data,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    analyzeResult,
    reset,
  };
}
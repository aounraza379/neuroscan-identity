import { useState, useCallback, useRef, useEffect } from 'react';

export interface BiometricData {
  dwellTimes: number[];
  flightTimes: number[];
  mousePositions: { x: number; y: number; time: number }[];
  mouseVariance: number;
  avgDwellTime: number;
  avgFlightTime: number;
  timingVariance: number;
  neuralWaveform: { time: number; value: number }[];
  latency: number;
  jitter: number;
  isBotMode: boolean;
  isBreached: boolean;
  // New: Progressive confidence tracking
  movementScore: number;
  keystrokeScore: number;
  lastMovementTime: number;
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
    latency: 0,
    jitter: 0,
    isBotMode: false,
    isBreached: false,
    movementScore: 0,
    keystrokeScore: 0,
    lastMovementTime: 0,
  });

  const keyDownTime = useRef<number>(0);
  const lastKeyUpTime = useRef<number>(0);
  const waveformIndex = useRef<number>(0);
  const lastTextLength = useRef<number>(0);
  const movementIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPositionRef = useRef<{ x: number; y: number } | null>(null);

  // Progressive movement scoring - every 1 second of non-robotic movement adds +10%
  useEffect(() => {
    movementIntervalRef.current = setInterval(() => {
      setData(prev => {
        if (prev.isBotMode || prev.isBreached) return prev;
        
        const now = Date.now();
        const timeSinceLastMovement = now - prev.lastMovementTime;
        
        // Only add score if there was recent movement (within last 1.5 seconds)
        // and mouse variance indicates human-like movement (> 1px variance)
        if (timeSinceLastMovement < 1500 && prev.mouseVariance > 1) {
          const newMovementScore = Math.min(50, prev.movementScore + 10);
          return { ...prev, movementScore: newMovementScore };
        }
        return prev;
      });
    }, 1000);

    return () => {
      if (movementIntervalRef.current) {
        clearInterval(movementIntervalRef.current);
      }
    };
  }, []);

  const calculateVariance = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return Math.sqrt(squaredDiffs.reduce((a, b) => a + b, 0) / values.length);
  };

  // Check if mouse moves in a perfect circle (variance < 1px from ideal circle path)
  const calculateCircleVariance = (positions: { x: number; y: number }[]): number => {
    if (positions.length < 10) return 100; // Not enough data
    
    // Find center of all points
    const centerX = positions.reduce((a, p) => a + p.x, 0) / positions.length;
    const centerY = positions.reduce((a, p) => a + p.y, 0) / positions.length;
    
    // Calculate distances from center
    const distances = positions.map(p => 
      Math.sqrt(Math.pow(p.x - centerX, 2) + Math.pow(p.y - centerY, 2))
    );
    
    // If all distances are nearly identical (variance < 1px), it's a perfect circle
    return calculateVariance(distances);
  };

  // Check for identical flight times (bot pattern)
  const hasIdenticalFlightTimes = (flightTimes: number[]): boolean => {
    if (flightTimes.length < 3) return false;
    
    // Round to nearest ms and count occurrences
    const rounded = flightTimes.map(t => Math.round(t));
    const counts: Record<number, number> = {};
    
    for (const time of rounded) {
      counts[time] = (counts[time] || 0) + 1;
      // If any timing appears 3+ times identically, it's a bot
      if (counts[time] >= 3) return true;
    }
    
    return false;
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
      if (prev.isBotMode || prev.isBreached) return prev;
      
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
          value: dwellTime + (Math.random() * 10 - 5),
        }
      ].slice(-50);

      // Add keystroke score: +5% per natural keystroke (max 50%)
      const hasNaturalVariance = timingVar > 5;
      const newKeystrokeScore = hasNaturalVariance 
        ? Math.min(50, prev.keystrokeScore + 5) 
        : prev.keystrokeScore;

      return {
        ...prev,
        dwellTimes: newDwellTimes,
        flightTimes: newFlightTimes,
        avgDwellTime: avgDwell,
        avgFlightTime: avgFlight,
        timingVariance: timingVar,
        neuralWaveform: newWaveform,
        latency: Math.round(dwellTime),
        jitter: Math.round(timingVar),
        keystrokeScore: newKeystrokeScore,
      };
    });
  }, []);

  // Detect copy-paste (text length jumps > 5 characters)
  const handleTextChange = useCallback((newLength: number): boolean => {
    const lengthDiff = newLength - lastTextLength.current;
    lastTextLength.current = newLength;
    
    // If length jumped by more than 5 characters, it's a paste
    return lengthDiff > 5;
  }, []);

  const handleMouseMove = useCallback((x: number, y: number) => {
    const now = performance.now();
    
    // Check if this is actual movement (not just the same position)
    const lastPos = lastPositionRef.current;
    if (lastPos && Math.abs(x - lastPos.x) < 1 && Math.abs(y - lastPos.y) < 1) {
      return; // Ignore micro-movements
    }
    lastPositionRef.current = { x, y };
    
    setData(prev => {
      if (prev.isBotMode || prev.isBreached) return prev;
      
      const newPositions = [...prev.mousePositions, { x, y, time: now }].slice(-100);
      const mouseVar = calculateCircleVariance(newPositions);
      
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
        jitter: Math.round(mouseVar),
        lastMovementTime: Date.now(),
      };
    });
  }, []);

  // Simulate bot behavior
  const triggerBotMode = useCallback(() => {
    waveformIndex.current = 0;
    
    // Generate perfectly timed bot data
    const perfectFlightTimes = Array(10).fill(100); // Exactly 100ms intervals
    const perfectDwellTimes = Array(10).fill(50);   // Exactly 50ms dwell
    
    // Generate perfect circle positions
    const perfectCircle: { x: number; y: number; time: number }[] = [];
    const centerX = 100;
    const centerY = 80;
    const radius = 40;
    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * 2 * Math.PI;
      perfectCircle.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        time: i * 20,
      });
    }
    
    // Generate bot waveform (flat line)
    const botWaveform = Array(50).fill(null).map((_, i) => ({
      time: i,
      value: 50, // Perfectly flat
    }));

    setData({
      dwellTimes: perfectDwellTimes,
      flightTimes: perfectFlightTimes,
      mousePositions: perfectCircle,
      mouseVariance: 0.1, // Perfect circle = near-zero variance
      avgDwellTime: 50,
      avgFlightTime: 100,
      timingVariance: 0,
      neuralWaveform: botWaveform,
      latency: 50,
      jitter: 0,
      isBotMode: true,
      isBreached: true,
      movementScore: 0,
      keystrokeScore: 0,
      lastMovementTime: 0,
    });
  }, []);

  const analyzeResult = useCallback((): BiometricResult => {
    const { 
      timingVariance, 
      mouseVariance, 
      dwellTimes, 
      flightTimes, 
      isBotMode, 
      isBreached,
      movementScore,
      keystrokeScore,
      mousePositions
    } = data;
    
    // If bot mode was triggered, return immediate failure
    if (isBotMode || isBreached) {
      return {
        isHuman: false,
        confidence: 0,
        reason: '🚨 SYSTEM BREACH: Mechanical input pattern detected. Zero variance indicates automated execution.',
      };
    }
    
    // Check for identical flight times (3+ identical timings)
    if (hasIdenticalFlightTimes(flightTimes)) {
      return {
        isHuman: false,
        confidence: 5,
        reason: 'BOT SIGNATURE: Identical inter-key intervals detected. Human CNS cannot produce such precision.',
      };
    }
    
    // Check for perfect circle (variance < 1px)
    if (mouseVariance < 1 && mousePositions.length > 20) {
      return {
        isHuman: false,
        confidence: 3,
        reason: 'BOT SIGNATURE: Perfect geometric path detected. Human motor control has inherent jitter.',
      };
    }
    
    // Check for bot-like patterns (extremely consistent timing < 2ms variance)
    if (timingVariance < 2 && dwellTimes.length > 5) {
      return {
        isHuman: false,
        confidence: 8,
        reason: 'BOT SIGNATURE: Timing variance < 2ms indicates automated input execution.',
      };
    }
    
    // PROGRESSIVE CONFIDENCE: Start at 50%, add movement + keystroke scores
    const baseConfidence = 50;
    const totalScore = movementScore + keystrokeScore;
    const confidence = Math.min(98, baseConfidence + totalScore);
    
    // Quick boost if we have good variance indicators
    const hasNaturalMovement = mouseVariance > 5 && mousePositions.length > 10;
    const hasNaturalTyping = timingVariance > 10 && dwellTimes.length > 3;
    
    let bonusConfidence = 0;
    if (hasNaturalMovement) bonusConfidence += 10;
    if (hasNaturalTyping) bonusConfidence += 10;
    
    const finalConfidence = Math.min(98, confidence + bonusConfidence);
    
    if (finalConfidence >= 85) {
      return {
        isHuman: true,
        confidence: finalConfidence,
        reason: 'HUMAN VERIFIED: Natural CNS timing variance and motor jitter confirmed.',
      };
    }
    
    // Still analyzing
    return {
      isHuman: true,
      confidence: finalConfidence,
      reason: `Analyzing biometric signature... (${Math.round(finalConfidence)}%)`,
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
      latency: 0,
      jitter: 0,
      isBotMode: false,
      isBreached: false,
      movementScore: 0,
      keystrokeScore: 0,
      lastMovementTime: 0,
    });
    keyDownTime.current = 0;
    lastKeyUpTime.current = 0;
    waveformIndex.current = 0;
    lastTextLength.current = 0;
    lastPositionRef.current = null;
  }, []);

  return {
    data,
    handleKeyDown,
    handleKeyUp,
    handleMouseMove,
    handleTextChange,
    analyzeResult,
    triggerBotMode,
    reset,
  };
}

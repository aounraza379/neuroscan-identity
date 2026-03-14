/**
 * useNeuroGuard - Minimal Integration API for NeuroSignature
 * 
 * USAGE:
 *   const { isHuman, confidence, verdict, formProps, reset } = useNeuroGuard();
 *   
 *   // Spread formProps onto your <form> element:
 *   <form {...formProps}> ... </form>
 *   
 *   // Check before submission:
 *   if (!isHuman) { alert("Verification failed"); return; }
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export interface NeuroGuardResult {
  /** Whether the user is determined to be human */
  isHuman: boolean;
  /** Confidence score 0-100 */
  confidence: number;
  /** Human-readable verdict string */
  verdict: string;
  /** Spread these onto your <form> or container <div> */
  formProps: {
    onMouseMove: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
    onPaste: (e: React.ClipboardEvent) => void;
  };
  /** Whether a paste was detected */
  pasteDetected: boolean;
  /** Whether bot-like patterns were found */
  botDetected: boolean;
  /** Reset all tracking data */
  reset: () => void;
}

export function useNeuroGuard(options?: { threshold?: number }): NeuroGuardResult {
  const threshold = options?.threshold ?? 75;

  const [dwellTimes, setDwellTimes] = useState<number[]>([]);
  const [flightTimes, setFlightTimes] = useState<number[]>([]);
  const [mousePositions, setMousePositions] = useState<{ x: number; y: number }[]>([]);
  const [pasteDetected, setPasteDetected] = useState(false);
  const [movementScore, setMovementScore] = useState(0);
  const [keystrokeScore, setKeystrokeScore] = useState(0);

  const keyDownTime = useRef(0);
  const lastKeyUpTime = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastMoveTime = useRef(0);

  // Progressive movement scoring
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastMoveTime.current;
      if (timeSince < 1500 && mousePositions.length > 5) {
        setMovementScore(prev => Math.min(40, prev + 8));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [mousePositions.length]);

  const calculateVariance = (values: number[]): number => {
    if (values.length < 2) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.sqrt(values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length);
  };

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const { clientX: x, clientY: y } = e;
    const prev = lastPos.current;
    if (prev && Math.abs(x - prev.x) < 1 && Math.abs(y - prev.y) < 1) return;
    lastPos.current = { x, y };
    lastMoveTime.current = Date.now();
    setMousePositions(p => [...p, { x, y }].slice(-80));
  }, []);

  const onKeyDown = useCallback(() => {
    keyDownTime.current = performance.now();
  }, []);

  const onKeyUp = useCallback(() => {
    const now = performance.now();
    const dwell = now - keyDownTime.current;
    const flight = lastKeyUpTime.current > 0 ? keyDownTime.current - lastKeyUpTime.current : 0;
    lastKeyUpTime.current = now;

    setDwellTimes(prev => [...prev, dwell]);
    if (flight > 0) setFlightTimes(prev => [...prev, flight]);

    // Natural keystrokes add score
    setKeystrokeScore(prev => Math.min(40, prev + 4));
  }, []);

  const onPaste = useCallback(() => {
    setPasteDetected(true);
  }, []);

  // Analyze
  const result = useMemo((): { isHuman: boolean; confidence: number; verdict: string; botDetected: boolean } => {
    // Check for bot signatures
    if (flightTimes.length >= 3) {
      const rounded = flightTimes.map(t => Math.round(t));
      const counts: Record<number, number> = {};
      for (const t of rounded) {
        counts[t] = (counts[t] || 0) + 1;
        if (counts[t] >= 3) {
          return { isHuman: false, confidence: 5, verdict: 'BOT DETECTED: Identical inter-key intervals', botDetected: true };
        }
      }
    }

    const timingVar = calculateVariance([...dwellTimes, ...flightTimes]);
    if (timingVar < 2 && dwellTimes.length > 5) {
      return { isHuman: false, confidence: 8, verdict: 'BOT DETECTED: Timing variance < 2ms', botDetected: true };
    }

    // Mouse linearity check
    if (mousePositions.length > 20) {
      const centerX = mousePositions.reduce((a, p) => a + p.x, 0) / mousePositions.length;
      const centerY = mousePositions.reduce((a, p) => a + p.y, 0) / mousePositions.length;
      const distances = mousePositions.map(p => Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2));
      const mouseVar = calculateVariance(distances);
      if (mouseVar < 1) {
        return { isHuman: false, confidence: 3, verdict: 'BOT DETECTED: Perfect geometric path', botDetected: true };
      }
    }

    // Progressive confidence
    const base = 30;
    const hasNaturalMovement = mousePositions.length > 10 ? 10 : 0;
    const hasNaturalTyping = timingVar > 10 && dwellTimes.length > 3 ? 10 : 0;
    const confidence = Math.min(98, base + movementScore + keystrokeScore + hasNaturalMovement + hasNaturalTyping);

    return {
      isHuman: confidence >= threshold,
      confidence,
      verdict: confidence >= threshold
        ? 'HUMAN VERIFIED: Natural behavioral patterns confirmed'
        : `Analyzing biometric signature... (${Math.round(confidence)}%)`,
      botDetected: false,
    };
  }, [dwellTimes, flightTimes, mousePositions, movementScore, keystrokeScore, threshold]);

  const reset = useCallback(() => {
    setDwellTimes([]);
    setFlightTimes([]);
    setMousePositions([]);
    setPasteDetected(false);
    setMovementScore(0);
    setKeystrokeScore(0);
    keyDownTime.current = 0;
    lastKeyUpTime.current = 0;
    lastPos.current = null;
  }, []);

  return {
    isHuman: result.isHuman,
    confidence: result.confidence,
    verdict: result.verdict,
    pasteDetected,
    botDetected: result.botDetected,
    formProps: { onMouseMove, onKeyDown, onKeyUp, onPaste },
    reset,
  };
}

/**
 * useNeuroGuard - Hardened Behavioral Biometrics Hook
 * 
 * SIGNALS COLLECTED:
 * 1. Keystroke dynamics: dwell times, flight times, timing variance
 * 2. Mouse trajectory: curvature analysis, acceleration jitter, path straightness
 * 3. Headless browser fingerprinting: webdriver, phantom, automation flags
 * 4. Typing speed consistency: detects inhuman fixed-interval typing
 * 5. Paste/clipboard detection
 * 
 * CONFIDENCE FORMULA:
 *   base(20) + movementScore(0-25) + keystrokeScore(0-25) + 
 *   curvatureBonus(0-10) + accelerationBonus(0-10) + environmentBonus(0-10)
 *   Capped at 98. Threshold default: 75.
 * 
 * BOT DETECTION (any triggers → isHuman=false):
 *   - 3+ identical flight times (fixed-interval typing)
 *   - Timing variance < 2ms with 5+ keystrokes
 *   - Mouse path straightness ratio > 0.98 with 20+ points
 *   - Near-zero curvature in mouse trajectory
 *   - Headless browser flags (webdriver, PhantomJS, etc.)
 *   - Typing speed < 30ms average (inhuman)
 * 
 * VERIFICATION TOKEN:
 *   When confidence passes threshold, a signed proof token is generated
 *   containing behavioral fingerprint + timestamp. Backend can verify
 *   this wasn't fabricated by checking the HMAC signature.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

// --- Headless Browser Detection ---
interface EnvironmentSignals {
  isHeadless: boolean;
  flags: string[];
}

function detectHeadlessBrowser(): EnvironmentSignals {
  const flags: string[] = [];
  
  // navigator.webdriver is set by Puppeteer, Playwright, Selenium
  if (navigator.webdriver) {
    flags.push('webdriver');
  }
  
  // PhantomJS detection
  if ((window as any).__phantom || (window as any)._phantom) {
    flags.push('phantomjs');
  }
  
  // Nightmare.js
  if ((window as any).__nightmare) {
    flags.push('nightmare');
  }
  
  // Chrome DevTools Protocol automation
  if ((window as any).domAutomation || (window as any).domAutomationController) {
    flags.push('dom-automation');
  }
  
  // Check for missing/spoofed plugins (headless browsers have 0 plugins)
  if (navigator.plugins.length === 0 && !/mobile|android/i.test(navigator.userAgent)) {
    flags.push('no-plugins');
  }
  
  // Check for missing languages
  if (!navigator.languages || navigator.languages.length === 0) {
    flags.push('no-languages');
  }
  
  // Chrome-specific: headless chrome has specific patterns
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('headlesschrome') || ua.includes('headless')) {
    flags.push('headless-ua');
  }
  
  // Screen dimensions of 0 suggest headless
  if (window.screen.width === 0 || window.screen.height === 0) {
    flags.push('zero-screen');
  }
  
  // Check for Selenium IDE
  if (document.documentElement.getAttribute('selenium') || 
      document.documentElement.getAttribute('webdriver') ||
      document.documentElement.getAttribute('driver')) {
    flags.push('selenium-attr');
  }

  return {
    isHeadless: flags.length > 0,
    flags,
  };
}

// --- Trajectory Analysis ---
interface TrajectoryMetrics {
  /** Ratio of straight-line distance to actual path length. 1.0 = perfectly straight */
  straightnessRatio: number;
  /** Average angular change between segments. Humans: 5-45°, bots: <2° */
  avgCurvature: number;
  /** Variance in speed between consecutive points. Humans have natural acceleration jitter */
  accelerationVariance: number;
  /** Whether the trajectory shows Bézier-curve-like smoothness (puppeteer ghost-cursor) */
  isSyntheticSmooth: boolean;
}

function analyzeTrajectory(positions: { x: number; y: number; time: number }[]): TrajectoryMetrics {
  const defaults: TrajectoryMetrics = {
    straightnessRatio: 0,
    avgCurvature: 90,
    accelerationVariance: 100,
    isSyntheticSmooth: false,
  };
  
  if (positions.length < 10) return defaults;

  // Straightness: displacement / total path length
  const first = positions[0];
  const last = positions[positions.length - 1];
  const displacement = Math.sqrt((last.x - first.x) ** 2 + (last.y - first.y) ** 2);
  
  let totalPathLength = 0;
  const speeds: number[] = [];
  const angles: number[] = [];
  
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const dt = positions[i].time - positions[i - 1].time;
    
    totalPathLength += dist;
    if (dt > 0) speeds.push(dist / dt);
    
    // Calculate angle between consecutive segments
    if (i >= 2) {
      const dx1 = positions[i - 1].x - positions[i - 2].x;
      const dy1 = positions[i - 1].y - positions[i - 2].y;
      const dot = dx * dx1 + dy * dy1;
      const cross = dx * dy1 - dy * dx1;
      const angle = Math.abs(Math.atan2(cross, dot) * (180 / Math.PI));
      angles.push(angle);
    }
  }
  
  const straightnessRatio = totalPathLength > 0 ? displacement / totalPathLength : 0;
  const avgCurvature = angles.length > 0
    ? angles.reduce((a, b) => a + b, 0) / angles.length
    : 90;

  // Acceleration variance
  const speedDiffs: number[] = [];
  for (let i = 1; i < speeds.length; i++) {
    speedDiffs.push(Math.abs(speeds[i] - speeds[i - 1]));
  }
  const avgSpeedDiff = speedDiffs.length > 0 ? speedDiffs.reduce((a, b) => a + b, 0) / speedDiffs.length : 100;
  const accVar = speedDiffs.length > 1
    ? Math.sqrt(speedDiffs.reduce((sum, d) => sum + (d - avgSpeedDiff) ** 2, 0) / speedDiffs.length)
    : 100;

  // Synthetic smoothness detection: very low curvature variance + high straightness
  // Puppeteer's ghost-cursor produces unnaturally smooth Bézier curves
  const curvatureVariance = angles.length > 1
    ? Math.sqrt(angles.reduce((sum, a) => sum + (a - avgCurvature) ** 2, 0) / angles.length)
    : 100;
  const isSyntheticSmooth = curvatureVariance < 1.5 && straightnessRatio > 0.85 && positions.length > 20;

  return {
    straightnessRatio,
    avgCurvature,
    accelerationVariance: accVar,
    isSyntheticSmooth,
  };
}

// --- Verification Token ---
// Now uses server-issued clientKey instead of hardcoded secret
async function generateProofToken(
  clientKey: string,
  confidence: number,
  signals: {
    keystrokeCount: number;
    mousePoints: number;
    avgCurvature: number;
    timingVariance: number;
    environmentFlags: string[];
  }
): Promise<string> {
  const payload = {
    c: confidence,
    t: Date.now(),
    s: {
      k: signals.keystrokeCount,
      m: signals.mousePoints,
      cv: Math.round(signals.avgCurvature * 100) / 100,
      tv: Math.round(signals.timingVariance * 100) / 100,
      ef: signals.environmentFlags,
    },
    // Nonce to prevent replay
    n: crypto.getRandomValues(new Uint8Array(16)).reduce((s, b) => s + b.toString(16).padStart(2, '0'), ''),
  };
  
  const payloadStr = JSON.stringify(payload);
  const encoder = new TextEncoder();
  
  // HMAC-SHA256 sign with server-issued clientKey
  const keyData = encoder.encode(clientKey);
  const key = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadStr));
  const sigHex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Base64 encode the token
  return btoa(JSON.stringify({ p: payload, s: sigHex }));
}

// --- Main Hook ---
export interface NeuroGuardResult {
  isHuman: boolean;
  confidence: number;
  verdict: string;
  formProps: {
    onMouseMove: (e: React.MouseEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
    onPaste: (e: React.ClipboardEvent) => void;
  };
  pasteDetected: boolean;
  botDetected: boolean;
  botReason: string | null;
  environmentFlags: string[];
  /** Signed proof token (null until isHuman=true) */
  verificationToken: string | null;
  /** Session ID from backend (null if no backend configured) */
  sessionId: string | null;
  trajectory: TrajectoryMetrics;
  signals: {
    keystrokeCount: number;
    mousePoints: number;
    timingVariance: number;
    avgTypingSpeed: number;
    straightnessRatio: number;
    avgCurvature: number;
  };
  /** Call to verify token server-side. Returns { verified, error? } */
  verifyOnServer: () => Promise<{ verified: boolean; error?: string }>;
  reset: () => void;
}

export function useNeuroGuard(options?: { threshold?: number; backendUrl?: string }): NeuroGuardResult {
  const threshold = options?.threshold ?? 75;
  const backendUrl = options?.backendUrl ?? null;

  const [dwellTimes, setDwellTimes] = useState<number[]>([]);
  const [flightTimes, setFlightTimes] = useState<number[]>([]);
  const [mousePositions, setMousePositions] = useState<{ x: number; y: number; time: number }[]>([]);
  const [pasteDetected, setPasteDetected] = useState(false);
  const [movementScore, setMovementScore] = useState(0);
  const [keystrokeScore, setKeystrokeScore] = useState(0);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [envSignals, setEnvSignals] = useState<EnvironmentSignals>({ isHeadless: false, flags: [] });
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [clientKey, setClientKey] = useState<string | null>(null);

  const keyDownTime = useRef(0);
  const lastKeyUpTime = useRef(0);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const lastMoveTime = useRef(0);
  const tokenGenerated = useRef(false);

  // Run headless detection once on mount
  useEffect(() => {
    setEnvSignals(detectHeadlessBrowser());
  }, []);

  // Fetch session key from backend if configured
  useEffect(() => {
    if (!backendUrl) return;
    fetch(`${backendUrl}/api/session/init`, { method: 'POST' })
      .then(r => r.json())
      .then(data => {
        setSessionId(data.sessionId);
        setClientKey(data.clientKey);
        console.log(`[NeuroGuard] Session initialized: ${data.sessionId}`);
      })
      .catch(err => console.warn('[NeuroGuard] Backend unavailable, running client-only:', err.message));
  }, [backendUrl]);

  // Progressive movement scoring
  useEffect(() => {
    const interval = setInterval(() => {
      const timeSince = Date.now() - lastMoveTime.current;
      if (timeSince < 1500 && mousePositions.length > 5) {
        setMovementScore(prev => Math.min(25, prev + 5));
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
    const now = performance.now();
    const prev = lastPos.current;
    if (prev && Math.abs(x - prev.x) < 1 && Math.abs(y - prev.y) < 1) return;
    lastPos.current = { x, y };
    lastMoveTime.current = Date.now();
    setMousePositions(p => [...p, { x, y, time: now }].slice(-100));
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
    setKeystrokeScore(prev => Math.min(25, prev + 3));
  }, []);

  const onPaste = useCallback(() => {
    setPasteDetected(true);
  }, []);

  // Trajectory analysis
  const trajectory = useMemo(() => analyzeTrajectory(mousePositions), [mousePositions]);

  // Core analysis
  const result = useMemo(() => {
    let botReason: string | null = null;

    // --- HARD FAILURES (any one = bot) ---

    // 1. Headless browser
    if (envSignals.isHeadless) {
      botReason = `HEADLESS BROWSER: ${envSignals.flags.join(', ')}`;
      return { isHuman: false, confidence: 0, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // 2. Identical flight times (fixed-interval bot typing)
    if (flightTimes.length >= 3) {
      const rounded = flightTimes.map(t => Math.round(t));
      const counts: Record<number, number> = {};
      for (const t of rounded) {
        counts[t] = (counts[t] || 0) + 1;
        if (counts[t] >= 3) {
          botReason = `FIXED-INTERVAL TYPING: ${t}ms repeated ${counts[t]}x`;
          return { isHuman: false, confidence: 5, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
        }
      }
    }

    // 3. Timing variance too low
    const timingVar = calculateVariance([...dwellTimes, ...flightTimes]);
    if (timingVar < 2 && dwellTimes.length > 5) {
      botReason = `TIMING VARIANCE: ${timingVar.toFixed(2)}ms (threshold: >2ms)`;
      return { isHuman: false, confidence: 8, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // 4. Inhuman typing speed (avg flight time < 30ms)
    if (flightTimes.length > 5) {
      const avgFlight = flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length;
      if (avgFlight < 30) {
        botReason = `INHUMAN SPEED: ${avgFlight.toFixed(0)}ms avg flight time (min: 30ms)`;
        return { isHuman: false, confidence: 3, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
      }
    }

    // 5. Perfectly straight mouse trajectory
    if (mousePositions.length > 20 && trajectory.straightnessRatio > 0.98) {
      botReason = `LINEAR TRAJECTORY: ${(trajectory.straightnessRatio * 100).toFixed(1)}% straight (threshold: <98%)`;
      return { isHuman: false, confidence: 4, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // 6. Near-zero curvature (Puppeteer with basic mouse movement)
    if (mousePositions.length > 20 && trajectory.avgCurvature < 1.5) {
      botReason = `ZERO CURVATURE: ${trajectory.avgCurvature.toFixed(2)}° avg (threshold: >1.5°)`;
      return { isHuman: false, confidence: 6, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // 7. Synthetic smooth curves (ghost-cursor detection)
    if (trajectory.isSyntheticSmooth) {
      botReason = 'SYNTHETIC SMOOTHNESS: Bézier-curve-like trajectory detected';
      return { isHuman: false, confidence: 7, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // 8. Zero acceleration variance with enough data
    if (mousePositions.length > 30 && trajectory.accelerationVariance < 0.5) {
      botReason = `CONSTANT VELOCITY: ${trajectory.accelerationVariance.toFixed(2)} acc variance (threshold: >0.5)`;
      return { isHuman: false, confidence: 5, verdict: `⛔ ${botReason}`, botDetected: true, botReason };
    }

    // --- PROGRESSIVE CONFIDENCE ---
    const base = 20;
    const curvatureBonus = trajectory.avgCurvature > 5 && mousePositions.length > 15 ? 10 : 0;
    const accelBonus = trajectory.accelerationVariance > 2 && mousePositions.length > 15 ? 10 : 0;
    const envBonus = !envSignals.isHeadless ? 10 : 0;
    const naturalTyping = timingVar > 10 && dwellTimes.length > 3 ? 10 : 0;

    const confidence = Math.min(98, base + movementScore + keystrokeScore + curvatureBonus + accelBonus + envBonus + naturalTyping);
    const isHuman = confidence >= threshold;

    return {
      isHuman,
      confidence,
      verdict: isHuman
        ? `✅ HUMAN VERIFIED (${confidence}%): Natural behavioral patterns confirmed`
        : `🔍 Analyzing biometric signature... (${confidence}%)`,
      botDetected: false,
      botReason: null,
    };
  }, [dwellTimes, flightTimes, mousePositions, movementScore, keystrokeScore, threshold, trajectory, envSignals]);

  // Generate verification token when passing threshold
  useEffect(() => {
    if (result.isHuman && !tokenGenerated.current) {
      tokenGenerated.current = true;
      const timingVar = calculateVariance([...dwellTimes, ...flightTimes]);
      // Use server-issued clientKey if available, otherwise use a local fallback
      const signingKey = clientKey || `local_${Date.now()}`;
      generateProofToken(signingKey, result.confidence, {
        keystrokeCount: dwellTimes.length,
        mousePoints: mousePositions.length,
        avgCurvature: trajectory.avgCurvature,
        timingVariance: timingVar,
        environmentFlags: envSignals.flags,
      }).then(setVerificationToken);
    }
  }, [result.isHuman, result.confidence, dwellTimes, flightTimes, mousePositions.length, trajectory.avgCurvature, envSignals.flags, clientKey]);

  const avgTypingSpeed = flightTimes.length > 0
    ? flightTimes.reduce((a, b) => a + b, 0) / flightTimes.length
    : 0;

  // Server-side verification call
  const verifyOnServer = useCallback(async (): Promise<{ verified: boolean; error?: string }> => {
    if (!backendUrl || !sessionId || !verificationToken) {
      return { verified: false, error: backendUrl ? 'NO_TOKEN' : 'NO_BACKEND' };
    }
    try {
      const res = await fetch(`${backendUrl}/api/session/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, token: verificationToken }),
      });
      return await res.json();
    } catch (err) {
      return { verified: false, error: 'NETWORK_ERROR' };
    }
  }, [backendUrl, sessionId, verificationToken]);

  const reset = useCallback(() => {
    setDwellTimes([]);
    setFlightTimes([]);
    setMousePositions([]);
    setPasteDetected(false);
    setMovementScore(0);
    setKeystrokeScore(0);
    setVerificationToken(null);
    tokenGenerated.current = false;
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
    botReason: result.botReason,
    environmentFlags: envSignals.flags,
    verificationToken,
    sessionId,
    trajectory,
    signals: {
      keystrokeCount: dwellTimes.length,
      mousePoints: mousePositions.length,
      timingVariance: calculateVariance([...dwellTimes, ...flightTimes]),
      avgTypingSpeed,
      straightnessRatio: trajectory.straightnessRatio,
      avgCurvature: trajectory.avgCurvature,
    },
    formProps: { onMouseMove, onKeyDown, onKeyUp, onPaste },
    verifyOnServer,
    reset,
  };
}

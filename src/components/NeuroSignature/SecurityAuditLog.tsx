import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScrollText, Shield, Fingerprint, Eye, Cpu, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning';
}

interface SecurityAuditLogProps {
  confidence: number;
  isVerified: boolean;
  gripStability: number;
  isStaticDevice: boolean;
}

export function SecurityAuditLog({ 
  confidence, 
  isVerified, 
  gripStability,
  isStaticDevice 
}: SecurityAuditLogProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastConfidenceRef = useRef(confidence);
  const lastVerifiedRef = useRef(isVerified);

  const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  };

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const addLog = (message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: generateId(),
      timestamp: getTimestamp(),
      message,
      type
    };
    setLogs(prev => [...prev.slice(-19), newLog]); // Keep last 20 logs
  };

  // Initial log
  useEffect(() => {
    addLog('Security Audit System initialized', 'info');
    addLog('Neural pattern monitoring active', 'info');
    addLog('Continuous session integrity enabled', 'success');
  }, []);

  // Monitor confidence changes
  useEffect(() => {
    const diff = confidence - lastConfidenceRef.current;
    if (Math.abs(diff) >= 5) {
      if (confidence >= 85) {
        addLog(`Neural Jitter Verified: ${Math.round(confidence)}% Human`, 'success');
      } else if (confidence >= 50) {
        addLog(`Confidence Score: ${Math.round(confidence)}% - Building profile`, 'info');
      }
      lastConfidenceRef.current = confidence;
    }
  }, [confidence]);

  // Monitor verification status
  useEffect(() => {
    if (isVerified && !lastVerifiedRef.current) {
      addLog('IDENTITY VERIFIED - Banking access granted', 'success');
      addLog('Neural signature locked to session', 'success');
    }
    lastVerifiedRef.current = isVerified;
  }, [isVerified]);

  // Periodic HMOG updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (isStaticDevice) {
        addLog('HMOG Stability: SUSPICIOUS - Static device detected', 'warning');
      } else if (gripStability >= 80) {
        addLog(`HMOG Stability: Secure (${Math.round(gripStability)}%)`, 'success');
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [gripStability, isStaticDevice]);

  // Periodic neural pattern logs
  useEffect(() => {
    const interval = setInterval(() => {
      const patterns = [
        'Mouse trajectory analysis: Natural jitter detected',
        'Keystroke dynamics: Human variance confirmed',
        'Session heartbeat: Active monitoring',
        'Behavioral entropy: Within human parameters',
        'Pattern correlation: Matching stored profile'
      ];
      const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
      addLog(randomPattern, 'info');
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-primary" />;
      case 'warning': return <Shield className="w-3 h-3 text-destructive" />;
      default: return <Cpu className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 p-4 rounded-xl glassmorphism border border-border/50"
    >
      <div className="flex items-center gap-2 mb-3">
        <ScrollText className="w-4 h-4 text-primary" />
        <span className="text-xs font-mono font-bold text-primary">SECURITY AUDIT LOG</span>
        <div className="flex-1" />
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] font-mono text-muted-foreground">LIVE</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="h-32 overflow-y-auto space-y-1 font-mono text-[11px] scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
      >
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`flex items-start gap-2 py-0.5 ${
                log.type === 'success' ? 'text-primary' :
                log.type === 'warning' ? 'text-destructive' :
                'text-muted-foreground'
              }`}
            >
              <span className="text-muted-foreground/70 shrink-0">{log.timestamp}</span>
              {getIcon(log.type)}
              <span className="break-all">{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

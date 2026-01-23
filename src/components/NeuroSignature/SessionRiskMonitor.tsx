import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Shield, ShieldAlert, ShieldCheck, TrendingUp, TrendingDown } from 'lucide-react';

interface SessionRiskMonitorProps {
  confidence: number;
  isBreached: boolean;
  isVerified: boolean;
  mouseVariance: number;
}

export function SessionRiskMonitor({ 
  confidence, 
  isBreached, 
  isVerified,
  mouseVariance 
}: SessionRiskMonitorProps) {
  const [sessionRisk, setSessionRisk] = useState(0);
  const [riskHistory, setRiskHistory] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  // Update session risk every 2 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (isBreached) {
        setSessionRisk(100);
        setRiskHistory(prev => [...prev.slice(-9), 100]);
      } else {
        // Calculate risk based on confidence and mouse variance
        const baseRisk = 100 - confidence;
        const varianceRisk = mouseVariance < 5 ? 30 : 0; // Low variance = higher risk
        const newRisk = Math.min(100, Math.max(0, baseRisk + varianceRisk + (Math.random() * 5 - 2.5)));
        
        setSessionRisk(newRisk);
        setRiskHistory(prev => [...prev.slice(-9), newRisk]);
      }
      setLastUpdate(Date.now());
    }, 2000);

    return () => clearInterval(interval);
  }, [confidence, isBreached, mouseVariance]);

  const getRiskLevel = () => {
    if (isBreached) return { label: 'CRITICAL', color: 'text-destructive', bg: 'bg-destructive/20' };
    if (sessionRisk > 70) return { label: 'HIGH', color: 'text-destructive', bg: 'bg-destructive/20' };
    if (sessionRisk > 40) return { label: 'MEDIUM', color: 'text-warning', bg: 'bg-warning/20' };
    return { label: 'LOW', color: 'text-primary', bg: 'bg-primary/20' };
  };

  const riskLevel = getRiskLevel();
  const trend = riskHistory.length >= 2 
    ? riskHistory[riskHistory.length - 1] - riskHistory[riskHistory.length - 2]
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glassmorphism rounded-xl p-4 border ${
        isBreached ? 'border-destructive/50 cyber-glow-danger' : 'border-border/50'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className={`w-4 h-4 ${riskLevel.color}`} />
          <span className="font-mono text-xs text-muted-foreground">SESSION RISK MONITOR</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-mono text-muted-foreground">
          <span>Updated: </span>
          <span>{new Date(lastUpdate).toLocaleTimeString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Risk Score */}
        <div className="text-center">
          <motion.div
            key={sessionRisk}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className={`text-2xl font-bold font-mono ${riskLevel.color}`}
          >
            {Math.round(sessionRisk)}%
          </motion.div>
          <div className="flex items-center justify-center gap-1 mt-1">
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3 text-destructive" />
            ) : trend < 0 ? (
              <TrendingDown className="w-3 h-3 text-primary" />
            ) : null}
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${riskLevel.bg} ${riskLevel.color}`}>
              {riskLevel.label}
            </span>
          </div>
        </div>

        {/* Shield Status */}
        <div className="text-center">
          <motion.div
            animate={{ 
              scale: isBreached ? [1, 1.1, 1] : 1,
            }}
            transition={{ duration: 0.5, repeat: isBreached ? Infinity : 0 }}
          >
            {isBreached ? (
              <ShieldAlert className="w-8 h-8 mx-auto text-destructive" />
            ) : isVerified ? (
              <ShieldCheck className="w-8 h-8 mx-auto text-primary" />
            ) : (
              <Shield className="w-8 h-8 mx-auto text-muted-foreground" />
            )}
          </motion.div>
          <p className="text-xs font-mono text-muted-foreground mt-1">
            {isBreached ? 'COMPROMISED' : isVerified ? 'VERIFIED' : 'PENDING'}
          </p>
        </div>

        {/* Confidence */}
        <div className="text-center">
          <div className={`text-2xl font-bold font-mono ${
            isBreached ? 'text-destructive' : 'text-foreground'
          }`}>
            {Math.round(confidence)}%
          </div>
          <p className="text-xs font-mono text-muted-foreground mt-1">CONFIDENCE</p>
        </div>
      </div>

      {/* Mini Risk Graph */}
      <div className="mt-3 h-8 flex items-end gap-0.5">
        {riskHistory.map((risk, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${(risk / 100) * 100}%` }}
            className={`flex-1 rounded-t-sm ${
              risk > 70 ? 'bg-destructive' : risk > 40 ? 'bg-warning' : 'bg-primary'
            }`}
            style={{ minHeight: '2px' }}
          />
        ))}
        {Array(10 - riskHistory.length).fill(0).map((_, i) => (
          <div key={`empty-${i}`} className="flex-1 h-0.5 bg-muted rounded-t-sm" />
        ))}
      </div>
    </motion.div>
  );
}

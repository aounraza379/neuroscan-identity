import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Github, Landmark } from 'lucide-react';
import { SecurityTerminal } from './SecurityTerminal';
import { ProjectNarrative } from './ProjectNarrative';
import { WebcamShield } from './WebcamShield';
import { DeveloperTools } from './DeveloperTools';
import { SystemBreachAlert } from './SystemBreachAlert';
import { BankingDashboard } from './BankingDashboard';
import { SessionRiskMonitor } from './SessionRiskMonitor';
import { NeuralProfileManager } from './NeuralProfileManager';
import { SecurityBreachLock } from './SecurityBreachLock';
import { ShieldStatus } from './ShieldStatus';
import { useBiometricTracker } from '@/hooks/useBiometricTracker';

export function NeuroSignature() {
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [simulateDeepfake, setSimulateDeepfake] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  
  const { 
    data,
    handleMouseMove,
    analyzeResult, 
    triggerBotMode, 
    reset 
  } = useBiometricTracker();

  const result = analyzeResult();

  // Continuous mouse monitoring for session integrity
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [handleMouseMove]);

  // Monitor for breach condition
  useEffect(() => {
    if (data.isBreached || data.isBotMode) {
      setIsPageLocked(true);
      setIsVerified(false);
    }
  }, [data.isBreached, data.isBotMode]);

  // Track verification status
  useEffect(() => {
    if (result.isHuman && result.confidence >= 85 && !data.isBreached) {
      setIsVerified(true);
    }
  }, [result.isHuman, result.confidence, data.isBreached]);

  const handleBreachDetected = useCallback(() => {
    setShowBreachAlert(true);
    setTimeout(() => {
      setShowBreachAlert(false);
      setIsPageLocked(true);
    }, 2000);
  }, []);

  const handleSimulateBot = useCallback(() => {
    triggerBotMode();
    handleBreachDetected();
  }, [triggerBotMode, handleBreachDetected]);

  const handleVerificationComplete = useCallback((success: boolean, confidence: number) => {
    if (success && confidence >= 85) {
      setIsVerified(true);
    }
  }, []);

  const handleTransferAttempt = () => {
    // In a real app, this would open a transfer modal
    console.log('Transfer initiated with neural verification');
  };

  const handleFullReset = () => {
    reset();
    setIsPageLocked(false);
    setShowBreachAlert(false);
    setIsVerified(false);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Full-screen Security Breach Lock */}
      <SecurityBreachLock isVisible={isPageLocked} onReset={handleFullReset} />
      
      {/* Shield Status Indicator */}
      <ShieldStatus 
        isVerified={isVerified} 
        isBreached={data.isBreached} 
        confidence={result.confidence}
      />
      
      {/* System Breach Alert Overlay */}
      <SystemBreachAlert isVisible={showBreachAlert} />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center cyber-glow">
              <Landmark className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-wider text-primary text-glow">
                NEUROSIGNATURE
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Banking Defense • Continuous Session Integrity
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Webcam Shield */}
            <WebcamShield simulateDeepfake={simulateDeepfake} />
            
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="w-5 h-5" />
              <span className="hidden sm:inline font-mono">View Source</span>
            </a>
          </div>
        </div>
      </motion.header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-xs font-mono text-primary">FINTECH SECURITY • CONTINUOUS MONITORING</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Banking Defense System
            <br />
            <span className="text-primary text-glow">Powered by Neural Biometrics</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Protect high-value transactions with continuous behavioral authentication. 
            Even with stolen credentials, attackers cannot replicate your neural signature.
          </p>
        </motion.div>

        {/* Session Risk Monitor */}
        <div className="max-w-4xl mx-auto mb-6">
          <SessionRiskMonitor
            confidence={result.confidence}
            isBreached={data.isBreached}
            isVerified={isVerified}
            mouseVariance={data.mouseVariance}
          />
        </div>
        
        <SecurityTerminal 
          onBreachDetected={handleBreachDetected} 
          onVerificationComplete={handleVerificationComplete}
        />

        {/* Neural Profile Manager */}
        <div className="max-w-4xl mx-auto mt-6 grid md:grid-cols-2 gap-6">
          <NeuralProfileManager
            avgDwellTime={data.avgDwellTime}
            avgFlightTime={data.avgFlightTime}
            timingVariance={data.timingVariance}
            mouseVariance={data.mouseVariance}
            isVerified={isVerified}
          />
          
          {/* Developer Tools */}
          <DeveloperTools
            onSimulateBot={handleSimulateBot}
            simulateDeepfake={simulateDeepfake}
            onToggleDeepfake={setSimulateDeepfake}
          />
        </div>

        {/* Banking Dashboard */}
        <BankingDashboard
          isVerified={isVerified}
          confidence={result.confidence}
          onTransferAttempt={handleTransferAttempt}
          isBreached={data.isBreached}
        />
        
        <ProjectNarrative />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            NeuroSignature Banking Defense • Preventing credential theft through behavioral biometrics
          </p>
        </div>
      </footer>
    </div>
  );
}

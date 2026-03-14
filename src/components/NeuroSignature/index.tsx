import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Github, Landmark, Code2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SecurityTerminal } from './SecurityTerminal';
import { ProjectNarrative } from './ProjectNarrative';
import { LivenessChallenge } from './LivenessChallenge';
import { DeveloperTools } from './DeveloperTools';
import { SystemBreachAlert } from './SystemBreachAlert';
import { BankingDashboard } from './BankingDashboard';
import { SessionRiskMonitor } from './SessionRiskMonitor';
import { NeuralProfileManager } from './NeuralProfileManager';
import { SecurityBreachLock } from './SecurityBreachLock';
import { ShieldStatus } from './ShieldStatus';
import { GripStabilityMeter } from './GripStabilityMeter';
import { SessionIntegrityBadge } from './SessionIntegrityBadge';
import { SecurityAuditLog } from './SecurityAuditLog';
import { BotAttackOverlay } from './BotAttackOverlay';
import { useBiometricTracker } from '@/hooks/useBiometricTracker';
import { useHMOG } from '@/hooks/useHMOG';

export function NeuroSignature() {
  // SESSION HYGIENE: All state starts fresh on mount - no localStorage persistence
  const [showBreachAlert, setShowBreachAlert] = useState(false);
  const [showBotOverlay, setShowBotOverlay] = useState(false);
  const [simulateDeepfake, setSimulateDeepfake] = useState(false);
  const [isPageLocked, setIsPageLocked] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false); // Global unlock state - starts FALSE
  const [livenessVerified, setLivenessVerified] = useState(false);
  
  // EXPLICIT VERIFICATION GATES: Both must be completed to unlock transactions
  const [typingVerified, setTypingVerified] = useState(false);
  const [circleVerified, setCircleVerified] = useState(false);
  
  const { 
    data,
    handleMouseMove,
    analyzeResult, 
    triggerBotMode,
    triggerBotTyping,
    reset 
  } = useBiometricTracker();

  const {
    data: hmogData,
    simulateRoboticHand,
    setSimulateRoboticHand,
    reset: resetHMOG
  } = useHMOG();

  const result = analyzeResult();

  // Continuous mouse monitoring for session integrity
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e.clientX, e.clientY);
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    return () => window.removeEventListener('mousemove', handleGlobalMouseMove);
  }, [handleMouseMove]);

  // Monitor for breach condition - include HMOG static device detection
  useEffect(() => {
    if (data.isBreached || data.isBotMode || hmogData.isStaticDevice) {
      setIsPageLocked(true);
      setIsVerified(false);
      setIsUnlocked(false);
    }
  }, [data.isBreached, data.isBotMode, hmogData.isStaticDevice]);

  // Track verification status - REQUIRES BOTH typing AND circle verification
  useEffect(() => {
    const hasCompletedBothTasks = typingVerified && circleVerified;
    const hasHighConfidence = result.isHuman && result.confidence >= 85;
    const isNotBreached = !data.isBreached && !hmogData.isStaticDevice;
    
    if (hasCompletedBothTasks && hasHighConfidence && isNotBreached) {
      setIsVerified(true);
      setIsUnlocked(true); // Set global unlock state
    }
  }, [result.isHuman, result.confidence, data.isBreached, hmogData.isStaticDevice, typingVerified, circleVerified]);

  const handleBreachDetected = useCallback(() => {
    setShowBreachAlert(true);
    setShowBotOverlay(true);
    setTimeout(() => {
      setShowBreachAlert(false);
      setIsPageLocked(true);
      // Keep bot overlay visible for dramatic effect
      setTimeout(() => setShowBotOverlay(false), 3000);
    }, 2000);
  }, []);

  const handleSimulateBot = useCallback(() => {
    triggerBotMode();
    handleBreachDetected();
  }, [triggerBotMode, handleBreachDetected]);

  const handleSimulateBotTyping = useCallback(() => {
    triggerBotTyping();
    handleBreachDetected();
  }, [triggerBotTyping, handleBreachDetected]);

  // Called when typing verification is complete
  const handleTypingVerified = useCallback(() => {
    setTypingVerified(true);
  }, []);

  // Called when circle trace verification is complete  
  const handleCircleVerified = useCallback(() => {
    setCircleVerified(true);
  }, []);

  const handleTransferAttempt = () => {
    console.log('Transfer initiated with neural verification');
  };

  const handleSliderBotDetected = () => {
    handleBreachDetected();
    triggerBotMode();
  };

  const handleLivenessResult = (passed: boolean) => {
    setLivenessVerified(passed);
    if (!passed) {
      console.log('Liveness check failed - possible deepfake detected');
    }
  };

  const handleTransactionComplete = (amount: number) => {
    console.log(`Transaction completed: $${amount}`);
  };

  const handleFullReset = () => {
    reset();
    resetHMOG();
    setIsPageLocked(false);
    setShowBreachAlert(false);
    setShowBotOverlay(false);
    setIsVerified(false);
    setIsUnlocked(false);
    setLivenessVerified(false);
    setTypingVerified(false);
    setCircleVerified(false);
  };

  const isBreached = data.isBreached || hmogData.isStaticDevice;

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Session Integrity Badge - Top Center */}
      <SessionIntegrityBadge
        isVerified={isUnlocked}
        isBreached={isBreached}
        confidence={result.confidence}
        isStaticDevice={hmogData.isStaticDevice}
      />
      
      {/* Full-screen Security Breach Lock */}
      <SecurityBreachLock isVisible={isPageLocked} onReset={handleFullReset} />
      
      {/* Shield Status Indicator */}
      <ShieldStatus 
        isVerified={isUnlocked} 
        isBreached={isBreached} 
        confidence={result.confidence}
      />
      
      {/* System Breach Alert Overlay */}
      <SystemBreachAlert isVisible={showBreachAlert} />
      
      {/* Bot Attack Visualization Overlay */}
      <BotAttackOverlay isVisible={showBotOverlay} />
      
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 backdrop-blur-sm pt-14"
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
            {/* Liveness Challenge Camera */}
            <LivenessChallenge 
              simulateDeepfake={simulateDeepfake} 
              onLivenessResult={handleLivenessResult}
            />
            
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
            isBreached={isBreached}
            isVerified={isUnlocked}
            mouseVariance={data.mouseVariance}
          />
        </div>
        
        <SecurityTerminal 
          onBreachDetected={handleBreachDetected} 
          onTypingVerified={handleTypingVerified}
          onCircleVerified={handleCircleVerified}
        />

        {/* Neural Profile Manager + Grip Stability + Developer Tools */}
        <div className="max-w-4xl mx-auto mt-6 grid md:grid-cols-3 gap-6">
          <NeuralProfileManager
            avgDwellTime={data.avgDwellTime}
            avgFlightTime={data.avgFlightTime}
            timingVariance={data.timingVariance}
            mouseVariance={data.mouseVariance}
            isVerified={isUnlocked}
            confidence={result.confidence}
          />
          
          {/* Grip Stability Meter (HMOG) */}
          <GripStabilityMeter
            gripStability={hmogData.gripStability}
            isStaticDevice={hmogData.isStaticDevice}
            isSupported={hmogData.isSupported}
            tiltData={{
              alpha: hmogData.alpha,
              beta: hmogData.beta,
              gamma: hmogData.gamma
            }}
            staticDuration={hmogData.staticDuration}
          />
          
          {/* Developer Tools */}
          <DeveloperTools
            onSimulateBot={handleSimulateBot}
            onSimulateBotTyping={handleSimulateBotTyping}
            simulateDeepfake={simulateDeepfake}
            onToggleDeepfake={setSimulateDeepfake}
            simulateRoboticHand={simulateRoboticHand}
            onToggleRoboticHand={setSimulateRoboticHand}
          />
        </div>

        {/* Banking Dashboard */}
        <BankingDashboard
          isVerified={isUnlocked}
          confidence={result.confidence}
          onTransferAttempt={handleTransferAttempt}
          onBotDetected={handleSliderBotDetected}
          isBreached={isBreached}
          onTransactionComplete={handleTransactionComplete}
        />

        {/* Security Audit Log */}
        <div className="max-w-4xl mx-auto">
          <SecurityAuditLog
            confidence={result.confidence}
            isVerified={isUnlocked}
            gripStability={hmogData.gripStability}
            isStaticDevice={hmogData.isStaticDevice}
          />
        </div>
        
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

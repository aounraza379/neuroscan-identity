import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, RefreshCw, Lock, Scan } from 'lucide-react';
import { useBiometricTracker } from '@/hooks/useBiometricTracker';
import { NeuralWaveform } from './NeuralWaveform';
import { ConfidenceGauge } from './ConfidenceGauge';
import { RhythmTyping } from './RhythmTyping';
import { PrecisionTrace } from './PrecisionTrace';
import { VerdictDisplay } from './VerdictDisplay';
import { Button } from '@/components/ui/button';

const TARGET_PHRASE = 'I am a biological entity.';

export function SecurityTerminal() {
  const [typedText, setTypedText] = useState('');
  const [testState, setTestState] = useState<'idle' | 'scanning' | 'complete'>('idle');
  const { data, handleKeyDown, handleKeyUp, handleMouseMove, analyzeResult, reset } = useBiometricTracker();

  const isTypingComplete = typedText === TARGET_PHRASE;
  const hasMouseData = data.mousePositions.length > 20;
  
  const result = useMemo(() => analyzeResult(), [analyzeResult, data]);

  const handleInputChange = (value: string) => {
    if (testState === 'idle') setTestState('scanning');
    setTypedText(value);
    
    if (value === TARGET_PHRASE && hasMouseData) {
      setTimeout(() => setTestState('complete'), 500);
    }
  };

  const handleReset = () => {
    setTypedText('');
    setTestState('idle');
    reset();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-4xl mx-auto"
    >
      {/* Terminal Header */}
      <div className="glassmorphism rounded-t-2xl border-b-0 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-destructive" />
            <div className="w-3 h-3 rounded-full bg-warning" />
            <div className="w-3 h-3 rounded-full bg-primary" />
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-sm text-foreground">NEUROSIGNATURE v1.0</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-muted-foreground">SECURE SESSION</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="font-mono text-xs"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            RESET
          </Button>
        </div>
      </div>
      
      {/* Main Terminal Body */}
      <div className="glassmorphism rounded-b-2xl p-6 space-y-6 cyber-grid relative overflow-hidden">
        {/* Scanline effect */}
        <div className="absolute inset-0 scanline opacity-30 pointer-events-none" />
        
        <AnimatePresence mode="wait">
          {testState !== 'complete' && (
            <motion.div
              key="testing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6 relative z-10"
            >
              {/* Status Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <motion.div
                    animate={testState === 'scanning' ? { rotate: 360 } : {}}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  >
                    <Scan className="w-5 h-5 text-primary" />
                  </motion.div>
                  <span className="font-mono text-sm">
                    {testState === 'idle' ? 'AWAITING INPUT' : 'SCANNING BIOMETRICS'}
                  </span>
                </div>
                <ConfidenceGauge 
                  confidence={result.confidence} 
                  isHuman={result.isHuman}
                  isComplete={false}
                />
              </div>
              
              {/* Waveform */}
              <NeuralWaveform 
                data={data.neuralWaveform} 
                isScanning={testState === 'scanning'} 
              />
              
              {/* Test Zone */}
              <div className="grid md:grid-cols-2 gap-6">
                <RhythmTyping
                  value={typedText}
                  targetPhrase={TARGET_PHRASE}
                  onKeyDown={handleKeyDown}
                  onKeyUp={handleKeyUp}
                  onChange={handleInputChange}
                  isComplete={isTypingComplete}
                />
                <PrecisionTrace
                  onMouseMove={handleMouseMove}
                  mouseVariance={data.mouseVariance}
                  isComplete={hasMouseData}
                />
              </div>
              
              {/* Instructions */}
              <div className="text-center text-xs font-mono text-muted-foreground">
                Complete both tests to verify your humanity. Your typing rhythm and mouse movement patterns are being analyzed.
              </div>
            </motion.div>
          )}
          
          {testState === 'complete' && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-8 relative z-10"
            >
              <VerdictDisplay result={result} isVisible={true} />
              
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 text-center"
              >
                <Button onClick={handleReset} variant="outline" className="font-mono">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  RUN NEW SCAN
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
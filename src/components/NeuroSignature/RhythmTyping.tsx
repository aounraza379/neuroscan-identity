import { motion } from 'framer-motion';
import { Keyboard, Check, X, AlertTriangle } from 'lucide-react';

interface RhythmTypingProps {
  value: string;
  targetPhrase: string;
  onKeyDown: () => void;
  onKeyUp: () => void;
  onChange: (value: string, isPaste: boolean) => void;
  isComplete: boolean;
  isPasteDetected?: boolean;
}

export function RhythmTyping({
  value,
  targetPhrase,
  onKeyDown,
  onKeyUp,
  onChange,
  isComplete,
  isPasteDetected = false,
}: RhythmTypingProps) {
  const progress = value.length / targetPhrase.length;
  const isMatch = value === targetPhrase;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    const lengthDiff = newValue.length - value.length;
    const isPaste = lengthDiff > 5;
    onChange(newValue, isPaste);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
      className="space-y-3"
    >
      <div className="flex items-center gap-2">
        <Keyboard className="w-4 h-4 text-primary" />
        <span className="text-sm font-mono text-muted-foreground">RHYTHM TYPING ANALYSIS</span>
      </div>
      
      <div className={`glassmorphism rounded-lg p-4 space-y-3 ${
        isPasteDetected ? 'border-destructive/50 cyber-glow-danger' : ''
      }`}>
        <div className="text-xs font-mono text-muted-foreground">
          TYPE THE PHRASE:
        </div>
        <div className="text-sm font-mono text-foreground/70 bg-muted/30 p-2 rounded border border-border/50">
          "{targetPhrase}"
        </div>
        
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
            disabled={isComplete}
            placeholder="Begin typing..."
            className={`w-full bg-background/50 border rounded-lg px-4 py-3 font-mono text-sm 
                       focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary
                       disabled:opacity-50 disabled:cursor-not-allowed
                       placeholder:text-muted-foreground/50
                       ${isPasteDetected ? 'border-destructive' : 'border-border'}`}
          />
          
          {value.length > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              {isPasteDetected ? (
                <AlertTriangle className="w-5 h-5 text-destructive" />
              ) : isMatch ? (
                <Check className="w-5 h-5 text-primary" />
              ) : value.length >= targetPhrase.length ? (
                <X className="w-5 h-5 text-destructive" />
              ) : null}
            </motion.div>
          )}
        </div>
        
        {/* Paste Warning */}
        {isPasteDetected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2 text-xs font-mono text-destructive bg-destructive/10 px-3 py-2 rounded"
          >
            <AlertTriangle className="w-3 h-3" />
            <span>COPY-PASTE DETECTED: Text length jumped &gt;5 characters</span>
          </motion.div>
        )}
        
        {/* Progress bar */}
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              backgroundColor: isPasteDetected 
                ? 'hsl(var(--destructive))' 
                : isMatch 
                  ? 'hsl(var(--primary))' 
                  : 'hsl(var(--muted-foreground))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress * 100, 100)}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
        
        <div className="flex justify-between text-xs font-mono text-muted-foreground">
          <span>{value.length} / {targetPhrase.length} characters</span>
          <span>{isPasteDetected ? 'PASTE DETECTED' : isMatch ? 'COMPLETE' : 'IN PROGRESS'}</span>
        </div>
      </div>
    </motion.div>
  );
}

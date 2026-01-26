import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, ChevronDown, ChevronUp, Bot, Scan, Hand, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface DeveloperToolsProps {
  onSimulateBot: () => void;
  onSimulateBotTyping?: () => void;
  simulateDeepfake: boolean;
  onToggleDeepfake: (value: boolean) => void;
  simulateRoboticHand: boolean;
  onToggleRoboticHand: (value: boolean) => void;
}

export function DeveloperTools({ 
  onSimulateBot,
  onSimulateBotTyping,
  simulateDeepfake, 
  onToggleDeepfake,
  simulateRoboticHand,
  onToggleRoboticHand
}: DeveloperToolsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glassmorphism rounded-lg overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-muted/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-warning" />
          <span className="text-sm font-mono text-warning">DEVELOPER TOOLS</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        )}
      </button>
      
      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-border/50"
          >
            <div className="p-4 space-y-4">
              {/* Simulate Bot Button */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  MOUSE/MOVEMENT BOT
                </Label>
                <Button
                  variant="destructive"
                  onClick={onSimulateBot}
                  className="w-full font-mono text-sm"
                >
                  <Bot className="w-4 h-4 mr-2" />
                  SIMULATE BOT ATTACK
                </Button>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Injects perfect straight-line mouse paths (0% variance) to trigger detection.
                </p>
              </div>
              
              {/* Simulate Bot Typing Button - Fixed 50ms intervals */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  KEYBOARD BOT (50ms)
                </Label>
                <Button
                  variant="destructive"
                  onClick={onSimulateBotTyping}
                  className="w-full font-mono text-sm"
                >
                  <Keyboard className="w-4 h-4 mr-2" />
                  SIMULATE BOT TYPING
                </Button>
                <p className="text-[10px] font-mono text-muted-foreground">
                  Injects exactly 50ms interval keystrokes. Instant detection on flight time consistency.
                </p>
              </div>
              
              {/* Robotic Hand Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  ROBOTIC HAND SIMULATION
                </Label>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Hand className="w-4 h-4 text-warning" />
                    <span className="text-sm font-mono">Simulate Robotic Hand</span>
                  </div>
                  <Switch
                    checked={simulateRoboticHand}
                    onCheckedChange={onToggleRoboticHand}
                  />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  When ON, mouse moves in straight lines and device tilt is set to 0° (static).
                </p>
              </div>
              
              {/* Deepfake Toggle */}
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">
                  DEEPFAKE SIMULATION
                </Label>
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border/50">
                  <div className="flex items-center gap-2">
                    <Scan className="w-4 h-4 text-warning" />
                    <span className="text-sm font-mono">Simulate Deepfake Attack</span>
                  </div>
                  <Switch
                    checked={simulateDeepfake}
                    onCheckedChange={onToggleDeepfake}
                  />
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">
                  When ON, the Vision Guard will display "SYNTHETIC (Deepfake Detected)".
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

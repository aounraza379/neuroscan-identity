import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Bot, Zap } from 'lucide-react';

interface BotAttackOverlayProps {
  isVisible: boolean;
}

export function BotAttackOverlay({ isVisible }: BotAttackOverlayProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-40 pointer-events-none overflow-hidden"
        >
          {/* Red Scanline Effect */}
          <motion.div
            animate={{ y: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-x-0 h-1 bg-gradient-to-b from-transparent via-destructive to-transparent opacity-50"
          />
          
          {/* Ghost Path - Straight Lines */}
          <svg className="absolute inset-0 w-full h-full">
            <motion.line
              x1="0"
              y1="50%"
              x2="100%"
              y2="50%"
              stroke="hsl(var(--destructive))"
              strokeWidth="3"
              strokeDasharray="10,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.8, 0.3, 0.8] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeDasharray="10,5"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0.5, 0.2, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            {/* Diagonal lines */}
            <motion.line
              x1="0"
              y1="0"
              x2="100%"
              y2="100%"
              stroke="hsl(var(--destructive))"
              strokeWidth="2"
              strokeDasharray="15,10"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </svg>
          
          {/* SYNTHETIC INPUT WARNING */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ 
              scale: [1, 1.02, 1],
              opacity: 1 
            }}
            transition={{ duration: 0.5, scale: { repeat: Infinity, duration: 1 } }}
            className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-destructive/30 blur-xl rounded-xl" />
              
              <div className="relative bg-background/95 border-2 border-destructive rounded-xl px-8 py-4 shadow-2xl shadow-destructive/50">
                <div className="flex items-center gap-3 mb-2">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    <AlertTriangle className="w-8 h-8 text-destructive" />
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.3, repeat: Infinity }}
                  >
                    <Bot className="w-8 h-8 text-destructive" />
                  </motion.div>
                  <Zap className="w-8 h-8 text-destructive" />
                </div>
                
                <motion.h2
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="text-2xl font-mono font-bold text-destructive text-center"
                >
                  SYNTHETIC INPUT DETECTED
                </motion.h2>
                
                <p className="text-xs font-mono text-destructive/80 mt-2 text-center">
                  Mechanical precision patterns identified • Zero variance
                </p>
              </div>
            </div>
          </motion.div>
          
          {/* Corner Glitches */}
          {[0, 1, 2, 3].map((corner) => (
            <motion.div
              key={corner}
              className={`absolute w-16 h-16 border-2 border-destructive ${
                corner === 0 ? 'top-4 left-4 border-r-0 border-b-0' :
                corner === 1 ? 'top-4 right-4 border-l-0 border-b-0' :
                corner === 2 ? 'bottom-4 left-4 border-r-0 border-t-0' :
                'bottom-4 right-4 border-l-0 border-t-0'
              }`}
              animate={{ 
                opacity: [0.8, 0.2, 0.8],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 0.8, 
                repeat: Infinity,
                delay: corner * 0.2
              }}
            />
          ))}
          
          {/* Edge Flashes */}
          <motion.div
            className="absolute inset-x-0 top-0 h-1 bg-destructive"
            animate={{ opacity: [1, 0, 1] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1 bg-destructive"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.3, repeat: Infinity, delay: 0.15 }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

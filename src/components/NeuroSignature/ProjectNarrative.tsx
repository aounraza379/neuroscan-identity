import { motion } from 'framer-motion';
import { Brain, Shield, Fingerprint, AlertTriangle, Zap, Lock } from 'lucide-react';

export function ProjectNarrative() {
  const features = [
    {
      icon: Fingerprint,
      title: 'Keystroke Dynamics',
      description: 'Analyzes dwell time and flight time between keystrokes',
    },
    {
      icon: Brain,
      title: 'Neural Micro-Patterns',
      description: 'Detects CNS-level timing variations unique to humans',
    },
    {
      icon: Zap,
      title: 'Real-Time Analysis',
      description: 'Sub-millisecond precision in behavioral tracking',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <div className="glassmorphism rounded-2xl p-6 space-y-6">
        {/* Warning Banner */}
        <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div>
            <h3 className="font-mono text-sm font-semibold text-warning">THE PROBLEM</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Traditional biometrics (Face/Fingerprint) are now replicable by Generative AI. 
              Deepfakes can bypass facial recognition. Synthetic fingerprints fool scanners.
            </p>
          </div>
        </div>
        
        {/* Solution */}
        <div className="flex items-start gap-3 p-4 bg-primary/10 border border-primary/20 rounded-lg">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <div>
            <h3 className="font-mono text-sm font-semibold text-primary">THE SOLUTION: NEUROSIGNATURE</h3>
            <p className="text-sm text-muted-foreground mt-1">
              NeuroSignature tracks Central Nervous System micro-patterns in real-time. 
              The way you type and move is controlled by millions of neural impulses that create 
              unique timing signatures—making identity spoofing mathematically impossible.
            </p>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="p-4 bg-muted/30 rounded-lg border border-border/50"
            >
              <feature.icon className="w-6 h-6 text-primary mb-2" />
              <h4 className="font-mono text-sm font-semibold">{feature.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* Technical Note */}
        <div className="flex items-center justify-center gap-2 pt-2 border-t border-border/50">
          <Lock className="w-4 h-4 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground">
            All biometric data processed locally. No data transmitted.
          </span>
        </div>
      </div>
    </motion.div>
  );
}
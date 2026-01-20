import { motion } from 'framer-motion';
import { Cpu, Github } from 'lucide-react';
import { SecurityTerminal } from './SecurityTerminal';
import { ProjectNarrative } from './ProjectNarrative';

export function NeuroSignature() {
  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-border/50 backdrop-blur-sm"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center cyber-glow">
              <Cpu className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="font-mono font-bold text-lg tracking-wider text-primary text-glow">
                NEUROSIGNATURE
              </h1>
              <p className="text-xs text-muted-foreground font-mono">
                Behavioral Biometric Authentication
              </p>
            </div>
          </div>
          
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
      </motion.header>
      
      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
            className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4"
          >
            <span className="text-xs font-mono text-primary">NEXT-GEN AUTHENTICATION</span>
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prove You're Human.
            <br />
            <span className="text-primary text-glow">No Face. No Fingerprint.</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            NeuroSignature analyzes your unique typing rhythm and mouse movement patterns—
            behavioral biometrics that AI cannot replicate.
          </p>
        </motion.div>
        
        <SecurityTerminal />
        <ProjectNarrative />
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border/50 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-xs font-mono text-muted-foreground">
            Built for the future of authentication. CNS-based identity verification.
          </p>
        </div>
      </footer>
    </div>
  );
}
import { motion } from 'framer-motion';
import { CheckCircle, Shield, Clock, Hash, Fingerprint, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransactionReceiptProps {
  sessionId: string;
  timestamp: string;
  confidence: number;
  amount: string;
  onClose: () => void;
}

export function TransactionReceipt({ 
  sessionId, 
  timestamp, 
  confidence, 
  amount,
  onClose 
}: TransactionReceiptProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      className="glassmorphism rounded-xl p-6 border-primary/50 border-2 max-w-md mx-auto"
    >
      {/* Success Header */}
      <div className="text-center mb-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-20 h-20 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center"
        >
          <CheckCircle className="w-12 h-12 text-primary" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold font-mono text-primary mb-1"
        >
          Transaction Successful
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-muted-foreground font-mono"
        >
          Neural signature verified
        </motion.p>
      </div>

      {/* Amount */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-center mb-6 p-4 rounded-lg bg-primary/10"
      >
        <p className="text-xs font-mono text-muted-foreground mb-1">Transfer Amount</p>
        <p className="text-3xl font-bold font-mono text-foreground">{amount}</p>
      </motion.div>

      {/* Neural Audit Receipt */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/50"
      >
        <div className="flex items-center gap-2 text-xs font-mono text-primary mb-3">
          <Shield className="w-4 h-4" />
          <span>NEURAL AUDIT RECEIPT</span>
        </div>

        <div className="grid gap-2 text-xs font-mono">
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Session ID
            </span>
            <span className="text-foreground">{sessionId}</span>
          </div>
          
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Timestamp
            </span>
            <span className="text-foreground">{timestamp}</span>
          </div>
          
          <div className="flex items-center justify-between py-1 border-b border-border/30">
            <span className="text-muted-foreground flex items-center gap-1">
              <Fingerprint className="w-3 h-3" />
              Confidence Score
            </span>
            <span className="text-primary font-bold">{confidence}%</span>
          </div>
          
          <div className="flex items-center justify-between py-1">
            <span className="text-muted-foreground">Verification</span>
            <span className="text-primary flex items-center gap-1">
              <CheckCircle className="w-3 h-3" />
              HUMAN VERIFIED
            </span>
          </div>
        </div>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-6 flex gap-3"
      >
        <Button 
          variant="outline" 
          className="flex-1 font-mono text-xs"
          onClick={() => {
            // Simulate download
            console.log('Downloading receipt...');
          }}
        >
          <Download className="w-3 h-3 mr-2" />
          Save Receipt
        </Button>
        <Button 
          className="flex-1 font-mono text-xs"
          onClick={onClose}
        >
          Done
        </Button>
      </motion.div>
    </motion.div>
  );
}

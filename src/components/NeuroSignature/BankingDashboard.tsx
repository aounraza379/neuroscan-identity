import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldCheck,
  AlertTriangle,
  Banknote,
  Building2,
  Sparkles,
  Send,
  Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SlideToConfirm } from './SlideToConfirm';
import { useToast } from '@/hooks/use-toast';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
  isNew?: boolean;
}

const initialTransactions: Transaction[] = [
  { id: '1', type: 'credit', description: 'Salary Deposit', amount: 5250.00, date: '2024-01-22' },
  { id: '2', type: 'debit', description: 'Rent Payment', amount: -1800.00, date: '2024-01-20' },
  { id: '3', type: 'credit', description: 'Freelance Project', amount: 1200.00, date: '2024-01-18' },
  { id: '4', type: 'debit', description: 'Electric Bill', amount: -145.50, date: '2024-01-15' },
  { id: '5', type: 'debit', description: 'Grocery Store', amount: -89.32, date: '2024-01-14' },
];

const recipientNames = [
  'Alex Johnson', 'Sarah Miller', 'Mike Chen', 'Emma Davis', 
  'James Wilson', 'Lisa Anderson', 'David Brown', 'Maria Garcia'
];

interface BankingDashboardProps {
  isVerified: boolean;
  confidence: number;
  onTransferAttempt: () => void;
  onBotDetected: () => void;
  isBreached: boolean;
  onTransactionComplete?: (amount: number) => void;
}

export function BankingDashboard({ 
  isVerified, 
  confidence, 
  onTransferAttempt,
  onBotDetected,
  isBreached,
  onTransactionComplete
}: BankingDashboardProps) {
  const { toast } = useToast();
  const [showTransferSuccess, setShowTransferSuccess] = useState(false);
  const [accountBalance, setAccountBalance] = useState(12415.18);
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const transferAmount = 500.00;
  
  // Sequential guard: require 85%+ confidence for banking access
  const isFullyAuthenticated = isVerified && confidence >= 85;
  const showSequentialLock = !isFullyAuthenticated && !isBreached;
  
  const handleLockedClick = () => {
    toast({
      variant: "destructive",
      title: "🔒 Security Protocol Required",
      description: "Complete Neural Scan to access banking features. Current confidence: " + Math.round(confidence) + "%",
    });
  };

  const handleTransferConfirmed = () => {
    // Update balance
    setAccountBalance(prev => prev - transferAmount);
    
    // Add new transaction to history
    const randomRecipient = recipientNames[Math.floor(Math.random() * recipientNames.length)];
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    
    const newTransaction: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'debit',
      description: `Transfer to ${randomRecipient}`,
      amount: -transferAmount,
      date: dateStr,
      isNew: true
    };
    
    setTransactions(prev => [newTransaction, ...prev.slice(0, 4)]);
    
    // Show success message
    setShowTransferSuccess(true);
    setTimeout(() => setShowTransferSuccess(false), 3000);
    
    // Notify parent
    onTransferAttempt();
    onTransactionComplete?.(transferAmount);
    
    // Remove "new" flag after animation
    setTimeout(() => {
      setTransactions(prev => prev.map(tx => ({ ...tx, isNew: false })));
    }, 2000);
  };

  // Blur effect when breached OR not authenticated
  const contentClass = isBreached || showSequentialLock ? 'blur-md pointer-events-none select-none' : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl mx-auto mt-8 relative"
      onClick={showSequentialLock ? handleLockedClick : undefined}
    >
      {/* Sequential Guard Lock Overlay */}
      <AnimatePresence>
        {showSequentialLock && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/60 backdrop-blur-sm rounded-lg cursor-pointer"
          >
            <div className="text-center p-6">
              <motion.div
                animate={{ scale: [1, 1.05, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Lock className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-mono font-bold text-foreground mb-2">
                NEURAL SCAN REQUIRED
              </h3>
              <p className="text-sm font-mono text-muted-foreground mb-2">
                Complete verification to access banking features.
              </p>
              <div className="text-xs font-mono text-primary">
                Current Confidence: {Math.round(confidence)}% • Required: 85%+
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Security Lockdown Overlay */}
      <AnimatePresence>
        {isBreached && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg"
          >
            <div className="text-center p-6">
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <AlertTriangle className="w-16 h-16 text-destructive mx-auto mb-4" />
              </motion.div>
              <h3 className="text-xl font-mono font-bold text-destructive mb-2">
                SECURITY LOCKDOWN
              </h3>
              <p className="text-sm font-mono text-muted-foreground">
                Bot activity detected. Banking functions disabled.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Card className={`glassmorphism border-border/50 ${contentClass}`}>
        <CardHeader className="border-b border-border/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="font-mono text-lg">SECURE BANKING PORTAL</CardTitle>
                <p className="text-xs text-muted-foreground font-mono">
                  Protected by NeuroSignature™
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <span className="font-mono text-sm text-muted-foreground">•••• 4829</span>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          {/* Account Balance */}
          <motion.div 
            className="p-6 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20"
            whileHover={{ scale: 1.01 }}
          >
            <p className="text-sm font-mono text-muted-foreground mb-1">Available Balance</p>
            <div className="flex items-baseline gap-1">
              <motion.span 
                key={accountBalance}
                initial={{ scale: 1.1, color: 'hsl(var(--primary))' }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold font-mono text-primary text-glow"
              >
                ${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </motion.span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
          </motion.div>

          {/* Transfer Amount Preview */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-primary" />
              <span className="text-sm font-mono text-muted-foreground">Transfer Amount</span>
            </div>
            <span className="text-lg font-bold font-mono text-primary">
              ${transferAmount.toFixed(2)}
            </span>
          </div>

          {/* Transfer Success Message */}
          <AnimatePresence>
            {showTransferSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 rounded-lg bg-primary/20 border border-primary/50 text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono text-primary">
                    Transfer Initiated Successfully! Neural signature verified.
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide to Confirm Transfer */}
          <SlideToConfirm
            onConfirm={handleTransferConfirmed}
            onBotDetected={onBotDetected}
            disabled={isBreached}
            isVerified={isVerified && confidence >= 85}
            confidence={confidence}
          />

          {/* Verification Status */}
          <div className="flex items-center justify-center gap-2 text-xs font-mono">
            {isVerified && confidence >= 85 ? (
              <span className="text-primary flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Neural signature verified ({Math.round(confidence)}% confidence)
              </span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Requires 85%+ confidence (Current: {Math.round(confidence)}%)
              </span>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-mono text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              RECENT TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={tx.isNew ? { opacity: 0, x: -20, backgroundColor: 'hsl(var(--primary) / 0.2)' } : { opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0, backgroundColor: 'transparent' }}
                  transition={{ delay: tx.isNew ? 0 : index * 0.1, duration: tx.isNew ? 0.5 : 0.3 }}
                  className={`flex items-center justify-between p-3 rounded-lg bg-card/50 border transition-colors ${
                    tx.isNew ? 'border-primary/50 bg-primary/10' : 'border-border/30 hover:border-border/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'credit' 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {tx.type === 'credit' 
                        ? <ArrowDownLeft className="w-4 h-4" /> 
                        : <ArrowUpRight className="w-4 h-4" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-medium flex items-center gap-2">
                        {tx.description}
                        {tx.isNew && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                            NEW
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">{tx.date}</p>
                    </div>
                  </div>
                  <span className={`font-mono font-medium ${
                    tx.type === 'credit' ? 'text-primary' : 'text-foreground'
                  }`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('en-US', { 
                      style: 'currency', 
                      currency: 'USD' 
                    })}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Lock, 
  Unlock,
  ShieldCheck,
  AlertTriangle,
  Banknote,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  description: string;
  amount: number;
  date: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', type: 'credit', description: 'Salary Deposit', amount: 5250.00, date: '2024-01-22' },
  { id: '2', type: 'debit', description: 'Rent Payment', amount: -1800.00, date: '2024-01-20' },
  { id: '3', type: 'credit', description: 'Freelance Project', amount: 1200.00, date: '2024-01-18' },
  { id: '4', type: 'debit', description: 'Electric Bill', amount: -145.50, date: '2024-01-15' },
  { id: '5', type: 'debit', description: 'Grocery Store', amount: -89.32, date: '2024-01-14' },
];

interface BankingDashboardProps {
  isVerified: boolean;
  confidence: number;
  onTransferAttempt: () => void;
  isBreached: boolean;
}

export function BankingDashboard({ 
  isVerified, 
  confidence, 
  onTransferAttempt,
  isBreached 
}: BankingDashboardProps) {
  const [showTransferBlocked, setShowTransferBlocked] = useState(false);
  
  const canTransfer = isVerified && confidence >= 85 && !isBreached;
  const accountBalance = 12415.18;

  const handleTransferClick = () => {
    if (!canTransfer) {
      setShowTransferBlocked(true);
      setTimeout(() => setShowTransferBlocked(false), 3000);
    } else {
      onTransferAttempt();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full max-w-4xl mx-auto mt-8"
    >
      <Card className="glassmorphism border-border/50">
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
              <span className="text-4xl font-bold font-mono text-primary text-glow">
                ${accountBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-sm text-muted-foreground">USD</span>
            </div>
          </motion.div>

          {/* Transfer Button Area */}
          <div className="relative">
            <AnimatePresence>
              {showTransferBlocked && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute -top-2 left-0 right-0 p-3 rounded-lg bg-destructive/20 border border-destructive/50 text-center"
                >
                  <div className="flex items-center justify-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    <span className="text-sm font-mono text-destructive">
                      Transaction Blocked: Identity Pattern Mismatch ({Math.round(confidence)}% &lt; 85%)
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              onClick={handleTransferClick}
              disabled={isBreached}
              className={`w-full h-14 font-mono text-lg transition-all duration-300 ${
                canTransfer 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground cyber-glow' 
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              {canTransfer ? (
                <>
                  <Unlock className="w-5 h-5 mr-2" />
                  TRANSFER FUNDS
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 mr-2" />
                  {isBreached 
                    ? 'ACCOUNT LOCKED - BREACH DETECTED' 
                    : 'COMPLETE NEURAL VERIFICATION TO UNLOCK'
                  }
                </>
              )}
            </Button>

            {!isBreached && (
              <div className="mt-2 flex items-center justify-center gap-2 text-xs font-mono text-muted-foreground">
                <ShieldCheck className="w-3 h-3" />
                <span>
                  {canTransfer 
                    ? `Neural signature verified (${Math.round(confidence)}% confidence)` 
                    : `Requires 85%+ confidence (Current: ${Math.round(confidence)}%)`
                  }
                </span>
              </div>
            )}
          </div>

          {/* Recent Transactions */}
          <div>
            <h3 className="font-mono text-sm text-muted-foreground mb-3 flex items-center gap-2">
              <Banknote className="w-4 h-4" />
              RECENT TRANSACTIONS
            </h3>
            <div className="space-y-2">
              {mockTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-3 rounded-lg bg-card/50 border border-border/30 hover:border-border/50 transition-colors"
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
                      <p className="text-sm font-medium">{tx.description}</p>
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

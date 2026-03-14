import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ShieldCheck, ShieldAlert, ArrowLeft, Copy, Check, CreditCard, Lock, Fingerprint, Activity, Eye, Keyboard, MousePointer } from 'lucide-react';
import { useNeuroGuard } from '@/hooks/useNeuroGuard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'react-router-dom';

const CODE_SNIPPET = `import { useNeuroGuard } from '@neurosignature/react';

function PaymentForm() {
  const { isHuman, confidence, formProps } = useNeuroGuard();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isHuman) return alert("Verification failed");
    // proceed with payment...
  };

  return (
    <form onSubmit={handleSubmit} {...formProps}>
      <input name="card" placeholder="Card number" />
      <input name="amount" placeholder="Amount" />
      <button disabled={!isHuman}>Pay Now</button>
    </form>
  );
}`;

export default function IntegrationDemo() {
  const { isHuman, confidence, verdict, pasteDetected, botDetected, botReason, environmentFlags, verificationToken, trajectory, signals, formProps, reset } = useNeuroGuard({ threshold: 70 });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHuman) {
      toast({
        title: "⛔ Neural Verification Failed",
        description: "Behavioral biometrics did not confirm a human operator. Keep interacting naturally.",
        variant: "destructive",
      });
      return;
    }
    setSubmitted(true);
    toast({
      title: "✅ Payment Authorized",
      description: `$${amount || '0'} sent securely with ${confidence}% neural confidence.`,
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_SNIPPET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ShieldIcon = botDetected ? ShieldAlert : isHuman ? ShieldCheck : Shield;
  const shieldColor = botDetected ? 'text-destructive' : isHuman ? 'text-primary' : 'text-muted-foreground';

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-primary" />
            <span className="font-mono text-sm text-primary font-bold">INTEGRATION DEMO</span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <div className="inline-block px-4 py-1 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-xs font-mono text-primary">DEVELOPER INTEGRATION</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            One Hook. <span className="text-primary text-glow">Zero UI Required.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Add invisible behavioral biometrics to any form with a single React hook. 
            No CAPTCHAs, no friction, no extra UI components.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Left: Code */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
            <div className="glassmorphism rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive" />
                  <div className="w-3 h-3 rounded-full bg-warning" />
                  <div className="w-3 h-3 rounded-full bg-primary" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">PaymentForm.tsx</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="font-mono text-xs h-7">
                  {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <pre className="p-4 text-sm font-mono text-foreground/90 overflow-x-auto leading-relaxed">
                <code>{CODE_SNIPPET}</code>
              </pre>
            </div>

            {/* Integration Steps */}
            <div className="mt-6 space-y-3">
              {[
                { step: '1', text: 'Import the hook', code: "import { useNeuroGuard } from '...'" },
                { step: '2', text: 'Spread formProps onto your form', code: '<form {...formProps}>' },
                { step: '3', text: 'Check isHuman before submit', code: 'if (!isHuman) return;' },
              ].map(({ step, text, code }) => (
                <div key={step} className="glassmorphism rounded-lg p-3 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-mono text-primary font-bold">{step}</span>
                  </div>
                  <div>
                    <p className="text-sm text-foreground">{text}</p>
                    <code className="text-xs text-primary/70 font-mono">{code}</code>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right: Live Demo Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <div className="glassmorphism rounded-xl overflow-hidden">
              {/* Live Status Bar */}
              <div className="px-4 py-3 border-b border-border/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldIcon className={`w-4 h-4 ${shieldColor}`} />
                  <span className="font-mono text-xs text-muted-foreground">LIVE DEMO</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${
                      botDetected ? 'bg-destructive animate-pulse' : isHuman ? 'bg-primary' : 'bg-muted-foreground animate-pulse'
                    }`} />
                    <span className={`font-mono text-xs ${
                      botDetected ? 'text-destructive' : isHuman ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {confidence}%
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { reset(); setSubmitted(false); }} className="font-mono text-xs h-7">
                    Reset
                  </Button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {!submitted ? (
                  <motion.form
                    key="form"
                    {...formProps}
                    onSubmit={handleSubmit}
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-6 space-y-5"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="recipient" className="font-mono text-xs text-muted-foreground">RECIPIENT</Label>
                      <Input
                        id="recipient"
                        placeholder="John Doe"
                        value={recipient}
                        onChange={e => setRecipient(e.target.value)}
                        className="font-mono bg-background/50 border-border/50"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="card" className="font-mono text-xs text-muted-foreground">CARD NUMBER</Label>
                      <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="card"
                          placeholder="4242 4242 4242 4242"
                          value={cardNumber}
                          onChange={e => setCardNumber(e.target.value)}
                          className="font-mono pl-10 bg-background/50 border-border/50"
                          maxLength={19}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount" className="font-mono text-xs text-muted-foreground">AMOUNT (USD)</Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder="500.00"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="font-mono bg-background/50 border-border/50"
                      />
                    </div>

                    {/* Verdict bar */}
                    <div className={`rounded-lg p-3 border ${
                      botDetected 
                        ? 'bg-destructive/10 border-destructive/30' 
                        : isHuman 
                          ? 'bg-primary/10 border-primary/30' 
                          : 'bg-muted/50 border-border/50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <ShieldIcon className={`w-4 h-4 ${shieldColor}`} />
                        <span className="font-mono text-xs text-foreground">{verdict}</span>
                      </div>
                      {/* Confidence bar */}
                      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            botDetected ? 'bg-destructive' : isHuman ? 'bg-primary' : 'bg-muted-foreground'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${confidence}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      {pasteDetected && (
                        <p className="text-xs font-mono text-warning mt-2">⚠ Paste event detected — flagged for review</p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full font-mono"
                      disabled={!isHuman}
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      {isHuman ? `Pay $${amount || '0'} — Verified` : 'Analyzing Biometrics...'}
                    </Button>
                  </motion.form>
                ) : (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 text-center space-y-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto cyber-glow"
                    >
                      <ShieldCheck className="w-8 h-8 text-primary" />
                    </motion.div>
                    <h3 className="font-mono text-lg font-bold text-primary">PAYMENT AUTHORIZED</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      ${amount || '0'} sent to {recipient || 'recipient'}<br />
                      Neural confidence: {confidence}%
                    </p>
                    <Button variant="outline" onClick={() => { reset(); setSubmitted(false); setCardNumber(''); setAmount(''); setRecipient(''); }} className="font-mono text-xs">
                      New Transaction
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* API Reference mini */}
            <div className="mt-6 glassmorphism rounded-xl p-4">
              <h4 className="font-mono text-xs text-primary mb-3 font-bold">HOOK API</h4>
              <div className="space-y-1.5 font-mono text-xs">
                {[
                  ['isHuman', 'boolean', 'Whether confidence exceeds threshold'],
                  ['confidence', 'number', 'Score 0-100 based on behavior'],
                  ['verdict', 'string', 'Human-readable status message'],
                  ['formProps', 'object', 'Spread onto your <form> element'],
                  ['botDetected', 'boolean', 'True if bot patterns found'],
                  ['pasteDetected', 'boolean', 'True if paste event occurred'],
                  ['reset()', 'function', 'Clear all tracking data'],
                ].map(([name, type, desc]) => (
                  <div key={name} className="flex items-start gap-2">
                    <span className="text-primary shrink-0 w-28">{name}</span>
                    <span className="text-muted-foreground shrink-0 w-16">{type}</span>
                    <span className="text-foreground/70">{desc}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

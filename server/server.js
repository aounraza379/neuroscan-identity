/**
 * NeuroSignature Backend Server
 * 
 * Endpoints:
 *   POST /api/session/init    → Creates session, returns sessionId + clientKey
 *   POST /api/session/verify  → Validates proof token, checks expiry + nonce reuse
 *   GET  /api/session/:id     → Returns session status (for polling)
 * 
 * Security:
 *   - Server-side HMAC secrets (never sent to client raw)
 *   - Nonce tracking prevents replay attacks
 *   - Rate limiting: 5 verify attempts per IP per minute
 *   - Session TTL: 10 minutes (configurable)
 *   - Helmet for HTTP security headers
 * 
 * Self-host: copy this folder, run `npm install && npm start`
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

const app = express();

// ─── Config ────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
const MASTER_SECRET = process.env.MASTER_SECRET || crypto.randomBytes(32).toString('hex');
const SESSION_TTL = parseInt(process.env.SESSION_TTL_MS || '600000');       // 10 min
const TOKEN_EXPIRY = parseInt(process.env.TOKEN_EXPIRY_MS || '30000');      // 30 sec
const MAX_ATTEMPTS = parseInt(process.env.MAX_VERIFY_ATTEMPTS || '5');
const RATE_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000');  // 1 min

// ─── In-Memory Session Store ───────────────────────────────────────
// Replace with Redis in production: same interface, add TTL via EXPIRE
const sessions = new Map();

function createSession() {
  const sessionId = uuidv4();
  const sessionSecret = crypto.randomBytes(32).toString('hex');
  
  // Derive the client-facing key from master + session secret
  // Client uses this to sign tokens; server can recreate it to verify
  const clientKey = crypto
    .createHmac('sha256', MASTER_SECRET)
    .update(sessionSecret)
    .digest('hex');

  const session = {
    id: sessionId,
    secret: sessionSecret,
    clientKey,
    createdAt: Date.now(),
    expiresAt: Date.now() + SESSION_TTL,
    verified: false,
    verifyAttempts: 0,
    usedNonces: new Set(),
    lastVerification: null,
    confidence: 0,
  };

  sessions.set(sessionId, session);
  return session;
}

function getSession(sessionId) {
  const session = sessions.get(sessionId);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    sessions.delete(sessionId);
    return null;
  }
  return session;
}

// Cleanup expired sessions every 60s
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of sessions) {
    if (now > session.expiresAt) sessions.delete(id);
  }
}, 60000);

// ─── Middleware ─────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || '*', credentials: true }));
app.use(express.json({ limit: '16kb' }));

// Rate limiter for verification endpoint
const verifyLimiter = rateLimit({
  windowMs: RATE_WINDOW,
  max: MAX_ATTEMPTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'RATE_LIMITED',
    message: `Too many verification attempts. Max ${MAX_ATTEMPTS} per ${RATE_WINDOW / 1000}s.`,
    retryAfterMs: RATE_WINDOW,
  },
  keyGenerator: (req) => req.ip,
});

// ─── Routes ────────────────────────────────────────────────────────

/**
 * POST /api/session/init
 * 
 * Creates a new biometric session. Returns:
 *   - sessionId: unique session identifier
 *   - clientKey: HMAC key the client uses to sign proof tokens
 *   - expiresAt: when the session expires (Unix ms)
 * 
 * The client uses clientKey to HMAC-sign its behavioral payload.
 * The server can independently derive the same key to verify signatures.
 */
app.post('/api/session/init', (req, res) => {
  const session = createSession();

  console.log(`[SESSION] Created ${session.id} | TTL: ${SESSION_TTL / 1000}s`);

  res.json({
    sessionId: session.id,
    clientKey: session.clientKey,
    expiresAt: session.expiresAt,
  });
});

/**
 * POST /api/session/verify
 * 
 * Validates a proof token from the client.
 * 
 * Body:
 *   - sessionId: string
 *   - token: base64-encoded proof token from useNeuroGuard
 * 
 * Checks:
 *   1. Session exists and hasn't expired
 *   2. Max verification attempts not exceeded
 *   3. Token structure is valid
 *   4. Token timestamp within TOKEN_EXPIRY window
 *   5. Nonce hasn't been used before (replay protection)
 *   6. HMAC signature matches server-derived key
 *   7. Confidence meets minimum threshold
 * 
 * Returns:
 *   - verified: boolean
 *   - confidence: number
 *   - sessionId: string
 *   - error: string (if failed)
 */
app.post('/api/session/verify', verifyLimiter, (req, res) => {
  const { sessionId, token } = req.body;

  if (!sessionId || !token) {
    return res.status(400).json({ verified: false, error: 'MISSING_FIELDS' });
  }

  const session = getSession(sessionId);
  if (!session) {
    return res.status(404).json({ verified: false, error: 'SESSION_EXPIRED' });
  }

  // Check attempt count
  session.verifyAttempts++;
  if (session.verifyAttempts > MAX_ATTEMPTS) {
    sessions.delete(sessionId);
    return res.status(429).json({ verified: false, error: 'MAX_ATTEMPTS_EXCEEDED' });
  }

  try {
    // Decode token
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
    const { p: payload, s: signature } = decoded;

    if (!payload || !signature) {
      return res.status(400).json({ verified: false, error: 'INVALID_TOKEN_STRUCTURE' });
    }

    // Check timestamp freshness
    const tokenAge = Date.now() - payload.t;
    if (tokenAge > TOKEN_EXPIRY) {
      return res.status(400).json({ 
        verified: false, 
        error: 'TOKEN_EXPIRED',
        age: tokenAge,
        maxAge: TOKEN_EXPIRY,
      });
    }

    // Check nonce reuse
    if (session.usedNonces.has(payload.n)) {
      return res.status(400).json({ verified: false, error: 'NONCE_REUSED' });
    }
    session.usedNonces.add(payload.n);

    // Verify HMAC signature using the server-derived client key
    const payloadStr = JSON.stringify(payload);
    const expectedSig = crypto
      .createHmac('sha256', session.clientKey)
      .update(payloadStr)
      .digest('hex');

    if (expectedSig !== signature) {
      console.log(`[VERIFY] Signature mismatch for session ${sessionId}`);
      return res.status(403).json({ verified: false, error: 'SIGNATURE_INVALID' });
    }

    // Check confidence threshold
    const MIN_CONFIDENCE = 75;
    if (payload.c < MIN_CONFIDENCE) {
      return res.status(400).json({
        verified: false,
        error: 'CONFIDENCE_TOO_LOW',
        confidence: payload.c,
        required: MIN_CONFIDENCE,
      });
    }

    // ✅ All checks passed
    session.verified = true;
    session.confidence = payload.c;
    session.lastVerification = Date.now();

    console.log(`[VERIFY] ✅ Session ${sessionId} verified | Confidence: ${payload.c}%`);

    res.json({
      verified: true,
      confidence: payload.c,
      sessionId,
      signals: payload.s,
    });

  } catch (err) {
    console.error(`[VERIFY] Parse error:`, err.message);
    return res.status(400).json({ verified: false, error: 'TOKEN_PARSE_ERROR' });
  }
});

/**
 * GET /api/session/:id
 * 
 * Returns current session status (for backend polling before processing forms).
 */
app.get('/api/session/:id', (req, res) => {
  const session = getSession(req.params.id);
  if (!session) {
    return res.status(404).json({ error: 'SESSION_NOT_FOUND' });
  }

  res.json({
    sessionId: session.id,
    verified: session.verified,
    confidence: session.confidence,
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - session.verifyAttempts),
    expiresAt: session.expiresAt,
    ttlMs: session.expiresAt - Date.now(),
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    activeSessions: sessions.size,
    uptime: process.uptime(),
  });
});

// ─── Start ─────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║         NEUROSIGNATURE BACKEND v1.0.0            ║
║                                                  ║
║  Endpoints:                                      ║
║    POST /api/session/init    → Create session     ║
║    POST /api/session/verify  → Validate token     ║
║    GET  /api/session/:id     → Session status     ║
║    GET  /api/health          → Health check       ║
║                                                  ║
║  Rate limit: ${String(MAX_ATTEMPTS).padEnd(2)} attempts / ${String(RATE_WINDOW / 1000).padEnd(3)}s per IP        ║
║  Session TTL: ${String(SESSION_TTL / 1000).padEnd(4)}s                            ║
║  Port: ${String(PORT).padEnd(5)}                                    ║
╚══════════════════════════════════════════════════╝
  `);
});

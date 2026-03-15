# NeuroSignature Backend

Self-hostable Node.js/Express server for verifying NeuroGuard biometric tokens.

## Quick Start

```bash
cd server
cp .env.example .env
# Edit .env — set MASTER_SECRET to a strong random string:
# openssl rand -hex 32

npm install
npm start
```

## Client Integration

```tsx
const { isHuman, verificationToken, verifyOnServer } = useNeuroGuard({
  backendUrl: 'http://localhost:3001',  // your deployed server URL
  threshold: 75,
});

// When user submits the form:
const result = await verifyOnServer();
if (result.verified) {
  // proceed with payment
}
```

## API

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/session/init` | POST | Creates session, returns `sessionId` + `clientKey` |
| `/api/session/verify` | POST | Validates proof token (body: `{ sessionId, token }`) |
| `/api/session/:id` | GET | Returns session status |
| `/api/health` | GET | Health check |

## Security

- HMAC secrets are server-generated, never hardcoded client-side
- Nonce tracking prevents replay attacks
- Rate limiting: 5 attempts/IP/minute via `express-rate-limit`
- Session TTL: 10 minutes (configurable)
- Token expiry: 30 seconds

## Production Notes

Replace the in-memory store with Redis:
```js
// Use ioredis or redis package
// Store sessions with TTL via SET + EXPIRE
// Store nonces in a Set or sorted set with TTL
```

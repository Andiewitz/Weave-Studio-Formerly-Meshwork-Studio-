# BYOK AI API Service

## What is this?

You want to let users plug in their own OpenAI/Anthropic/whatever API keys — but you *also* don't want those keys floating around in the browser where anyone can snatch them. This service solves that. Keys go in, get encrypted, live in the database, and when a user makes an AI request your server grabs the key, decrypts it in memory, fires off the request, and forgets the key ever existed. The user never sees their own key again (just the last 4 chars so they know which one's which).

---

## Setup

**Step 1: Generate your encryption key and stick it in `.env`**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

```env
ENCRYPTION_KEY=the-thing-you-just-generated

# These are optional fallbacks if a user has no key stored
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-...
```

**Step 2: Run the migration** (adds the `userApiKeys` table)

```bash
npm run db:generate
npm run db:migrate
```

---

## API Endpoints

### Managing Keys

```http
# Save a key
POST /api/ai/keys
{ "provider": "openai", "apiKey": "sk-..." }

# See what keys are stored (just hints, not actual keys)
GET /api/ai/keys

# Delete one
DELETE /api/ai/keys/:id

# Test a key without saving it
POST /api/ai/keys/test
{ "provider": "openai", "apiKey": "sk-..." }
```

The list endpoint returns something like:
```json
[{ "id": "uuid", "provider": "openai", "keyHint": "...wxyz", "isActive": true }]
```

### Making AI Requests

```http
POST /api/ai/chat
{
  "provider": "openai",
  "model": "gpt-4",
  "messages": [{ "role": "user", "content": "yo" }],
  "temperature": 0.7,
  "maxTokens": 1000
}

# See available models
GET /api/ai/models?provider=openai
```

---

## Supported Providers

| Provider | Key |
|----------|-----|
| OpenAI | `openai` |
| Anthropic | `anthropic` |
| Google | `google` |

---

## Frontend Usage

```typescript
import { aiService } from '@/services/ai';

await aiService.saveApiKey('openai', 'sk-...');
const keys = await aiService.getApiKeys(); // hints only
const response = await aiService.chat({
  provider: 'openai',
  model: 'gpt-4',
  messages: [{ role: 'user', content: 'hello' }]
});
```

Or with the hook:

```typescript
import { useAI } from '@/hooks/useAI';

const { sendMessage, isLoading, error } = useAI('openai');
const response = await sendMessage('gpt-4', [{ role: 'user', content: 'hello' }]);
```

---

## How the Encryption Works

1. User submits key over HTTPS
2. Server generates a random 16-byte IV
3. Key gets encrypted with AES-256-GCM using your master key + the IV
4. Encrypted blob + IV + auth tag → database
5. Original key is gone from memory

And when a request comes in:

1. Server fetches encrypted key from DB
2. Decrypts it in memory
3. Makes the request to the AI provider
4. Streams response back
5. Clears the decrypted key

---

## Rate Limits

Default per user, per provider:
- 100 requests/min
- 10,000 tokens/min

Both are configurable.

---

## Errors

| Error | What happened | Fix |
|-------|--------------|-----|
| `ENCRYPTION_KEY_MISSING` | Forgot to set the env var | Add it |
| `INVALID_API_KEY` | The key got rejected by the provider | Double check it |
| `RATE_LIMIT_EXCEEDED` | Too many requests | Chill for a sec |
| `PROVIDER_ERROR` | Provider-side issue | Check their status page |
| `NO_ACTIVE_KEY` | No stored key for that provider | Add one |

---

## Testing

```bash
npm test -- server/modules/ai
npm test -- encryption.test.ts
npm test -- proxy.test.ts
```

---

## Coming Eventually

- Azure OpenAI support
- Local LLMs (Ollama, LM Studio)
- Usage analytics
- Per-user budget limits
- Automatic key rotation
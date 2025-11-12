# Project README — Pluvino (Comprehensive setup & webhook / Paystack guide)

> Complete, step-by-step README for teammates: from prereqs and repo structure to running the app locally, exposing a `server.js` via **ngrok**, and receiving/validating Paystack webhooks. Includes troubleshooting, example `.env`, commands and recommended safety practices.

---

## Table of contents

1. Project overview
2. Repo layout (recommended)
3. Prerequisites (local machine)
4. Environment variables (`.env` / `.env.example`)
5. Install & run (frontend + server)
6. `server.js` — example Express server (webhook handling + payment init)
7. Expose server with **ngrok** and configure Paystack webhook
8. How to test webhooks & trigger test payments (without a business account)
9. Troubleshooting & common issues
10. Contribution & coding standards
11. Useful commands & references

---

# 1. Project overview

**Pluvino** is a TypeScript React/Next-style app (stored under `app/`) with an optional Node/Express `server.js` to handle backend tasks (webhook endpoints, payments, etc.). This README focuses on onboarding a teammate, running locally, and wiring Paystack webhooks through **ngrok** to your local server for development and testing.

---

# 2. Repo layout (recommended)

```
Pluvino/
│
├── app/                       # Next.js App Router (frontend - typescript)
│   ├── layout.tsx
│   ├── globals.css
│   └── ...
│
├── public/                    # static assets (images/fonts/favicon)
│
├── server/                    # backend code (optional)
│   └── server.js
│
├── .env.example
├── .gitignore
├── LICENSE
├── README.md
├── next-env.d.ts
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
└── vercel.json (optional)
```

> Note: If your `server.js` is at project root, move it under `server/` or update scripts accordingly.

---

# 3. Prerequisites

Install these on your development machine:

* Node.js (LTS recommended, v18+ recommended). Verify:
  `node -v` and `npm -v`
* Git
* (Optional) pnpm or yarn if you prefer, but commands here use npm
* ngrok — for exposing local server: [https://ngrok.com](https://ngrok.com)
* (Optional) Postman/curl for manual API calls
* A Paystack test account (you can sign up for a test account at Paystack and get test keys). **You do not need a "business" production account to use test secret keys.**

---

# 4. Environment variables

**Never commit real secrets.** Use `.env` locally (ignored in `.gitignore`) and commit only `.env.example`.

Example `.env.example`:

```env
# Server
PORT=3001
NODE_ENV=development

# Paystack (test)
PAYSTACK_TEST_SECRET_KEY=sk_test_xxx
PAYSTACK_TEST_PUBLIC_KEY=pk_test_xxx

# Signature secret (if using HMAC verification — often same as secret key)
PAYSTACK_WEBHOOK_SECRET=sk_test_xxx

# Optional: App host for building absolute callback URLs
APP_URL=http://localhost:3000
```

When you clone the repo, copy `.env.example` to `.env` and populate secrets:

```bash
cp .env.example .env
# then edit .env
```

**.gitignore** should include:

```
node_modules/
.next/
dist/
.env
.env.local
*.log
.DS_Store
```

---

# 5. Install & run (frontend + server)

From repo root:

1. Install dependencies:

```bash
npm install
```

2. Available scripts (example `package.json` scripts you may want):

```json
"scripts": {
  "dev": "next dev -p 3000",
  "build": "next build",
  "start": "next start -p 3000",
  "server": "node server/server.js",
  "dev:all": "concurrently \"npm run dev\" \"npm run server\""
}
```

(You can add `concurrently` as dev dependency if you want to run frontend + server in one terminal.)

3. Run frontend:

```bash
npm run dev
# frontend runs at http://localhost:3000 (example)
```

4. Run backend server (webhook receiver / payment endpoints):

```bash
npm run server
# server runs at http://localhost:3001 (example)
```

If you need both running in one terminal, use `concurrently` or run them in separate terminals.

---

# 6. Example `server.js` (Express) — webhook handling + simple payment init

Place this under `server/server.js`. It contains:

* Endpoint to create a Paystack transaction (server-side)
* `/webhook` endpoint that validates Paystack signature (HMAC) and logs payload

> **Important**: Paystack requires reading raw request body to verify signature. Use `raw` body parser for `/webhook`.

```js
// server/server.js
const express = require('express');
const fetch = require('node-fetch'); // or built-in fetch (Node 18+)
const bodyParser = require('body-parser');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3001;

// Use JSON for normal routes (like initiating payments)
app.use(express.json());

// For webhook route, we must get the raw body to verify signature.
// We'll use bodyParser.raw for that route only.
app.post('/webhook', bodyParser.raw({ type: '*/*' }), (req, res) => {
  const PAYSTACK_SECRET = process.env.PAYSTACK_WEBHOOK_SECRET || process.env.PAYSTACK_TEST_SECRET_KEY;
  const signature = req.headers['x-paystack-signature'];

  // req.body is Buffer because of bodyParser.raw
  const body = req.body ? req.body.toString() : '';
  const hmac = crypto.createHmac('sha512', PAYSTACK_SECRET).update(body).digest('hex');

  if (signature !== hmac) {
    console.warn('Invalid signature on webhook');
    return res.status(401).send('invalid signature');
  }

  // Parse JSON now safely
  let payload;
  try {
    payload = JSON.parse(body);
  } catch (err) {
    console.error('Webhook JSON parse error', err);
    return res.status(400).send('bad payload');
  }

  console.log('Valid Paystack webhook received:', payload.event);
  // TODO: handle event types here (charge.success, transfer.success etc.)
  // Save to DB, update order status, etc.

  res.json({ status: 'ok' });
});

// Example: create a transaction (server-side)
app.post('/create-transaction', async (req, res) => {
  const email = req.body.email;
  const amount = req.body.amount; // in Naira/Kobo? Paystack expects amount in lowest currency unit

  const secret = process.env.PAYSTACK_TEST_SECRET_KEY;
  const response = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      amount // e.g. 100000 for NGN 1,000.00 if Paystack expects Kobo
    })
  });
  const data = await response.json();
  return res.json(data);
});

app.get('/health', (req, res) => res.send('OK'));

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
```

**Notes:**

* Use `PAYSTACK_WEBHOOK_SECRET` or the same test secret to verify HMAC.
* Paystack signature header name is `x-paystack-signature`.
* For Node 18+ `fetch` is built-in; for older Node use `node-fetch`.

---

# 7. Expose local server with **ngrok** and configure Paystack webhook

1. Install ngrok and login (one-time):

```bash
# download from https://ngrok.com and then
ngrok authtoken YOUR_NGROK_AUTH_TOKEN
```

2. Expose your server port (example port 3001):

```bash
ngrok http 3001
```

ngrok prints a **public URL** like `https://abcd-1234.ngrok.io` and forwards to `http://localhost:3001`.

3. Register webhook in Paystack dashboard:

* Go to Paystack Dashboard → Settings → Webhooks (or Developers → Webhooks)
* Add webhook URL: `https://abcd-1234.ngrok.io/webhook`
* Use the same secret you put in `.env` (`PAYSTACK_WEBHOOK_SECRET`)

4. Verify:

* ngrok shows incoming requests in its web interface at `http://127.0.0.1:4040` — use that to inspect requests.
* Your `server.js` console will log webhook events when they arrive.

---

# 8. Testing webhooks & triggering test payments (without a business account)

You mentioned earlier you don't have a business registered — for development you can still use Paystack **test** secret keys. Paystack allows using their test API and test cards.

### Option A — Create a transaction via server endpoint (recommended for dev)

Use the `create-transaction` endpoint from the `server.js` above.

Example using `curl`:

```bash
curl -X POST http://localhost:3001/create-transaction \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","amount":20000}'
```

This returns an `authorization_url` that you can open in the browser to simulate payment (test cards allowed).

### Option B — Use Paystack test cards

Open the `authorization_url`, and use Paystack test card details (from Paystack docs). If you don’t want to use the browser flow, you can simulate successful webhook payloads manually.

### Option C — Manually POST a webhook payload to your ngrok URL (simulate event)

If you cannot trigger through the dashboard, you can craft a true-looking webhook and POST it to ngrok:

```bash
# Example: simulate Paystack webhook payload
curl -X POST https://abcd-1234.ngrok.io/webhook \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: <correct-hmac>" \
  -d '{"event":"charge.success","data":{ "reference":"test_ref", "amount":20000 }}'
```

To compute the `<correct-hmac>` locally for test:

```js
// Node snippet to compute HMAC (use in REPL)
const crypto = require('crypto');
const payload = '{"event":"charge.success","data":{"reference":"test_ref","amount":20000}}';
const secret = 'sk_test_xxx';
const hmac = crypto.createHmac('sha512', secret).update(payload).digest('hex');
console.log(hmac);
```

**Important:** If you skip signature validation in dev, be aware this is insecure. Only skip for local simulations where you control the payload.

---

# 9. Troubleshooting & common issues

### `error: cannot lock ref ... main.lock` on git pull

We addressed this earlier — delete the lock file:

1. Close all git editors/terminals.
2. Delete the file:

```
C:\Users\Zoe Oladokun\.git\refs\remotes\origin\main.lock
```

3. Retry `git fetch --all` and `git pull`.

### Two branches `Main` vs `main` on Windows

Windows is case-insensitive — avoid branches that differ only by case. To remove the undesired one:

```bash
# list remote branches
git branch -r

# delete remote branch named Main (example)
git push origin --delete Main
```

### ngrok shows `502` or no webhook received

* Ensure server is running and reachable locally at the exposed port.
* Use `http://127.0.0.1:4040` to inspect request logs.
* Ensure your server response to `/webhook` returns 200 quickly (Paystack may retry if not 200).

### Signature verification failing

* Verify you are using the raw body to compute HMAC (not `req.body` parsed as object).
* Ensure same secret is used that Paystack has in dashboard.
* Ensure no whitespace or newline differences in payload string when computing HMAC.

### Paystack test payments not triggering

* Make sure you used **test** secret key for initializing transaction.
* Open `authorization_url` returned by Paystack to complete transaction with a test card.
* Check Paystack dashboard (test mode) and ngrok logs.

---

# 10. Contribution & coding standards

* Branching: use `main` as canonical branch.
* Commit messages: use conventional style (`feat:`, `fix:`, `docs:`, etc.).
* Linting & format: add/prefer `eslint` & `prettier`. Consider pre-commit hooks:

```json
"husky": {
  "hooks": {
    "pre-commit": "npm run lint && npm run test"
  }
}
```

* Add unit tests for webhook handlers where practical.

---

# 11. Useful commands & references

Start frontend:

```bash
npm run dev
```

Start server:

```bash
npm run server
```

Run both (example with concurrently):

```bash
npm install -D concurrently
npm run dev:all
```

ngrok:

```bash
ngrok http 3001
# visit http://127.0.0.1:4040 to inspect requests
```

Compute HMAC (Node REPL):

```js
const crypto = require('crypto');
const hmac = crypto.createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET).update(JSON.stringify(payload)).digest('hex');
```

# Stripe API Keys - Secure Storage

⚠️ **NEVER commit this file to Git!** Add to .gitignore immediately.

---

## 🔴 IMPORTANT: Live vs Test Keys

**You currently have a LIVE key!** This will charge real credit cards.

For development, you should use **TEST** keys from: https://dashboard.stripe.com/test/apikeys

---

## Your Keys

### Test Key (Development - Use This Locally)
```
sk_test_51PmO8ABZ8xGs87qdA7eWkg7inxr80qi6PVGW69MUcDJBPWSOkt6UGhNsSXop3VGfsjqd7NFcA9wEsLwp6R9qzE8R00WMM06Wy2
```

**Use for:** Local development, testing, staging
**Charges:** No real charges - test mode only

### Live Key (Production Only)
```
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
```

**Use for:** Production deployment only
**Charges:** REAL charges - live mode

**Note:** Retrieved on 2025-01-29

---

## Where to Use This

### For Development (LOCAL):
**DO NOT use the live key above!**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Toggle to **"Test mode"** (top right)
3. Copy the **Test** secret key (starts with `sk_test_`)
4. Add to `backend/.env`:
   ```bash
   STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE
   ```

### For Production (DEPLOYMENT):
1. Add the LIVE key to your production environment variables
2. **NEVER** put it in code or commit it to Git
3. Use Vercel/Railway/Render environment variables

---

## Test vs Live Mode

| Mode | Key Prefix | Cards | Charges |
|------|-----------|-------|---------|
| **Test** | `sk_test_` | Test cards only | No real charges |
| **Live** | `sk_live_` | Real cards | **REAL CHARGES** |

### Test Cards (Test Mode Only):
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

---

## Security Checklist

- [ ] This file is in `.gitignore`
- [ ] Live key only used in production environment
- [ ] Test key used for all local development
- [ ] Keys stored in password manager
- [ ] Team members have their own keys (don't share)

---

## How to Add to Backend

**For local development:**
```bash
# Create backend/.env (if it doesn't exist)
cd backend
cp .env.example .env

# Edit .env and add:
STRIPE_SECRET_KEY=sk_test_YOUR_TEST_KEY_HERE  # Use TEST key!
FRONTEND_URL=http://localhost:3000
```

**For production (Vercel):**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add: `STRIPE_SECRET_KEY` = `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`
3. Select "Production" environment only

---

## Rotating Keys

If this key is ever compromised:
1. Go to https://dashboard.stripe.com/apikeys
2. Click "Delete" on the compromised key
3. Create a new secret key
4. Update all production environment variables
5. Update this document

---

**Last Updated:** 2025-01-29

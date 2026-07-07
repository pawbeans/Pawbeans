# PAWBEANS BLUEPRINT BACKLOG (in order)

Status legend: [ ] pending · [x] blueprint written in ./blueprints/ · [~] blocked/incomplete spec

1. [x] **Order PII fix** — The Order entity is client-readable; Account.jsx and ProductReviews.jsx leak customer PII. Produce a Base44 fix prompt that adds a getMyOrders server function (no params, derives identity from auth token), a verifyPurchase server function for reviews, locks Order entity permissions to server-functions-only, and removes the legacy client-side Order.get path in OrderConfirmation. Do NOT touch admin auth (already fixed).
   → blueprints/order-pii-fix.md

2. [ ] **Paw Stamps** — Base44 prompt. 1 stamp per freeze-dried treat pouch purchased (supplements earn nothing). Ledger balance via a StampTransaction entity, never a stored balance. 5 stamps redeems a free Turkey pouch; 8 stamps redeems a free pouch of any flavour. Redemption is item-based at checkout (a $0 line), never a discount code. Earn in confirmStripeOrder, deduct only on payment confirmation, idempotent. Stackable with one promo code and wallet credit. Paw Stamps tab on /account plus PDP and OrderConfirmation cross-sells.

3. [~] **Beans Wallet, 5% cashback** — Base44 prompt. WalletTransaction …
   ⚠ SPEC TRUNCATED: the original paste cut off mid-sentence here. Owner must re-paste the full item 3 spec before its blueprint can be written.

4. [~] **UNKNOWN** — items 4+ never arrived in the paste. The mining prompt references at least 8 items (items 1–5 are beans.sg builds; item 7 needs a CSV supplied at build time; item 8 needs an llms.txt supplied at build time). Owner must re-paste items 3–8 in full.

## Known build-time inputs owed by owner (per mining prompt)
- Item 7: a CSV (blueprint must say: stop and ask for it at build time)
- Item 8: an llms.txt (blueprint must say: stop and ask for it at build time)

## Grounding note (2026-07-07)
The pawbeans/Pawbeans GitHub repo was EMPTY (zero commits on any branch) when blueprint writing started. The real app lives in Base44 (beans.sg). Blueprints written before a code export lands here are grounded in the owner's spec + standard Base44 platform conventions, with ASSUMPTION markers on anything unverifiable. If the Base44 code export gets pushed to this repo later, re-verify open blueprints against it.

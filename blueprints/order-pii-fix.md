# BLUEPRINT 1: Order PII fix (Base44 fix prompt)

BUILDER: Claude Sonnet, working alone, cold start, cannot ask questions. (Sonnet because this is security work — PII exposure, auth-derived identity, entity permissions — where a wrong shortcut leaks customer data.)

## GOAL

A single paste-ready Base44 fix prompt exists that, when run in the Pawbeans (beans.sg) Base44 workspace, stops any client from reading other customers' Order records: order reads go through two new server functions (`getMyOrders`, `verifyPurchase`), the Order entity is locked to server-functions-only, and the legacy client-side `Order.get` path in OrderConfirmation is removed — with the Account page, product reviews, and order confirmation still working for the logged-in customer.

## CONTEXT THE BUILDER NEEDS (it has no memory of the planning chat)

- **What you are producing:** ONE prompt (plain text) to be pasted into the Base44 AI app builder for the Pawbeans app. You are not editing code in this repo. Save your output to `./prompts/order-pii-fix-base44.txt` and also print it in full.
- **The app:** Pawbeans (beans.sg), a Base44-built e-commerce store selling freeze-dried dog treats and supplements, with Stripe checkout. Existing server functions: `createStripeCheckout` (creates the Stripe Checkout session) and `confirmStripeOrder` (confirms payment after redirect and finalizes the order). Existing pages/components relevant here: the Account page (`Account.jsx`, shows the customer's past orders), `ProductReviews.jsx` (shows/collects product reviews and needs to know if the reviewer actually bought the product), and the OrderConfirmation page (post-checkout landing page).
- **The bug:** The Order entity currently has client-readable permissions. `Account.jsx` and `ProductReviews.jsx` query Order from the browser via the Base44 client SDK, which means any logged-in user can read ALL customers' orders — names, emails, addresses, items. OrderConfirmation also has a legacy client-side `Order.get(orderId)` path.
- **ASSUMPTION (repo was empty at planning time, so exact code was unverifiable):** exact filenames follow Base44 defaults (`pages/Account.jsx` or `Account` page, `components/ProductReviews.jsx`, `pages/OrderConfirmation.jsx`, server functions under `functions/`). The Order entity's exact field list is unknown; assume at minimum it has `created_by` (the buyer's email, set automatically by Base44), an items list with product identifiers, an order status, and a Stripe session/payment reference. Your Base44 prompt must therefore instruct Base44 to work with the entity AS IT EXISTS — no renaming, no new fields, no schema changes.
- **Base44 conventions to use in the prompt:** server functions run with service-role entity access and can read the authenticated caller's identity from the request's auth token (`base44.auth.me()`); clients call them via the functions SDK (`import { functionName } from "@/api/functions"`). Entity permissions are set per-entity in the entity's security rules.
- **Gotchas:**
  - Admin auth was ALREADY fixed in a previous change. The admin order dashboard reads orders through its own already-secured server-function path. Your prompt must explicitly tell Base44 not to modify any admin page, admin function, or admin auth logic.
  - Locking the Order entity will break ANY remaining client-side Order query. That is why every client-side Order read (Account, ProductReviews, OrderConfirmation) must be rewired in the SAME prompt, and why the prompt must end with an instruction to search the whole app for any other client-side Order SDK usage and route it through `getMyOrders` or flag it.
  - `confirmStripeOrder` runs server-side and must keep full Order access — the entity lock must not break it or `createStripeCheckout`.

## CONSTRAINTS (the limits)

- Must stay inside: the four changes named in GOAL, expressed as one Base44 prompt. Output file: `./prompts/order-pii-fix-base44.txt` only.
- Must not change: admin pages, admin functions, admin auth; the Order entity schema (fields, names, types); the checkout flow behavior of `createStripeCheckout` / `confirmStripeOrder` (other than them continuing to work under locked permissions); any copy, styling, or unrelated pages.
- Stack / tools to respect: Base44 platform only (its entities, server functions, client SDK). No external backend, no new libraries, no discount-code or webhook machinery.
- Non-negotiables: identity comes ONLY from the server-side auth token — the prompt must forbid any function parameter like `email` or `userId` for identifying the caller. `verifyPurchase` must never return order contents, only a boolean. The final prompt must be one self-contained block a non-engineer can paste into Base44.

## STEP-BY-STEP PLAN (in build order)

1. Create `./prompts/order-pii-fix-base44.txt`. Open the prompt with 2–3 sentences of context for Base44: the app leaks customer PII because the Order entity is client-readable; this change moves all customer order reads to server functions and locks the entity; do not touch anything admin-related.
2. In the same file, spec server function 1 — `getMyOrders`: takes NO parameters; reads the authenticated user from the auth token; returns only that user's orders (match `Order.created_by` to the authenticated user's email), sorted newest first; returns `[]` (not an error) when the user has no orders; returns 401 if unauthenticated.
3. Spec server function 2 — `verifyPurchase`: takes exactly one parameter, `productId`; reads the authenticated user from the auth token; returns `{ verified: true }` if that user has at least one PAID/COMPLETED order containing that product, else `{ verified: false }`; never returns order data; returns `{ verified: false }` (not an error) if unauthenticated.
4. Spec the entity lock: set Order entity permissions so client-side reads AND writes are disallowed for all users — Order is accessible only from server functions. State explicitly that `createStripeCheckout` and `confirmStripeOrder` must keep working via their server-side access.
5. Spec the Account page rewire: replace its client-side Order query with a call to `getMyOrders`; keep the page's existing UI, layout, and empty-state exactly as they are.
6. Spec the ProductReviews rewire: replace its client-side Order query with a call to `verifyPurchase(productId)`; use the boolean wherever the component currently decides "verified buyer" / whether the user may review; keep all review UI and copy unchanged.
7. Spec the OrderConfirmation cleanup: delete the legacy client-side `Order.get` path entirely; the page must rely solely on the data returned by `confirmStripeOrder`; if that data is missing, show the page's existing error/fallback state rather than fetching the order from the client.
8. Close the prompt with a verification instruction to Base44: search the entire app for any other client-side Order SDK usage (`Order.list`, `Order.filter`, `Order.get`) outside server functions, rewire read-only cases through `getMyOrders`, and list anything else it finds instead of silently changing it. Then restate: no admin changes, no schema changes.
9. Print the finished prompt in full in your reply, plus your ASSUMPTION lines (if any) above it.

## EXACT INPUTS TO USE

- Files to open or create, by name: create `./prompts/order-pii-fix-base44.txt` (this blueprint is your only other input).
- The one prompt to hand the builder to kick this off: "Open blueprints/order-pii-fix.md in the Pawbeans repo and follow it literally. Produce the single Base44 fix prompt it specifies, save it to prompts/order-pii-fix-base44.txt, and print it in full. Make no other changes."
- Copy / values / snippets to use verbatim in the Base44 prompt:
  - Function names: `getMyOrders`, `verifyPurchase` (exact casing).
  - "Derive the customer's identity ONLY from the authenticated request's auth token. Do not accept an email, user id, or any identity parameter from the client."
  - "Do NOT modify any admin page, admin server function, or admin authentication — that was fixed separately and must stay as-is."
  - "Do NOT change the Order entity's schema: no new fields, no renames, no type changes. Only its permissions change."

## DEFINITION OF DONE (checklist the builder ticks before calling it finished)

- [ ] `./prompts/order-pii-fix-base44.txt` exists and is ONE self-contained paste-ready prompt (no placeholders left, no "TODO", no references to this blueprint).
- [ ] The prompt covers all four changes: `getMyOrders`, `verifyPurchase`, Order entity locked to server-functions-only, legacy `Order.get` removed from OrderConfirmation.
- [ ] `getMyOrders` is specced with no parameters and token-derived identity; `verifyPurchase` returns only a boolean and takes only `productId`.
- [ ] The prompt rewires all three client surfaces (Account, ProductReviews, OrderConfirmation) in the same change, and includes the whole-app sweep for leftover client-side Order queries.
- [ ] The prompt explicitly protects: admin (untouched), Order schema (unchanged), `createStripeCheckout`/`confirmStripeOrder` (keep working).
- [ ] Acceptance scenarios appear in the prompt for Base44 to verify: (a) logged-in customer sees only their own orders on Account; (b) a second account sees none of the first account's orders anywhere, including via browser devtools/network responses; (c) a buyer of product X gets `verified: true` on X's reviews, a non-buyer gets `false`; (d) completing a fresh Stripe checkout still lands on a working OrderConfirmation page.
- [ ] Nothing in CONSTRAINTS was violated.

## IF SOMETHING IS UNCLEAR (anti-stall)

If you hit a genuine gap this blueprint did not cover: make the smallest safe assumption, write it at the top of your output as 'ASSUMPTION: ...', and keep going. Never stall, never ask, never invent big new scope.

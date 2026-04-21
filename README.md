This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Testing

### Unit / Integration tests (mocked)

The payment API route is covered by Jest tests in `__tests__/api/payment.test.ts`.
All Square and Resend network calls are intercepted with `jest.spyOn(global, "fetch")` — no
real credentials are required.

```bash
npm test               # run all tests
npm run test:coverage  # run with coverage report
```

### Testing against the Square Sandbox

To run the payment route against the real Square sandbox environment:

1. Log in to the [Square Developer Dashboard](https://developer.squareup.com/apps).
2. Select your application and open the **Sandbox** tab.
3. Copy the **Sandbox Access Token** (starts with `EAAAlXXX...` under the Sandbox heading,
   not the production token).
4. In `.env.local`, set:

   ```
   SQUARE_ACCESS_TOKEN=<your-sandbox-access-token>
   NEXT_PUBLIC_SQUARE_APP_ID=sandbox-sq0idb-cVDPc4jt6noc_-Xsc04TbQ
   NEXT_PUBLIC_SQUARE_LOCATION_ID=LT7NQBMFDDKB5
   NEXT_PUBLIC_SQUARE_ENV=sandbox
   ```

5. Start the dev server (`npm run dev`) and use Square's test card nonces (e.g.
   `cnon:card-nonce-ok` for a successful charge, `cnon:card-nonce-declined` for a decline).
   Full list: [Square test nonces](https://developer.squareup.com/docs/devtools/sandbox/payments).

6. You can also exercise the route directly with `curl`:

   ```bash
   curl -X POST http://localhost:3000/api/payment \
     -H "Content-Type: application/json" \
     -d '{
       "token": "cnon:card-nonce-ok",
       "amountCents": 1000,
       "customerName": "Test User",
       "customerEmail": "test@example.com"
     }'
   ```

   A successful sandbox charge returns `{"ok":true,"paymentId":"...","orderNumber":"PN-XXXXXX","status":"COMPLETED"}`.

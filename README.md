# Luxurie — U.S. storefront

Static Vercel-ready storefront with Paystack checkout and manual cryptocurrency payment proof.

## Paystack setup

1. Open `script.js`.
2. Replace `pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY` with your Paystack **public key**.
3. Deploy the project to Vercel.
4. In Vercel, open **Settings → Environment Variables**.
5. Add `PAYSTACK_SECRET_KEY` and paste your Paystack **secret key** as the value.
6. Redeploy after adding the environment variable.

Never put the Paystack secret key in `script.js` or any public file.

## Crypto setup

In `script.js`, replace:

`ADD YOUR CRYPTO WALLET ADDRESS`

with the wallet address you want customers to use. The crypto option collects a transaction reference and payment screenshot and emails the proof to `shopatkuxurie@gmail.com` for manual verification.

## Important

Test with Paystack test keys before switching to live keys. The site only confirms a Paystack order after the transaction is verified server-side.

The email order service uses FormSubmit and may require one-time activation for `shopatkuxurie@gmail.com`.

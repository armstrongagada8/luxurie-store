export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ verified: false, message: 'Method not allowed' });
  try {
    const { reference, amount, currency } = req.body || {};
    if (!reference || !amount || currency !== 'USD') return res.status(400).json({ verified: false, message: 'Invalid payment details.' });
    const key = process.env.PAYSTACK_SECRET_KEY;
    if (!key) return res.status(500).json({ verified: false, message: 'Payment verification is not configured.' });
    const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${key}` } });
    const data = await response.json();
    if (!response.ok || !data.status || !data.data) return res.status(400).json({ verified: false, message: data.message || 'Unable to verify transaction.' });
    const tx = data.data;
    const verified = tx.status === 'success' && Number(tx.amount) === Number(amount) && tx.currency === currency;
    return res.status(verified ? 200 : 400).json({ verified, message: verified ? 'Payment verified.' : 'Payment details did not match the order.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ verified: false, message: 'Payment verification error.' });
  }
}

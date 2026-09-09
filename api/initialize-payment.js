export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      verified: false,
      message: "Method not allowed"
    });
  }

  try {
    const {
      transaction_id,
      reference,
      amount,
      currency
    } = req.body || {};

    if (
      !transaction_id ||
      !reference ||
      !amount ||
      currency !== "USD"
    ) {
      return res.status(400).json({
        verified: false,
        message: "Invalid payment details."
      });
    }

    /*
     * Flutterwave SECRET key.
     *
     * This must be stored in Vercel Environment Variables.
     * Never put this key in script.js or index.html.
     */
    const key =
      process.env.FLW_SECRET_KEY;

    if (!key) {
      return res.status(500).json({
        verified: false,
        message:
          "Flutterwave payment verification is not configured."
      });
    }

    const response = await fetch(
      `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
        transaction_id
      )}/verify`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${key}`,
          Accept: "application/json"
        }
      }
    );

    const data =
      await response.json();

    if (
      !response.ok ||
      !data ||
      !data.data
    ) {
      return res.status(400).json({
        verified: false,
        message:
          data?.message ||
          "Unable to verify Flutterwave transaction."
      });
    }

    const tx = data.data;

    const verified =
      tx.status === "successful" &&
      String(tx.tx_ref) === String(reference) &&
      String(tx.currency).toUpperCase() ===
        String(currency).toUpperCase() &&
      Number(tx.amount) >= Number(amount);

    if (!verified) {
      return res.status(400).json({
        verified: false,
        message:
          "Payment details did not match the order."
      });
    }

    return res.status(200).json({
      verified: true,
      message: "Payment verified.",
      transaction_id: tx.id,
      reference: tx.tx_ref,
      amount: tx.amount,
      currency: tx.currency,
      status: tx.status
    });

  } catch (error) {

    console.error(
      "Flutterwave verification error:",
      error
    );

    return res.status(500).json({
      verified: false,
      message:
        "Payment verification error."
    });
  }
}

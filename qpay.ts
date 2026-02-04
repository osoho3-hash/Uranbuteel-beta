import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * In a production environment, this endpoint would proxy requests to
 * QPay's invoice API to create and monitor payment invoices.  Because
 * there is no official QPay sandbox enabled for this project, we
 * simulate the workflow in memory.  When a POST request is made with
 * an amount, contractId and milestoneId, a mock invoice is created and
 * will automatically transition from `pending` to `paid` after a short
 * delay.  Clients can poll the status of an invoice by sending a
 * GET request with an `invoice_id` query parameter.
 */

// In‑memory store of invoices and their statuses.  This is reset
// whenever the server is reloaded.  In a real application this
// information would be persisted in a database or managed via QPay's
// webhooks.
const invoices: Record<string, { status: 'pending' | 'paid'; createdAt: number }> = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Handle invoice creation
  if (req.method === 'POST') {
    const { amount, contractId, milestoneId } = req.body;
    if (!amount || !contractId || !milestoneId) {
      return res.status(400).json({ error: 'amount, contractId and milestoneId are required' });
    }
    const invoiceId = `MOCK-${Date.now()}`;
    // Store invoice with pending status
    invoices[invoiceId] = { status: 'pending', createdAt: Date.now() };
    // Simulate payment processing: mark as paid after 10 seconds
    setTimeout(() => {
      if (invoices[invoiceId]) {
        invoices[invoiceId].status = 'paid';
      }
    }, 10000);
    // Provide a placeholder QR code.  In a real integration this would
    // be returned from QPay's API as an image or URL.  For the sake
    // of demonstration, we reference a public QR code generator that
    // encodes the invoice ID in the QR.  If external requests are
    // blocked, the frontend will still display this URL as the src.
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
      invoiceId,
    )}`;
    return res.status(200).json({ invoice_id: invoiceId, qr_url: qrUrl });
  }
  // Handle invoice status polling
  if (req.method === 'GET') {
    const { invoice_id } = req.query;
    if (!invoice_id || Array.isArray(invoice_id)) {
      return res.status(400).json({ error: 'invoice_id query param is required' });
    }
    const record = invoices[invoice_id];
    if (!record) {
      return res.status(404).json({ error: 'invoice not found' });
    }
    return res.status(200).json({ status: record.status });
  }
  // Unsupported method
  return res.status(405).json({ error: 'Method not allowed' });
}
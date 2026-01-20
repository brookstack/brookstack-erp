import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * RECONCILIATION ENGINE
 * This function synchronizes the Invoice (billing) with its Payments.
 * If a payment is added, updated, or deleted, this forces a recalculation.
 */
async function syncBillingMaster(connection, billing_id) {
  // 1. Get the Invoice Total and the NEW sum of all remaining payments
  const [stats] = await connection.query(
    `SELECT 
      grand_total,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE billing_id = ?) as total_captured
     FROM billing 
     WHERE id = ?`, [billing_id, billing_id]
  );

  if (stats.length > 0) {
    const { grand_total, total_captured } = stats[0];
    
    // 2. Calculate new balance: (Total - sum of all payments)
    const new_outstanding = grand_total - total_captured;
    
    // 3. Determine Logic-based Status
    let status = 'unpaid';
    if (total_captured >= grand_total && grand_total > 0) {
      status = 'paid';
    } else if (total_captured > 0) {
      status = 'partial';
    }

    // 4. Update the Master Invoice
    // This effectively "increases" the balance if a payment was deleted
    await connection.query(
      `UPDATE billing 
       SET total_paid = ?, outstanding_balance = ?, status = ? 
       WHERE id = ?`, 
      [total_captured, new_outstanding, status, billing_id]
    );
  }
}

// GET: All payments
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*, 
        c.companyName as clientName,
        c.email as email,
        c.mobile as mobile,
        b.doc_no, b.currency,
        b.services as billing_services_json,
        b.grand_total as billing_grand_total,
        (SELECT COALESCE(SUM(p2.amount_paid), 0) 
         FROM payments p2 
         WHERE p2.billing_id = p.billing_id AND p2.id <= p.id) as running_total_paid
      FROM payments p
      JOIN billing b ON p.billing_id = b.id
      JOIN customers c ON b.client_id = c.id
      ORDER BY p.id DESC`; 
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) { 
    console.error("❌ GET Payments Error:", err.message);
    res.status(500).json({ error: err.message }); 
  }
});

// POST: Create payment
router.post('/', async (req, res) => {
  const { billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO payments (billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes]
    );
    await syncBillingMaster(connection, billing_id);
    await connection.commit();
    res.status(201).json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally { connection.release(); }
});

// PUT: Update payment
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      `UPDATE payments SET billing_id=?, payment_date=?, amount_paid=?, payment_method=?, transaction_reference=?, notes=? WHERE id=?`,
      [billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes, id]
    );
    await syncBillingMaster(connection, billing_id);
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally { connection.release(); }
});

// DELETE: Remove payment (Now correctly restores invoice balance)
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    // 1. Identify which invoice this payment belonged to before deleting
    const [payment] = await connection.query('SELECT billing_id FROM payments WHERE id = ?', [id]);
    
    if (payment.length === 0) {
        return res.status(404).json({ error: 'Payment record not found' });
    }

    const billing_id = payment[0].billing_id;

    // 2. Delete the payment
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);

    // 3. Trigger reconciliation (This increases the outstanding_balance on the invoice)
    await syncBillingMaster(connection, billing_id);

    await connection.commit();
    res.json({ success: true, message: "Payment removed and invoice adjusted." });
  } catch (err) {
    await connection.rollback();
    console.error("❌ DELETE Payment Error:", err.message);
    res.status(500).json({ error: err.message });
  } finally { connection.release(); }
});

export default router;
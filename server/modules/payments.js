import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * Shared Helper: Syncs the Billing table as the PRIMARY source of truth.
 * Ensures field names match the database: total_paid & outstanding_balance.
 */
async function syncBillingMaster(connection, billing_id) {
  // 1. Calculate the real-time totals from the ledger
  const [stats] = await connection.query(
    `SELECT 
      grand_total,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE billing_id = ?) as calculated_paid
     FROM billing 
     WHERE id = ?`, [billing_id, billing_id]
  );

  if (stats.length > 0) {
    const { grand_total, calculated_paid } = stats[0];
    const balance = grand_total - calculated_paid;
    
    // Status logic: pending -> partial -> paid
    let status = 'pending';
    if (calculated_paid >= grand_total && grand_total > 0) status = 'paid';
    else if (calculated_paid > 0) status = 'partial';

    // 2. UPDATE MASTER BILLING TABLE (The Source of Truth)
    await connection.query(
      `UPDATE billing 
       SET total_paid = ?, outstanding_balance = ?, status = ? 
       WHERE id = ?`, 
      [calculated_paid, balance, status, billing_id]
    );

    // 3. SYNC PAYMENT SNAPSHOTS 
    // This ensures that when you fetch payments, the snapshots match the master
    await connection.query(
      `UPDATE payments 
       SET grand_total = ?, total_received = ?, outstanding_balance = ? 
       WHERE billing_id = ?`, 
      [grand_total, calculated_paid, balance, billing_id]
    );
  }
}

/**
 * GET: Fetch all payments
 * Always pulls the 'Current Truth' from the joined billing table
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*, 
        c.companyName as clientName,
        c.mobile as clientPhone,
        b.doc_no, 
        b.currency,
        b.total_paid,
        b.outstanding_balance,
        b.status as billing_status
      FROM payments p
      JOIN billing b ON p.billing_id = b.id
      JOIN customers c ON b.client_id = c.id
      ORDER BY p.payment_date DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST: New Payment
 */
router.post('/', async (req, res) => {
  const { billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [result] = await connection.query(
      `INSERT INTO payments (billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [billing_id, payment_date, amount_paid, payment_method, transaction_reference, notes]
    );

    // Recalculate everything and push to Billing table
    await syncBillingMaster(connection, billing_id);

    await connection.commit();
    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * PUT: Edit Payment
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { amount_paid, payment_date, payment_method, transaction_reference, notes } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [payment] = await connection.query('SELECT billing_id FROM payments WHERE id = ?', [id]);
    if (payment.length === 0) throw new Error("Payment record not found");
    const billing_id = payment[0].billing_id;

    await connection.query(
      `UPDATE payments SET amount_paid = ?, payment_date = ?, payment_method = ?, transaction_reference = ?, notes = ? 
       WHERE id = ?`,
      [amount_paid, payment_date, payment_method, transaction_reference, notes, id]
    );

    await syncBillingMaster(connection, billing_id);

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE: Reverse Payment
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [payment] = await connection.query('SELECT billing_id FROM payments WHERE id = ?', [id]);
    if (payment.length === 0) throw new Error("Payment record not found");
    const billing_id = payment[0].billing_id;

    await connection.query('DELETE FROM payments WHERE id = ?', [id]);

    await syncBillingMaster(connection, billing_id);

    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

export default router;
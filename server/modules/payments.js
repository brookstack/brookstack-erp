import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * RECONCILIATION ENGINE
 */
async function syncBillingMaster(connection, billing_id) {
  const [stats] = await connection.query(
    `SELECT 
      grand_total,
      (SELECT COALESCE(SUM(amount_paid), 0) FROM payments WHERE billing_id = ?) as total_captured
     FROM billing 
     WHERE id = ?`, [billing_id, billing_id]
  );

  if (stats.length > 0) {
    const { grand_total, total_captured } = stats[0];
    const new_outstanding = grand_total - total_captured;
    
    let status = 'unpaid';
    if (total_captured >= grand_total && grand_total > 0) status = 'paid';
    else if (total_captured > 0) status = 'partial';

    await connection.query(
      `UPDATE billing 
       SET total_paid = ?, outstanding_balance = ?, status = ? 
       WHERE id = ?`, 
      [total_captured, new_outstanding, status, billing_id]
    );
  }
}

// GET: All payments with historical running totals
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
        -- Calculate the sum of payments for this invoice up to this specific record
        (SELECT COALESCE(SUM(p2.amount_paid), 0) 
         FROM payments p2 
         WHERE p2.billing_id = p.billing_id AND p2.id <= p.id) as running_total_paid
      FROM payments p
      JOIN billing b ON p.billing_id = b.id
      JOIN customers c ON b.client_id = c.id
      ORDER BY p.id DESC`; 
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
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

// DELETE: Remove payment
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [payment] = await connection.query('SELECT billing_id FROM payments WHERE id = ?', [id]);
    if (payment.length === 0) throw new Error('Payment not found');
    await connection.query('DELETE FROM payments WHERE id = ?', [id]);
    await syncBillingMaster(connection, payment[0].billing_id);
    await connection.commit();
    res.json({ success: true });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally { connection.release(); }
});

export default router;
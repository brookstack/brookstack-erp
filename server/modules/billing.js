import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * SHARED UTILITY: Sync Master Source of Truth
 * This ensures the billing record always reflects the actual sum of payments.
 */
async function syncBillingMaster(connection, billing_id) {
  const [stats] = await connection.query(
    `SELECT 
      b.grand_total, 
      COALESCE(SUM(p.amount_paid), 0) as total_received 
     FROM billing b
     LEFT JOIN payments p ON b.id = p.billing_id
     WHERE b.id = ?
     GROUP BY b.id`, [billing_id]
  );

  if (stats.length > 0) {
    const { grand_total, total_received } = stats[0];
    const balance = grand_total - total_received;
    
    // Status logic based on master totals
    let status = 'pending';
    if (total_received >= grand_total && grand_total > 0) status = 'paid';
    else if (total_received > 0) status = 'partial';

    await connection.query(
      `UPDATE billing 
       SET total_paid = ?, outstanding_balance = ?, status = ? 
       WHERE id = ?`, 
      [total_received, balance, status, billing_id]
    );
  }
}

/**
 * GET: Fetch all billing records
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        b.*, 
        c.companyName as clientName, 
        c.email, 
        c.mobile as clientPhone 
      FROM billing b
      LEFT JOIN customers c ON b.client_id = c.id
      ORDER BY b.created_at DESC`;
      
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Billing Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST: Create a new Billing Record
 */
router.post('/', async (req, res) => {
  const { type, currency, clientId, notes, services, sub, vat, grand } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const docNo = `${type === 'invoice' ? 'INV' : 'QUO'}-${Date.now().toString().slice(-6)}`;
    const servicesData = services ? JSON.stringify(services) : JSON.stringify([]);

    // Logic: Upon creation, total_paid is 0 and balance = grand_total
    const sql = `
      INSERT INTO billing (
        doc_no, type, client_id, currency, 
        subtotal, vat_total, grand_total, 
        total_paid, outstanding_balance,
        notes, services, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.query(sql, [
      docNo, type, clientId, currency, 
      sub, vat, grand, 
      0.00, grand, // The source of truth starts here
      notes, servicesData, 'pending'
    ]);

    await connection.commit();
    res.status(201).json({ id: result.insertId, docNo, success: true });

  } catch (err) {
    await connection.rollback();
    console.error("❌ POST Billing Error:", err.message);
    res.status(500).json({ error: "Database Error" });
  } finally {
    connection.release();
  }
});

/**
 * PUT: Update an existing Billing Record
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, currency, status, notes, services, sub, vat, grand } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Determine if type changed to update doc_no prefix
    const [current] = await connection.query('SELECT doc_no, type FROM billing WHERE id = ?', [id]);
    if (current.length === 0) return res.status(404).json({ error: "Not found" });

    let updatedDocNo = current[0].doc_no;
    if (type && type !== current[0].type) {
      const prefix = type === 'invoice' ? 'INV' : 'QUO';
      updatedDocNo = `${prefix}-${current[0].doc_no.split('-')[1]}`;
    }

    // 2. Update the main fields
    const sql = `
      UPDATE billing 
      SET type = COALESCE(?, type), 
          doc_no = COALESCE(?, doc_no),
          currency = COALESCE(?, currency),
          status = COALESCE(?, status), 
          notes = COALESCE(?, notes), 
          services = COALESCE(?, services),
          subtotal = COALESCE(?, subtotal),
          vat_total = COALESCE(?, vat_total),
          grand_total = COALESCE(?, grand_total)
      WHERE id = ?`;

    await connection.query(sql, [
      type, updatedDocNo, currency, status, 
      notes, services ? JSON.stringify(services) : undefined, sub, vat, grand, id
    ]);

    // 3. IMPORTANT: Re-sync balance in case grand_total was changed manually
    await syncBillingMaster(connection, id);

    await connection.commit();
    res.json({ success: true, docNo: updatedDocNo });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
});

/**
 * DELETE: Remove a billing record
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // Note: We delete associated payments first if they exist to maintain integrity
    await db.query('DELETE FROM payments WHERE billing_id = ?', [id]);
    const [result] = await db.query('DELETE FROM billing WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) return res.status(404).json({ error: "Not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * GET: Fetch all billing records
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT b.*, c.companyName as clientName 
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
 * Revised to match Frontend keys: clientId, sub, vat, grand
 */
router.post('/', async (req, res) => {
  // We destructure the EXACT names your React form sends in the payload
  const { 
    type, currency, clientId, notes, services, 
    sub, vat, grand 
  } = req.body;

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate Document Number
    const prefix = type === 'invoice' ? 'INV' : 'QUO';
    const docNo = `${prefix}-${Date.now().toString().slice(-6)}`;

    // INSERT into 'billing' table
    // Mapping: sub -> subtotal, vat -> vat_total, grand -> grand_total
    const [billingResult] = await connection.query(
      `INSERT INTO billing (doc_no, type, client_id, currency, subtotal, vat_total, grand_total, notes, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [docNo, type, clientId, currency, sub, vat, grand, notes, 'pending']
    );

    const billingId = billingResult.insertId;

    // Handle service lines if they exist
    if (services && services.length > 0) {
      const serviceValues = services.map(s => [
        billingId, s.description, s.price, s.vat ? 1 : 0
      ]);
      
      // Ensure 'billing_services' table exists with columns: billing_id, description, price, has_vat
      await connection.query(
        `INSERT INTO billing_services (billing_id, description, price, has_vat) VALUES ?`,
        [serviceValues]
      );
    }

    await connection.commit();
    console.log(`✅ Success: Created ${type} ${docNo}`);
    res.status(201).json({ id: billingId, docNo, success: true });

  } catch (err) {
    await connection.rollback();
    // This log is critical for your troubleshooting
    console.error("❌ TRANSACTION ERROR:", err.sqlMessage || err.message);
    res.status(500).json({ 
        error: "Database transaction failed", 
        details: err.sqlMessage || err.message 
    });
  } finally {
    connection.release();
  }
});

/**
 * DELETE: Remove a billing record
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM billing WHERE id = ?', [id]);
    res.json({ success: true, message: "Record deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
import express from 'express';
import db from '../db.js'; 

const router = express.Router();

/**
 * GET: Fetch all billing records with Client Info
 */
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT b.*, c.companyName as clientName, c.email, c.mobile as phone
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
    
    // Ensure services array is stringified for the LONGTEXT/JSON column
    const servicesData = services ? JSON.stringify(services) : JSON.stringify([]);

    const sql = `
      INSERT INTO billing (
        doc_no, type, client_id, currency, 
        subtotal, vat_total, grand_total, 
        notes, services, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await connection.query(sql, [
      docNo, type, clientId, currency, 
      sub, vat, grand, 
      notes, servicesData, 'pending'
    ]);

    await connection.commit();
    res.status(201).json({ id: result.insertId, docNo, success: true });

  } catch (err) {
    await connection.rollback();
    console.error("❌ POST Billing Error:", err.sqlMessage || err.message);
    res.status(500).json({ error: err.sqlMessage || "Database Error" });
  } finally {
    connection.release();
  }
});

/**
 * PUT: Update an existing Billing Record (For the Edit functionality)
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes, services, sub, vat, grand } = req.body;
  
  try {
    const servicesData = services ? JSON.stringify(services) : undefined;
    
    const sql = `
      UPDATE billing 
      SET status = COALESCE(?, status), 
          notes = COALESCE(?, notes), 
          services = COALESCE(?, services),
          subtotal = COALESCE(?, subtotal),
          vat_total = COALESCE(?, vat_total),
          grand_total = COALESCE(?, grand_total)
      WHERE id = ?`;

    await db.query(sql, [status, notes, servicesData, sub, vat, grand, id]);
    res.json({ success: true, message: "Record updated successfully" });
  } catch (err) {
    console.error("❌ UPDATE Billing Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE: Remove a billing record by ID
 * Note: Since 'services' are stored as JSON within this table, 
 * deleting the row automatically removes the associated services.
 */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await db.query('DELETE FROM billing WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    console.log(`🗑️ Deleted Billing Record ID: ${id}`);
    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE Billing Error:", err.message);
    // Check for foreign key constraints if you have other tables linked
    res.status(500).json({ error: err.message });
  }
});

export default router;
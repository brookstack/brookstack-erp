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

    // Generate Document Number (INV for invoice, QUO for quotation)
    const docNo = `${type === 'invoice' ? 'INV' : 'QUO'}-${Date.now().toString().slice(-6)}`;
    
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
 * PUT: Update an existing Billing Record
 * Fixes: Added 'type', 'currency', and mapped 'sub/vat/grand' to 'subtotal/vat_total/grand_total'
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { type, currency, status, notes, services, sub, vat, grand } = req.body;
  
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Fetch current record to check if we need to update the doc_no prefix
    const [current] = await connection.query('SELECT doc_no, type FROM billing WHERE id = ?', [id]);
    if (current.length === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    let updatedDocNo = current[0].doc_no;

    // 2. Logic to swap prefix if type changed (e.g., INV-123 to QUO-123)
    if (type && type !== current[0].type) {
      const prefix = type === 'invoice' ? 'INV' : 'QUO';
      const numberPart = current[0].doc_no.split('-')[1] || Date.now().toString().slice(-6);
      updatedDocNo = `${prefix}-${numberPart}`;
    }

    const servicesData = services ? JSON.stringify(services) : undefined;
    
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

    // Map the incoming frontend fields (sub, vat, grand) to DB columns
    await connection.query(sql, [
      type, 
      updatedDocNo,
      currency, 
      status, 
      notes, 
      servicesData, 
      sub, 
      vat, 
      grand, 
      id
    ]);

    await connection.commit();
    res.json({ success: true, message: "Record updated successfully", docNo: updatedDocNo });
  } catch (err) {
    await connection.rollback();
    console.error("❌ UPDATE Billing Error:", err.message);
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
    const [result] = await db.query('DELETE FROM billing WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ success: true, message: "Record deleted successfully" });
  } catch (err) {
    console.error("❌ DELETE Billing Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
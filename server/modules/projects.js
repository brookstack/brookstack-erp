import express from 'express';
import db from '../db.js'; 

const router = express.Router();

// --- GET: All Projects ---
router.get('/', async (req, res) => {
  try {
    const sql = `
      SELECT 
        p.*, 
        c.companyName as clientName,
        u.full_name as leadStaffName
      FROM projects p
      JOIN customers c ON p.client_id = c.id
      LEFT JOIN users u ON p.lead_staff_id = u.id
      ORDER BY p.id DESC`;
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("❌ GET Projects Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- POST: Create Project ---
router.post('/', async (req, res) => {
  const { 
    project_name, 
    description, // Added description
    client_id, 
    lead_staff_id, 
    project_type, 
    status, 
    project_url, 
    repo_url, 
    tech_stack, 
    notes 
  } = req.body;

  try {
    const sql = `INSERT INTO projects 
      (project_name, description, client_id, lead_staff_id, project_type, status, project_url, repo_url, tech_stack, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const [result] = await db.query(sql, [
      project_name, 
      description || '', // Ensure it's not null if your SQL constraint is strict
      client_id, 
      lead_staff_id || null, 
      project_type, 
      status || 'Discovery', 
      project_url || null, 
      repo_url || null, 
      tech_stack || null, 
      notes || null
    ]);

    res.status(201).json({ id: result.insertId, success: true });
  } catch (err) {
    console.error("❌ POST Project Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- PUT: Update Project ---
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  
  // 1. Create a clean copy of the data
  const dataToUpdate = { ...req.body };

  // 2. Remove virtual/non-table fields
  delete dataToUpdate.id;
  delete dataToUpdate.clientName;   
  delete dataToUpdate.leadStaffName; 
  delete dataToUpdate.created_at;    
  delete dataToUpdate.attachments;   

  try {
    // 3. Shorthand update: 'description' will be included if present in req.body
    const [result] = await db.query('UPDATE projects SET ? WHERE id = ?', [dataToUpdate, id]);
    
    if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Project not found" });
    }
    
    res.json({ success: true, message: "Project updated successfully" });
  } catch (err) {
    console.error("❌ PUT Project Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE: Remove Project ---
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    console.error("❌ DELETE Project Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

export default router;
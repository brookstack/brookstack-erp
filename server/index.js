import dotenv from 'dotenv';
import path from 'path';

// This tells the server to look for the .env in the parent (root) folder
dotenv.config({ path: '../.env' }); 

import express from 'express';
import cors from 'cors';

// --- ADD THESE IMPORTS ---
import customerRoutes from './modules/customers.js';
import billingRoutes from './modules/billing.js'; 

const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes); 

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ERP Server running on port ${PORT}`);
    // This will confirm if the ../.env path is working
    console.log(`Connected as user: ${process.env.DB_USER}`);
    console.log(`Database Port: ${process.env.DB_PORT}`);
});
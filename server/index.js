import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root
dotenv.config({ path: '../.env' }); 

import express from 'express';
import cors from 'cors';

// --- IMPORTS ---
import authRoutes from './modules/auth.js';      
import customerRoutes from './modules/customers.js';
import billingRoutes from './modules/billing.js'; 
import paymentRoutes from './modules/payments.js'; 
import userRoutes from './modules/users.js'; // 1. Import the new users module

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// --- ROUTES ---
app.use('/api/auth', authRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/billing', billingRoutes); 
app.use('/api/payments', paymentRoutes); 
app.use('/api/users', userRoutes); // 2. Register the users route

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ERP Server running on port ${PORT}`);
    
    if (!process.env.JWT_SECRET) {
        console.warn("⚠️  WARNING: JWT_SECRET is missing from .env!");
    } else {
        console.log("✅ Security keys loaded.");
    }
});
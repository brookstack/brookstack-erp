import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

// --- ENVIRONMENT CONFIG ---
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// This will check for .env in the /server folder first
dotenv.config({ path: path.resolve(__dirname, '.env') }); 

const isProd = process.env.NODE_ENV === 'production';

// --- DYNAMIC ROUTE PREFIX ---
/**
 * On Local: You access http://localhost:5000/api/customers
 * On cPanel: The 'api' part is consumed by the server, 
 * so Express only sees /customers.
 */
const prefix = isProd ? '' : '/api';

// --- IMPORTS ---
import authRoutes from './modules/auth.js';      
import customerRoutes from './modules/customers.js';
import billingRoutes from './modules/billing.js'; 
import paymentRoutes from './modules/payments.js'; 
import userRoutes from './modules/users.js';

const app = express();

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- DIAGNOSTIC ROUTE ---
// Always available at https://os.brookstack.com/api/test
app.get(`${prefix}/test`, (req, res) => {
    res.json({
        message: "🚀 Backend is reachable!",
        environment: isProd ? "Production (cPanel)" : "Development (Local)",
        timestamp: new Date().toISOString()
    });
});

// --- ROUTES ---
app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/customers`, customerRoutes);
app.use(`${prefix}/billing`, billingRoutes); 
app.use(`${prefix}/payments`, paymentRoutes); 
app.use(`${prefix}/users`, userRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({ error: 'Internal Server Error' });
});

// --- SERVER START ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ERP Server running in ${isProd ? 'PROD' : 'DEV'} mode`);
    console.log(`🔗 Base URL: ${isProd ? 'os.brookstack.com/api' : 'localhost:' + PORT + '/api'}`);
    
    if (!process.env.JWT_SECRET && isProd) {
        console.warn("⚠️  WARNING: JWT_SECRET is missing from production environment!");
    }
});
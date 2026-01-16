import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') }); 

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());

// --- ROUTES ---
import authRoutes from './modules/auth.js';      
import customerRoutes from './modules/customers.js';
import billingRoutes from './modules/billing.js'; 
import paymentRoutes from './modules/payments.js'; 
import projectsRoutes from './modules/projects.js'; 
import userRoutes from './modules/users.js';

// FIXED PREFIX: This makes it easier for the frontend to stay consistent
const prefix = '/api';

app.use(`${prefix}/auth`, authRoutes);
app.use(`${prefix}/customers`, customerRoutes);
app.use(`${prefix}/billing`, billingRoutes); 
app.use(`${prefix}/payments`, paymentRoutes); 
app.use(`${prefix}/projects`, projectsRoutes); 
app.use(`${prefix}/users`, userRoutes);

// Test this at: http://localhost:5000/api/test
app.get(`${prefix}/test`, (req, res) => {
    res.json({ 
        status: "🚀 Online", 
        environment: isProd ? "Production" : "Development",
        expected_endpoints: ["/customers", "/billing", "/auth/login"]
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 ERP Server running on port ${PORT}`);
});
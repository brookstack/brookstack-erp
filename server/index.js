import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import customerRoutes from './modules/customers.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/customers', customerRoutes);

// Use the PORT from .env or default to 5000
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 ERP Server running on port ${PORT}`));
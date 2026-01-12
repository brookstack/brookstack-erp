import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to ensure .env is found regardless of where the app is started
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

const dbConfig = isProd ? {
  // --- PRODUCTION (cPanel) ---
  host: 'localhost', 
  user: 'brooksta_erpuser',
  password: 'W+v?0,exn!JzcVEX', 
  database: 'brooksta_erp',
  port: 3306, 
} : {
  // --- DEVELOPMENT (Local Mac) ---
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brooksta_erp',
  port: process.env.DB_PORT || 3307,
};

const db = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Logs to the terminal (Local) or Passenger Log (cPanel)
console.log(`🚀 System Mode: ${isProd ? 'PRODUCTION' : 'DEVELOPMENT'}`);
console.log(`📡 Connected to: ${dbConfig.database} on ${dbConfig.host}`);

export default db;
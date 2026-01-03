import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

// Double-check env loading here as a safety measure
dotenv.config({ path: '../.env' });

const db = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'root',      // Ensure this isn't an empty string
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'brooksta_erp',
  port: process.env.DB_PORT || 3307,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default db;


// import mysql from 'mysql2';

// const pool = mysql.createPool({
//   host: 'brookstack.com',
//   user: 'brooksta_erpuser',
//   password: 'W+v?0,exn!JzcVEX', 
//   database: 'brooksta_erp',
//   waitForConnections: true,
//   connectionLimit: 10
// });

// export default pool.promise();
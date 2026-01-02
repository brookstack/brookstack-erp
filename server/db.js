import mysql from 'mysql2';
import dotenv from 'dotenv';
// This loads the variables from your .env file
dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10
});

export default pool.promise();

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
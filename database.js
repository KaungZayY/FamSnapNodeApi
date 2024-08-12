import { createPool } from 'mysql';
import dotenv from 'dotenv';

dotenv.config();

const pool = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    connectionLimit: process.env.DB_CONNECTIONLIMIT
});

// pool.getConnection((err, connection) => {
//     if (err) {
//         console.error('Error connecting to the database:', err.code);
//         return;
//     }
//     console.log('Connected to the database as ID', connection.threadId);
    
//     connection.release();
// });

const qry = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, params, (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

export default qry;
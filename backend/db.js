// const mysql = require('mysql2/promise');
// require('dotenv').config();

// const db = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASSWORD || '',
//   database: process.env.DB_NAME || 'studypartner',
// });

// module.exports = db;
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: "gateway01.ap-northeast-1.prod.aws.tidbcloud.com", // Your TiDB Host
    user: "YmoLqm7MH9XHFcf.root", // Your TiDB User (from the screenshots)
    password: "Cf79o0eZBUqPBgKM", // Type the password you reset earlier
    database: "studypartner", // The database name you just created
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    }
});

// db.connect((err) => {
//     if (err) {
//         console.error('❌ Database connection failed:', err.stack);
//         return;
//     }
//     console.log('✅ Connected to TiDB Cloud');
// });

// Simple check to see if it works (Optional but helpful)
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to TiDB Cloud via Pool');
        connection.release(); // Important: Release it back to the pool
    }
});

module.exports = db;



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
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});




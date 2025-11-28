const mysql = require('mysql2');

const pool = mysql.createPool({
    host: "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
    user: "YmoLqm7MH9XHFcf.root",
    password: "t5zcQIZlM4As9Mzn", // <--- Put your password here
    database: "studypartner",
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// This line is the most important one.
// It allows other files to see the pool.
module.exports = pool;
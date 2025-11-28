// CRITICAL: This MUST have '/promise' at the end.
// If you remove '/promise', your site will crash with the ".then()" error.
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: "gateway01.ap-northeast-1.prod.aws.tidbcloud.com",
    user: "YmoLqm7MH9XHFcf.root",
    
    // CRITICAL: This MUST be the password that worked in HeidiSQL.
    // If you get "Access Denied", this line is the ONLY reason.
    password: "t5zcQIZlM4As9Mzn", 
    
    database: "studypartner",
    port: 4000,
    ssl: {
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,

    timezone: '+05:30', 
    dateStrings: true
});

module.exports = pool;
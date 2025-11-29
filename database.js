//(This will handle the Database connection)
//First we need to import the library
const mysql = require('mysql2/promise');

//Second we need to create the connection
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Pass1234!',
    database: 'project_ca2',
    waitForConnections: true,
    connectionLimit: 10, // Recommended pool size
    queueLimit: 0
});

async function ensureTableExists() {
    const createTableSql = `
    CREATE TABLE IF NOT EXISTS mysql_table (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(20) NOT NULL,
        second_name VARCHAR(20) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone_number VARCHAR(10) NOT NULL,
        eircode VARCHAR(6) NOT NULL,
        submission_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`;

    await pool.query(createTableSql);
}

// We use pool.promise() to use modern async/await syntax
(async () => {
    try {
        await ensureTableExists();
        console.log('Database connected, and mysql_table checked/created successfully.');
    } catch (err) {
        console.error('CRITICAL ERROR: Failed to initialize database:', err);
        // Exiting if the database is not ready
        process.exit(1);
    }
})();

//last, export the module
module.exports = {db : pool};
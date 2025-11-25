//(This will handle the Database connection)
//First we need to import the library
const mysql = require('mysql2');

//Second we need to create the connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Pass1234!',
    database: 'project_ca2'
});

//third, we need to try if the connection works
db.connect((err) => {
    if (err){
        console.error('Error while trying to connect to database: ', err);
    } else{
        console.log('Database has been connected.');
    }
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
    
    // We use pool.promise() to use modern async/await syntax
    const promisePool = pool.promise();
    try {
        await promisePool.execute(createTableSql);
        console.log('MySQL connected and user_info table ensured.');
    } catch (err) {
        console.error('Error creating user_info table:', err.message);
        // Exit if the database connection/table creation fails
        process.exit(1);
    }
}

//last, export the module
module.exports = db;
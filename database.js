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

//last, export the module
module.exports = db;
const validation = require('./validation.js'); //importing the validation file
const {db} = require('./database.js'); //inporting the database connection
const multer = require('multer'); //importing multer, the mildware to handle the file.
const fs = require('fs'); //importing the library fs to handle the reading and deliting file.
const csv = require('csv-parser'); 
//(This will be the Server/Logic)
//To set up the express we need 4 main concepts
//1. Export express
const express = require('express');
//2. Create an application instance
const app = express();
//3. Define a port for the server to listen to
const port = 3000; //this value was required for this assignment
//4.Start the server to listen, it will usually be at the bottom of the code...

// We need to require path for secure static serving
const path = require('path');

// --- MULTER SETUP (for file uploads) ---
const upload = multer({ 
    // Define where to temporarily store the files
    dest: 'uploads/', 
    // Set file size limits (e.g., 5MB)
    limits: { fileSize: 5 * 1024 * 1024 } 
});

//MiddleWare needs a translator from the HTML data and Json to the server:
app.use(express.urlencoded({extended: true})); //URL-encoded - HTML
app.use(express.json()); //Json files
// Serve Static Files (This allows the server to automatically send the files from the path we chose)
app.use(express.static(path.join(__dirname, 'public'))); // Serves form.html and other client files


// Route to serve the HTML form when a user visits the root URL: localhost:3000
app.get('/', (req, res) => {
    // send the form.html file located in the 'public' directory
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// it tells the server what to do when it receives a POST request at the /submit-form endpoint
app.post('/submit-form', upload.none(), async (req, res) =>{

    // Add a guard clause to prevent crash if req.body is undefined.
    // If req.body is undefined, we use an empty object {} instead.
    const safeBody = req.body || {};

    // Use safeBody for destructuring
    const { first_name, second_name, email, phone_number, eircode} = safeBody;
    
    // Optional: Return a cleaner error message if the entire body is empty.
    if (Object.keys(safeBody).length === 0) {
        return res.status(400).send({
             message: 'Validation has failed.',
             errors: ["Form submission failed: No data was received by the server. Please check all fields."]
        });
    }
    
    // Now safely proceed with validation
    const errors = validation.validateFormData(safeBody);
    console.log('receiving data error', req.body);

    //if validation fails, it will send a 400 bad request with the status of failer
    if (Object.keys(errors).length > 0){
        console.log('Error in validation is here (line 64).')
        return res.status(400).send({
            message: 'Validation has failed.',
            errors: errors
        });
    }

    //Data Sanitization (XSS Protection - Task D)
    const safe_first_name = validation.sanitize(first_name);
    const safe_second_name = validation.sanitize(second_name);
    const safe_email = validation.sanitize(email);
    const safe_phone_number = validation.sanitize(phone_number);
    const safe_eircode = validation.sanitize(eircode);
    
    //sql query to insert the data into the table
    const insertSQL = `
    INSERT INTO mysql_table (first_name, second_name, email, phone_number, eircode)
    VALUES (?, ?, ?, ?, ?) 
    `;
    //array to store the safe and sanitize form input
    const data = [safe_first_name, safe_second_name, safe_email, safe_phone_number, safe_eircode]; 
    
    try{
        //execute the query in the await mode
        console.log('Error in executing query is here.')
        await db.query(insertSQL, data);
        //if success will display this message
        res.status(201).send('Success! Data has been saved correctly.')
    }catch(error){
        //otherwise, will catch the error and display it
        console.error('Database insertion has failed: ', error);
        res.status(500).send('Database error occured: Failed to save record!');
    }
    
    
});

// POST Route: Handles CSV file upload and processing
app.post('/upload-csv', upload.single('csvFile'), async (req, res) => { 
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    const validRecords = [];
    const invalidRecords = [];
    let transactionSuccess = true;

    try {
        // --- PARSE AND VALIDATE CSV DATA ---
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csv()) // Pipe the file stream into the CSV parser
                .on('data', (row) => {
                    // Normalize variable names to match validation.js expectations
                    const data = {
                        first_name: row.first_name || row.First_Name,
                        second_name: row.second_name || row.Second_Name || row.last_name || row.Last_Name, 
                        email: row.email || row.Email,
                        phone_number: row.phone_number || row.Phone_Number,
                        eircode: row.eircode || row.Eircode
                    };
                    
                    const errors = validation.validateFormData(data); 

                    if (Object.keys(errors).length === 0) {
                        // If valid, sanitize and store for bulk insertion
                        const safeRecord = [
                            validation.sanitize(data.first_name),
                            validation.sanitize(data.second_name),
                            validation.sanitize(data.email),
                            validation.sanitize(data.phone_number),
                            validation.sanitize(data.eircode)
                        ];
                        validRecords.push(safeRecord);
                    } else {
                        invalidRecords.push({ row: data, errors: errors });
                    }
                })
                .on('end', () => {
                    resolve(); // Parsing complete
                })
                .on('error', (err) => {
                    reject(err); // File stream error
                });
        });

        // --- BULK INSERT VALID RECORDS ---
        if (validRecords.length > 0) {
            const insertSql = `
                INSERT INTO mysql_table (first_name, second_name, email, phone_number, eircode)
                VALUES ?
            `;
            // Execute the bulk insert
            await db.query(insertSql, [validRecords]);
        }

    } catch (error) {
        console.error('CSV Processing Error or DB Insertion Failed:', error);
        transactionSuccess = false;
        // If the entire transaction fails due to a DB error
        return res.status(500).send({
            message: 'An internal error occurred during database processing.',
            details: error.message
        });
    } finally {
        // --- CLEANUP (Important for storage) ---
        fs.unlink(filePath, (err) => { // Delete the temporary file
            if (err) console.error('Error deleting temp file:', err);
        });
    }

    // --- FINAL RESPONSE ---
    if (transactionSuccess) {
        res.status(200).send({
            message: `CSV processed successfully. ${validRecords.length} records inserted.`,
            invalid_records: invalidRecords.length,
            details: invalidRecords
        });
    }
});


//await ensureTableExists(); //running the function inside the database to ensure it exists first.

//...Part 4 of express:
async function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

startServer();
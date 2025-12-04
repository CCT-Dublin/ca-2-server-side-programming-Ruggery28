const {validateFormData, sanitize} = require('./validation.js'); //importing the validation file
const {db} = require('./database.js'); //inporting the database connection
const multer = require('multer'); //importing multer, the mildware to handle the file.
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
app.post('/submit-form', async (req, res) =>{

    const { first_name, second_name, email, phone_number, eircode} = req.body;
    const errors = validateFormData(req.body);
    console.log('receiving data error', req.body);

    //if validation fails, it will send a 400 bad request with the status of failer
    if (errors.length > 0){
        console.log('Error in validation is here.')
        return res.status(400).send({
            message: 'Validation has failed.',
            errors: errors
        });
    }

    //Data Sanitization (XSS Protection - Task D)
    const safe_first_name = sanitize(first_name);
    const safe_second_name = sanitize(second_name);
    const safe_email = sanitize(email);
    const safe_phone_number = sanitize(phone_number);
    const safe_eircode = sanitize(eircode);
    
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
    
    // Check if a file was actually uploaded
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = req.file.path;
    
    // --- Placeholder for CSV processing logic (next step) ---
    console.log(`Processing file at: ${filePath}`);

    // Temporary success response for testing the upload middleware
    res.send('File received successfully. Ready to process CSV.'); 
});


//await ensureTableExists(); //running the function inside the database to ensure it exists first.

//...Part 4 of express:
async function startServer() {
    app.listen(port, () => {
        console.log(`Server is running on port: ${port}`);
    });
}

startServer();
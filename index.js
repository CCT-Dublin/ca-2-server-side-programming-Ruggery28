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

//MiddleWare needs a translator from the HTML data and Json to the server:
app.use(express.urlencoded({extended: true})); //URL-encoded - HTML
app.use(express.json()); //Json files
// Serve Static Files (This allows the server to automatically send the files from the path we chose)
app.use(express.static(path.join(__dirname, 'public'))); // Serves form.html and other client files

const db = require('./database.js'); //inporting the database connection

// Route to serve the HTML form when a user visits the root URL: localhost:3000
app.get('/', (req, res) => {
    // send the form.html file located in the 'public' directory
    res.sendFile(path.join(__dirname, 'public', 'form.html'));
});

// it tells the server what to do when it receives a POST request at the /submit-form endpoint
app.post('/submit-form', async (req, res) =>{

    //need to create the const to get all the attributes from the form: (inside the name)
});


//...Part 4 of express:
app.listen(port, () =>{
    console.log('Server is running on port: ', port);
});
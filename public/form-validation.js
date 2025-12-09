const form1 = document.getElementById('submissionform');
const form2 = document.getElementById('uploadform'); // This is correct, as the ID is "uploadform"
const messageArea = document.getElementById('resultsMessage');

// Client-Side Validation: Quick checks to save server load (Optional, but good UX)
function clientValidate(formData) {
    const first_name = formData.get('first_name');
    const second_name = formData.get('second_name');
    const email = formData.get('email');
    const phone = formData.get('phone_number');
    const eircode = formData.get('eircode');
    const errors = [];

    // Check for 10-digit phone number (Quick check)
    if (phone && phone.length !== 10) {
        errors.push("Client Check: Phone number must be exactly 10 digits.");
    }

    // Check for names length (Quick check matching server max length of 20)
    if (first_name && first_name.length > 20) {
        errors.push("Client Check: First Name cannot exceed 20 characters.")
    }

    if (second_name && second_name.length > 20) {
        errors.push("Client Check: Second Name cannot exceed 20 characters.")
    }

    // FIXED: The original 'if' was incomplete and likely causing crashes. 
    // This is a defensive check to ensure email is present/long enough.
    if (!email || email.length < 5) {
        errors.push("Client Check: Email is required and must be valid.");
    }
    
    // Add a basic eircode length check
    if (eircode && eircode.length !== 6) {
        errors.push("Client Check: Eircode must be 6 characters long.");
    }


    return errors;
}

// Function to handle asynchronous submission for any form
function setupFormSubmission(form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Stop the default page navigation
        messageArea.innerHTML = ''; //clear the previous error message

        const formData = new FormData(form);
        const url = form.action;

        // Run client-side validation only for the single record form
        if (url === '/submit-form') {
            const clientErrors = clientValidate(formData);
            if (clientErrors.length > 0) {
                messageArea.style.color = 'orange';
                messageArea.innerHTML = 'CLIENT-SIDE ERRORS DETECTED:<ul><li>' + clientErrors.join('</li><li>') + '</li></ul>';
                return; //stop and display client errors
            }
        }

        try {
            let fetchOptions = {
                method: 'POST',
            };

            // Handle /submit-form differently than /upload-csv
            if (url === '/submit-form') {
                // 1. Convert FormData to a URL-encoded string
                const params = new URLSearchParams(formData);
                const bodyString = params.toString();

                // 2. Set the Content-Type header manually for Express middleware to parse req.body
                fetchOptions.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                
                // 3. Set the body to the string
                fetchOptions.body = bodyString;

            } else { 
                // This is the /upload-csv route: Must use FormData for files!
                fetchOptions.body = formData;
            }

            const response = await fetch(url, fetchOptions);
            
            // Parse response: Server might send JSON (errors) or plain text (success)
            const contentType = response.headers.get("content-type");
            let responseData;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Handle Success (200-299)
            if (response.ok) {
                messageArea.style.color = 'green';
                messageArea.innerHTML = responseData.message || responseData;
                form.reset();
            } else {
                messageArea.style.color = 'red';

                let displayMessage = 'ERROR: ' + (responseData.message || responseData);

                // Check for the detailed 'errors' array from the server (validation.js output)
                if (responseData.errors && Array.isArray(responseData.errors)) {
                    // Display the detailed list of server-side errors
                    displayMessage += '<br>SERVER-SIDE ERRORS:<ul><li>';
                    displayMessage += responseData.errors.join('</li><li>');
                    displayMessage += '</li></ul>';
                }

                messageArea.innerHTML = displayMessage;
            }

        } catch (error) {
            console.error('Submission error:', error);
            messageArea.style.color = 'red';
            messageArea.innerHTML = 'An unexpected network error occurred.';
        }
    });
}

// Apply the AJAX logic to both forms
setupFormSubmission(form1);
setupFormSubmission(form2);
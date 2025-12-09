//CLIENT SIDE VALIDATION UX
const form1 = document.getElementById('submissionform');
const form2 = document.getElementById('uploadform'); // This is correct, as the ID is "uploadform"
const messageArea = document.getElementById('resultsMessage');

// Client-Side Validation: Quick checks to save server load (Optional, but good UX)
function clientValidate(formData) {
    const phone = formData.get('phone_number');
    const errors = [];
    
    // Add logic here to check if the field is empty AND only run this for the single submission form
    if (formData.has('phone_number') && phone.length !== 10) {
        errors.push("Phone number must be exactly 10 digits (client check).");
    }
    
    return errors;
}

// Function to handle asynchronous submission for any form
function setupFormSubmission(form) {
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Stop the default page navigation

        const formData = new FormData(form);
        const url = form.action;

        // Run client-side validation only for the single record form
        if (url === '/submit-form') {
            const clientErrors = clientValidate(formData);
            if (clientErrors.length > 0) {
                messageArea.style.color = 'orange';
                messageArea.innerHTML = 'CLIENT-SIDE ERROR: ' + clientErrors.join('<br>');
                return; 
            }
        }

        try {
            // Send the form data to the server
            const response = await fetch(url, {
                method: 'POST',
                // fetch automatically sets the correct header for FormData, 
                // including multipart/form-data for the file upload form.
                body: formData 
            });

            // Parse response: Server might send JSON (errors) or plain text (success)
            const contentType = response.headers.get("content-type");
            let responseData;
            
            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }
            
            // Handle Success (200-299) or Failure (400-500)
            if (response.ok) { 
                messageArea.style.color = 'green';
                messageArea.innerHTML = responseData.message || responseData; 
                form.reset(); 
            } else { 
                messageArea.style.color = 'red';
                // Display validation errors or server messages
                messageArea.innerHTML = 'ERROR: ' + (responseData.message || responseData); 
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
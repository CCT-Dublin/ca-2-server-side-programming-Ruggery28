const form1 = document.getElementById('submissionform');
const form2 = document.getElementById('uploadform'); // This is correct, as the ID is "uploadform"
const messageArea = document.getElementById('resultsMessage');

function clearFieldErrors() {
    const errorSpans = document.querySelectorAll('.error-message');
    errorSpans.forEach(span => {
        span.textContent = '';
    });
}

function mapErrorsToFields(errors) {
    for (const fieldName in errors) {
        const errorSpanId = `error_${fieldName}`;
        const errorElement = document.getElementById(errorSpanId);

        if (errorElement) {
            errorElement.textContent = errors[fieldName];
        }
    }
}

// Client-Side Validation: Quick checks to save server load (Optional, but good UX)
function clientValidate(formData) {
    const first_name = formData.get('first_name');
    const second_name = formData.get('second_name');
    const email = formData.get('email');
    const phone = formData.get('phone_number');
    const eircode = formData.get('eircode');
    const errors = {};

    // Check for 10-digit phone number (Quick check)
    if (phone && phone.length !== 10) {
        errors.phone_number("Client Check: Phone number must be exactly 10 digits.");
    }

    // Check for names length (Quick check matching server max length of 20)
    if (first_name && first_name.length > 20) {
        errors.first_name("Client Check: First Name cannot exceed 20 characters.")
    }

    if (second_name && second_name.length > 20) {
        errors.second_name("Client Check: Second Name cannot exceed 20 characters.")
    }

    // This is a defensive check to ensure email is present/long enough.
    if (!email || email.length < 5) {
        errors.email("Client Check: Email is required and must be valid.");
    }

    // Add a basic eircode length check
    if (eircode && eircode.length !== 6) {
        errors.eircode("Client Check: Eircode must be 6 characters long.");
    }


    return errors;
}

// Function to handle asynchronous submission for any form
function setupFormSubmission(form) {
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Stop the default page navigation
        messageArea.innerHTML = ''; //clear the previous error message
        clearFieldErrors(); // Clear previous field-specific errors

        const formData = new FormData(form);
        const url = form.action;

        // Run client-side validation only for the single record form
        if (url === '/submit-form') {
            const clientErrors = clientValidate(formData);
            if (Object.keys(clientErrors).length > 0) { // FIX: Check if object is not empty
                // Map client errors to the field spans
                mapErrorsToFields(clientErrors);
                messageArea.style.color = '#F8B229'; // Gold/Yellow
                messageArea.innerHTML = 'CLIENT-SIDE ERRORS DETECTED. See fields for details.';
                return; //stop and display client errors
            }
        }

        try {
            let fetchOptions = {
                method: 'POST',
            };

            // Handle /submit-form differently than /upload-csv (as implemented before)
            if (url === '/submit-form') {
                const params = new URLSearchParams(formData);
                const bodyString = params.toString();

                fetchOptions.headers = {
                    'Content-Type': 'application/x-www-form-urlencoded'
                };
                
                fetchOptions.body = bodyString;

            } else { 
                fetchOptions.body = formData;
            }

            const response = await fetch(url, fetchOptions);
            
            const contentType = response.headers.get("content-type");
            let responseData;

            if (contentType && contentType.indexOf("application/json") !== -1) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Handle Success (200-299)
            if (response.ok) {
                // Success color for general message
                messageArea.style.color = '#F8B229'; 
                messageArea.innerHTML = responseData.message || responseData;
                form.reset();
            } else {
                // Set the color for error messages
                messageArea.style.color = '#F8B229'; // Use Gold/Yellow error color

                // CRITICAL FIX: Check if server returned the error OBJECT for /submit-form
                if (url === '/submit-form' && responseData.errors && typeof responseData.errors === 'object' && !Array.isArray(responseData.errors)) {
                    
                    // Display the general error message at the top
                    messageArea.innerHTML = 'SERVER ERROR: Validation has failed. See fields below for details.';
                    
                    // MAP THE ERRORS TO THE FIELDS
                    mapErrorsToFields(responseData.errors);

                } else {
                    // This handles general errors or CSV errors (which may still return an array/list)
                    let displayMessage = 'ERROR: ' + (responseData.message || responseData);
                    
                    if (responseData.errors && Array.isArray(responseData.errors)) {
                         // Display the detailed list of server-side errors for CSV or general issues
                        displayMessage += '<br>SERVER-SIDE ERRORS:<ul><li>';
                        displayMessage += responseData.errors.join('</li><li>');
                        displayMessage += '</li></ul>';
                    }

                    messageArea.innerHTML = displayMessage;
                }
            }

        } catch (error) {
            console.error('Submission error:', error);
            messageArea.style.color = '#F8B229';
            messageArea.innerHTML = 'An unexpected network error occurred.';
        }
    });
}

// Apply the AJAX logic to both forms
setupFormSubmission(form1);
setupFormSubmission(form2);
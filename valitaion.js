// method to validate the form before submission
document.addEventListener('DOMContentLoaded', function() {
    // Get a reference to the form element using its ID from form.html
    const form = document.getElementById('submissionForm');
    
    // Attach an event listener to the form's 'submit' event
    form.addEventListener('submit', function(event) {
        
        // Call the main validation function
        if (!validateFormData()) {
            // If validateForm() returns false (meaning validation failed),
            // this line stops the form from performing its default action, 
            // which is sending the POST request to the server.
            event.preventDefault(); 
        }
    });
});

function validateFormData({first_name, second_name, email, phone_number, eircode}){

    // Regex is used for enforcing character rules and specific formats
    const nameRegex = /^[a-zA-Z0-9]{1,10}$/; // Alphanumeric (1 to 20 characters)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; //checking email format
    const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits
    const eircodeRegex = /^[0-9]{1}[a-zA-Z0-9]{5}$/; // Starts with 1 digit, followed by 5 alphanumeric

    if(!nameRegex.test(first_name) || !nameRegex.test(second_name)){
        error.push("Names must be alphanumeric and contains a maximum of 20 characters.")
    }

    if(!emailRegex.test(email)){
        error.push("Email address format is invalid.")
    }

    if(!phoneRegex.test(phone_number)){
        error.push("Phone number must be only numeric and contains exactly 10 digits.")
    }

    if(eircodeRegex.test(eircode)){
        error.push("Eircode must starts with a letter and contain 6 characters total.")
    }
}
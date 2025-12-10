//function to validate all the inputs.
function validateFormData({first_name, second_name, email, phone_number, eircode}){

    const errors = {};
    // Regex is used for enforcing character rules and specific formats
    const nameRegex = /^[a-zA-Z0-9]{1,20}$/; // Alphanumeric (1 to 20 characters)
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/; //checking email format
    const phoneRegex = /^[0-9]{10}$/; // Exactly 10 digits
    const eircodeRegex = /^[a-zA-Z0-9]{1}[a-zA-Z0-9]{5}$/; // Starts with 1 digit, followed by 5 alphanumeric

    // 1. First Name
    if (!first_name || !nameRegex.test(first_name)){
        errors.first_name = "First name must be alphanumeric and contain a maximum of 20 characters."
    }
    
    // 2. Second Name
    if (!second_name || !nameRegex.test(second_name)){
        // If first_name also failed, we can merge the error message, but for clarity, we'll keep them separate or target second_name key
        errors.second_name = "Second name must be alphanumeric and contain a maximum of 20 characters."
    }

    // 3. Email
    if (!email || !emailRegex.test(email)){
        errors.email = "Email address format is invalid."
    }

    // 4. Phone Number
    if (!phone_number || !phoneRegex.test(phone_number)){
        errors.phone_number = "Phone number must be only numeric and contains exactly 10 digits."
    }

    // 5. Eircode
    if (!eircode || !eircodeRegex.test(eircode)){
        errors.eircode = "Eircode must be 6 characters total, starting with an alphanumeric character."
    }

    return errors;
}

//function to clean and replace simbols that can prevent XSS attacks
function sanitize(input) {
    if (typeof input !== 'string'){
        return input; //handle non-string inputs safely
    }

    let sanitized_input = input;

    sanitized_input = sanitized_input.replace(/&/g, '&amp;');    // Replace ampersands
    // Replace less-than and greater-than signs
    sanitized_input = sanitized_input.replace(/</g, '&lt;');
    sanitized_input = sanitized_input.replace(/>/g, '&gt;'); 
    // Replace quotes
    sanitized_input = sanitized_input.replace(/"/g, '&quot;');
    sanitized_input = sanitized_input.replace(/'/g, '&#39;'); 

    return sanitized_input; 
}


module.exports = {
    validateFormData : validateFormData,
    sanitize : sanitize
};

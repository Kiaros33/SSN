const passwordValidator = require('password-validator');

// Create a schema
const pValidator = new passwordValidator();

// Add properties to it
pValidator
.is().min(6)                                    // Minimum length 6
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits()                                 // Must have digits
.has().not().spaces()                           // Should not have spaces

module.exports =  pValidator;
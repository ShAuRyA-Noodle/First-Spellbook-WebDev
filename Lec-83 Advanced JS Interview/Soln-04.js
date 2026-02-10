/* =========================================================
   Password Validator
   Rules:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one digit
========================================================= */

function validatePassword(password) {

    const minLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);

    return minLength && hasUppercase && hasLowercase && hasDigit;
}


/* Example usage */
console.log(validatePassword("Shaurya12")); // true
console.log(validatePassword("shaurya"));   // false
console.log(validatePassword("SHAURYA12")); // false
console.log(validatePassword("Shaurya"));   // false

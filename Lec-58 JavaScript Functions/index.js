/* =========================================================
   Function Demonstrations
   Covers:
   - Function declarations
   - Default parameters
   - Return values
   - Arrow functions
========================================================= */


/* =========================================================
   1. Greeting Function
   Demonstrates parameter usage and string concatenation
========================================================= */
function greetUser(name) {
    console.log(`Hey ${name}, you are the best person.`);
    console.log(`Hey ${name}, you are the cutest person.`);
    console.log(`Hey ${name}, you are the tallest person.`);
    console.log(`Hey ${name}, you are the most trustworthy person.`);
}

greetUser("Shaurya");


/* =========================================================
   2. Sum Function with Default Parameter
   If parameter 'c' is not provided, default value (9) is used
========================================================= */
function calculateSum(a, b, c = 9) {
    return a + b + c;
}

const result1 = calculateSum(2, 4);
console.log("Sum with default value of c:", result1);

const result2 = calculateSum(3, 5, 1);
console.log("Sum with provided value of c:", result2);


/* =========================================================
   3. Arrow Function Example
   Demonstrates modern ES6 arrow function syntax
========================================================= */
const logMessage = (value) => {
    console.log("Hello, I am Shaurya Punj using arrow function:", value);
};

logMessage(90);
logMessage(97);
logMessage(62);

/* =========================================================
   Conditional Statements Practice
   Demonstrates:
   - Logical AND (&&)
   - Logical OR (||)
   - Range checking
   - Eligibility validation
========================================================= */


/* =========================================================
   Example 1: Age Range Check (10–20)
========================================================= */
const age = 7;

if (age >= 10 && age <= 20) {
    console.log("Your age is between 10 and 20.");
} else {
    console.log("Your age is NOT between 10 and 20.");
}


/* =========================================================
   Example 2: Divisible by BOTH 2 and 3
========================================================= */
const numberCheck1 = 6;

if (numberCheck1 % 2 === 0 && numberCheck1 % 3 === 0) {
    console.log("Number is divisible by BOTH 2 and 3.");
} else {
    console.log("Number is NOT divisible by both 2 and 3.");
}


/* =========================================================
   Example 3: Divisible by EITHER 2 OR 3
========================================================= */
const numberCheck2 = 6;

if (numberCheck2 % 2 === 0 || numberCheck2 % 3 === 0) {
    console.log("Number is divisible by either 2 or 3.");
} else {
    console.log("Number is not divisible by either 2 or 3.");
}


/* =========================================================
   Example 4: Driving Eligibility Check
========================================================= */
const drivingAge = 17;

if (drivingAge >= 18) {
    console.log("You are eligible to drive.");
} else {
    console.log("You are NOT eligible to drive.");
}

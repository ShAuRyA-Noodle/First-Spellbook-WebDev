/* =========================================================
   Lecture 02 – Conditional Logic and Operators
   Demonstrates:
   - Exponentiation operator (**)
   - Conditional statements (if / else if / else)
   - Logical operators
   - Comparison operators
========================================================= */

console.log("Hello, I am Shaurya Punj — Lecture 02");

/* =========================================================
   Exponentiation Example
   Calculates: age raised to the power of exponentValue
========================================================= */
const age = 9;
const exponentValue = 2;

const powerResult = age ** exponentValue;
console.log("Exponentiation result:", powerResult);


/* =========================================================
   Driving Eligibility Check
========================================================= */
if (age >= 18) {
    console.log("You can drive and are eligible to vote.");
} else {
    console.log("You are still a minor.");
}


/* =========================================================
   Grade Evaluation Logic
========================================================= */
const marks = 50;

if (marks >= 80 && marks <= 99) {
    console.log("You have achieved Grade A.");
}
else if (marks === 100) {
    console.log("You have achieved Grade A+.");
}
else if (marks >= 60 && marks <= 79) {
    console.log("You have achieved Grade B.");
}
else {
    console.log("You have failed this course.");
}


/* =========================================================
   Operator Notes
   ===  : strict equality (value + type)
   !==  : strict inequality
   ?:   : ternary operator (short-form conditional)
========================================================= */

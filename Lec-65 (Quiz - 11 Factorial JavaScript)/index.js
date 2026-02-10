/* =========================================================
   Factorial Calculator
   Demonstrates:
   - Factorial using loop
   - Factorial using reduce()
========================================================= */

/* =========================================================
   User Input
========================================================= */
const inputNumber = Number(prompt("Enter the number:"));


/* =========================================================
   Method 1: Factorial Using Loop
========================================================= */
let factorial = 1;

for (let i = 1; i <= inputNumber; i++) {
    factorial *= i;
}


/* =========================================================
   Method 2: Factorial Using Array + reduce()
========================================================= */
const numberArray = Array.from({ length: inputNumber }, (_, i) => i + 1);

const factorialUsingReduce = numberArray.reduce((acc, value) => acc * value, 1);


/* =========================================================
   Output
========================================================= */
alert(`Factorial using loop: ${factorial}`);
alert(`Factorial using reduce(): ${factorialUsingReduce}`);

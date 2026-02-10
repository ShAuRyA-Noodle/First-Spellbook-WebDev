/* =========================================================
   Faulty Calculator (10% error probability)
   Accepts user input and intentionally produces incorrect
   results 10% of the time using faulty operator mapping.
========================================================= */

/* =========================================================
   User Input
========================================================= */
const firstNumber = Number(prompt("Enter your first number:"));
const secondNumber = Number(prompt("Enter your second number:"));
let operator = prompt("Enter operator (+, -, *, /):");


/* =========================================================
   Correct Operations Mapping
========================================================= */
const operations = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => a / b
};


/* =========================================================
   Faulty Operations Mapping (10% probability)
========================================================= */
const faultyOperatorMap = {
    "+": "*",
    "*": "+",
    "-": "/",
    "/": "**"
};


/* =========================================================
   Random Failure Logic
========================================================= */
const randomValue = Math.random();

if (randomValue < 0.1) {
    operator = faultyOperatorMap[operator];
    alert("⚠ Faulty calculation occurred!");
}


/* =========================================================
   Result Calculation
========================================================= */
const result = operations[operator]
    ? operations[operator](firstNumber, secondNumber)
    : eval(`${firstNumber} ${operator} ${secondNumber}`); // handles **

alert(`The result is ${result}`);

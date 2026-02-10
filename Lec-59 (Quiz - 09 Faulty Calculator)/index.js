/* =========================================================
   Faulty Calculator Simulation
   This calculator intentionally produces incorrect results
   10% of the time to simulate system malfunction.

   Fault Mapping:
   +  → *
   *  → +
   -  → /
   /  → **
========================================================= */


/* =========================================================
   Correct Operations
========================================================= */
const operations = {
    add: (a, b) => a + b,
    multiply: (a, b) => a * b,
    subtract: (a, b) => a - b,
    divide: (a, b) => a / b
};


/* =========================================================
   Faulty Operations Mapping
========================================================= */
const faultyOperations = {
    add: (a, b) => a * b,
    multiply: (a, b) => a + b,
    subtract: (a, b) => a / b,
    divide: (a, b) => a ** b
};


/* =========================================================
   Input Values
========================================================= */
const a = 1;
const b = 2;

/* Random failure generator (10% chance) */
const isFaulty = Math.random() < 0.1;


/* =========================================================
   Execution Logic
========================================================= */
const selectedOperations = isFaulty ? faultyOperations : operations;

const results = {
    sum: selectedOperations.add(a, b),
    product: selectedOperations.multiply(a, b),
    difference: selectedOperations.subtract(a, b),
    division: selectedOperations.divide(a, b)
};


/* =========================================================
   Output Results
========================================================= */
if (isFaulty) {
    console.log("⚠ Faulty calculation occurred (10% probability)");
} else {
    console.log("✓ Normal calculation executed");
}

console.log("Sum:", results.sum);
console.log("Product:", results.product);
console.log("Difference:", results.difference);
console.log("Division:", results.division);

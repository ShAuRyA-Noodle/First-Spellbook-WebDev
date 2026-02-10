/* =========================================================
   Error Handling Demonstration
   Covers:
   - Type validation
   - Throwing custom errors
   - try / catch / finally behavior
========================================================= */

/* Example input (normally from prompt) */
let a = 9;
let b = 6;

/* =========================================================
   Validate inputs
========================================================= */
if (isNaN(a) || isNaN(b)) {
    throw new SyntaxError("Invalid input: values must be numeric.");
}

/* =========================================================
   Correct numeric conversion
========================================================= */
const sum = Number(a) + Number(b);
console.log("Correct sum:", sum);


/* =========================================================
   try-catch example (Reference Error demonstration)
========================================================= */
try {
    // 'x' is intentionally undefined to trigger error
    console.log("Attempting operation:", sum * x);
} catch (error) {
    console.log("Error caught:", error.message);
}


/* =========================================================
   finally block demonstration
========================================================= */
function main() {
    let z = 2;

    try {
        console.log("Safe operation result:", sum * z);
        return true;
    } catch (error) {
        console.log("Unexpected error:", error.message);
        return false;
    } finally {
        /*
           finally block ALWAYS executes,
           even if return is triggered above
        */
        console.log("Cleanup tasks executed (finally block).");
    }
}

/* Run function */
const result = main();
console.log("Function returned:", result);

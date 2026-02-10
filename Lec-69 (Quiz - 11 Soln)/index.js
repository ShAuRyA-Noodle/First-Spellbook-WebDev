/* =========================================================
   Factorial Calculation Using Array.from() + reduce()
   Demonstrates:
   - Creating numeric sequence dynamically
   - Using reduce() for factorial computation
========================================================= */

function factorial(number) {

    /*
       Create array: [0, 1, 2, 3, ..., number]
    */
    const numberArray = Array.from({ length: number + 1 }, (_, i) => i);

    /*
       Remove 0 to avoid multiplication by 0
    */
    const sequence = numberArray.slice(1);

    /*
       Calculate factorial using reduce
    */
    const result = sequence.reduce((accumulator, value) => {
        return accumulator * value;
    }, 1);

    return result;
}

/* =========================================================
   Function Call
========================================================= */
const factorialResult = factorial(6);
console.log("Factorial:", factorialResult);

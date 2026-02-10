/* =========================================================
   JavaScript Loop Demonstrations
   Types covered:
   - for loop
   - for...in loop
   - for...of loop
   - while loop
   - do...while loop
========================================================= */


/* =========================================================
   1. Standard for Loop
   Executes a fixed number of iterations
========================================================= */
let baseValue = 1;

for (let i = 0; i < 10; i++) {
    console.log(baseValue + i);
}


/* =========================================================
   2. for...in Loop
   Used to iterate over object keys
========================================================= */
const student = {
    name: "Shaurya Punj",
    role: "Student",
    college: "Thapar"
};

for (const key in student) {
    const value = student[key];
    console.log(key, value);
}


/* =========================================================
   3. for...of Loop
   Used to iterate over iterable data structures such as
   arrays, strings, maps, etc.
========================================================= */
for (const character of "Shaurya") {
    console.log(character);
}


/* =========================================================
   4. while Loop
   Executes while the condition remains true
========================================================= */
let counter = 9;

while (counter < 12) {
    console.log("Shaurya Punj is a great boy");
    counter++;
}


/* =========================================================
   5. do...while Loop
   Executes at least once before checking the condition
========================================================= */
let g = 90;

do {
    console.log(g);
    g++;
} while (g < 10);

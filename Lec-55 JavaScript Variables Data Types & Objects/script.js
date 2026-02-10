/* =========================================================
   JavaScript Variables and Data Types Demonstration
   Covers:
   - Primitive data types
   - Object manipulation
   - typeof operator
   - Best practices for variable declaration
========================================================= */

/* =========================================================
   String + Number Concatenation Example
========================================================= */
const labelText = "Entered number is: ";
const numericValue = 88;

const combinedResult = labelText + numericValue;

console.log(combinedResult);
console.log("Type of result:", typeof combinedResult);


/* =========================================================
   Object Declaration Example
   const prevents reassignment of the object reference,
   but object properties can still be modified.
========================================================= */
const userAccount = {
    username: "killerops",
    password: "securePassword"
};

console.log("Initial object:", userAccount);

/* Adding a new property dynamically */
userAccount.city = "Delhi";

console.log("Updated object:", userAccount);


/* =========================================================
   Variable Declaration Demonstration
========================================================= */
const a = 10;
const b = 93;
const c = "Shaurya Punj";

console.log("Sum:", a + b);
console.log("Data types:", typeof a, typeof b, typeof c);


/* =========================================================
   Primitive Data Types Example
========================================================= */
let x = "Shaurya is good"; // string
let y = 19;                // number
let w = 3.98;              // number
const p = true;            // boolean
let q = undefined;         // undefined
let s = null;              // null

console.log(x, y, w, p, q, s);
console.log(
    typeof x,
    typeof y,
    typeof w,
    typeof p,
    typeof q,
    typeof s
);


/* =========================================================
   Object with Multi-word Property Name
========================================================= */
const profile = {
    name: "Shaurya Punj",
    "job position": "Student"
};

console.log("Profile object:", profile);

/* Adding new property */
profile.weight = "100kg";

console.log("Updated profile:", profile);


/* =========================================================
   Final Log
========================================================= */
console.log("JavaScript variable and data types demo completed.");

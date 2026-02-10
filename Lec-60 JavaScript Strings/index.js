/* =========================================================
   JavaScript String Operations Demonstration
   Covers:
   - String indexing
   - Length property
   - Template literals
   - String methods (toUpperCase, slice, replace, concat)
========================================================= */

/* =========================================================
   Basic String Declaration
========================================================= */
const fullName = "Shaurya Punj";

console.log(fullName);

/*
   Accessing character at index 4
   (Indexing starts from 0 in JavaScript)
*/
console.log("Character at index 4:", fullName[4]);

/* String length */
console.log("String length:", fullName.length);


/* =========================================================
   Template Literal Example
========================================================= */
const personName = "Vasu Gupta";
const relationName = "Dhingra";

console.log(`His name is ${personName} and his bhabhi is ${relationName}`);


/* =========================================================
   String Method Demonstrations
========================================================= */
const sampleText = "Shreya";

/* Converts string to uppercase */
console.log("Uppercase:", sampleText.toUpperCase());

/*
   slice(start, end)
   - start index included
   - end index excluded
*/
console.log("Slice (1,4):", sampleText.slice(1, 4));

/*
   replace(oldValue, newValue)
   Replaces the first occurrence of the specified substring
*/
console.log("Replace example:", fullName.replace("rya", "673"));

/*
   concat()
   Joins multiple strings together
*/
console.log("Concatenated string:", fullName.concat(" ", sampleText, " Punj"));

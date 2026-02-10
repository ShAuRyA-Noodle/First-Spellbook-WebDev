/* =========================================================
   JavaScript Arrays Demonstration
   Covers:
   - Array modification
   - Array methods
   - delete operator behavior
========================================================= */

/* =========================================================
   Array Initialization
========================================================= */
let numbers = [1, 2, 3, 5, 6];

/*
   Arrays in JavaScript are objects and can store
   multiple data types simultaneously.
*/
numbers[0] = 69;              // Updating value
numbers[4] = "Shaurya";       // Storing different data type

console.log("Updated array:", numbers);


/* =========================================================
   Convert Array to String
========================================================= */
console.log("Array as string:", numbers.toString());

/*
   join() replaces the default comma separator
*/
console.log("Joined array:", numbers.join(" & "));


/* =========================================================
   Adding and Removing Elements
========================================================= */
numbers.push(100);            // Adds element at end
numbers.pop();                // Removes last element

numbers.unshift(500);         // Adds element at beginning
numbers.shift();              // Removes first element


/* =========================================================
   delete Operator
   Removes element but DOES NOT change array length.
   The index becomes undefined.
========================================================= */
delete numbers[0];

console.log("After delete operation:", numbers);
console.log("Value at index 0:", numbers[0]);
console.log("Array length remains:", numbers.length);

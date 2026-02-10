/* =========================================================
   JavaScript Array Methods Demonstration
   Covers:
   - concat()
   - sort()
   - splice()
   - slice()
   - reverse()
========================================================= */


/* =========================================================
   concat() – Combine Multiple Arrays
   Does NOT modify original arrays
========================================================= */
const arr1 = [2, 1, 3];
const arr2 = [4, 5, 6];
const arr3 = [10, 11, 12];

const combinedArray = arr1.concat(arr2, arr3);
console.log("Combined array:", combinedArray);


/* =========================================================
   sort() – Sort Elements
   Note: Default sorting is lexicographical (string-based)
========================================================= */
console.log("Sorted arr1:", arr1.sort());


/* =========================================================
   splice() – Remove Elements
   splice(startIndex, deleteCount)
   Modifies the original array
========================================================= */
let numbers = [2, 3, 4, 5, 6, 7, 77, 81];

console.log("Removed elements:", numbers.splice(1, 2));
console.log("Array after splice:", numbers);


/* =========================================================
   splice() – Remove + Insert Elements
   splice(startIndex, deleteCount, newItems...)
========================================================= */
let arr = [2, 3, 4, 5, 6, 8];

console.log("Removed elements:", arr.splice(1, 2, 69, 98));
console.log("Updated array:", arr);


/* =========================================================
   slice() – Create New Array Portion
   Does NOT modify original array
========================================================= */
console.log("Slice from index 2:", arr.slice(2));
console.log("Slice from index 1 to 3:", arr.slice(1, 3));


/* =========================================================
   reverse() – Reverse Array Order
   Modifies the original array
========================================================= */
console.log("Reversed array:", arr.reverse());

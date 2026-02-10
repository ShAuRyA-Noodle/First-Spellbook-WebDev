/* =========================================================
   JavaScript Iteration & Array Transformation Methods
   Covers:
   - for loop
   - forEach
   - for...of
   - map()
   - filter()
   - reduce()
   - Array.from()
========================================================= */

const numbers = [1, 17, 6, 3, 12, 7];

/* =========================================================
   Create New Array Using Traditional Loop (Square values)
========================================================= */
let squaredArray = [];

for (let i = 0; i < numbers.length; i++) {
    squaredArray.push(numbers[i] ** 2);
}

console.log("Squared array (loop):", squaredArray);


/* =========================================================
   Using map() – Preferred Functional Method
========================================================= */
const squaredUsingMap = numbers.map(value => value ** 2);
console.log("Squared array (map):", squaredUsingMap);


/* =========================================================
   filter() – Select Values Matching Condition
========================================================= */
const greaterThan100 = value => value > 100;

console.log("Filtered (>100):", squaredUsingMap.filter(greaterThan100));


/* =========================================================
   reduce() – Convert Array to Single Value
   Example: Product of all numbers
========================================================= */
const values = [1, 2, 3, 4, 5, 6];

const multiplyReducer = (accumulator, currentValue) => {
    return accumulator * currentValue;
};

console.log("Product of array:", values.reduce(multiplyReducer));


/* =========================================================
   Array.from() – Convert Iterable to Array
========================================================= */
const nameArray = Array.from("Shaurya Punj");
console.log("Array from string:", nameArray);

/* =========================================================
   Sum Selector
   Sums numbers in array until a negative number is found
========================================================= */

function sumUntilNegative(arr) {

    let sum = 0;

    for (const num of arr) {
        if (num < 0) {
            break;   // stop when negative number encountered
        }
        sum += num;
    }

    return sum;
}


/* Example usage */
console.log(sumUntilNegative([5, 10, 3, -2, 8, 9])); // 18
console.log(sumUntilNegative([1, 2, 3, 4]));         // 10

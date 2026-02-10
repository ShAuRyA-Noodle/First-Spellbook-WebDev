/* =========================================================
   Double Trouble Function
========================================================= */

function doubleTrouble(arr) {

    const result = [];

    for (let i = 0; i < arr.length; i++) {

        /* If current element equals previous element
           do NOT double (consecutive duplicate case) */
        if (i > 0 && arr[i] === arr[i - 1]) {
            result.push(arr[i]);
        } 
        else {
            result.push(arr[i] * 2);
        }
    }

    return result;
}


/* Example usage */
const numbers = [2, 2, 3, 4, 4, 4, 5];

console.log(doubleTrouble(numbers));

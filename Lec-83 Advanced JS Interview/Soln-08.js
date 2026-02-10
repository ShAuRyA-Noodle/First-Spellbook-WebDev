/* =========================================================
   Async Array Mapping
   Returns an array of Promises where each number is doubled
   after 500ms delay
========================================================= */

function asyncDoubleArray(numbers) {

    return numbers.map(num => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(num * 2);
            }, 500);
        });
    });
}


/* Example usage */
const nums = [1, 2, 3, 4];

const promises = asyncDoubleArray(nums);

/* To get final values */
Promise.all(promises).then(result => {
    console.log(result); // [2, 4, 6, 8]
});

/* =========================================================
   Mirror Mirror Function
   Appends reversed string to original string
========================================================= */

function mirrorString(str) {

    /* Reverse string */
    const reversed = str.split("").reverse().join("");

    /* Append reversed version */
    return str + reversed;
}


/* Example usage */
console.log(mirrorString("hello"));   // "helloolleh"
console.log(mirrorString("Shaurya")); // "ShauryayruauhS"

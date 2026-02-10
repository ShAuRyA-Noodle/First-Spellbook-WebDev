/* =========================================================
   Vowel Counter
   Counts vowels (both uppercase and lowercase)
========================================================= */

function countVowels(str) {

    const vowels = "aeiouAEIOU";
    let count = 0;

    for (const char of str) {
        if (vowels.includes(char)) {
            count++;
        }
    }

    return count;
}


/* Example usage */
console.log(countVowels("Shaurya Punj")); // 4
console.log(countVowels("HELLO WORLD"));  // 3

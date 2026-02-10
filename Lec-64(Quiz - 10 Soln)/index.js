/* =========================================================
   Random Brand Name Generator
   Generates a name using:
   - Adjectives
   - Business categories
   - Suffixes
========================================================= */

/* =========================================================
   Word Lists
========================================================= */
const adjectives = ["Crazy", "Amazing", "Fire"];
const businessTypes = ["Engine", "Foods", "Garments"];
const suffixes = ["Bros", "Limited", "Hub"];


/* =========================================================
   Utility Function: Select Random Element
========================================================= */
function getRandomElement(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}


/* =========================================================
   Generate Brand Name
========================================================= */
const first = getRandomElement(adjectives);
const second = getRandomElement(businessTypes);
const third = getRandomElement(suffixes);

console.log(`${first} ${second} ${third}`);

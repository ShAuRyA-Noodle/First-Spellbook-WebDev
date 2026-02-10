/* =========================================================
   SaaS Brand Name Generator
   Randomly generates a company / product name using:
   - Adjectives
   - Shop Categories
   - Extra Suffixes
========================================================= */

/* =========================================================
   Word Lists
========================================================= */
const adjectives = ["Crazy", "Amazing", "Fire"];
const shopNames = ["Engine", "Foods", "Garments"];
const extras = ["Bros", "Limited", "Hub"];


/* =========================================================
   Utility Function: Random Element Picker
========================================================= */
function getRandomItem(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}


/* =========================================================
   Name Generation Logic
========================================================= */
function generateBrandName() {
    const adjective = getRandomItem(adjectives);
    const shop = getRandomItem(shopNames);
    const extra = getRandomItem(extras);

    return `${adjective} ${shop} ${extra}`;
}


/* =========================================================
   Output Generated Name
========================================================= */
const brandName = generateBrandName();
console.log("Generated Brand Name:", brandName);

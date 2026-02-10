/* =========================================================
   Random Background Color Generator for All Boxes
========================================================= */

console.log("Shaurya Punj");

/* Select all elements with class 'box' */
const boxes = document.querySelectorAll(".box");

/* =========================================================
   Utility Function: Generate Random Integer Between Range
========================================================= */
function getRandomInt(min, max) {
    return Math.floor(min + Math.random() * (max - min + 1));
}

/* =========================================================
   Utility Function: Generate Random RGB Color
========================================================= */
function getRandomColor() {
    const r = getRandomInt(0, 255);
    const g = getRandomInt(0, 255);
    const b = getRandomInt(0, 255);

    return `rgb(${r}, ${g}, ${b})`;
}

/* =========================================================
   Apply Random Color to Each Box
========================================================= */
boxes.forEach(box => {
    box.style.backgroundColor = getRandomColor();
    // box.style.color = getRandomColor(); // optional text color
});

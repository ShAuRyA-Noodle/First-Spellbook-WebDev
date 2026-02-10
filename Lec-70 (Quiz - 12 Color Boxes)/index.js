/* =========================================================
   Random Color Generator for Boxes
   Applies a random background color to each box element
========================================================= */

/* Select all boxes */
const boxes = document.getElementsByClassName("box");

/* Available colors */
const colors = ["aqua", "pink", "crimson", "orange", "yellow"];

/* Utility function to pick random color */
function getRandomColor() {
    const index = Math.floor(Math.random() * colors.length);
    return colors[index];
}

/* Apply random color to each box */
for (let i = 0; i < boxes.length; i++) {
    boxes[i].style.backgroundColor = getRandomColor();
}

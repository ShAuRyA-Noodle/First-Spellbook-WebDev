/* =========================================================
   Event Bubbling Demonstration
========================================================= */

const child = document.querySelector(".child");
const childContainer = document.querySelector(".childcontainer");
const container = document.querySelector(".container");
const button = document.getElementById("btn");
const box = document.querySelector(".box");

/* Child click */
child.addEventListener("click", (e) => {
    e.stopPropagation();
    alert("Child clicked");
});

/* Child container click */
childContainer.addEventListener("click", (e) => {
    e.stopPropagation();
    alert("Child container clicked");
});

/* Parent container click */
container.addEventListener("click", (e) => {
    e.stopPropagation();
    alert("Container clicked");
});

/* =========================================================
   Random color generator
========================================================= */
function getRandomColor() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return `rgb(${r},${g},${b})`;
}

/* Change color after 5 seconds */
setTimeout(() => {
    childContainer.style.backgroundColor = getRandomColor();
}, 5000);


/* =========================================================
   Button Events
========================================================= */

button.addEventListener("click", () => {
    box.textContent = "Login clicked";
});

button.addEventListener("dblclick", () => {
    box.textContent = "Double click detected";
});

button.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    alert("Right click detected");
});


/* =========================================================
   Keyboard Event
========================================================= */
document.addEventListener("keydown", (e) => {
    console.log("Key pressed:", e.key);
});

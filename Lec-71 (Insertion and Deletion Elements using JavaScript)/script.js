/* =========================================================
   DOM Element Creation & Insertion
========================================================= */

const container = document.querySelector(".container");
const box = document.querySelector(".box");

/* Create new element */
const newDiv = document.createElement("div");
newDiv.textContent = "I love DOM manipulation";
newDiv.classList.add("created");

/* Append element */
container.append(newDiv);


/* =========================================================
   Class Manipulation
========================================================= */
console.log("Class list:", container.classList);

container.classList.add("new-class");
container.classList.remove("new-class");

/* Toggle class */
container.classList.toggle("red");


/* =========================================================
   HTML Content Access
========================================================= */
console.log("Outer HTML:", container.outerHTML);
console.log("Tag Name:", container.tagName);
console.log("Node Name:", container.nodeName);
console.log("Text Content:", container.textContent);

/* Modify inner HTML */
box.innerHTML = "Updated content via JavaScript";


/* =========================================================
   Attribute Handling
========================================================= */
console.log("Has style attribute:", box.hasAttribute("style"));
console.log("Style attribute:", box.getAttribute("style"));

box.setAttribute("style", "background-color: crimson");

console.log("All attributes:", box.attributes);

/* Remove attribute */
box.removeAttribute("style");


/* =========================================================
   Data Attributes
========================================================= */
console.log("Dataset:", box.dataset);

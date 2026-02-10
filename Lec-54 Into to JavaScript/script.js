/* =========================================================
   Console Logging
   Used for debugging and runtime inspection
========================================================= */
console.log("Shaurya Punj JavaScript initialized");
console.log("Application lifecycle logging active");

/* =========================================================
   Page Initialization Logic
   Demonstrates alert, prompt, confirm, and DOM manipulation
========================================================= */

/* Alert displayed when page loads */
alert("Parasite EVE");

/* Prompt input from user */
const userNumber = prompt("Enter your number:");
console.log("Your number is:", userNumber);

/* Confirmation dialog */
const isConfirmed = confirm("Are you sure you want to leave us?");

if (isConfirmed) {
    console.log("Hex spell deployed — destruction begins...");
} else {
    console.log("Welcome back to H3LLHOLE");
}

/* DOM Manipulation Example */
document.title = "Shaurya Punj";

/*
    Inline styling through JavaScript:
    Demonstrates dynamic UI manipulation.
*/
document.body.style.backgroundColor = "red";

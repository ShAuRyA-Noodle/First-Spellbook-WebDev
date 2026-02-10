/* =========================================================
   DOM Selection Demonstration
   Covers:
   - getElementsByClassName
   - getElementById
   - querySelector
   - querySelectorAll
   - getElementsByTagName
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================================================
       Select elements by class name
    ========================================================== */
    const boxesByClass = document.getElementsByClassName("box");
    console.log("Elements by class:", boxesByClass);

    /* =========================================================
       Select element by ID
    ========================================================== */
    const blueBox = document.getElementById("blue");
    blueBox.style.backgroundColor = "red";

    /* =========================================================
       querySelector – selects first matching element
    ========================================================== */
    document.querySelector(".box").style.borderColor = "green";

    /* =========================================================
       querySelectorAll – selects all matching elements
    ========================================================== */
    document.querySelectorAll(".box").forEach(element => {
        element.style.backgroundColor = "pink";
    });

    /* =========================================================
       Select elements by tag name
    ========================================================== */
    console.log("All div elements:", document.getElementsByTagName("div"));

});

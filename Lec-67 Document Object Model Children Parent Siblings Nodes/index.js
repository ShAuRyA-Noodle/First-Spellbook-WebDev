/* =========================================================
   DOM Traversal Demonstration
   Shows:
   - children vs childNodes
   - element selection
   - parent / sibling traversal
   - table row access
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Select container safely using ID */
    const container = document.getElementById("mainContainer");

    /* =========================================================
       Children vs ChildNodes
    ========================================================== */
    console.log("All child nodes (including text nodes):", container.childNodes);
    console.log("Only element children:", container.children);

    /* Access first and last element */
    console.log("First element child:", container.firstElementChild);
    console.log("Last element child:", container.lastElementChild);

    /* Styling examples */
    container.firstElementChild.style.backgroundColor = "red";
    container.lastElementChild.style.color = "green";

    /* Parent and sibling navigation */
    console.log("Parent element:", container.firstElementChild.parentElement);
    console.log(
        "Previous sibling of last element:",
        container.lastElementChild.previousElementSibling
    );

    /* =========================================================
       Table DOM Access
    ========================================================== */
    const table = document.getElementById("dataTable");
    console.log("Table rows:", table.rows);

});

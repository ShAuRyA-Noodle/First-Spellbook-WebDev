/* =========================================================
   Window Scroller
   Smoothly scrolls the window to the top
========================================================= */

function smoothScrollToTop() {

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* Example usage */
document.getElementById("scrollTopBtn").addEventListener("click", smoothScrollToTop);

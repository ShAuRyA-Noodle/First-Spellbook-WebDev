console.log("Shaurya Punj");
console.log("Shreya Punj");

/* =========================================================
   Utility function
========================================================= */
const fn = () => {
    console.log("I miss her");
};

/* =========================================================
   Callback function
========================================================= */
const callback = (arg) => {
    console.log("Callback executed with:", arg);
    fn();
};

/* =========================================================
   Script Loader Function (Async behavior)
========================================================= */
const loadScript = (src, callback) => {
    const script = document.createElement("script");
    script.src = src;

    /* IMPORTANT: pass function reference */
    script.onload = () => callback("Script loaded successfully");

    document.head.appendChild(script);
};

/* =========================================================
   Function call
========================================================= */
loadScript(
    "https://cdnjs.cloudflare.com/ajax/libs/prism/9000.0.1/prism.min.js",
    callback
);

/* =========================================================
   Async Sleep Utility
========================================================= */
function sleep() {
    return new Promise(resolve => {
        setTimeout(() => resolve(50), 1000);
    });
}


/* =========================================================
   Async IIFE Demonstration
========================================================= */
(async function mainAsyncDemo() {
    const a = await sleep();
    console.log("Sleep result 1:", a);

    const b = await sleep();
    console.log("Sleep result 2:", b);
})();


/* =========================================================
   Destructuring Examples
========================================================= */
(async function destructuringDemo() {

    /* Array destructuring */
    const [w, q] = [1, 60];
    console.log("Array destructuring:", w, q);

    /* Ignore extra values */
    const [t, s] = [1, 60, 70];
    console.log("Ignoring extra:", t, s);

    /* Rest operator */
    const [r, z, ...rest] = [1, 230, 70, 90, 82, 65];
    console.log("Rest operator:", r, z, rest);

    /* Object destructuring */
    const obj = {
        name: "Shaurya Punj",
        city: "Delhi"
    };

    const { name, city } = obj;
    console.log("Object destructuring:", name, city);

})();


/* =========================================================
   Spread Operator Example
========================================================= */
function add(x, y, z) {
    return x + y + z;
}

(function spreadDemo() {
    const arr = [23, 45, 1];

    console.log("Manual sum:", arr[0] + arr[1] + arr[2]);
    console.log("Function sum:", add(arr[0], arr[1], arr[2]));
    console.log("Spread sum:", add(...arr));
})();


/* =========================================================
   Hoisting Demonstration
========================================================= */
(function hoistingDemo() {
    console.log("Hoisted variable value:", a); // undefined
    var a = 80;

    /*
       If replaced with:
       let a = 80;
       → ReferenceError (temporal dead zone)
    */
})();

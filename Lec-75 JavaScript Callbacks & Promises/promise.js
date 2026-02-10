/* =========================================================
   Promise Demonstration
   Covers:
   - Promise creation
   - Promise APIs: all, allSettled, race, any
   - resolve / reject helpers
========================================================= */

/* Utility function to create random promise */
function createRandomPromise(label) {
    return new Promise((resolve, reject) => {
        const random = Math.random();

        if (random < 0.4) {
            reject(`${label} rejected`);
        } else {
            setTimeout(() => {
                console.log(`${label} resolved`);
                resolve(label);
            }, 1000);
        }
    });
}

const prom1 = createRandomPromise("Promise 1");
const prom2 = createRandomPromise("Promise 2");
const prom3 = createRandomPromise("Promise 3");


/* =========================================================
   Promise.all
   Resolves only if ALL succeed
========================================================= */
Promise.all([prom1, prom2, prom3])
    .then(res => console.log("Promise.all:", res))
    .catch(err => console.log("Promise.all error:", err));


/* =========================================================
   Promise.allSettled
   Returns result of ALL promises
========================================================= */
Promise.allSettled([prom1, prom2, prom3])
    .then(res => console.log("Promise.allSettled:", res));


/* =========================================================
   Promise.race
   First settled promise wins
========================================================= */
Promise.race([prom1, prom2, prom3])
    .then(res => console.log("Promise.race:", res))
    .catch(err => console.log("Promise.race error:", err));


/* =========================================================
   Promise.any
   First fulfilled promise wins
========================================================= */
Promise.any([prom1, prom2, prom3])
    .then(res => console.log("Promise.any:", res))
    .catch(err => console.log("Promise.any error:", err));


/* =========================================================
   Promise.resolve / Promise.reject
========================================================= */
Promise.resolve("Immediate success")
    .then(res => console.log("Promise.resolve:", res));

Promise.reject("Immediate failure")
    .catch(err => console.log("Promise.reject:", err));

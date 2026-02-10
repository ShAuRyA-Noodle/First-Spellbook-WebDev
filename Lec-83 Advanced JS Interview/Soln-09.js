/* =========================================================
   Asynchronous Shopper
   Simulates placing an order with random delay
========================================================= */

function placeOrder(orderId) {

    return new Promise((resolve, reject) => {

        /* Random delay between 1 and 3 seconds */
        const delay = Math.floor(Math.random() * 2000) + 1000;

        setTimeout(() => {
            resolve(`Order #${orderId} confirmed successfully after ${delay} ms`);
        }, delay);

    });
}


/* Example usage */
async function main() {
    console.log("Placing order...");
    const confirmation = await placeOrder(101);
    console.log(confirmation);
}

main();

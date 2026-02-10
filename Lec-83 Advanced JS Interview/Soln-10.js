/* =========================================================
   Coffee Machine Simulator
   Asynchronously brews coffee with random delay
========================================================= */

function brewCoffee(type) {

    return new Promise((resolve) => {

        /* Random delay between 1 and 4 seconds */
        const delay = Math.floor(Math.random() * 3000) + 1000;

        setTimeout(() => {
            resolve(`${type} coffee is ready! Brewed in ${delay} ms.`);
        }, delay);

    });
}


/* Example usage */
async function serveCoffee() {
    console.log("Brewing your coffee...");
    
    const message = await brewCoffee("Cappuccino");
    
    console.log(message);
}

serveCoffee();

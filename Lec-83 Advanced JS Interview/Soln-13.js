/* =========================================================
   Shopping Cart Totalizer
   Calculates total cost of items in cart
========================================================= */

function calculateTotal(products) {

    return products.reduce((total, product) => {
        return total + (product.price * product.quantity);
    }, 0);
}


/* Example usage */
const cart = [
    { name: "Laptop", price: 1000, quantity: 1 },
    { name: "Mouse", price: 50, quantity: 2 },
    { name: "Keyboard", price: 80, quantity: 1 }
];

const totalCost = calculateTotal(cart);

console.log("Total Cost:", totalCost);

/* =========================================================
   Array Filterer
   Filters products based on a given criterion
========================================================= */

function filterProducts(products, criterion) {

    /*
      criterion example:
      { category: "Electronics" }
      { price: 500 }
      { brand: "Nike" }
    */

    const key = Object.keys(criterion)[0];
    const value = criterion[key];

    return products.filter(product => product[key] === value);
}


/* Example usage */

const products = [
    { name: "Laptop", category: "Electronics", price: 1000 },
    { name: "Shoes", category: "Fashion", price: 80 },
    { name: "Phone", category: "Electronics", price: 600 }
];

const filtered = filterProducts(products, { category: "Electronics" });

console.log(filtered);

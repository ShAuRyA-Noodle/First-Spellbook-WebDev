/* ------------------------------------------------------------------
   MongoDB Playground — Course Collection Seed Script
   ------------------------------------------------------------------

   Purpose:
   - Select the target database
   - Insert sample product/course documents into the `Course` collection
   - Maintain consistent schema structure for production readiness

   Best Practices Applied:
   - Prices stored as numeric values for query efficiency
   - Consistent field naming conventions
   - Clean seed-data format for repeatable database initialization
   ------------------------------------------------------------------ */

// Select database
use('SigmaDatabase');

// Insert sample documents
db.getCollection('Course').insertMany([
  { _id: "67f4c02011de4153d749e338", name: "MacBook Pro 14", price: 200000, instructor: "Shaurya Punj" },
  { _id: "67f4c02011de4153d749e339", name: "iPad 10th Gen", price: 29000, instructor: "Ananya Sharma" },
  { _id: "67f4c02011de4153d749e340", name: "MacBook Air M1", price: 85000, instructor: "Rohan Verma" },
  { _id: "67f4c02011de4153d749e341", name: "MacBook Pro M2", price: 125000, instructor: "Mehak Kapoor" },
  { _id: "67f4c02011de4153d749e342", name: "Dell Inspiron 15", price: 55000, instructor: "Rajeev Yadav" },
  { _id: "67f4c02011de4153d749e343", name: "HP Pavilion x360", price: 62000, instructor: "Nikita Bansal" },
  { _id: "67f4c02011de4153d749e344", name: "Lenovo IdeaPad Flex", price: 48000, instructor: "Arjun Mehta" },
  { _id: "67f4c02011de4153d749e345", name: "Samsung Galaxy Tab S9", price: 58000, instructor: "Divya Sheoran" },
  { _id: "67f4c02011de4153d749e346", name: "Asus ROG Zephyrus", price: 145000, instructor: "Aayush Rana" },
  { _id: "67f4c02011de4153d749e347", name: "Acer Swift 5", price: 67000, instructor: "Tanvi Deshmukh" },
  { _id: "67f4c02011de4153d749e348", name: "iPad Air 5th Gen", price: 58000, instructor: "Gaurav Singh" },
  { _id: "67f4c02011de4153d749e349", name: "Microsoft Surface Go 3", price: 42000, instructor: "Pooja Nair" },
  { _id: "67f4c02011de4153d749e350", name: "Realme Pad X", price: 19999, instructor: "Sahil Thakur" },
  { _id: "67f4c02011de4153d749e351", name: "Xiaomi Pad 6", price: 26999, instructor: "Ishita Dey" },
  { _id: "67f4c02011de4153d749e352", name: "Amazon Fire HD 10", price: 15000, instructor: "Yuvraj Sinha" }
]);

console.log('Course seed data inserted successfully.');

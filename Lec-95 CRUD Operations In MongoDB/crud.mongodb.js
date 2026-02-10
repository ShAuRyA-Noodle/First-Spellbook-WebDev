/* ------------------------------------------------------------------
   MongoDB CRUD Operations — Users Collection
   ------------------------------------------------------------------

   This script demonstrates the complete CRUD workflow:
   - CREATE   : Insert documents into a collection
   - READ     : Retrieve documents using queries
   - UPDATE   : Modify existing documents
   - DELETE   : Remove documents from the collection

   Best Practices Applied:
   - Consistent field naming
   - Structured CRUD sectioning
   - Clear logging for query results
   ------------------------------------------------------------------ */

// Select database
use('CrudDB');

console.log('Connected Database:', db.getName());

/* ---------------------------- CREATE ---------------------------- */

// Create collection
db.createCollection("Users");

// Insert a single document
db.Users.insertOne({
  name: "John Doe",
  age: 30,
  kills: 299
});

// Insert multiple documents
db.Users.insertMany([
  { name: "Shaurya Punj", age: 30, kills: 987 },
  { name: "Alice Smith", age: 27, kills: 312 },
  { name: "Robert King", age: 35, kills: 280 },
  { name: "Nina Patel", age: 24, kills: 265 },
  { name: "Carlos Rivera", age: 29, kills: 301 },
  { name: "Emily Chen", age: 30, kills: 287 },
  { name: "Aarav Mehta", age: 26, kills: 319 },
  { name: "Fatima Noor", age: 28, kills: 276 },
  { name: "Jake Thompson", age: 31, kills: 334 },
  { name: "Sakura Tanaka", age: 23, kills: 245 }
]);

/* ----------------------------- READ ----------------------------- */

// Find users aged 30
const usersAge30 = db.Users.find({ age: 30 }).toArray();
console.log('Users aged 30:', usersAge30);

// Find users with specific kills value
const killsQuery = db.Users.find({ kills: 299 });
console.log('Cursor result:', killsQuery);

// Count matching documents
console.log('Matching document count:', db.Users.countDocuments({ kills: 299 }));

// Find single document
const singleUser = db.Users.findOne({ kills: 299 });
console.log('Single user:', singleUser);

/* ---------------------------- UPDATE ---------------------------- */

// Update single document
db.Users.updateOne(
  { kills: 299 },
  { $set: { kills: 500 } }
);

// Update multiple documents
db.Users.updateMany(
  { kills: 500 },
  { $set: { kills: 1000 } }
);

/* ---------------------------- DELETE ---------------------------- */

// Delete multiple documents (example)
db.Users.deleteMany({});

/* ------------------------------------------------------------------
   CRUD operations completed
   ------------------------------------------------------------------ */
console.log('CRUD operations executed successfully.');

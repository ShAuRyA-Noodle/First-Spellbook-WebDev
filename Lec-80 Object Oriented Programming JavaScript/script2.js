/* =========================================================
   Encapsulation Example using Getters and Setters
========================================================= */

class User {

    constructor(name) {
        this.name = name; // Calls setter automatically
    }

    /* Getter */
    get name() {
        return this._name;
    }

    /* Setter with validation */
    set name(value) {
        if (value.length < 4) {
            console.log("Name must be at least 4 characters long.");
            return;
        }
        this._name = value;
    }
}


/* =========================================================
   Object Creation
========================================================= */
const user1 = new User("Shaurya Punj");
console.log("User1 name:", user1.name);

const user2 = new User("Trit");   // valid (length = 4)
console.log("User2 name:", user2.name);

/* Invalid example */
const user3 = new User("Tom");    // too short
console.log("User3 name:", user3.name);  // undefined because setter rejected

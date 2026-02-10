/* =========================================================
   Objects and Prototypes
========================================================= */

const baseAnimal = {
    eats: true
};

const rabbit = {
    jumps: true
};

/* Set prototype safely (recommended over __proto__) */
Object.setPrototypeOf(rabbit, baseAnimal);

console.log("Rabbit object:", rabbit);
console.log("Rabbit can eat (inherited):", rabbit.eats);


/* =========================================================
   Base Class: Animal
========================================================= */
class Animal {

    constructor(name) {
        this.name = name;
        console.log("Animal created:", name);
    }

    eats() {
        console.log(`${this.name} is eating.`);
    }

    jumps() {
        console.log(`${this.name} is jumping.`);
    }

    hunts() {
        console.log(`${this.name} is hunting.`);
    }
}

/* Create instance */
const cat = new Animal("Kitty");
console.log(cat.name);
cat.eats();


/* =========================================================
   Child Class: PetAnimal (Inheritance)
========================================================= */
class PetAnimal extends Animal {

    constructor(name) {
        super(name); // Call parent constructor
    }

    /* Method overriding */
    eats() {
        super.eats(); // Call parent method
        console.log(`${this.name} enjoys premium pet food.`);
    }

    socialize() {
        console.log(`${this.name} is socializing.`);
    }
}

/* Create child instance */
const dog = new PetAnimal("Bruno");

dog.eats();
dog.socialize();


/* =========================================================
   instanceof Operator
========================================================= */
console.log("dog instanceof PetAnimal:", dog instanceof PetAnimal);
console.log("dog instanceof Animal:", dog instanceof Animal);

/* =========================================================
   Magical Sorting Hat
   Assigns students to houses based on name length
========================================================= */

function sortStudents(studentNames) {

    const result = {
        Gryffindor: [],
        Hufflepuff: [],
        Ravenclaw: [],
        Slytherin: []
    };

    studentNames.forEach(name => {
        const length = name.length;

        if (length < 6) {
            result.Gryffindor.push(name);
        }
        else if (length < 8) {
            result.Hufflepuff.push(name);
        }
        else if (length < 12) {
            result.Ravenclaw.push(name);
        }
        else {
            result.Slytherin.push(name);
        }
    });

    return result;
}


/* Example usage */
const students = [
    "Harry",
    "Hermione",
    "Christopher",
    "Luna",
    "AlexanderTheGreat"
];

console.log(sortStudents(students));

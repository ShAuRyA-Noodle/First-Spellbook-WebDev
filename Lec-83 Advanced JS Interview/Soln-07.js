/* =========================================================
   Local Storage Manager
   Saves note object into browser localStorage
========================================================= */

function saveNoteToLocalStorage(note) {

    /*
       Convert note object into JSON string
       because localStorage stores only strings
    */
    const noteString = JSON.stringify(note);

    /*
       Save using a unique key
       (example: timestamp-based key)
    */
    const key = `note_${Date.now()}`;

    localStorage.setItem(key, noteString);

    console.log("Note saved with key:", key);
}


/* Example usage */
const note = {
    title: "Meeting Notes",
    content: "Discuss project roadmap",
    date: new Date().toISOString()
};

saveNoteToLocalStorage(note);

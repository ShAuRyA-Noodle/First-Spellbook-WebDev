/* =========================================================
   Hacking Terminal Simulator
========================================================= */

const messages = [
    "Initializing hacking",
    "Reading your files",
    "Password files detected",
    "Uploading data to server",
    "Cleaning up"
];

const terminal = document.getElementById("terminal");

/* Random delay generator (1–7 sec) */
function randomDelay(){
    return (Math.floor(Math.random()*7)+1)*1000;
}

/* Add line to terminal */
function addLine(text){
    const line = document.createElement("div");
    line.className = "line dots";
    line.textContent = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

/* Async sequence execution */
async function runSimulation(){
    for(const msg of messages){
        await new Promise(res => setTimeout(res, randomDelay()));
        addLine(msg);
    }
}

runSimulation();

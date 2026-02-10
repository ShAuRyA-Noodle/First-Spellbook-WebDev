/* =========================================================
   Function: createCard
   Dynamically creates a video card
========================================================= */

function createCard(title, channel, views, monthsOld, duration, thumbnail) {

    /* Convert views into readable format */
    if (views >= 1000000) {
        views = (views / 1000000).toFixed(1) + "M";
    } else if (views >= 1000) {
        views = (views / 1000).toFixed(1) + "K";
    }

    const container = document.getElementById("cardContainer");

    const cardHTML = `
        <div class="card">
            <div class="thumbnail">
                <img src="${thumbnail}">
                <div class="duration">${duration}</div>
            </div>
            <div class="info">
                <h3>${title}</h3>
                <div class="meta">
                    ${channel} • ${views} views • ${monthsOld} months ago
                </div>
            </div>
        </div>
    `;

    container.innerHTML += cardHTML;
}


/* Example usage */
createCard(
    "Installing VS Code & How Websites Work",
    "CodeWithHarry",
    560000,
    7,
    "31:20",
    "https://i.ytimg.com/vi/lfmg-EJ8gm4/maxresdefault.jpg"
);

console.log("Card generator initialized");

/* =========================================================
   Utility: Format Views Count
========================================================= */
function formatViews(views) {
    if (views >= 1_000_000) {
        return (views / 1_000_000).toFixed(1) + "M";
    }
    if (views >= 1_000) {
        return (views / 1_000).toFixed(1) + "K";
    }
    return views;
}

/* =========================================================
   Function: Create Video Card
========================================================= */
function createCard(title, channelName, views, monthsOld, duration, thumbnail) {

    const container = document.querySelector(".container");

    const html = `
        <div class="card">
            <div class="image">
                <img src="${thumbnail}" alt="thumbnail">
                <div class="timing">${duration}</div>
            </div>
            <div class="text">
                <h1>${title}</h1>
                <p>${channelName} • ${formatViews(views)} views • ${monthsOld} months ago</p>
            </div>
        </div>
    `;

    container.insertAdjacentHTML("beforeend", html);
}

/* =========================================================
   Example Card
========================================================= */
createCard(
    "Friday - The Chainsmokers",
    "The Chainsmokers",
    10000000,
    4,
    "3:45",
    "https://i.ytimg.com/vi/yAgKmKLajFY/hqdefault.jpg"
);

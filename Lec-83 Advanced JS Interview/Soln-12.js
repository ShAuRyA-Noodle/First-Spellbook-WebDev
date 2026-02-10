/* =========================================================
   Token Manager
   Stores auth token in localStorage with expiration time
========================================================= */

function setAuthToken(token, expiresInMinutes) {

    /* Calculate expiration timestamp */
    const expiryTime = Date.now() + expiresInMinutes * 60 * 1000;

    /* Create token object */
    const tokenData = {
        token: token,
        expiry: expiryTime
    };

    /* Save in localStorage */
    localStorage.setItem("authToken", JSON.stringify(tokenData));
}


/* Optional helper: retrieve token safely */
function getAuthToken() {

    const stored = localStorage.getItem("authToken");
    if (!stored) return null;

    const tokenData = JSON.parse(stored);

    /* Check expiration */
    if (Date.now() > tokenData.expiry) {
        localStorage.removeItem("authToken");
        return null;
    }

    return tokenData.token;
}


/* Example usage */
setAuthToken("abc123xyz", 30); // expires in 30 minutes

console.log(getAuthToken());

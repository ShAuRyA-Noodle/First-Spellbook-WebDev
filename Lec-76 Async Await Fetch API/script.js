/* =========================================================
   Async / Await Example
   Demonstrates:
   - POST request using fetch()
   - Awaiting async responses
   - Proper error handling
========================================================= */

/* =========================================================
   Function: Fetch Data (POST request)
========================================================= */
async function getData() {
    try {
        const response = await fetch(
            "https://jsonplaceholder.typicode.com/posts",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=UTF-8"
                },
                body: JSON.stringify({
                    title: "foo",
                    body: "bar",
                    userId: 1
                })
            }
        );

        const data = await response.json();
        return data;

    } catch (error) {
        console.error("Error fetching data:", error);
        throw error;
    }
}


/* =========================================================
   Main Execution Function
========================================================= */
async function main() {

    console.log("Loading modules...");
    console.log("Doing other work while waiting...");
    console.log("Loading data...");

    const data = await getData();

    console.log("Received data:", data);

    console.log("Processing data...");
    console.log("Hi, I am processing the response");
    console.log("Async workflow completed.");
}

/* Run program */
main();

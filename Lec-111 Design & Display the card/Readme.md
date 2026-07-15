# Lec-111: Design & Display the Card (Practice Challenge)

## Overview

This lecture is a **practice challenge**, not a follow-along coding session. Your job is to combine three of the most important React skills you have learned so far — component state, side effects, and list rendering — into one small but very realistic feature: fetching data from a public API and displaying every record as a card on the page.

This is the exact pattern behind almost every data-driven screen you will ever build: a product grid on an e-commerce site, a feed of posts on a social app, a list of search results, a dashboard of metrics. If you can fetch an array from an API and turn it into a list of styled cards, you can build a huge portion of the modern web. Attempt this challenge on your own before looking at the solution.

---

## Original Assignment

The original exercise prompt for this lecture is preserved below, word for word:

> You have to use an api and display the data in the form of a card under a container. All the data points returned by the API should be converted to a card
> Use this API: https://jsonplaceholder.typicode.com/posts
>
> Hint:
> Create a state for the data which will be fetched using the Json Placeholder API
> Inside useEffect, use fetch to populate that state and then use map to render the cards from that state

---

## Concepts You Need

### 1. `useState` for fetched data

When data arrives from a server, it arrives **after** your component has already rendered at least once. That means the data cannot be a plain variable — React would never know it changed, and the screen would never update. Instead, the data must live in **state**, because updating state is what tells React to re-render the component with the new information.

```jsx
// Illustrative only — not the full solution
const [posts, setPosts] = useState([]);
```

Two important details:

- **Initialize with an empty array (`[]`), not `undefined` or `null`.** Your JSX will call `.map()` on this state. Calling `.map()` on an empty array is perfectly safe (it just renders nothing), but calling `.map()` on `undefined` crashes with `Cannot read properties of undefined (reading 'map')`. Choosing a sensible initial value saves you from the most common crash in this exercise.
- **Never mutate the state directly** (e.g., `posts.push(...)`). Always call the setter (`setPosts(newData)`) so React knows a re-render is needed.

### 2. `useEffect` with an empty dependency array — and why

Fetching data is a **side effect**: it reaches outside of React (to the network) and it takes time. Side effects do not belong in the component body, because the component body runs on *every* render. They belong inside `useEffect`.

```jsx
// Illustrative only
useEffect(() => {
  // fetch the data here, then call setPosts(...)
}, []); // <-- empty dependency array
```

The **empty dependency array `[]`** is the crucial part. It tells React: "run this effect **once**, right after the component mounts, and never again." That is exactly what we want for a one-time initial data load.

Why does this matter so much? Think through what happens *without* it:

1. Component renders → effect runs → `fetch` completes → `setPosts` is called.
2. `setPosts` triggers a re-render.
3. With no dependency array, the effect runs again after **every** render → another fetch → another `setPosts` → another render...
4. You have built an **infinite network-request loop**.

The empty array breaks that cycle: the effect fires exactly once on mount, no matter how many times the component re-renders afterwards.

### 3. `fetch()` and `.json()`

The browser's built-in `fetch()` function makes an HTTP request and returns a **Promise**. There are two asynchronous steps, and beginners often forget the second one:

1. `fetch(url)` resolves to a **Response object** — this is *not* your data yet. It is metadata about the response (status code, headers) plus a body stream.
2. `response.json()` reads the body and parses it as JSON. This is **also asynchronous** and returns another Promise, which resolves to the actual JavaScript array/object.

```jsx
// Illustrative only — the classic .then() chain
fetch("https://jsonplaceholder.typicode.com/posts")
  .then((response) => response.json())
  .then((data) => setPosts(data));
```

Both steps must complete before you have usable data. Skipping `.json()` and putting the raw `Response` object into state is a very common mistake — you will see `[object Response]` behavior instead of your posts.

### 4. Rendering lists with `.map()` and the `key` prop

`.map()` transforms one array into another. Here, it transforms an array of **data objects** into an array of **JSX elements** — and React happily renders an array of elements placed inside JSX.

```jsx
// Illustrative only
{posts.map((post) => (
  <div className="card" key={post.id}>
    {/* show the post's fields here */}
  </div>
))}
```

The **`key` prop** is mandatory for list items:

- React uses keys to identify *which* item is which between renders, so it can update the DOM efficiently instead of destroying and rebuilding the entire list.
- The key must be **stable and unique among siblings**. The API gives you a perfect candidate: each post's `id`.
- Avoid using the array index as a key when a real ID exists. Index keys break down when items are reordered, inserted, or deleted, causing subtle UI bugs.
- If you forget the key, React warns you in the console: `Warning: Each child in a list should have a unique "key" prop.` Do not ignore that warning.

### 5. Conditional rendering while loading

Between the first render and the moment the fetch resolves, your state is still the empty array. The user would just see a blank container. Good UIs acknowledge this "loading" window. Two simple approaches:

```jsx
// Illustrative only — option A: check the data itself
{posts.length === 0 ? <p>Loading posts...</p> : /* render the cards */}

// Illustrative only — option B: a dedicated loading flag
const [loading, setLoading] = useState(true);
// set it to false after the data arrives, and render a spinner/message while true
```

Option A is enough for this exercise; option B is the pattern you will use in real applications (it can distinguish "still loading" from "loaded, but genuinely empty").

### 6. What JSONPlaceholder returns (the shape of a post)

[JSONPlaceholder](https://jsonplaceholder.typicode.com/) is a free fake REST API made for practicing exactly this kind of exercise. The `/posts` endpoint returns an **array of 100 post objects**. Every post has the same four fields:

```json
{
  "userId": 1,
  "id": 1,
  "title": "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
  "body": "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto"
}
```

| Field    | Type   | Meaning                                        | Useful for            |
| -------- | ------ | ---------------------------------------------- | --------------------- |
| `userId` | number | ID of the (fake) user who authored the post    | Optional badge/label  |
| `id`     | number | Unique ID of the post itself                   | **Your `key` prop**   |
| `title`  | string | Post title (Latin placeholder text)            | Card heading          |
| `body`   | string | Post body text (contains `\n` line breaks)     | Card content          |

The text is Lorem-Ipsum-style Latin — that is normal and expected. Since the assignment says *all* data points should become cards, you should end up with **100 cards** on the page.

---

## Approach / Hints Expanded

Do not jump straight into code. Work through these steps deliberately. (Snippets in this section are illustrative fragments, not a complete solution — this folder intentionally contains no project code.)

**Step 1 — Inspect the API before writing any React.**
Open `https://jsonplaceholder.typicode.com/posts` directly in your browser. Look at the JSON with your own eyes: confirm it is an array, note the four fields, and decide which fields belong on your card. Knowing your data's shape *before* coding prevents most rendering bugs.

**Step 2 — Build a static card first.**
Forget the API for a moment. Create a card component (or just card JSX) with hard-coded text — a heading for the title and a paragraph for the body. Style it: border or shadow, padding, rounded corners. Once one card looks good, the rest of the exercise is just producing 100 of them.

**Step 3 — Create the state.**

```
state: posts, initialized to []
```

This is where the fetched array will live. Empty array initial value, for the reasons explained above.

**Step 4 — Fetch inside `useEffect` (mount-only).**
In pseudocode:

```
useEffect(() => {
  fetch the posts URL
    -> convert the response with .json()
    -> store the resulting array with setPosts
}, [])   // empty array: run once on mount
```

Add a `console.log` of the data inside the second `.then()` (or after `await`) to verify in the browser console that you actually received 100 objects before you try to render anything.

**Step 5 — Map state to cards.**
Inside your container element, map over the state:

```
for each post in posts:
    render a card
        key   = post.id
        title = post.title
        body  = post.body
```

**Step 6 — Add a loading state.**
While `posts` is still empty, show a "Loading..." message instead of an empty container.

**Step 7 — Style the container.**
The assignment asks for cards "under a container." A container styled with CSS Grid (`display: grid` with `repeat(auto-fill, minmax(...))`) or Flexbox with `flex-wrap: wrap` turns your card list into a clean responsive grid. This is the "Design" half of "Design & Display the card" — spend real effort here.

**Self-check before you peek at the solution:**

- [ ] Exactly one network request appears in the DevTools Network tab (not a stream of repeated requests).
- [ ] 100 cards render, each showing a title and body.
- [ ] No `key` warning in the console.
- [ ] A loading message appears briefly before the cards (throttle your network in DevTools to see it clearly).
- [ ] The cards look like *cards* — spacing, borders/shadows, a readable layout.

---

## Common Mistakes

**1. Fetching inside the render body (no `useEffect`) → infinite loop.**
If you call `fetch(...).then(setPosts)` directly in the component body, it executes on every render. But `setPosts` *causes* a render. Fetch → setState → re-render → fetch → setState → re-render... forever. Your Network tab fills with hundreds of identical requests and the app grinds to a halt. Side effects always go inside `useEffect`. The same loop occurs if you use `useEffect` but **omit the dependency array entirely** — the empty `[]` is what limits the effect to a single run.

**2. Missing the `key` prop on mapped elements.**
React will render the list, but it will warn you in the console, and it loses the ability to track items efficiently across re-renders. Always pass a stable unique key — here, `key={post.id}` on the outermost element returned by your `.map()` callback. Note: the key goes on the element you return from the map, not on some element nested deeper inside it.

**3. Mishandling async inside `useEffect`.**
Several related traps:

- **Forgetting that data is not there yet.** Trying to use the fetched data immediately after calling `fetch` (outside the `.then()` chain) gives you `undefined`, because the request has not finished.
- **Making the effect callback itself `async`.** `useEffect(async () => {...}, [])` is wrong — an async function returns a Promise, but React expects the effect to return either nothing or a cleanup function. If you prefer `async/await`, define an async function *inside* the effect and call it:

  ```jsx
  // Illustrative only
  useEffect(() => {
    async function loadPosts() {
      const response = await fetch(url);
      const data = await response.json();
      // put data into state here
    }
    loadPosts();
  }, []);
  ```

- **Skipping `.json()`.** Storing the raw `Response` object in state instead of the parsed data. Remember: two async steps, not one.

**4. Bonus pitfalls worth knowing.**

- Initializing state to `null`/`undefined` and then calling `.map()` on it → crash on first render.
- Mutating state directly instead of using the setter → UI never updates.
- Rendering the whole `post` object (`{post}`) instead of its fields (`{post.title}`) → "Objects are not valid as a React child" error.

---

## Solution

Once you have genuinely attempted the challenge (and only then!), the complete working solution is available in the **`Lec-113 Solution Display the cards`** folder of this course. Compare it with your own attempt — pay special attention to how the fetch, the state update, and the mapping are wired together, and to any differences in how loading is handled.

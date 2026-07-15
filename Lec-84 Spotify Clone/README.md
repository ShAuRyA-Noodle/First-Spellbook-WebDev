# Lecture 84 — Building a Spotify Clone with Vanilla HTML, CSS & JavaScript

In this lecture we build a fully functional, Spotify-inspired music web player — themed around The Chainsmokers — using **nothing but vanilla HTML, CSS, and JavaScript**. There is no framework, no bundler, and no backend code: the "backend" is simply a static file server whose **directory listings** we scrape with `fetch()` to discover playlists and songs dynamically. Along the way, the project exercises nearly every fundamental front-end skill: the HTML5 `Audio` API, `async/await` with `fetch`, DOM creation and manipulation, event listeners, seekbar percentage math, an `IntersectionObserver`-powered scroll-reveal, a responsive hamburger sidebar, CSS Grid and Flexbox layout, glassmorphism styling with CSS custom properties, and a small Tailwind-style utility class system. This project matters because it proves you can build a rich, animated, data-driven UI with the platform alone — a milestone that makes every framework you learn afterwards feel like a convenience rather than a mystery.

---

## What You'll Learn

- How to play, pause, and seek audio using the HTML5 `Audio` object (no `<audio>` tag needed).
- How to fetch a server's **directory listing** and parse it as HTML to discover files at runtime.
- Why the app *must* run on a local server (and what `.htaccess` with `Options +Indexes` does on Apache).
- `async/await`, `try/catch`, and graceful fallbacks when a `fetch` fails.
- Dynamic DOM construction: building song list items and album cards from data with `createElement` + `innerHTML`.
- Event-driven programming: `click`, `input`, `timeupdate`, and `ended` listeners.
- Seekbar math — converting a click's pixel offset into a percentage and into `currentTime`.
- Volume control, mute toggling, and remembering the previous volume level.
- `IntersectionObserver` for staggered scroll-reveal animations.
- Responsive design: an off-canvas sidebar driven by a hamburger button and CSS media queries.
- Modern CSS: custom properties (design tokens), `backdrop-filter` glassmorphism, CSS Grid playbar layout, keyframe animations (aurora background, equalizer bars, pulsing play button), and utility classes.
- URL encoding/decoding with `decodeURIComponent` when file names contain spaces and special characters.

---

## Project Structure

```
Lec-84 Spotify Clone/
├── index.html                 # Single page: sidebar, header, hero, album cards, playbar
├── favicon.ico                # Site icon (note: not linked in index.html)
├── css/
│   ├── style.css              # All theming, layout, animations, responsive rules
│   └── utility.css            # Small Tailwind-style utility classes (.flex, .invert, .m-1 …)
├── js/
│   └── script.js              # All player logic: fetching songs, playback, UI events
├── img/                       # SVG icons (play, pause, volume, hamburger, logo …) + cover.jpg
└── songs/                     # "Database" — one folder per playlist/album
    ├── .htaccess              # Enables Apache directory listing (Options +Indexes)
    ├── the-chainsmokers/      # Playlist folder: cover.jpg + info.json (+ .mp3 files)
    │   ├── cover.jpg          # Card artwork
    │   └── info.json          # {"title": "...", "description": "..."}
    ├── Closer_(mood)/         # Only folder in this copy that actually contains an .mp3
    ├── closer-era/            # Same structure: cover.jpg + info.json
    ├── memories/  world-war-joy/  EDM_(mood)/  Festival_(mood)/
    ├── High_(mood)/  Late_Night_(mood)/  Melancholy_(mood)/  Rave_(mood)/
    └── …                      # Add a folder + cover + info.json + mp3s = new playlist appears
```

The key architectural idea: **the `songs/` folder *is* the database.** Drop in a new folder with a `cover.jpg`, an `info.json`, and some `.mp3` files, and the app discovers and renders it automatically — no code changes required.

---

## Concept Deep-Dives

### 1. The HTML5 `Audio` API (JavaScript-only playback)

We never write an `<audio>` element in the HTML. Instead, `script.js` creates one entirely in JavaScript:

```js
let currentSong = new Audio();
let songs       = [];
let currFolder  = '';
let currArtist  = 'The Chainsmokers';
let prevVolume  = 0.70;

currentSong.volume = prevVolume;
```

`new Audio()` returns an `HTMLAudioElement` that lives in memory. It exposes everything a media player needs:

| Property / Method | What it does | Where the project uses it |
|---|---|---|
| `.src` | URL of the track to load | `playMusic()` sets it per song |
| `.play()` / `.pause()` | Start / stop playback | Play button, prev/next handlers |
| `.paused` | Boolean — is it currently paused? | Play/pause toggle logic |
| `.currentTime` | Playback position in seconds (read **and** write) | Time display, seekbar seeking |
| `.duration` | Track length in seconds (`NaN` until metadata loads) | Progress percentage |
| `.volume` | 0.0 – 1.0 | Volume slider, mute toggle |
| `timeupdate` event | Fires several times/second during playback | Updates clock + seekbar |
| `ended` event | Fires when the track finishes | Auto-advance to next song |

A single `Audio` instance is reused for every song — changing `.src` swaps the track. This is simpler and lighter than creating a new object per song, and it means all event listeners are attached exactly once.

### 2. `fetch` + `async/await` + Directory Listing Scraping

The most unusual (and cleverest) idea in the project: **there is no API and no JSON list of songs.** Instead, we ask the web server for the *folder itself* and parse the HTML index page it returns:

```js
const res  = await fetch(`/${folder}/`);
const html = await res.text();
const div  = document.createElement("div");
div.innerHTML = html;

songs = [];
for (const a of div.querySelectorAll("a")) {
    const href = a.getAttribute('href') || '';
    if (href.toLowerCase().endsWith('.mp3')) songs.push(href);
}
```

Step by step:

1. `fetch(`/${folder}/`)` requests a **directory URL** (trailing slash). A server with directory listing enabled responds with an auto-generated HTML page full of `<a href="...">` links — one per file.
2. `await res.text()` reads that HTML as a string.
3. We inject the string into a detached `<div>` — an in-memory DOM we can query without touching the page.
4. `div.querySelectorAll("a")` finds every link; anything ending in `.mp3` is a song.

Note the comment in the source explaining a subtle bug fix:

```js
// ── LOAD SONGS FROM FOLDER ────────────────
// FIX: use getAttribute('href') so relative links aren't resolved against page URL
```

If you read `a.href` (the *property*), the browser resolves it into an **absolute URL** (`http://127.0.0.1:5500/songs/...`). Using `a.getAttribute('href')` returns the **raw attribute text** exactly as the server wrote it, so relative filenames stay clean and comparable.

`async/await` makes the asynchronous flow read top-to-bottom, and `try/catch` gives graceful fallbacks when an `info.json` is missing:

```js
try {
    const r = await fetch(`/${folder}/info.json`);
    const info = await r.json();
    currArtist = info.title || 'The Chainsmokers';
} catch(e) { currArtist = 'The Chainsmokers'; }
```

If the fetch fails (404, network error) or the JSON is malformed, we fall back to a default artist name instead of crashing.

### 3. `.htaccess` and Directory Indexes

The entire "scrape the folder" trick only works if the server is willing to *list* directory contents. On an **Apache** server that behavior is controlled by `songs/.htaccess`:

```apacheconf
Options +Indexes
IndexOptions FancyIndexing NameWidth=* DescriptionWidth=*
```

- `Options +Indexes` — when a URL points at a directory with no `index.html`, Apache generates an HTML listing of its files instead of returning `403 Forbidden`.
- `IndexOptions FancyIndexing NameWidth=* DescriptionWidth=*` — use the "fancy" table-style listing and never truncate long file names (important, because we parse the `href` of each link and a truncated name would break playback).

Important nuance: **`.htaccess` only affects Apache.** Development servers like VS Code Live Server, `npx serve`, or Python's `http.server` generate their own directory listings natively and ignore this file entirely — which is why the app still works with them. On production hosts (or Apache with indexes disabled), you would need this file (or a real API) for the app to find songs.

### 4. The Playlist Metadata Contract — `info.json`

Every playlist folder carries a tiny metadata file. For example, `songs/the-chainsmokers/info.json`:

```json
{"title": "The Chainsmokers","description": "Drew Taggart & Alex Pall"}
```

and `songs/Closer_(mood)/info.json`:

```json
{"title": "Closer","description": "Slow dance to electric beats"}
```

`displayAlbums()` fetches this file per folder to render the card's heading and subtitle, with a defensive default if it's missing:

```js
let info = { title: folder, description: '' };
try {
    const r = await fetch(`/songs/${folder}/info.json`);
    info    = await r.json();
} catch(e) {}
```

This is a miniature example of a **data contract**: the JavaScript agrees to look for `title` and `description`, and any folder that honors the contract "just works."

### 5. DOM Manipulation — Building UI from Data

Both the song list and the album cards start as **empty containers** in `index.html`:

```html
<div class="songList"><ul></ul></div>
```

```html
<!-- Album Cards -->
<div class="cardContainer"></div>
```

JavaScript then fills them. The song list, from `getSongs()`:

```js
const ul = document.querySelector(".songList ul");
ul.innerHTML = "";
songs.forEach((song, i) => {
    const li = document.createElement("li");
    li.style.animationDelay = `${i * 0.07}s`;
    li.dataset.href = song; // store raw href for active-state matching
    li.innerHTML = `
        <img class="invert" width="30" src="img/music.svg" alt="">
        <div class="info">
            <div>${decodeURIComponent(song)}</div>
            <div>${currArtist}</div>
        </div>
        <div class="playnow">
            <span>Play Now</span>
            <img class="invert" width="16" src="img/play.svg" alt="">
        </div>`;
    li.addEventListener("click", () => playMusic(song));
    ul.appendChild(li);
});
```

Techniques on display:

- **`createElement` + `innerHTML` hybrid** — create the outer element in JS (so we can attach a listener and dataset to it), then template its inner markup with a template literal.
- **`li.dataset.href = song`** — the `data-href` attribute stores the *raw, URL-encoded* filename so that later we can match it against `currentSong.src` to highlight the active song.
- **`decodeURIComponent(song)`** — server listings URL-encode names (`My%20Song.mp3`), so we decode before showing them to humans.
- **Staggered entrance** — `li.style.animationDelay = `${i * 0.07}s`` offsets each item's `slideLeft` CSS animation by 70 ms, producing a cascade.
- **Closures in listeners** — each `li.addEventListener("click", () => playMusic(song))` captures its own `song` variable from the loop iteration.

### 6. Event Listeners — The Player's Nervous System

Everything interactive is wired in `main()` with `addEventListener`. The two most important are *media* events (fired by the `Audio` object, not the user):

```js
// ── TIME UPDATE ──
currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML =
        `${fmt(currentSong.currentTime)} / ${fmt(currentSong.duration)}`;
    setProgress((currentSong.currentTime / currentSong.duration) * 100 || 0);
});

// ── AUTO NEXT ──
currentSong.addEventListener("ended", () => {
    const file = currentSong.src.split("/").pop();
    const idx  = songs.indexOf(file);
    if (idx + 1 < songs.length) {
        playMusic(songs[idx + 1]);
    } else {
        setPlayIcon("img/play.svg");
        setEqualizer(false);
    }
});
```

Two details worth memorizing:

- **`|| 0` guards against `NaN`.** Before a track's metadata loads, `currentSong.duration` is `NaN`, so `currentTime / duration * 100` is `NaN`. `NaN || 0` evaluates to `0`, keeping the seekbar sane.
- **Finding "which song is playing"** is done by parsing the filename back out of the audio URL: `currentSong.src.split("/").pop()` grabs everything after the last slash, and `songs.indexOf(file)` finds its position in the playlist. That index +1 / −1 is how next/previous navigation works.

### 7. Seekbar Math

Clicking anywhere on the progress bar jumps playback there. The math is a pure ratio conversion:

```js
// ── SEEKBAR CLICK ──
document.querySelector(".seekbar").addEventListener("click", e => {
    const pct = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
    setProgress(pct);
    currentSong.currentTime = (currentSong.duration * pct) / 100;
});
```

- `e.offsetX` — horizontal pixel distance of the click from the left edge of the element that received it.
- `getBoundingClientRect().width` — the seekbar's rendered width in pixels.
- Divide the two, multiply by 100 → **percentage across the bar**.
- Multiply the track's `duration` by that percentage / 100 → the target second, assigned to `currentTime`, which is writable and makes the browser seek instantly.

The visual update is centralized in a helper that moves the knob **and** feeds a CSS custom property that drives the gradient fill:

```js
function setProgress(pct) {
    document.querySelector(".circle").style.left = pct + "%";
    document.querySelector(".seekbar").style.setProperty('--progress', pct + '%');
}
```

On the CSS side, the fill is a `::before` pseudo-element whose width *is* that variable — a lovely pattern for JS→CSS communication:

```css
.seekbar::before {
    content:''; position:absolute; left:0; top:0; bottom:0;
    width:var(--progress, 0%);
    background:linear-gradient(90deg, var(--purple), var(--pink), var(--cyan));
    background-size:200%;
    border-radius:10px;
    animation:shimSeek 3s linear infinite;
    transition:width .28s;
}
```

One classic pitfall lurks here: `e.offsetX` is relative to the element the pointer event *targets*. If the user clicks precisely on the white `.circle` knob (a child of the seekbar), `offsetX` is measured relative to the tiny circle, producing a wild jump. Robust players compute position from `e.clientX - rect.left` instead, or set `pointer-events:none` on the knob.

### 8. Time Formatting

A tiny, defensive utility converts raw seconds into `MM:SS`:

```js
function fmt(s) {
    if (isNaN(s) || s < 0) return "00:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}
```

The `isNaN` guard matters because `duration` is `NaN` until the browser has loaded the track's metadata; without it, the playbar would flash `NaN:NaN`. `padStart(2,'0')` gives the familiar `03:07` zero-padding.

### 9. `IntersectionObserver` — Scroll-Reveal Cards

Album cards start invisible (CSS: `opacity:0; transform:translateY(28px) scale(.95);`) and animate in **only when scrolled into view**, with a stagger based on their position among siblings:

```js
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const siblings = Array.from(entry.target.parentElement.children);
            const i = siblings.indexOf(entry.target);
            setTimeout(() => entry.target.classList.add('revealed'), i * 70);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.06 });
```

- `IntersectionObserver` is a browser API that efficiently tells you when elements enter the viewport — no scroll-event listeners, no layout thrashing.
- `threshold: 0.06` fires as soon as ~6% of a card is visible.
- The sibling index times 70 ms creates the wave effect; `unobserve` ensures each card animates only once.
- Adding the `revealed` class flips the CSS to `opacity:1; transform:translateY(0) scale(1);` and the `transition` on `.card` animates the change.

Each card is registered right after creation in `displayAlbums()` with `revealObserver.observe(card);`.

### 10. Hamburger Menu & Responsive Off-Canvas Sidebar

On wide screens, the sidebar (`.left`) sits beside the content in a flex row. Below **1200px**, CSS repositions it *off-screen* and the hamburger slides it back in:

```css
@media (max-width:1200px) {
    .left {
        position:fixed; left:-110%; top:0;
        width:350px; height:100vh;
        z-index:200;
        background:rgba(7,7,16,.97);
        backdrop-filter:blur(30px); -webkit-backdrop-filter:blur(30px);
        border-right:1px solid var(--border);
        transition:left .32s cubic-bezier(.4,0,.2,1);
        border-radius:0; margin:0; padding:0;
    }
    .left.open { left:0; }
    .left .close { position:absolute; right:18px; top:18px; display:block; }

    .right { width:100vw; margin:0; border-radius:0; border:none; }
    .hamburger { display:block; }
```

The JavaScript is deliberately minimal — it only toggles a class; **CSS owns the animation**:

```js
// ── HAMBURGER ──
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").classList.add("open");
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").classList.remove("open");
});
```

This "JS toggles state, CSS renders state" separation is the idiomatic vanilla pattern for menus, modals, and drawers. A second breakpoint at `500px` further tightens spacing and makes the drawer full-width (`.left { width:100vw; }`).

### 11. Layout — Flexbox Shell + CSS Grid Playbar

The page shell is a two-column flex layout:

```css
.container { display:flex; min-height:100vh; position:relative; z-index:1; }
```

```css
.left { width:25vw; padding:10px; flex-shrink:0; }
```

```css
.right {
    flex:1; width:75vw; margin:10px 10px 10px 0;
    background:rgba(10,10,20,.45);
    backdrop-filter:blur(8px);
    border:1px solid var(--border); border-radius:14px;
    overflow:hidden; display:flex; flex-direction:column;
}
```

The floating playbar, though, uses **CSS Grid** — three columns (now-playing / controls / volume) on row one, and a full-width seekbar spanning row two:

```css
.playbar {
    position:fixed; bottom:18px; left:50%; transform:translateX(-50%);
    width:72vw; z-index:100;

    background:rgba(9,9,20,.92);
    backdrop-filter:blur(36px); -webkit-backdrop-filter:blur(36px);
    border:1px solid rgba(139,92,246,.30);
    border-radius:22px;
    padding:14px 22px 10px;

    display:grid;
    grid-template-columns:1fr auto 1fr;
    grid-template-rows:auto auto;
    align-items:center;
    gap:0 12px;
    ...
}
```

```css
/* ── SEEKBAR (full width, second row) ── */
.seekbar {
    grid-column:1 / -1; grid-row:2;
    height:4px; border-radius:10px;
    background:rgba(255,255,255,.10);
    position:relative; cursor:pointer; margin-top:6px;
    transition:height .18s;
}
```

- `grid-template-columns:1fr auto 1fr` centers the controls perfectly: the outer `1fr` tracks absorb equal leftover space, so the middle `auto` column is dead-center regardless of how wide the song title is. (Flexbox `justify-content:space-between` cannot guarantee that.)
- `grid-column:1 / -1` means "span from the first grid line to the last" — the seekbar stretches the full bar width.
- `position:fixed; bottom:18px; left:50%; transform:translateX(-50%)` is the standard horizontal-centering trick for fixed elements. The scrolling content compensates with `.mainContent { padding-bottom:100px; /* room for fixed playbar */ }`.
- In the ≤1200px media query, the same grid reflows to two columns and three rows just by reassigning `grid-column` values — no HTML changes.

### 12. CSS Custom Properties as Design Tokens

The whole color system lives in `:root`, so the theme can be changed in one place:

```css
:root {
    --purple:   #8B5CF6;
    --purple-d: #6D28D9;
    --pink:     #EC4899;
    --cyan:     #06B6D4;
    --bg:       #07070E;
    --card-bg:  rgba(255,255,255,0.05);
    --glass:    rgba(12,12,24,0.82);
    --border:   rgba(139,92,246,0.20);
    --bh:       rgba(139,92,246,0.55);   /* border hover */
    --text:     #E8E8F0;
    --muted:    #6B7280;
}
```

They are consumed everywhere with `var(--purple)`, and — as seen with `--progress` on the seekbar — custom properties are also a **runtime channel from JavaScript into CSS** via `style.setProperty()`.

### 13. Utility Classes (`utility.css`)

A miniature homage to Tailwind: single-purpose classes composed directly in the HTML.

```css
.flex{
    display: flex;
}

.justify-center{
    justify-content: center;
}

.items-center{
    align-items: center;
}
```

```css
.invert{
    filter: invert(1);
}

.bg-grey{
    background-color: #121212;
}

.rounded{
    border-radius: 7px;
}

.m-1{
    margin: 5px;
}

.p-1{
    padding: 10px;
}
```

Usage in `index.html`:

```html
<div class="home bg-grey rounded m-1 p-1">
```

The `.invert` class deserves a special mention: all the icons in `img/` are **black SVGs**, and `filter: invert(1)` flips them to white so they read on the dark theme — one CSS rule instead of a second set of white icon files. (Note that `style.css` later layers fancier glass backgrounds over `.bg-grey`, so the utility acts as a base coat.)

### 14. Ambient Animation Layer (Aurora, Orbs, Equalizer)

Purely decorative but instructive CSS. The animated aurora is a fixed, oversized pseudo-element behind everything:

```css
body::before {
    content:'';
    position:fixed; inset:-30%;
    width:160%; height:160%;
    background:
        radial-gradient(ellipse at 12% 18%,  rgba(139,92,246,0.32) 0%, transparent 45%),
        radial-gradient(ellipse at 88% 82%,  rgba(236,72,153,0.28) 0%, transparent 45%),
        radial-gradient(ellipse at 55% 50%,  rgba(6,182,212,0.14)  0%, transparent 55%),
        radial-gradient(ellipse at 82% 12%,  rgba(59,130,246,0.20) 0%, transparent 40%);
    animation: aurora 16s ease-in-out infinite alternate;
    pointer-events:none; z-index:0;
}
```

The playbar's "equalizer" is five `<span>` bars whose heights pulse with different durations and delays, so they never sync up — a cheap illusion of reactive audio:

```css
.equalizer span:nth-child(1) { height:7px;  animation-duration:.70s; animation-delay:.00s; }
.equalizer span:nth-child(2) { height:14px; animation-duration:.90s; animation-delay:.10s; }
.equalizer span:nth-child(3) { height:20px; animation-duration:.60s; animation-delay:.20s; }
.equalizer span:nth-child(4) { height:11px; animation-duration:.80s; animation-delay:.15s; }
.equalizer span:nth-child(5) { height:16px; animation-duration:1.0s; animation-delay:.05s; }
@keyframes eqBar { from{transform:scaleY(.2)} to{transform:scaleY(1.15)} }
```

JavaScript merely toggles its visibility class in lockstep with playback:

```js
function setEqualizer(on) {
    document.querySelector(".equalizer").classList.toggle("playing", on);
}
```

---

## Full Code Walkthrough — `js/script.js`

### Global State (lines 1–11)

```js
let currentSong = new Audio();
let songs       = [];
let currFolder  = '';
let currArtist  = 'The Chainsmokers';
let prevVolume  = 0.70;

currentSong.volume = prevVolume;
```

Five module-level variables carry all state:

- `currentSong` — the single reusable `Audio` element.
- `songs` — array of raw (URL-encoded) `.mp3` hrefs for the **currently selected** playlist.
- `currFolder` — path (e.g. `songs/the-chainsmokers`) used to build audio and cover-art URLs.
- `currArtist` — playlist title from `info.json`, shown as the subtitle on each song row.
- `prevVolume` — remembers the last non-zero volume so unmuting restores it.

### `fmt(s)` — seconds → `MM:SS`

Covered above (Concept 8). Guards `NaN` and negatives, floors minutes/seconds, zero-pads with `padStart`. Called from the `timeupdate` handler for both current time and duration.

### `setProgress(pct)` — one function, two visuals

Moves the seekbar knob (`.circle`) via `style.left` and updates the `--progress` custom property that the CSS `::before` fill reads. Centralizing this means the seekbar can never show a knob and a fill that disagree.

### `setPlayIcon(src)`

```js
function setPlayIcon(src) {
    document.querySelector('.play-icon').src = src;
}
```

Swaps the image inside the circular play button between `img/play.svg` and `img/pause.svg`. The icon itself is nudged with `transform:translateX(2px)` in CSS because a play triangle looks off-center when geometrically centered — a nice optical-alignment lesson.

### `setNowPlayingArt()`

```js
function setNowPlayingArt() {
    const art = document.querySelector('.now-playing-art');
    if (!art) return;
    art.src = `/${currFolder}/cover.jpg`;
    art.onerror = () => { art.src = 'img/music.svg'; };
}
```

Points the playbar thumbnail at the current playlist's `cover.jpg`. The `onerror` fallback swaps in a generic music icon if the cover is missing — the same defensive pattern the cards use inline (`onerror="this.src='img/music.svg'"`).

### `revealObserver` — the IntersectionObserver

Covered in Concept 9. Created once at module level; `displayAlbums()` registers each card with it.

### `updateActiveSong()`

```js
function updateActiveSong() {
    const lis = document.querySelectorAll(".songList ul li");
    const currentFile = currentSong.src.split("/").pop(); // URL-encoded filename
    lis.forEach(li => {
        li.classList.toggle("active", li.dataset.href === currentFile);
    });
}
```

Extracts the URL-encoded filename from `currentSong.src` and toggles the `.active` class on whichever `<li>` has a matching `data-href`. This works because `getSongs()` stored the **raw href** (also URL-encoded) in `li.dataset.href` — encoded string compared with encoded string. The CSS `.songList ul li.active` rule adds the purple glow.

### `setEqualizer(on)`

Toggles `.playing` on the equalizer — the second argument to `classList.toggle` forces the state rather than flipping it.

### `getSongs(folder)` — load a playlist

Data flow:

1. Store `folder` into `currFolder` (all later URLs derive from it).
2. Fetch `info.json` for the artist/playlist title, with a `try/catch` fallback.
3. Fetch the **directory listing** at `/${folder}/`, parse it in a detached `<div>`, and collect every `<a>` whose `getAttribute('href')` ends with `.mp3` into `songs`.
4. Wipe and rebuild the sidebar `<ul>`: one `<li>` per song with staggered `animationDelay`, a decoded display name, the artist line, a hover-revealed "Play Now" affordance, a `data-href` for active-state matching, and a click listener that calls `playMusic(song)`.
5. Return `songs`.

Edge cases handled: missing `info.json` (fallback artist), URL-encoded names (`decodeURIComponent` for display, raw for playback), previous playlist's rows (cleared with `ul.innerHTML = ""`). Edge case *not* handled: a folder with zero `.mp3` files simply leaves the list empty — callers must check `songs.length` (and they do).

### `playMusic(track, pause = false)` — start (or stage) a track

```js
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        setPlayIcon("img/pause.svg");
        setEqualizer(true);
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    setProgress(0);
    setNowPlayingArt();
    setTimeout(updateActiveSong, 100);
};
```

The `pause = false` **default parameter** is the trick that lets `main()` pre-load the first song at startup *without* autoplaying it (`playMusic(songs[0], true)`) — browsers block autoplay with sound anyway, so this respects both UX and policy. Whether playing or staged, the UI (title, clock, progress, art) resets immediately. `updateActiveSong` is deferred by 100 ms via `setTimeout` so the freshly assigned `currentSong.src` is fully normalized before the filename comparison runs.

Note the paths are **root-absolute** (`/${currFolder}/...`): the project folder must be the server's root for these URLs to resolve.

### `displayAlbums()` — discover playlists and build cards

Data flow:

1. Fetch the listing of `/songs/` itself and parse it.
2. For each `<a>`, keep only links that look like **subdirectories**:

```js
const href = a.getAttribute('href') || '';
// Only directory links (trailing /), skip parent ../ and hidden
if (!href.endsWith('/') || href === '../' || href.startsWith('.')) continue;
```

   Trailing `/` = directory; `../` = the parent link servers include; leading `.` = hidden entries like `.htaccess` folders would be skipped.
3. `decodeURIComponent(href.replace(/\/$/, ''))` strips the trailing slash and decodes names like `Closer_(mood)`.
4. Fetch that folder's `info.json` (with a fallback of `{ title: folder, description: '' }`).
5. Build a `.card` div (image with `loading="lazy"` and an `onerror` fallback, hover overlay with an inline SVG play button, title, description), stamp `card.dataset.folder`, append it, and hand it to `revealObserver`.
6. Attach the click handler:

```js
card.addEventListener("click", async () => {
    // highlight active card
    document.querySelectorAll(".card").forEach(c => c.classList.remove("card-active"));
    card.classList.add("card-active");
    songs = await getSongs(`songs/${card.dataset.folder}`);
    if (songs.length > 0) playMusic(songs[0]);
});
```

   Clicking a card: highlight it, load its songs into the sidebar, and start the first track — but only if the folder actually contains songs (`songs.length > 0` guard).

Performance note: the `await fetch(info.json)` sits inside the `for` loop, so cards load **sequentially**. Fine for a dozen folders; with hundreds you'd parallelize with `Promise.all`.

### `main()` — bootstrap and event wiring

Runs once at the bottom of the file (`main();`). In order:

1. **Initial load** — `await getSongs("songs/the-chainsmokers")`, then stage (not play) the first track: `if (songs.length > 0) playMusic(songs[0], true);`
2. **Render all album cards** — `await displayAlbums();`
3. **Play/pause button** — checks `currentSong.paused` and flips playback, icon, and equalizer together.
4. **`timeupdate`** — refreshes the `MM:SS / MM:SS` clock and progress percentage (with the `|| 0` `NaN` guard).
5. **`ended`** — auto-advances to the next song, or resets the icon/equalizer at the end of the playlist.
6. **Seekbar click** — the ratio math from Concept 7.
7. **Hamburger / close** — adds/removes `.open` on the sidebar.
8. **Previous / Next** — pause, find the current index by filename, and `playMusic` the neighbor if it exists (no wrap-around: previous on the first song and next on the last song do nothing).
9. **Volume slider** (`input` event) — maps `0–100` to `0.0–1.0`, remembers `prevVolume` when above zero, and swaps the speaker icon to a mute icon at zero:

```js
document.querySelector(".range input").addEventListener("input", e => {
    const val = parseInt(e.target.value) / 100;
    currentSong.volume = val;
    const volImg = document.querySelector(".volume>img");
    if (val > 0) { prevVolume = val; volImg.src = volImg.src.replace("mute.svg", "volume.svg"); }
    else           { volImg.src = volImg.src.replace("volume.svg", "mute.svg"); }
});
```

10. **Mute toggle** (clicking the speaker icon) — inspects the icon's current `src` to decide direction; muting saves `prevVolume = currentSong.volume || 0.70` and zeroes both the volume and the slider; unmuting restores both:

```js
document.querySelector(".volume>img").addEventListener("click", e => {
    const volRange = document.querySelector(".range input");
    if (e.target.src.includes("volume.svg")) {
        prevVolume = currentSong.volume || 0.70;
        e.target.src = e.target.src.replace("volume.svg", "mute.svg");
        currentSong.volume = 0; volRange.value = 0;
    } else {
        e.target.src = e.target.src.replace("mute.svg", "volume.svg");
        currentSong.volume = prevVolume; volRange.value = Math.round(prevVolume * 100);
    }
});
```

Using the image's `src` as the *state* is a pragmatic (if fragile) pattern — the UI and the logic can never disagree, but renaming an icon file would silently break the toggle.

### How the data flows, end to end

```
main()
 ├─ getSongs("songs/the-chainsmokers")   →  songs[] + sidebar list
 ├─ playMusic(songs[0], true)            →  staged, paused
 └─ displayAlbums()                      →  fetch /songs/ listing → cards
        │  user clicks a card
        └─ getSongs("songs/<folder>")    →  new songs[] + rebuilt sidebar
               │  user clicks a song
               └─ playMusic(track)       →  currentSong.src set → .play()
                      ├─ "timeupdate"    →  clock + setProgress()
                      └─ "ended"         →  playMusic(next) or stop
```

---

## How to Run

**You cannot just double-click `index.html`.** Two reasons:

1. **`fetch` is blocked on `file://` URLs.** Browsers treat local files as an opaque origin, so every `fetch()` in `script.js` would fail with a CORS/security error.
2. **There is no directory listing without a server.** The app discovers playlists by fetching `/songs/` and songs by fetching `/songs/<folder>/` — only a web server can answer those requests with an HTML index page. (On Apache specifically, `songs/.htaccess` with `Options +Indexes` grants this; dev servers like Live Server and `serve` list directories out of the box.)

Also note the code uses **root-absolute paths** (`/songs/...`), so the project folder itself must be served as the web root.

### Option A — VS Code Live Server (easiest)

1. Install the "Live Server" extension in VS Code.
2. Open the `Lec-84 Spotify Clone` folder as your workspace root (important — the folder must be the server root).
3. Right-click `index.html` → **Open with Live Server**. It serves at `http://127.0.0.1:5500/` with directory listings enabled and auto-reload.

### Option B — `npx serve`

```bash
cd "Lec-84 Spotify Clone"
npx serve .
```

Open the printed URL (typically `http://localhost:3000`). `serve` renders directory listings, so folder scraping works.

### Option C — Python

```bash
cd "Lec-84 Spotify Clone"
python -m http.server 8000
```

Open `http://localhost:8000`. Python's built-in server also lists directories.

Then click any album card → its songs fill the left sidebar → click a song (or use the playbar) to play. Use the hamburger icon to open the library on narrow screens.

---

## Key Takeaways

- **The filesystem can be your database.** Directory listings + `fetch` + a tiny `info.json` contract give you a zero-backend, drop-a-folder-in CMS. It's a teaching device more than a production pattern, but it demystifies "dynamic" apps.
- **One `Audio` object, many songs.** Reuse the element, swap `.src`, and attach media event listeners exactly once.
- **JS toggles classes; CSS animates.** The hamburger drawer, equalizer, active song glow, and card reveals are all class flips — the motion lives entirely in stylesheets.
- **Percentages are the universal currency of seekbars.** pixels → percent → seconds, and the same percent drives both the knob position and the `--progress` fill.
- **Defend against the network.** Every `fetch` of `info.json` has a fallback; every cover image has an `onerror`; `fmt()` and `|| 0` guard `NaN` durations.
- **`getAttribute('href')` ≠ `.href`.** The property is a resolved absolute URL; the attribute is the raw string. Parsing scraped HTML, you almost always want the attribute.
- **Custom properties bridge JS and CSS** (`setProperty('--progress', …)`), and `:root` tokens make retheming a one-block edit.

## Common Pitfalls

1. **Opening via `file://`** — everything silently fails because `fetch` can't run. Always use a local server.
2. **Serving the wrong root** — the root-absolute paths (`/songs/...`, `/${currFolder}/cover.jpg`) break if the project sits in a subfolder of the served root (e.g. opening the *parent* "Pending Notes" folder in Live Server). Serve the clone folder itself.
3. **URL encoding mismatches** — filenames with spaces arrive as `%20`. Display uses `decodeURIComponent`, but comparisons (`songs.indexOf(file)`, `dataset.href === currentFile`) rely on both sides staying encoded identically. Different servers encode listings slightly differently, which can break next/prev/active-highlight.
4. **Clicking the seekbar knob** — `e.offsetX` becomes relative to the `.circle` child, causing a jump to near 0%. Compute from `clientX - getBoundingClientRect().left` (or `pointer-events:none` on the knob) to fix.
5. **Autoplay policies** — calling `currentSong.play()` before any user gesture is rejected by modern browsers; that's exactly why startup uses `playMusic(songs[0], true)` to stage without playing.
6. **Forgetting `.htaccess` semantics** — it only matters on Apache. If you deploy to Apache without it (or to a host that forbids indexes), `displayAlbums()` receives a 403 page containing no folder links, and the UI renders zero cards.
7. **Empty playlist folders** — a folder with a cover and `info.json` but no `.mp3`s renders a card whose click empties the sidebar and plays nothing (the `songs.length > 0` guard prevents an outright error).

## Practice Exercises

1. **Add a playlist.** Create `songs/my-mix/` with a `cover.jpg`, an `info.json` (`{"title": "My Mix", "description": "Handpicked"}`), and two `.mp3` files. Reload — the card should appear with no code changes. Explain, in writing, every request the app makes to render and play it.
2. **Fix the seekbar knob bug.** Rewrite the seekbar click handler to use `e.clientX - e.currentTarget.getBoundingClientRect().left` so clicking directly on the `.circle` seeks correctly. Test by clicking exactly on the knob.
3. **Add a loop/shuffle button.** Extend the playbar with a button that toggles between *loop one* (`currentSong.loop = true`), *loop playlist* (wrap `ended` back to `songs[0]`), and *shuffle* (random index ≠ current). Persist the icon state the same way the mute toggle does.
4. **Keyboard controls.** Add a `keydown` listener: Space = play/pause (careful — `preventDefault()` so the page doesn't scroll), ArrowRight/ArrowLeft = seek ±5 s, ArrowUp/ArrowDown = volume ±10% (sync the slider!).
5. **Replace directory scraping with a manifest.** Write a single `songs/manifest.json` listing every folder and its tracks, and refactor `getSongs`/`displayAlbums` to read it with one `fetch` each. Compare: which approach is more portable across servers, and why?

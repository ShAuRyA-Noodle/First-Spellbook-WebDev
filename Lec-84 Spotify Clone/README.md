# Lecture 84 — Building a Premium Spotify Clone with Vanilla HTML, CSS & JavaScript

In this lecture we build a fully functional, Spotify-inspired music web player — themed around The Chainsmokers — using **nothing but vanilla HTML, CSS, and JavaScript**. There is no framework, no bundler, and no backend code: the "backend" is simply a static file server whose **directory listings** we scrape with `fetch()` to discover playlists and songs dynamically.

This version goes further than a classroom demo: it's tuned to look and behave like a real product. The seekbar's percentage math is fixed so a click (or a full drag) lands exactly where the pointer is. The transport row now has real shuffle and loop toggles, a keyboard layer (Space / arrows), and a volume system driven by state instead of string-matching an `<img src>`. Every icon-only control is a real `<button>` with an `aria-label`, focus rings are visible for keyboard users, and a folder that has a cover and an `info.json` but zero `.mp3` files — which is true for **10 of the 11 playlist folders shipped in `songs/`** — renders a calm empty state instead of a silent, broken player.

---

## What You'll Learn

- How to play, pause, and seek audio using the HTML5 `Audio` object (no `<audio>` tag needed).
- How to fetch a server's **directory listing** and parse it as HTML to discover files at runtime.
- Why the app *must* run on a local server (and what `.htaccess` with `Options +Indexes` does on Apache).
- `async/await`, `try/catch`, and graceful fallbacks when a `fetch` fails — including when the *directory itself* 404s.
- Dynamic DOM construction: building song list items and album cards from data with `createElement` + `innerHTML`, including an **empty-state** row when a playlist has no playable tracks.
- Event-driven programming: `click`, `input`, `keydown`, `pointerdown/move/up`, `timeupdate`, and `ended` listeners.
- Seekbar math done **correctly** — `clientX - getBoundingClientRect().left`, not `offsetX`, so clicking the knob itself doesn't jump the playhead to zero.
- The **Pointer Events API** (`setPointerCapture`) for a draggable seek knob that keeps tracking the pointer even outside the bar's bounds.
- A real keyboard control layer: `Space` to toggle playback (with `preventDefault`), arrow keys to seek and adjust volume, and why you must ignore keystrokes while an `<input>` has focus.
- Loop and shuffle as first-class, persistent toggle states — `audio.loop` for repeat-one, a tracked boolean + `aria-pressed` for shuffle.
- Volume control and mute toggling driven by **state** (`currentSong.volume`), not by parsing an icon's `src` string.
- `IntersectionObserver` for staggered scroll-reveal animations.
- Responsive design: an off-canvas sidebar driven by a hamburger button and CSS media queries.
- Accessible icon buttons: real `<button>` elements (not bare `<img>`/`<li>`), `aria-label`, `aria-pressed`, `role="slider"` with `aria-valuenow`, and visible `:focus-visible` rings.
- Modern CSS: custom properties (design tokens — including a text-hierarchy and border-progression scale), `backdrop-filter` glassmorphism, CSS Grid playbar layout, keyframe animations, `prefers-reduced-motion`, and a small Tailwind-style utility class system.
- URL encoding/decoding with `decodeURIComponent` when file names contain spaces and special characters.

---

## Project Structure

```
Lec-84 Spotify Clone/
├── index.html                 # Single page: sidebar, header, hero, album cards, playbar
├── favicon.ico                # Site icon — now actually linked in <head>
├── css/
│   ├── style.css               # Theming, layout, tokens, animations, focus states, responsive rules
│   └── utility.css             # Small Tailwind-style utility classes (.flex, .invert, .m-1 …)
├── js/
│   └── script.js               # All player logic: fetching songs, playback, keyboard, drag-seek, UI events
├── img/                        # SVG/PNG icons (play, pause, volume, mute, hamburger, logo …) + cover.jpg
└── songs/                      # "Database" — one folder per playlist/album
    ├── .htaccess                # Enables Apache directory listing (Options +Indexes)
    ├── the-chainsmokers/        # Default playlist on load — cover.jpg + info.json, NO .mp3 files
    ├── Closer_(mood)/           # The only folder in this project that actually ships an .mp3
    ├── closer-era/  memories/  world-war-joy/
    ├── EDM_(mood)/  Festival_(mood)/  High_(mood)/
    ├── Late_Night_(mood)/  Melancholy_(mood)/  Rave_(mood)/
    └── …                        # Add a folder + cover + info.json + mp3s = new playlist appears
```

The key architectural idea is unchanged: **the `songs/` folder *is* the database.** Drop in a new folder with a `cover.jpg`, an `info.json`, and some `.mp3` files, and the app discovers and renders it automatically — no code changes required.

> **Assumption about the data.** Only `songs/Closer_(mood)/` ships an actual `.mp3` (confirmed by hitting the live directory listing: `The Chainsmokers - Closer (R3hab Remix Audio) ft. Halsey.mp3`). Every other folder — including `the-chainsmokers/`, the one loaded by default on page load — has only `cover.jpg` and `info.json`. That means **the empty-state UI described below is not a hypothetical edge case; it's what you see the moment the page loads**, and it's what you'll see for 10 of the 11 cards in the grid until you drop real audio files into their folders.

---

## Concept Deep-Dives

### 1. The HTML5 `Audio` API (JavaScript-only playback)

We never write an `<audio>` element in the HTML. Instead, `script.js` creates one entirely in JavaScript:

```js
let currentSong  = new Audio();
let songs        = [];
let currFolder   = '';
let currArtist   = 'The Chainsmokers';
let prevVolume   = 0.70;
let isShuffling  = false;
let isLooping    = false;
let isSeeking    = false;

currentSong.volume = prevVolume;
```

`new Audio()` returns an `HTMLAudioElement` that lives in memory. It exposes everything a media player needs:

| Property / Method | What it does | Where the project uses it |
|---|---|---|
| `.src` | URL of the track to load | `playMusic()` sets it per song |
| `.play()` / `.pause()` | Start / stop playback | Play button, prev/next handlers |
| `.paused` | Boolean — is it currently paused? | Play/pause toggle logic |
| `.currentTime` | Playback position in seconds (read **and** write) | Time display, seekbar seeking, `ArrowLeft`/`ArrowRight` |
| `.duration` | Track length in seconds (`NaN` until metadata loads) | Progress percentage |
| `.volume` | 0.0 – 1.0 | Volume slider, mute toggle, `ArrowUp`/`ArrowDown` |
| `.loop` | Native repeat-one | Loop toggle button |
| `timeupdate` event | Fires several times/second during playback | Updates clock + seekbar |
| `ended` event | Fires when the track finishes (never fires while `.loop === true`) | Auto-advance / shuffle-advance |

A single `Audio` instance is reused for every song — changing `.src` swaps the track. Two new booleans, `isShuffling` and `isLooping`, and a third, `isSeeking`, ride alongside the original state: `isSeeking` tells the `timeupdate` handler to back off while the user is actively dragging the seek knob, so the two don't fight over the knob's position.

### 2. `fetch` + `async/await` + Directory Listing Scraping (now resilient)

The most unusual (and cleverest) idea in the project: **there is no API and no JSON list of songs.** Instead, we ask the web server for the *folder itself* and parse the HTML index page it returns:

```js
songs = [];
try {
    const res  = await fetch(`/${folder}/`);
    const html = await res.text();
    const div  = document.createElement("div");
    div.innerHTML = html;

    for (const a of div.querySelectorAll("a")) {
        const href = a.getAttribute('href') || '';
        if (href.toLowerCase().endsWith('.mp3')) songs.push(href);
    }
} catch (e) { /* folder listing unavailable — fall through to empty state */ }
```

Step by step:

1. `fetch(`/${folder}/`)` requests a **directory URL** (trailing slash). A server with directory listing enabled responds with an auto-generated HTML page full of `<a href="...">` links — one per file.
2. `await res.text()` reads that HTML as a string.
3. We inject the string into a detached `<div>` — an in-memory DOM we can query without touching the page.
4. `div.querySelectorAll("a")` finds every link; anything ending in `.mp3` is a song.
5. **New:** the whole block is wrapped in `try/catch`. If the folder itself 404s, or the server rejects the request outright, `songs` simply stays `[]` and the UI falls through to the empty-state row below — it never throws an uncaught error into the console.

Note the comment in the source explaining a subtle bug fix that predates this pass and is still load-bearing:

```js
// ── LOAD SONGS FROM FOLDER ────────────────
// FIX: use getAttribute('href') so relative links aren't resolved against page URL
```

If you read `a.href` (the *property*), the browser resolves it into an **absolute URL**. Using `a.getAttribute('href')` returns the **raw attribute text** exactly as the server wrote it, so relative filenames stay clean and comparable.

### 3. `.htaccess` and Directory Indexes

The entire "scrape the folder" trick only works if the server is willing to *list* directory contents. On an **Apache** server that behavior is controlled by `songs/.htaccess`:

```apacheconf
Options +Indexes
IndexOptions FancyIndexing NameWidth=* DescriptionWidth=*
```

- `Options +Indexes` — when a URL points at a directory with no `index.html`, Apache generates an HTML listing of its files instead of returning `403 Forbidden`.
- `IndexOptions FancyIndexing NameWidth=* DescriptionWidth=*` — use the "fancy" table-style listing and never truncate long file names (important, because we parse the `href` of each link and a truncated name would break playback).

Important nuance: **`.htaccess` only affects Apache.** Development servers like VS Code Live Server, `npx serve`, or Python's `http.server` generate their own directory listings natively and ignore this file entirely — which is why the app still works with them (verified while building this pass: `python -m http.server` happily lists `/songs/` and returns `200` for every folder).

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

This is a miniature example of a **data contract**: the JavaScript agrees to look for `title` and `description`, and any folder that honors the contract "just works." The card's `aria-label` (`Play ${info.title}`) is also built from this contract, so a well-formed `info.json` improves accessibility for free.

### 5. DOM Manipulation — Building UI from Data (with an empty state)

Both the song list and the album cards start as **empty containers** in `index.html`:

```html
<div class="songList"><ul></ul></div>
```

```html
<!-- Album Cards -->
<div class="cardContainer"></div>
```

JavaScript then fills them. The song list, from `getSongs()`, now branches on whether any `.mp3` files were found:

```js
const ul = document.querySelector(".songList ul");
ul.innerHTML = "";

if (songs.length === 0) {
    const li = document.createElement("li");
    li.className = "empty-state";
    li.innerHTML = `
        <img class="invert" width="26" src="img/music.svg" alt="">
        <p>No tracks in this playlist yet</p>`;
    ul.appendChild(li);
    return songs;
}

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

- **Early return on empty data.** Rather than letting a `forEach` over an empty array silently render nothing, the empty case is checked explicitly and given its own dashed-border row (`.empty-state` in `style.css`) with a short, honest message.
- **`createElement` + `innerHTML` hybrid** — create the outer element in JS (so we can attach a listener and dataset to it), then template its inner markup with a template literal.
- **`li.dataset.href = song`** — the `data-href` attribute stores the *raw, URL-encoded* filename so that later we can match it against `currentSong.src` to highlight the active song. `updateActiveSong()` now specifically selects `.songList ul li[data-href]`, so the empty-state row (which has no `data-href`) is never accidentally toggled `.active`.
- **`decodeURIComponent(song)`** — server listings URL-encode names (`My%20Song.mp3`), so we decode before showing them to humans.
- **Staggered entrance** — `li.style.animationDelay = `${i * 0.07}s`` offsets each item's `slideLeft` CSS animation by 70 ms, producing a cascade.

### 6. Event Listeners — The Player's Nervous System

Everything interactive is wired in `main()` with `addEventListener`. Next/previous logic was pulled out of the click handlers into two shared functions so buttons, `ended`, and shuffle can all call the same code:

```js
function playNext() {
    if (!songs.length) return;
    const idx = currentIndex();
    if (isShuffling) {
        playMusic(songs[getRandomIndex(idx, songs.length)]);
    } else if (idx + 1 < songs.length) {
        playMusic(songs[idx + 1]);
    }
}

function playPrev() {
    if (!songs.length) return;
    const idx = currentIndex();
    if (isShuffling) {
        playMusic(songs[getRandomIndex(idx, songs.length)]);
    } else if (idx > 0) {
        playMusic(songs[idx - 1]);
    }
}
```

`ended` follows the same shuffle-aware branch, with one important note: because `currentSong.loop` is a native property, **the `ended` event never fires while looping is on** — the browser restarts the track internally before `ended` would have been dispatched. Repeat-one is therefore "free": no bookkeeping needed once `currentSong.loop = true` is set.

```js
currentSong.addEventListener("ended", () => {
    const idx = currentIndex();
    if (isShuffling && songs.length > 1) {
        playMusic(songs[getRandomIndex(idx, songs.length)]);
    } else if (idx + 1 < songs.length) {
        playMusic(songs[idx + 1]);
    } else {
        setPlayIcon("img/play.svg");
        setEqualizer(false);
        updatePlayButtonA11y(false);
    }
});
```

Two details worth memorizing:

- **`|| 0` guards against `NaN`** in the `timeupdate` handler. Before a track's metadata loads, `currentSong.duration` is `NaN`, so `currentTime / duration * 100` is `NaN`. `NaN || 0` evaluates to `0`, keeping the seekbar sane.
- **Finding "which song is playing"** is centralized in `currentIndex()`: `currentSong.src.split("/").pop()` grabs everything after the last slash, and `songs.indexOf(file)` finds its position in the playlist.

### 7. Seekbar Math — Fixed, Plus a Real Draggable Knob

This is the headline bug fix. The **old** handler used `e.offsetX`, which is measured relative to whichever element the pointer event *targets* — if you clicked precisely on the white `.circle` knob (a child of the seekbar), `offsetX` was relative to the *tiny circle*, not the bar, and the playhead would jump to near 0%. The **new** handler uses `clientX` (viewport-relative, the same coordinate space regardless of which child was hit) minus the bar's own `getBoundingClientRect().left`:

```js
const seekbar = document.getElementById("seekbar");
const seekKnob = document.getElementById("seekKnob");

function pctFromClientX(clientX) {
    const rect = seekbar.getBoundingClientRect();
    const pct  = ((clientX - rect.left) / rect.width) * 100;
    return Math.min(100, Math.max(0, pct));
}

function seekToPct(pct) {
    setProgress(pct);
    if (!isNaN(currentSong.duration) && currentSong.duration > 0) {
        currentSong.currentTime = (currentSong.duration * pct) / 100;
    }
}

seekbar.addEventListener("click", e => {
    seekToPct(pctFromClientX(e.clientX));
});
```

On top of the fix, the knob is now **draggable** using the Pointer Events API. `setPointerCapture` is the key trick: once called inside `pointerdown`, all subsequent `pointermove`/`pointerup` events for that pointer keep firing on `seekKnob` even if the cursor moves outside the bar — no need for a document-level fallback listener, and no risk of "losing" the drag if the pointer moves fast:

```js
seekKnob.addEventListener("pointerdown", e => {
    isSeeking = true;
    seekbar.classList.add("dragging");
    seekKnob.setPointerCapture(e.pointerId);
});
seekKnob.addEventListener("pointermove", e => {
    if (!isSeeking) return;
    setProgress(pctFromClientX(e.clientX));
});
seekKnob.addEventListener("pointerup", e => {
    if (!isSeeking) return;
    isSeeking = false;
    seekbar.classList.remove("dragging");
    seekToPct(pctFromClientX(e.clientX));
});
```

While `isSeeking` is `true`, the `timeupdate` handler stops calling `setProgress()` (see Concept 6's neighbor in `main()`), so the audio's real playback position can't yank the knob back mid-drag. `currentSong.currentTime` is only actually written once, on `pointerup` — dragging is visual-only until release, which avoids spamming the browser with hundreds of seek operations per second.

The visual update is still centralized in one helper that moves the knob, feeds the CSS custom property that drives the gradient fill, **and** keeps the accessible `aria-valuenow` in sync:

```js
function setProgress(pct) {
    pct = Math.min(100, Math.max(0, pct || 0));
    const seekbar = document.getElementById('seekbar');
    document.getElementById('seekKnob').style.left = pct + "%";
    seekbar.style.setProperty('--progress', pct + '%');
    seekbar.setAttribute('aria-valuenow', Math.round(pct));
}
```

On the CSS side, dragging also disables the fill's `.28s` width transition (so it tracks the pointer instantly instead of lagging) and enlarges the knob for visual feedback:

```css
.seekbar.dragging { height:6px; }
.seekbar.dragging::before { transition:none; }
.seekbar.dragging .circle {
    transition:transform .18s; transform:translateY(-50%) scale(1.5);
    cursor:grabbing;
}
```

The knob also gets a generous invisible hit-area via `::before` (a 33×33px target around a visually precise 13px dot) — a standard accessibility/ergonomics pattern for small interactive elements, especially on touch:

```css
.circle::before {
    content:''; position:absolute; inset:-8px; border-radius:50%;
}
```

### 8. Time Formatting

A tiny, defensive utility converts raw seconds into `MM:SS`, unchanged from the original build:

```js
function fmt(s) {
    if (isNaN(s) || s < 0) return "00:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}
```

The `isNaN` guard matters because `duration` is `NaN` until the browser has loaded the track's metadata; without it, the playbar would flash `NaN:NaN`. It feeds the current/total time display: `${fmt(currentSong.currentTime)} / ${fmt(currentSong.duration)}`.

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

`prefers-reduced-motion: reduce` (Concept 18) collapses all of this to effectively instant, so users who've asked their OS for less motion still get the content, just without the wave effect.

### 10. Accessible Icon Buttons — Real `<button>`s Everywhere

The original markup used bare `<img>` and `<li>` elements as click targets for the hamburger, close, nav items, and transport controls — none of them were reachable with `Tab`, and screen readers had nothing but a filename to announce. Every icon-only control is now a real `<button>`:

```html
<button type="button" class="icon-btn" id="previous" aria-label="Previous track">
    <img width="26" src="img/prevsong.svg" alt="">
</button>

<button class="play-circle" id="play" aria-label="Play" aria-pressed="false">
    <img class="play-icon" src="img/play.svg" alt="">
</button>

<button type="button" class="icon-btn volume-btn" id="volumeBtn" aria-label="Mute" aria-pressed="false">
    <img width="20" src="img/volume.svg" alt="">
</button>
```

The `<img>`s inside these buttons carry `alt=""` — deliberately empty, because the button's own `aria-label` already describes the action, and a screen reader announcing both would be redundant. `updatePlayButtonA11y()` keeps the play button's `aria-label`/`aria-pressed` in sync with playback state:

```js
function updatePlayButtonA11y(isPlaying) {
    const btn = document.getElementById('play');
    btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    btn.setAttribute('aria-pressed', String(isPlaying));
}
```

The seekbar is exposed to assistive tech as a real slider:

```html
<div class="seekbar" id="seekbar" role="slider" tabindex="0"
     aria-label="Seek" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="circle" id="seekKnob"></div>
</div>
```

And album cards — plain `<div>`s originally, mouse-only — are now keyboard-operable too, with `Enter`/`Space` triggering the same handler as a click:

```js
card.setAttribute("tabindex", "0");
card.setAttribute("role", "button");
card.setAttribute("aria-label", `Play ${info.title}`);
...
card.addEventListener("click", activateCard);
card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateCard();
    }
});
```

Focus itself is visible everywhere via one global rule in `style.css`:

```css
a:focus-visible,
button:focus-visible,
[tabindex]:focus-visible,
input:focus-visible {
    outline: 2px solid var(--border-focus);
    outline-offset: 3px;
    border-radius: 6px;
}
```

### 11. Keyboard Controls

A single `keydown` listener on `document` drives playback the way a real media app would — `Space` to toggle play/pause, `←`/`→` to seek 5 seconds, `↑`/`↓` to nudge the volume:

```js
document.addEventListener("keydown", e => {
    const tag = (e.target && e.target.tagName) || '';
    if (tag === "INPUT" || tag === "TEXTAREA" || e.target.isContentEditable) return;

    switch (e.code) {
        case "Space":
            e.preventDefault();
            togglePlayPause();
            break;
        case "ArrowRight":
            e.preventDefault();
            if (!isNaN(currentSong.duration)) {
                currentSong.currentTime = Math.min(currentSong.duration, currentSong.currentTime + 5);
            }
            break;
        case "ArrowLeft":
            e.preventDefault();
            currentSong.currentTime = Math.max(0, currentSong.currentTime - 5);
            break;
        case "ArrowUp":
            e.preventDefault();
            setVolume(currentSong.volume + 0.10);
            break;
        case "ArrowDown":
            e.preventDefault();
            setVolume(currentSong.volume - 0.10);
            break;
    }
});
```

Two things matter here:

- **`e.preventDefault()` on `Space`** stops the browser's default behavior (scrolling the page down) — the single most common bug when wiring Space as a shortcut.
- **The `INPUT`/`TEXTAREA`/`isContentEditable` guard** means these shortcuts don't hijack the volume `<input type="range">` — dragging the native slider with arrow keys still works natively instead of being intercepted by the global handler.

`setVolume()` is the single source of truth both the slider and the keyboard call into, so they can never disagree:

```js
function setVolume(val) {
    val = Math.min(1, Math.max(0, val));
    currentSong.volume = val;
    if (val > 0) prevVolume = val;
    updateVolumeUI(val);
}
```

### 12. Loop & Shuffle — Persistent Toggle States

Both toggles follow the same visual pattern as the mute icon: click, flip a boolean, reflect the new state everywhere (class, `aria-pressed`, `aria-label`) — and, crucially, the state *persists* across song changes because it lives outside `playMusic()`.

```js
const loopBtn = document.getElementById("loop");
loopBtn.addEventListener("click", () => {
    isLooping = !isLooping;
    currentSong.loop = isLooping;
    loopBtn.classList.toggle("active", isLooping);
    loopBtn.setAttribute("aria-pressed", String(isLooping));
    loopBtn.setAttribute("aria-label", isLooping ? "Loop: on" : "Loop: off");
});

const shuffleBtn = document.getElementById("shuffle");
shuffleBtn.addEventListener("click", () => {
    isShuffling = !isShuffling;
    shuffleBtn.classList.toggle("active", isShuffling);
    shuffleBtn.setAttribute("aria-pressed", String(isShuffling));
    shuffleBtn.setAttribute("aria-label", isShuffling ? "Shuffle: on" : "Shuffle: off");
});
```

Loop needs no extra bookkeeping — `currentSong.loop` is a **native** `HTMLMediaElement` property, and because the same `Audio()` instance is reused for every track (Concept 1), setting it once keeps it set across every subsequent `playMusic()` call until the user turns it off again.

Shuffle picks a random index different from the current one, reused by `playNext`, `playPrev`, and the `ended` auto-advance:

```js
function getRandomIndex(excludeIdx, len) {
    if (len <= 1) return excludeIdx;
    let idx;
    do { idx = Math.floor(Math.random() * len); } while (idx === excludeIdx);
    return idx;
}
```

Visually, an engaged toggle gets a purple glow on its icon plus a small dot beneath it — one shared rule handles both buttons:

```css
.icon-btn.active { color:var(--purple); }
.icon-btn.active svg {
    opacity:1; color:var(--purple);
    filter:drop-shadow(0 0 6px rgba(139,92,246,.75));
}
.icon-btn.active::after {
    content:''; position:absolute; bottom:2px; left:50%;
    transform:translateX(-50%);
    width:4px; height:4px; border-radius:50%;
    background:var(--purple);
    box-shadow:0 0 6px rgba(139,92,246,.9);
}
```

The shuffle and loop glyphs are hand-written inline SVGs (no new asset files needed) using `stroke="currentColor"`, so they inherit whatever color the button's CSS state sets:

```html
<button type="button" class="icon-btn" id="shuffle" aria-label="Shuffle: off" aria-pressed="false">
    <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true" focusable="false">
        <path d="M3 6.5h3.2c1.4 0 2.3.55 3.05 1.6L15 17.9h3.5M3 17.5h3.2c1.4 0 2.3-.55 3.05-1.6L11 12" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M15 6.5h3.5M16.6 4l2.4 2.5-2.4 2.5M16.6 15.4l2.4 2.5-2.4 2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
</button>
```

### 13. Volume + Mute — State-Driven, Not String-Matching

The original mute toggle inspected `e.target.src.includes("volume.svg")` to decide which direction to flip — functional, but fragile (renaming an icon file would silently break it). The rebuilt version treats `currentSong.volume` as the single source of truth and derives the icon from it:

```js
function updateVolumeUI(val) {
    volumeSlider.value = Math.round(val * 100);
    if (val > 0) {
        volumeIcon.src = "img/volume.svg";
        volumeBtn.setAttribute("aria-label", "Mute");
        volumeBtn.setAttribute("aria-pressed", "false");
    } else {
        volumeIcon.src = "img/mute.svg";
        volumeBtn.setAttribute("aria-label", "Unmute");
        volumeBtn.setAttribute("aria-pressed", "true");
    }
}
```

```js
volumeBtn.addEventListener("click", () => {
    if (currentSong.volume > 0) {
        prevVolume = currentSong.volume;
        setVolume(0);
    } else {
        setVolume(prevVolume || 0.70);
    }
});
```

`prevVolume` still remembers the last non-zero level so unmuting restores exactly where you left off — same idea as the original, cleaner implementation.

### 14. Hamburger Menu & Responsive Off-Canvas Sidebar

On wide screens, the sidebar (`.left`) sits beside the content in a flex row. Below **1200px**, CSS repositions it *off-screen* and the hamburger slides it back in. The hamburger and close controls are now buttons (Concept 10), and the JavaScript is still deliberately minimal — it only toggles a class; **CSS owns the animation**:

```js
document.querySelector(".hamburger-btn").addEventListener("click", () => {
    document.querySelector(".left").classList.add("open");
});
document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").classList.remove("open");
});
```

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
    .hamburger-btn { display:flex; }
    ...
}
```

This "JS toggles state, CSS renders state" separation is the idiomatic vanilla pattern for menus, modals, and drawers.

### 15. Layout — Flexbox Shell + CSS Grid Playbar

The page shell is a two-column flex layout:

```css
.container { display:flex; min-height:100vh; position:relative; z-index:1; }
```

```css
.left { width:25vw; padding:10px; flex-shrink:0; }
```

The floating playbar uses **CSS Grid** — three columns (now-playing / controls / volume) on row one, and a full-width seekbar spanning row two:

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
.seekbar {
    grid-column:1 / -1; grid-row:2;
    height:4px; border-radius:10px;
    background:rgba(255,255,255,.10);
    position:relative; cursor:pointer; margin-top:6px;
    transition:height .18s;
}
```

- `grid-template-columns:1fr auto 1fr` centers the controls perfectly regardless of song-title width — something Flexbox `justify-content:space-between` cannot guarantee.
- `grid-column:1 / -1` means "span from the first grid line to the last" — the seekbar stretches the full bar width.
- `position:fixed; bottom:18px; left:50%; transform:translateX(-50%)` is the standard horizontal-centering trick for fixed elements; `.mainContent { padding-bottom:100px; }` reserves room for it in the scrolling content below.

### 16. CSS Custom Properties as Design Tokens

The color system lives in `:root` and now includes a **text hierarchy**, a **border progression**, and dedicated **control tokens** — not just a flat palette — so new components (the empty state, icon buttons, focus rings) have somewhere principled to draw from instead of inventing new one-off values:

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

    /* ── text hierarchy (four levels, not just "text" + "muted") ── */
    --text-primary:   #E8E8F0;
    --text-secondary: rgba(232,232,240,0.68);
    --text-tertiary:  rgba(232,232,240,0.44);
    --text-muted:     #6B7280;

    /* ── border progression — intensity matched to importance ── */
    --border-subtle: rgba(139,92,246,0.10);
    --border-strong: rgba(139,92,246,0.45);
    --border-focus:  var(--pink);

    /* ── control tokens — independent from layout surfaces ── */
    --control-bg:     rgba(255,255,255,0.04);
    --control-hover:  rgba(139,92,246,0.14);
    --focus-ring:     0 0 0 3px rgba(236,72,153,0.30);
}
```

They're consumed everywhere with `var(--purple)`, and — as seen with `--progress` on the seekbar — custom properties are also a **runtime channel from JavaScript into CSS** via `style.setProperty()`.

### 17. Utility Classes (`utility.css`) — and a Scrollbar Bug That Was Fixed

A miniature homage to Tailwind: single-purpose classes composed directly in the HTML (`.flex`, `.invert`, `.bg-grey`, `.rounded`, `.m-1`, `.p-1`, …), unchanged in spirit from the original build.

One real bug lived here, though: `utility.css` is loaded in `<head>` **after** `style.css`, and it used to define its *own* `::-webkit-scrollbar` rules (a plain 12px dark-grey scrollbar). Because it loaded second, it silently won the cascade over `style.css`'s intentionally refined 5px purple-accented scrollbar — the "elegant scrollbar" the theme was designed around was never actually visible. The fix was to delete the duplicate block from `utility.css` and leave scrollbar styling solely owned by `style.css`:

```css
/* utility.css */
.p-1{
    padding: 10px;
}

/* Scrollbar styling lives in style.css (the refined, on-brand version) —
   intentionally not duplicated here so the two stylesheets never race
   for the same rule and silently override each other. */
```

```css
/* style.css */
::-webkit-scrollbar { width:5px; }
::-webkit-scrollbar-thumb { background:rgba(139,92,246,.45); border-radius:6px; }
::-webkit-scrollbar-track { background:rgba(255,255,255,.03); }
scrollbar-color:rgba(139,92,246,.45) transparent;
```

**Lesson:** two stylesheets that both claim the same selector is a silent bug — the "winner" is decided by load order and specificity, not by which one you *meant* to be authoritative. Keep global concerns (like scrollbars) owned by exactly one file.

### 18. Ambient Animation Layer (Aurora, Orbs, Equalizer) — and Respecting Motion Preferences

Purely decorative but instructive CSS. The animated aurora is a fixed, oversized pseudo-element behind everything, and the playbar's "equalizer" is five `<span>` bars whose heights pulse with different durations and delays so they never sync up — a cheap illusion of reactive audio. Both are unchanged from the original build, but they — along with every other animation in the project — now respect the user's OS-level motion preference:

```css
@media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
        animation-duration: .01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: .01ms !important;
        scroll-behavior: auto !important;
    }
}
```

This is a single, blanket rule placed near the top of `style.css` rather than a per-animation opt-out — simpler to maintain, and it can't be forgotten when a new keyframe animation is added later.

---

## Full Code Walkthrough — `js/script.js`

### Global State

```js
let currentSong  = new Audio();
let songs        = [];
let currFolder   = '';
let currArtist   = 'The Chainsmokers';
let prevVolume   = 0.70;
let isShuffling  = false;
let isLooping    = false;
let isSeeking    = false;

currentSong.volume = prevVolume;
```

Eight module-level variables carry all state — the original five (`currentSong`, `songs`, `currFolder`, `currArtist`, `prevVolume`) plus the three added for this pass (`isShuffling`, `isLooping`, `isSeeking`).

### Helpers: `fmt`, `setProgress`, `setPlayIcon`, `updatePlayButtonA11y`, `setNowPlayingArt`

- `fmt(s)` — seconds → `MM:SS`, guarding `NaN` (Concept 8).
- `setProgress(pct)` — moves the knob, updates the `--progress` gradient variable, **and** syncs `aria-valuenow` (Concept 7).
- `setPlayIcon(src)` swaps the image inside the circular play button between `img/play.svg` and `img/pause.svg`.
- `updatePlayButtonA11y(isPlaying)` — new — keeps the play button's `aria-label`/`aria-pressed` truthful (Concept 10).
- `setNowPlayingArt()` points the playbar thumbnail at the current playlist's `cover.jpg`, with an `onerror` fallback to a generic music icon; it now also bails out early if `currFolder` is still empty, so it can't throw before the first playlist has loaded.

### `revealObserver`, `updateActiveSong`, `setEqualizer`

Unchanged in behavior from the original build (Concepts 9 and 5), except `updateActiveSong` now scopes its query to `li[data-href]` so the empty-state row is never mistaken for a song.

### `getRandomIndex` / `currentIndex`

Two small helpers that back shuffle and next/prev:

```js
function getRandomIndex(excludeIdx, len) {
    if (len <= 1) return excludeIdx;
    let idx;
    do { idx = Math.floor(Math.random() * len); } while (idx === excludeIdx);
    return idx;
}

function currentIndex() {
    const file = currentSong.src.split("/").pop();
    return songs.indexOf(file);
}
```

### `getSongs(folder)` — load a playlist

Data flow:

1. Store `folder` into `currFolder`.
2. Fetch `info.json` for the artist/playlist title, with a `try/catch` fallback.
3. Fetch the **directory listing** at `/${folder}/` inside its own `try/catch` (Concept 2), parse it in a detached `<div>`, and collect every `<a>` whose `getAttribute('href')` ends with `.mp3`.
4. If nothing was found, render the single `.empty-state` row and return early.
5. Otherwise wipe and rebuild the sidebar `<ul>`, one `<li>` per song, exactly as before.
6. Return `songs`.

### `playMusic(track, pause = false)` — start (or stage) a track

```js
const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track;

    if (!pause) {
        currentSong.play();
        setPlayIcon("img/pause.svg");
        setEqualizer(true);
        updatePlayButtonA11y(true);
    } else {
        updatePlayButtonA11y(false);
    }

    document.querySelector(".songinfo").innerHTML = decodeURIComponent(track);
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
    setProgress(0);
    setNowPlayingArt();
    setTimeout(updateActiveSong, 100);
};
```

The `pause = false` default parameter is still the trick that lets `main()` pre-load the first song at startup *without* autoplaying it (`playMusic(songs[0], true)`) — browsers block autoplay with sound anyway, so this respects both UX and policy. The `else` branch now also calls `updatePlayButtonA11y(false)`, so a staged-but-not-playing track correctly announces "Play" rather than lying about state.

### `showEmptyPlaylist()` — new

Called whenever a clicked album card resolves to zero playable tracks. It pauses and fully detaches the previous track (`removeAttribute("src")` + `.load()`) so a stray press of the play button can't resume stale audio while the UI claims there's nothing to play, resets the clock/progress, and writes an honest status message:

```js
function showEmptyPlaylist() {
    currentSong.pause();
    currentSong.removeAttribute("src");
    currentSong.load();
    setPlayIcon("img/play.svg");
    setEqualizer(false);
    updatePlayButtonA11y(false);
    document.querySelector(".songinfo").textContent = "No playable tracks in this playlist";
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
    setProgress(0);
    setNowPlayingArt();
}
```

### `displayAlbums()` — discover playlists and build cards

Same folder-discovery logic as before (Concept 2's sibling — parsing `/songs/`, keeping only trailing-slash, non-hidden, non-parent links), with two additions: each card gets `tabindex="0"`, `role="button"`, and an `aria-label` (Concept 10), and the click handler was extracted into a named `activateCard` function so it can be shared between `click` and `keydown`:

```js
const activateCard = async () => {
    document.querySelectorAll(".card").forEach(c => c.classList.remove("card-active"));
    card.classList.add("card-active");
    songs = await getSongs(`songs/${card.dataset.folder}`);
    if (songs.length > 0) {
        playMusic(songs[0]);
    } else {
        showEmptyPlaylist();
    }
};

card.addEventListener("click", activateCard);
card.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activateCard();
    }
});
```

### `main()` — bootstrap and event wiring

Runs once at the bottom of the file (`main();`). In order:

1. **Initial load** — `await getSongs("songs/the-chainsmokers")`. Since that folder has no `.mp3` files, this immediately exercises the empty-state path; `if (songs.length > 0) playMusic(songs[0], true);` is simply skipped.
2. **Render all album cards** — `await displayAlbums();`
3. **Play/pause** — `togglePlayPause()`, shared by the button click and the `Space` key.
4. **`timeupdate`** — refreshes the clock and calls `setProgress()` **unless `isSeeking` is true** (Concept 7).
5. **`playNext` / `playPrev`** — shuffle-aware, shared by the transport buttons and the `ended` handler.
6. **`ended`** — auto- or shuffle-advances, or resets the icon/equalizer/`aria-pressed` at the end of the playlist.
7. **Seekbar** — click-to-seek (fixed math) plus pointer-capture drag (Concept 7).
8. **Hamburger / close** — adds/removes `.open` on the sidebar (Concept 14).
9. **Previous / Next buttons** — call the shared `playPrev`/`playNext`.
10. **Loop toggle** — flips `isLooping`, sets `currentSong.loop`, updates class + ARIA (Concept 12).
11. **Shuffle toggle** — flips `isShuffling`, updates class + ARIA (Concept 12).
12. **Volume** — `setVolume()` / `updateVolumeUI()`, wired to both the slider `input` event and the mute button `click` (Concept 13).
13. **Keyboard controls** — the global `keydown` listener (Concept 11).

### How the data flows, end to end

```
main()
 ├─ getSongs("songs/the-chainsmokers")   →  songs = [] → empty-state row rendered
 ├─ (playMusic skipped — nothing to stage)
 └─ displayAlbums()                      →  fetch /songs/ listing → cards (incl. keyboard support)
        │  user clicks/Enters a card
        └─ getSongs("songs/<folder>")    →  songs[] rebuilt (or empty-state again)
               │  if songs.length > 0:
               │      user clicks a song, or playMusic(songs[0]) runs automatically
               │      └─ playMusic(track) → currentSong.src set → .play()
               │             ├─ "timeupdate" → clock + setProgress() (unless isSeeking)
               │             └─ "ended"      → playNext()-equivalent logic, shuffle-aware
               │  else:
               │      └─ showEmptyPlaylist() → honest status text, no stale audio
```

---

## How to Run

**You cannot just double-click `index.html`.** Two reasons:

1. **`fetch` is blocked on `file://` URLs.** Browsers treat local files as an opaque origin, so every `fetch()` in `script.js` would fail with a CORS/security error.
2. **There is no directory listing without a server.** The app discovers playlists by fetching `/songs/` and songs by fetching `/songs/<folder>/` — only a web server can answer those requests with an HTML index page. (On Apache specifically, `songs/.htaccess` with `Options +Indexes` grants this; dev servers like Live Server, `serve`, and Python's `http.server` list directories out of the box — confirmed while building this pass.)

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

Then click any album card (or `Tab` to it and press `Enter`) → its songs fill the left sidebar → click a song, or use the playbar. Use the hamburger icon to open the library on narrow screens, `Space` to play/pause, `←`/`→` to seek, `↑`/`↓` for volume, and the new shuffle/loop buttons flanking the transport controls.

---

## Key Takeaways

- **The filesystem can be your database.** Directory listings + `fetch` + a tiny `info.json` contract give you a zero-backend, drop-a-folder-in CMS. It's a teaching device more than a production pattern, but it demystifies "dynamic" apps.
- **One `Audio` object, many songs.** Reuse the element, swap `.src`, and attach media event listeners exactly once. Native properties like `.loop` persist automatically because the object never gets recreated.
- **JS toggles classes; CSS animates.** The hamburger drawer, equalizer, active song glow, loop/shuffle dots, and card reveals are all class flips — the motion lives entirely in stylesheets.
- **`clientX - rect.left`, not `offsetX`.** `offsetX` is relative to whatever element the pointer actually hit — including a small child like a seek knob. Measuring from the viewport and subtracting the container's own offset is the robust pattern, and it's what makes both click-to-seek and drag-to-seek land in the same place.
- **State drives UI, not the other way around.** The rebuilt mute toggle and play button read from `currentSong.volume`/`.paused`; they don't infer state by parsing an `<img src>` string. This is the difference between a UI that's *displaying* truth and one that's *guessing* at it.
- **Real buttons, real labels.** An `<img>` or `<li>` with a click handler looks interactive but isn't reachable by keyboard and has no accessible name. A `<button>` with an `aria-label` costs nothing and fixes both.
- **Defend against the network — and against empty data.** Every `fetch` has a fallback; every cover image has an `onerror`; and now every playlist with zero tracks gets a real UI state instead of a silent no-op.
- **Two stylesheets can silently fight over the same selector.** The scrollbar bug in `utility.css` vs. `style.css` is a reminder to give every cross-cutting concern exactly one owner.

## Common Pitfalls

1. **Opening via `file://`** — everything silently fails because `fetch` can't run. Always use a local server.
2. **Serving the wrong root** — the root-absolute paths (`/songs/...`, `/${currFolder}/cover.jpg`) break if the project sits in a subfolder of the served root (e.g. opening the *parent* "Pending Notes" folder in Live Server). Serve the clone folder itself.
3. **URL encoding mismatches** — filenames with spaces arrive as `%20`. Display uses `decodeURIComponent`, but comparisons (`songs.indexOf(file)`, `dataset.href === currentFile`) rely on both sides staying encoded identically. Different servers encode listings slightly differently, which can break next/prev/active-highlight.
4. **Reaching for `e.offsetX` on a compound control.** It was the seekbar's original bug (Concept 7) and it'll bite again anywhere you build a custom slider or drag handle with a child element that can itself receive the pointer event. Always measure from `clientX`/`clientY` minus the container's own rect.
5. **Autoplay policies** — calling `currentSong.play()` before any user gesture is rejected by modern browsers; that's exactly why startup uses `playMusic(songs[0], true)` to stage without playing (though on this data set, `songs.length` is `0` for the default folder anyway, so `playMusic` isn't even called on load).
6. **Forgetting `.htaccess` semantics** — it only matters on Apache. If you deploy to Apache without it (or to a host that forbids indexes), `displayAlbums()` receives a 403 page containing no folder links, and the UI renders zero cards.
7. **Empty playlist folders** — a folder with a cover and `info.json` but no `.mp3`s now renders a clear empty-state row and, on card click, resets the playbar to an honest "No playable tracks" message instead of leaving stale state on screen.
8. **Global keyboard shortcuts eating form input.** Any global `keydown` listener needs an escape hatch for focused `<input>`/`<textarea>`/`contenteditable` elements, or you'll break native behavior like arrow-keying through a range slider or typing a space in a text field.

## Practice Exercises

1. **Add a playlist with real audio.** Create `songs/my-mix/` with a `cover.jpg`, an `info.json` (`{"title": "My Mix", "description": "Handpicked"}`), and two `.mp3` files. Reload — the card should appear with no code changes, and clicking it should skip the empty-state path entirely. Explain, in writing, every request the app makes to render and play it.
2. **Give shuffle a history.** Right now, `playPrev()` while shuffling picks a *new* random track rather than stepping back through what was actually played. Add a small history array so "previous" during shuffle genuinely goes back.
3. **Persist volume and loop/shuffle across reloads.** Use `localStorage` to remember the last volume level and whether loop/shuffle were on, and restore them in `main()` before the first `getSongs()` call.
4. **Add a "playlist has no tracks yet" affordance on the card itself**, not just in the sidebar — e.g. a small badge on cards whose folder is known (via a lightweight pre-check) to have zero `.mp3` files, so users don't have to click in to find out.
5. **Swap `Math.random()` shuffle for a true Fisher–Yates shuffle** of the whole playlist order, and compare the listening experience — does picking a fresh random index each time versus shuffling once up front feel different? Why?
6. **Replace directory scraping with a manifest.** Write a single `songs/manifest.json` listing every folder and its tracks, and refactor `getSongs`/`displayAlbums` to read it with one `fetch` each. Compare: which approach is more portable across servers, and why does the manifest approach sidestep the `.htaccess` requirement entirely?
7. **Add a light theme.** Extend the token system in Concept 16 with a `prefers-color-scheme: light` block (or a manual toggle) that remaps `--bg`, `--text-*`, and `--border-*` without touching component CSS — a real test of whether the tokens are doing their job.

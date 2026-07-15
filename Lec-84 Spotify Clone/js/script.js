// ═══════════════════════════════════════════
//  CHAINSMOKERS MUSIC PLAYER
// ═══════════════════════════════════════════

let currentSong  = new Audio();
let songs        = [];
let currFolder   = '';
let currArtist   = 'The Chainsmokers';
let prevVolume   = 0.70;
let isShuffling  = false;
let isLooping    = false;
let isSeeking    = false;

currentSong.volume = prevVolume;

// ── HELPERS ──────────────────────────────

function fmt(s) {
    if (isNaN(s) || s < 0) return "00:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

function setProgress(pct) {
    pct = Math.min(100, Math.max(0, pct || 0));
    const seekbar = document.getElementById('seekbar');
    document.getElementById('seekKnob').style.left = pct + "%";
    seekbar.style.setProperty('--progress', pct + '%');
    seekbar.setAttribute('aria-valuenow', Math.round(pct));
}

// Update play/pause icon + accessible state (button wrapper approach)
function setPlayIcon(src) {
    document.querySelector('.play-icon').src = src;
}

function updatePlayButtonA11y(isPlaying) {
    const btn = document.getElementById('play');
    btn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
    btn.setAttribute('aria-pressed', String(isPlaying));
}

// Update now-playing album art in playbar
function setNowPlayingArt() {
    const art = document.querySelector('.now-playing-art');
    if (!art || !currFolder) return;
    art.src = `/${currFolder}/cover.jpg`;
    art.onerror = () => { art.src = 'img/music.svg'; };
}

// ── SCROLL-REVEAL OBSERVER ────────────────

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

// ── ACTIVE SONG HIGHLIGHT ─────────────────

function updateActiveSong() {
    const lis = document.querySelectorAll(".songList ul li[data-href]");
    const currentFile = currentSong.src.split("/").pop(); // URL-encoded filename
    lis.forEach(li => {
        li.classList.toggle("active", li.dataset.href === currentFile);
    });
}

// ── EQUALIZER ─────────────────────────────

function setEqualizer(on) {
    document.querySelector(".equalizer").classList.toggle("playing", on);
}

// ── SHUFFLE / LOOP HELPERS ────────────────

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

// ── LOAD SONGS FROM FOLDER ────────────────
// FIX: use getAttribute('href') so relative links aren't resolved against page URL

async function getSongs(folder) {
    currFolder = folder;

    try {
        const r = await fetch(`/${folder}/info.json`);
        const info = await r.json();
        currArtist = info.title || 'The Chainsmokers';
    } catch(e) { currArtist = 'The Chainsmokers'; }

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

    // Render song list with stagger, or a graceful empty state
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

    return songs;
}

// ── PLAY MUSIC ────────────────────────────

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

// Gracefully reset the playbar when a chosen playlist has no playable tracks
function showEmptyPlaylist() {
    currentSong.pause();
    currentSong.removeAttribute("src"); // so the play button can't resume a stale track
    currentSong.load();
    setPlayIcon("img/play.svg");
    setEqualizer(false);
    updatePlayButtonA11y(false);
    document.querySelector(".songinfo").textContent = "No playable tracks in this playlist";
    document.querySelector(".songtime").textContent = "00:00 / 00:00";
    setProgress(0);
    setNowPlayingArt();
}

// ── DISPLAY ALBUMS ────────────────────────
// FIX: use getAttribute('href') + check endsWith('/') for folder detection

async function displayAlbums() {
    const res  = await fetch(`/songs/`);
    const html = await res.text();
    const div  = document.createElement("div");
    div.innerHTML = html;

    const cardContainer = document.querySelector(".cardContainer");

    for (const a of div.querySelectorAll("a")) {
        const href = a.getAttribute('href') || '';
        // Only directory links (trailing /), skip parent ../ and hidden
        if (!href.endsWith('/') || href === '../' || href.startsWith('.')) continue;

        const folder = decodeURIComponent(href.replace(/\/$/, ''));

        let info = { title: folder, description: '' };
        try {
            const r = await fetch(`/songs/${folder}/info.json`);
            info    = await r.json();
        } catch(e) {}

        const card = document.createElement("div");
        card.dataset.folder = folder;
        card.className      = "card";
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `Play ${info.title}`);
        card.innerHTML      = `
            <div class="card-inner">
                <div class="card-img-wrap">
                    <img src="/songs/${folder}/cover.jpg" alt="${info.title} cover art" loading="lazy"
                         onerror="this.src='img/music.svg'">
                    <div class="card-overlay">
                        <div class="card-play-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false">
                                <path d="M5 20V4L19 12L5 20Z" fill="white" stroke="white"
                                      stroke-width="1.5" stroke-linejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
                <div class="card-meta">
                    <h2>${info.title}</h2>
                    <p>${info.description}</p>
                </div>
            </div>`;

        cardContainer.appendChild(card);
        revealObserver.observe(card);

        const activateCard = async () => {
            // highlight active card
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
    }
}

// ═══════════════════════════════════════════
//  MAIN
// ═══════════════════════════════════════════

async function main() {
    await getSongs("songs/the-chainsmokers");
    if (songs.length > 0) playMusic(songs[0], true);

    await displayAlbums();

    // ── PLAY / PAUSE ──
    function togglePlayPause() {
        if (!currentSong.src) return;
        if (currentSong.paused) {
            currentSong.play();
            setPlayIcon("img/pause.svg");
            setEqualizer(true);
            updatePlayButtonA11y(true);
        } else {
            currentSong.pause();
            setPlayIcon("img/play.svg");
            setEqualizer(false);
            updatePlayButtonA11y(false);
        }
    }
    document.getElementById("play").addEventListener("click", togglePlayPause);

    // ── TIME UPDATE ──
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${fmt(currentSong.currentTime)} / ${fmt(currentSong.duration)}`;
        if (!isSeeking) {
            setProgress((currentSong.currentTime / currentSong.duration) * 100 || 0);
        }
    });

    // ── NEXT / PREV (shared by buttons, keyboard, and auto-advance) ──
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

    // ── AUTO NEXT ── (native `loop` handles repeat-one; `ended` never fires while looping)
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

    // ── SEEKBAR — click + drag, fixed to clientX/rect math so the knob
    //     lands exactly where clicked (or dragged), even on the knob itself ──
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

    // ── HAMBURGER ──
    document.querySelector(".hamburger-btn").addEventListener("click", () => {
        document.querySelector(".left").classList.add("open");
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("open");
    });

    // ── PREV / NEXT ──
    document.getElementById("previous").addEventListener("click", playPrev);
    document.getElementById("next").addEventListener("click", playNext);

    // ── LOOP TOGGLE (persists like the mute icon: state lives on the Audio element) ──
    const loopBtn = document.getElementById("loop");
    loopBtn.addEventListener("click", () => {
        isLooping = !isLooping;
        currentSong.loop = isLooping;
        loopBtn.classList.toggle("active", isLooping);
        loopBtn.setAttribute("aria-pressed", String(isLooping));
        loopBtn.setAttribute("aria-label", isLooping ? "Loop: on" : "Loop: off");
    });

    // ── SHUFFLE TOGGLE ──
    const shuffleBtn = document.getElementById("shuffle");
    shuffleBtn.addEventListener("click", () => {
        isShuffling = !isShuffling;
        shuffleBtn.classList.toggle("active", isShuffling);
        shuffleBtn.setAttribute("aria-pressed", String(isShuffling));
        shuffleBtn.setAttribute("aria-label", isShuffling ? "Shuffle: on" : "Shuffle: off");
    });

    // ── VOLUME ──
    const volumeSlider = document.getElementById("volumeSlider");
    const volumeBtn    = document.getElementById("volumeBtn");
    const volumeIcon    = volumeBtn.querySelector("img");

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

    function setVolume(val) {
        val = Math.min(1, Math.max(0, val));
        currentSong.volume = val;
        if (val > 0) prevVolume = val;
        updateVolumeUI(val);
    }

    volumeSlider.addEventListener("input", e => {
        setVolume(parseInt(e.target.value, 10) / 100);
    });

    volumeBtn.addEventListener("click", () => {
        if (currentSong.volume > 0) {
            prevVolume = currentSong.volume;
            setVolume(0);
        } else {
            setVolume(prevVolume || 0.70);
        }
    });

    // ── KEYBOARD CONTROLS ──
    // Space = play/pause · ArrowLeft/Right = seek ±5s · ArrowUp/Down = volume ±10%
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
}

main();

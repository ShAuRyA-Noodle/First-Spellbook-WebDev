// ═══════════════════════════════════════════
//  CHAINSMOKERS MUSIC PLAYER
// ═══════════════════════════════════════════

let currentSong = new Audio();
let songs       = [];
let currFolder  = '';
let currArtist  = 'The Chainsmokers';
let prevVolume  = 0.70;

currentSong.volume = prevVolume;

// ── HELPERS ──────────────────────────────

function fmt(s) {
    if (isNaN(s) || s < 0) return "00:00";
    const m = Math.floor(s / 60), r = Math.floor(s % 60);
    return `${String(m).padStart(2,'0')}:${String(r).padStart(2,'0')}`;
}

function setProgress(pct) {
    document.querySelector(".circle").style.left = pct + "%";
    document.querySelector(".seekbar").style.setProperty('--progress', pct + '%');
}

// Update play/pause icon (button wrapper approach)
function setPlayIcon(src) {
    document.querySelector('.play-icon').src = src;
}

// Update now-playing album art in playbar
function setNowPlayingArt() {
    const art = document.querySelector('.now-playing-art');
    if (!art) return;
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
    const lis = document.querySelectorAll(".songList ul li");
    const currentFile = currentSong.src.split("/").pop(); // URL-encoded filename
    lis.forEach(li => {
        li.classList.toggle("active", li.dataset.href === currentFile);
    });
}

// ── EQUALIZER ─────────────────────────────

function setEqualizer(on) {
    document.querySelector(".equalizer").classList.toggle("playing", on);
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

    const res  = await fetch(`/${folder}/`);
    const html = await res.text();
    const div  = document.createElement("div");
    div.innerHTML = html;

    songs = [];
    for (const a of div.querySelectorAll("a")) {
        const href = a.getAttribute('href') || '';
        if (href.toLowerCase().endsWith('.mp3')) songs.push(href);
    }

    // Render song list with stagger
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

    return songs;
}

// ── PLAY MUSIC ────────────────────────────

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
        card.innerHTML      = `
            <div class="card-inner">
                <div class="card-img-wrap">
                    <img src="/songs/${folder}/cover.jpg" alt="${info.title}" loading="lazy"
                         onerror="this.src='img/music.svg'">
                    <div class="card-overlay">
                        <div class="card-play-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
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

        card.addEventListener("click", async () => {
            // highlight active card
            document.querySelectorAll(".card").forEach(c => c.classList.remove("card-active"));
            card.classList.add("card-active");
            songs = await getSongs(`songs/${card.dataset.folder}`);
            if (songs.length > 0) playMusic(songs[0]);
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
    document.getElementById("play").addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            setPlayIcon("img/pause.svg");
            setEqualizer(true);
        } else {
            currentSong.pause();
            setPlayIcon("img/play.svg");
            setEqualizer(false);
        }
    });

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

    // ── SEEKBAR CLICK ──
    document.querySelector(".seekbar").addEventListener("click", e => {
        const pct = (e.offsetX / e.currentTarget.getBoundingClientRect().width) * 100;
        setProgress(pct);
        currentSong.currentTime = (currentSong.duration * pct) / 100;
    });

    // ── HAMBURGER ──
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").classList.add("open");
    });
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").classList.remove("open");
    });

    // ── PREV / NEXT ──
    document.getElementById("previous").addEventListener("click", () => {
        currentSong.pause();
        const file = currentSong.src.split("/").pop();
        const idx  = songs.indexOf(file);
        if (idx > 0) playMusic(songs[idx - 1]);
    });

    document.getElementById("next").addEventListener("click", () => {
        currentSong.pause();
        const file = currentSong.src.split("/").pop();
        const idx  = songs.indexOf(file);
        if (idx + 1 < songs.length) playMusic(songs[idx + 1]);
    });

    // ── VOLUME ──
    document.querySelector(".range input").addEventListener("input", e => {
        const val = parseInt(e.target.value) / 100;
        currentSong.volume = val;
        const volImg = document.querySelector(".volume>img");
        if (val > 0) { prevVolume = val; volImg.src = volImg.src.replace("mute.svg", "volume.svg"); }
        else           { volImg.src = volImg.src.replace("volume.svg", "mute.svg"); }
    });

    // ── MUTE TOGGLE ──
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
}

main();

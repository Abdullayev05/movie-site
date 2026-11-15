
"use strict";

/* ============================================
   TV KINO - CHANNEL CONFIGURATION
============================================ */

const PLAYLISTS = [
    {
        name: "Russia",
        url: "https://iptv-org.github.io/iptv/countries/ru.m3u"
    },
    {
        name: "Azerbaijan",
        url: "https://iptv-org.github.io/iptv/countries/az.m3u"
    },
    {
        name: "English",
        url: "https://iptv-org.github.io/iptv/languages/eng.m3u"
    }
];


/*
    These are additional candidate streams from
    public IPTV playlist listings.

    They are not guaranteed or represented as official.
*/

const EXTRA_STREAMS = {
    "Mosfilm": [
        "https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv",
        "http://31.222.235.15/mosfilm/index.m3u8",
        "http://stream.mcquack.net/369/index.m3u8"
    ],

    "Russia 24": [
        "https://live.smotrim.ru/vgtrk/0/russia24-hd/index.m3u8",
        "https://stream.smotrim.ru/hls2/russia24nl_smotrim/playlist_5.m3u8"
    ],

    "Russia 1": [
        "https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8"
    ]
};


/* ============================================
   DESIRED CHANNELS
============================================ */

const CHANNEL_DEFINITIONS = [
    {
        id: "mosfilm",
        name: "Mosfilm. Zolotaya Kolleksiya",
        aliases: ["mosfilm", "mosfilm gold collection"],
        category: "movie",
        official: "https://www.mosfilm.ru/cinema/"
    },
    {
        id: "russia24",
        name: "Россия 24",
        aliases: ["russia-24", "russia 24", "россия-24", "россия 24"],
        category: "news"
    },
    {
        id: "russia1",
        name: "Россия 1",
        aliases: ["russia-1", "russia 1", "россия-1", "россия 1"],
        category: "news"
    },
    {
        id: "perviy",
        name: "Первый канал",
        aliases: ["channel one russia", "perviy kanal", "первый канал", "1tv"],
        category: "news"
    },
    {
        id: "ntv",
        name: "НТВ",
        aliases: ["ntv"],
        category: "news"
    },
    {
        id: "ren",
        name: "РЕН ТВ",
        aliases: ["ren tv", "рен тв"],
        category: "news"
    },
    {
        id: "sts",
        name: "СТС",
        aliases: ["sts", "стс"],
        category: "movie"
    },
    {
        id: "tnt",
        name: "ТНТ",
        aliases: ["tnt", "тнт"],
        category: "movie"
    },
    {
        id: "mir",
        name: "МИР",
        aliases: ["mir", "мир"],
        category: "news"
    },
    {
        id: "zvezda",
        name: "Звезда",
        aliases: ["zvezda", "звезда"],
        category: "news"
    },
    {
        id: "culture",
        name: "Россия Культура",
        aliases: ["russia-k", "russia k", "россия-к", "культура"],
        category: "movie"
    },
    {
        id: "euronews",
        name: "Euronews",
        aliases: ["euronews"],
        category: "news"
    },
    {
        id: "bbc",
        name: "BBC News",
        aliases: ["bbc news", "bbc world"],
        category: "news"
    },
    {
        id: "discovery",
        name: "Discovery",
        aliases: ["discovery channel", "discovery"],
        category: "movie"
    },
    {
        id: "eurosport",
        name: "Eurosport",
        aliases: ["eurosport"],
        category: "sport"
    },
    {
        id: "natgeo",
        name: "National Geographic",
        aliases: ["national geographic", "nat geo", "natgeo"],
        category: "movie"
    },
    {
        id: "karusel",
        name: "Карусель",
        aliases: ["karusel", "карусель"],
        category: "kids"
    },
    {
        id: "muztv",
        name: "Муз-ТВ",
        aliases: ["muz-tv", "muz tv", "муз-тв"],
        category: "music"
    }
];


/* ============================================
   DOM
============================================ */

const channelList = document.getElementById("channelList");
const channelCount = document.getElementById("channelCount");
const searchInput = document.getElementById("searchInput");

const video = document.getElementById("mainVideo");
const placeholder = document.getElementById("playerPlaceholder");

const nowPlaying = document.getElementById("nowPlaying");
const playerStatus = document.getElementById("playerStatus");
const statusText = document.getElementById("statusText");
const statusLoader = document.getElementById("statusLoader");

const playerInfo = document.getElementById("playerInfo");
const sourceInfo = document.getElementById("sourceInfo");
const retryButton = document.getElementById("retryButton");
const mosfilmLink = document.getElementById("mosfilmLink");
const connectionDot = document.getElementById("connectionDot");


/* ============================================
   STATE
============================================ */

let channels = [];

let currentChannel = null;
let currentHls = null;

let currentCategory = "all";
let currentSearch = "";

let playbackId = 0;
let sourcePosition = 0;

let startupTimer = null;
let retryTimer = null;

const START_TIMEOUT = 12000;


/* ============================================
   HELPERS
============================================ */

function normalize(value) {
    return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/ё/g, "е")
        .replace(/[^a-zа-я0-9]+/gi, " ")
        .trim();
}

function showStatus(message, type = "loading") {
    playerStatus.style.display = "flex";
    playerStatus.dataset.type = type;
    statusText.textContent = message;
    statusLoader.style.display = type === "loading" ? "block" : "none";
}

function hideStatus() {
    playerStatus.style.display = "none";
}

function setInfo(message) {
    playerInfo.textContent = message;
}

function setConnected(value) {
    connectionDot.style.background = value ? "#32c879" : "#e53946";
}

function clearTimers() {
    clearTimeout(startupTimer);
    clearTimeout(retryTimer);
    startupTimer = null;
    retryTimer = null;
}

function stopPlayer() {
    clearTimers();

    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }

    video.pause();
    video.removeAttribute("src");
    video.load();
}


/* ============================================
   PLAYLIST PARSER
============================================ */

function parseM3U(text, sourceName) {
    const lines = text.split(/\r?\n/);
    const entries = [];

    let currentName = "";
    let currentGroup = "";

    for (const lineValue of lines) {
        const line = lineValue.trim();

        if (!line) continue;

        if (line.startsWith("#EXTINF:")) {
            const comma = line.lastIndexOf(",");

            currentName = comma >= 0
                ? line.substring(comma + 1).trim()
                : "";

            const group = line.match(/group-title="([^"]*)"/i);
            currentGroup = group ? group[1] : "";

            continue;
        }

        if (
            line.startsWith("#") ||
            !/^https?:\/\//i.test(line)
        ) {
            continue;
        }

        if (currentName) {
            entries.push({
                name: currentName,
                group: currentGroup,
                source: sourceName,
                url: line
            });
        }

        currentName = "";
        currentGroup = "";
    }

    return entries;
}


/* ============================================
   DOWNLOAD PLAYLIST
============================================ */

async function downloadPlaylist(source) {
    const controller = new AbortController();

    const timeout = setTimeout(
        () => controller.abort(),
        15000
    );

    try {
        const response = await fetch(source.url, {
            signal: controller.signal,
            cache: "no-cache"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const text = await response.text();

        if (!text.includes("#EXTM3U")) {
            throw new Error("Invalid M3U playlist");
        }

        return parseM3U(text, source.name);

    } finally {
        clearTimeout(timeout);
    }
}


/* ============================================
   MATCH CHANNEL
============================================ */

function findDefinition(entry) {
    const channelName = normalize(
        entry.name + " " + entry.group
    );

    for (const definition of CHANNEL_DEFINITIONS) {
        for (const alias of definition.aliases) {
            const normalizedAlias = normalize(alias);

            if (
                channelName === normalizedAlias ||
                channelName.startsWith(normalizedAlias + " ") ||
                channelName.includes(" " + normalizedAlias + " ")
            ) {
                return definition;
            }
        }
    }

    return null;
}


/* ============================================
   BUILD CHANNEL LIST
============================================ */

function buildChannels(entries) {
    const result = CHANNEL_DEFINITIONS.map(definition => ({
        ...definition,
        urls: [],
        sources: []
    }));

    const byId = new Map(
        result.map(channel => [channel.id, channel])
    );

    for (const entry of entries) {
        const definition = findDefinition(entry);

        if (!definition) continue;

        const channel = byId.get(definition.id);

        if (!channel.urls.includes(entry.url)) {
            channel.urls.push(entry.url);
            channel.sources.push(entry.source);
        }
    }

    // Add additional candidate streams
    for (const channel of result) {
        const extra = EXTRA_STREAMS[channel.name === "Mosfilm. Zolotaya Kolleksiya"
            ? "Mosfilm"
            : channel.id === "russia24"
                ? "Russia 24"
                : channel.id === "russia1"
                    ? "Russia 1"
                    : ""];

        if (extra) {
            for (const url of extra) {
                if (!channel.urls.includes(url)) {
                    channel.urls.push(url);
                    channel.sources.push("Additional public source");
                }
            }
        }
    }

    return result;
}


/* ============================================
   LOAD CHANNELS
============================================ */

async function loadChannels() {
    channelList.innerHTML = `
        <div class="list-loading">
            Kanallar internetdən yüklənir...
        </div>
    `;

    sourceInfo.textContent = "Loading public IPTV playlists...";

    const results = await Promise.allSettled(
        PLAYLISTS.map(downloadPlaylist)
    );

    let entries = [];
    let successful = 0;

    results.forEach((result, index) => {
        if (result.status === "fulfilled") {
            successful++;
            entries.push(...result.value);

            console.log(
                PLAYLISTS[index].name,
                "playlist loaded:",
                result.value.length
            );
        } else {
            console.warn(
                "Playlist failed:",
                PLAYLISTS[index].name,
                result.reason
            );
        }
    });

    channels = buildChannels(entries);

    const available = channels.filter(
        channel => channel.urls.length > 0
    ).length;

    sourceInfo.textContent =
        `${successful}/${PLAYLISTS.length} playlist · ${available} kanal mənbə tapdı`;

    renderChannels();

    console.log("Channel results:", channels);
}


/* ============================================
   RENDER CHANNELS
============================================ */

function renderChannels() {
    channelList.innerHTML = "";

    const filtered = channels.filter(channel => {
        const categoryMatch =
            currentCategory === "all" ||
            channel.category === currentCategory;

        const searchMatch =
            normalize(channel.name).includes(normalize(currentSearch));

        return categoryMatch && searchMatch;
    });

    channelCount.textContent = filtered.length;

    if (!filtered.length) {
        channelList.innerHTML = `
            <div class="no-channels">
                Kanal tapılmadı.
            </div>
        `;
        return;
    }

    const fragment = document.createDocumentFragment();

    filtered.forEach(channel => {
        const button = document.createElement("button");

        button.className = "channel-item";
        button.type = "button";

        if (currentChannel?.id === channel.id) {
            button.classList.add("active");
        }

        if (!channel.urls.length) {
            button.classList.add("channel-unavailable");
        }

        const name = document.createElement("span");
        name.className = "channel-name";
        name.textContent = channel.name;

        const details = document.createElement("span");
        details.className = "channel-country";

        details.textContent = channel.urls.length
            ? `${channel.urls.length} yayım ünvanı`
            : "Yayım ünvanı tapılmadı";

        name.appendChild(details);
        button.appendChild(name);

        button.addEventListener("click", () => {
            document.querySelectorAll(".channel-item").forEach(item => {
                item.classList.remove("active");
            });

            button.classList.add("active");

            playChannel(channel);
        });

        fragment.appendChild(button);
    });

    channelList.appendChild(fragment);
}


/* ============================================
   PLAY CHANNEL
============================================ */

function playChannel(channel) {
    playbackId++;

    const session = playbackId;

    currentChannel = channel;
    sourcePosition = 0;

    stopPlayer();

    nowPlaying.textContent = channel.name;

    placeholder.style.display = "none";
    video.style.display = "block";

    retryButton.hidden = true;
    mosfilmLink.hidden = true;

    setConnected(false);
    setInfo("Connecting to " + channel.name);

    if (!channel.urls.length) {
        showUnavailable(session);
        return;
    }

    showStatus("Yayım mənbəyinə qoşulur...");

    startNextSource(session);
}


/* ============================================
   TRY NEXT SOURCE
============================================ */

function startNextSource(session) {
    if (session !== playbackId) return;

    clearTimers();

    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }

    if (sourcePosition >= currentChannel.urls.length) {
        showUnavailable(session);
        return;
    }

    const url = currentChannel.urls[sourcePosition];

    console.log(
        `Trying ${sourcePosition + 1}/${currentChannel.urls.length}:`,
        url
    );

    showStatus(
        `Yayım yoxlanılır (${sourcePosition + 1}/${currentChannel.urls.length})...`
    );

    startupTimer = setTimeout(() => {
        if (session !== playbackId) return;

        sourcePosition++;
        startNextSource(session);
    }, START_TIMEOUT);

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (typeof Hls !== "undefined" && Hls.isSupported()) {
        startHls(url, session);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        startNative(url, session);
    } else {
        clearTimers();
        showStatus("Brauzer HLS formatını dəstəkləmir.", "error");
    }
}


/* ============================================
   HLS.JS
============================================ */

function startHls(url, session) {
    const player = new Hls({
        enableWorker: true,
        autoStartLoad: true,
        startPosition: -1,

        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        maxBufferSize: 25 * 1000 * 1000,

        lowLatencyMode: false,

        manifestLoadingTimeOut: 8000,
        manifestLoadingMaxRetry: 1,
        manifestLoadingRetryDelay: 500,

        levelLoadingTimeOut: 8000,
        levelLoadingMaxRetry: 1,
        levelLoadingRetryDelay: 500,

        fragLoadingTimeOut: 12000,
        fragLoadingMaxRetry: 1,
        fragLoadingRetryDelay: 500
    });

    currentHls = player;

    player.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (session !== playbackId) return;

        player.loadSource(url);
    });

    player.on(Hls.Events.MANIFEST_PARSED, () => {
        if (session !== playbackId) return;

        console.log("Manifest parsed:", currentChannel.name);

        playVideo(session);
    });

    player.on(Hls.Events.ERROR, (event, data) => {
        if (session !== playbackId || !data.fatal) return;

        console.error("HLS playback error:", {
            channel: currentChannel.name,
            url,
            type: data.type,
            details: data.details,
            response: data.response
        });

        sourcePosition++;
        startNextSource(session);
    });

    player.attachMedia(video);
}


/* ============================================
   NATIVE HLS
============================================ */

function startNative(url, session) {
    video.src = url;

    const onLoaded = () => {
        if (session !== playbackId) return;
        playVideo(session);
    };

    const onError = () => {
        if (session !== playbackId) return;

        video.removeEventListener("loadedmetadata", onLoaded);

        sourcePosition++;
        startNextSource(session);
    };

    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });

    video.load();
}


/* ============================================
   PLAY VIDEO
============================================ */

function playVideo(session) {
    if (session !== playbackId) return;

    video.play()
        .then(() => {
            if (session !== playbackId) return;

            clearTimers();
            hideStatus();

            setConnected(true);
            setInfo("Playing: " + currentChannel.name);
        })
        .catch(error => {
            console.warn("Autoplay blocked:", error);

            if (session !== playbackId) return;

            clearTimers();
            hideStatus();

            setConnected(true);
            setInfo("Play düyməsinə basın.");
        });
}


/* ============================================
   VIDEO EVENTS
============================================ */

video.addEventListener("playing", () => {
    hideStatus();
    setConnected(true);

    if (currentChannel) {
        setInfo("Playing: " + currentChannel.name);
    }
});

video.addEventListener("waiting", () => {
    if (currentChannel) {
        showStatus("Video buferlənir...");
    }
});


/* ============================================
   UNAVAILABLE STREAM
============================================ */

function showUnavailable(session) {
    if (session !== playbackId) return;

    clearTimers();

    if (currentHls) {
        currentHls.destroy();
        currentHls = null;
    }

    showStatus(
        "Bu kanal üçün işlək yayım ünvanı tapılmadı.",
        "error"
    );

    setConnected(false);
    setInfo("Stream unavailable");

    retryButton.hidden = false;

    if (currentChannel.id === "mosfilm") {
        mosfilmLink.hidden = false;
    }
}


/* ============================================
   RETRY
============================================ */

retryButton.addEventListener("click", () => {
    if (currentChannel) {
        playChannel(currentChannel);
    }
});


/* ============================================
   CATEGORY FILTER
============================================ */

document.querySelectorAll(".cat-btn").forEach(button => {
    button.addEventListener("click", () => {
        document.querySelectorAll(".cat-btn").forEach(item => {
            item.classList.remove("active");
        });

        button.classList.add("active");

        currentCategory = button.dataset.category;

        renderChannels();
    });
});


/* ============================================
   SEARCH
============================================ */

searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim();
    renderChannels();
});


/* ============================================
   START APPLICATION
============================================ */

async function initialize() {
    video.style.display = "none";
    placeholder.style.display = "flex";

    setInfo("Loading channels...");

    try {
        await loadChannels();
    } catch (error) {
        console.error("Application initialization error:", error);

        channelList.innerHTML = `
            <div class="no-channels">
                Kanalları yükləmək mümkün olmadı.
                İnternet bağlantısını yoxlayın.
            </div>
        `;

        sourceInfo.textContent = "Playlist loading failed";
    }

    setInfo("Ready to watch");
}

initialize();
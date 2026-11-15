"use strict";

/* ============================================
   TV KINO - CHANNEL CONFIGURATION
============================================ */

const PLAYLISTS = [
    { name: "Russia",     url: "https://iptv-org.github.io/iptv/countries/ru.m3u" },
    { name: "Azerbaijan", url: "https://iptv-org.github.io/iptv/countries/az.m3u" },
    { name: "English",    url: "https://iptv-org.github.io/iptv/languages/eng.m3u" }
];

/*
    PROXY_URL — GitHub Pages (https) üzərində http:// yayımlar üçün ehtiyat yol.
    Məsələn: "https://sizin-proxy.example.com/?url="
    Boş saxlasanız proxy istifadə olunmur.
*/
const PROXY_URL = "";

/*
    Əlavə axın ünvanları — kanal id-sinə görə.
*/
const EXTRA_STREAMS = {
    mosfilm: [
        "https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv",
        "http://31.222.235.15/mosfilm/index.m3u8",
        "http://stream.mcquack.net/369/index.m3u8"
    ],
    russia24: [
        "https://live.smotrim.ru/vgtrk/0/russia24-hd/index.m3u8",
        "https://stream.smotrim.ru/hls2/russia24nl_smotrim/playlist_5.m3u8"
    ],
    russia1: [
        "https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8"
    ],
    karusel: [
        // "https://...m3u8"
    ]
};


/* ============================================
   DESIRED CHANNELS
============================================ */

const CHANNEL_DEFINITIONS = [
    {
        id: "mosfilm",
        name: "Mosfilm. Zolotaya Kolleksiya",
        aliases: ["mosfilm", "mosfilm gold collection", "mosfilm zolotaya kolleksiya", "мосфильм"],
        category: "movie",
        official: "https://www.mosfilm.ru/cinema/"
    },
    {
        id: "russia24",
        name: "Россия 24",
        aliases: ["russia-24", "russia 24", "rossiya 24", "россия-24", "россия 24"],
        category: "news"
    },
    {
        id: "russia1",
        name: "Россия 1",
        aliases: ["russia-1", "russia 1", "rossiya 1", "rossija 1", "россия-1", "россия 1"],
        category: "news"
    },
    {
        id: "perviy",
        name: "Первый канал",
        aliases: ["channel one russia", "channel one", "perviy kanal", "pervyj kanal", "pervy kanal", "первый канал", "первый", "1tv"],
        category: "news"
    },
    {
        id: "ntv",
        name: "НТВ",
        aliases: ["ntv", "нтв"],
        category: "news"
    },
    {
        id: "ren",
        name: "РЕН ТВ",
        aliases: ["ren tv", "rentv", "рен тв", "рен-тв"],
        category: "news"
    },
    {
        id: "sts",
        name: "СТС",
        aliases: ["sts", "ctc", "стс"],
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
        aliases: ["mir", "mir tv", "мир"],
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
        aliases: ["russia-k", "russia k", "russia kultura", "rossiya kultura", "kultura", "россия-к", "россия к", "россия культура", "культура"],
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
        aliases: ["bbc news", "bbc world news", "bbc world"],
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
        aliases: ["karusel", "carousel", "карусель"],
        category: "kids"
    },
    {
        id: "muztv",
        name: "Муз-ТВ",
        aliases: ["muz-tv", "muz tv", "muztv", "муз-тв", "муз тв"],
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
let currentSources = [];

let currentCategory = "all";
let currentSearch = "";

let playbackId = 0;
let sourcePosition = 0;

let startupTimer = null;

const START_TIMEOUT = 10000;

// GitHub Pages kimi https səhifədə http:// sorğular brauzer tərəfindən bloklanır
const IS_HTTPS = location.protocol === "https:";


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
    startupTimer = null;
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

function isHttpUrl(url) {
    return /^http:\/\//i.test(url);
}

function upgradeToHttps(url) {
    return url.replace(/^http:\/\//i, "https://");
}

// IP ünvanlı hostlar üçün SSL sertifikatı olmur, https cəhdi mənasızdır
function isIpHost(url) {
    try {
        return /^\d{1,3}(\.\d{1,3}){3}$/.test(new URL(url).hostname);
    } catch {
        return false;
    }
}

function proxify(url) {
    return PROXY_URL + encodeURIComponent(url);
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

        if (line.startsWith("#") || !/^https?:\/\//i.test(line)) {
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
    const timeout = setTimeout(() => controller.abort(), 15000);

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
   score: 0 = dəqiq ad, 1 = ad ilə başlayır (regional ola bilər),
          2 = içində var. +10 = geo-blocked işarəsi
============================================ */

function findDefinition(entry) {
    const cleanName = normalize(
        entry.name.replace(/[\(\[][^\)\]]*[\)\]]/g, " ")
    );

    const geoPenalty = /geo.?block/i.test(entry.name) ? 10 : 0;

    let best = null;

    for (const definition of CHANNEL_DEFINITIONS) {
        for (const alias of definition.aliases) {
            const a = normalize(alias);
            let score = null;

            if (cleanName === a) {
                score = 0;
            } else if (cleanName.startsWith(a + " ")) {
                score = 1;
            } else if (cleanName.includes(" " + a + " ") || cleanName.endsWith(" " + a)) {
                score = 2;
            }

            if (score !== null && (!best || score + geoPenalty < best.score)) {
                best = { definition, score: score + geoPenalty };
            }
        }
    }

    return best;
}


/* ============================================
   BUILD CHANNEL LIST
============================================ */

function buildChannels(entries) {
    const result = CHANNEL_DEFINITIONS.map(definition => ({
        ...definition,
        candidates: [],
        urls: [],
        sources: []
    }));

    const byId = new Map(result.map(channel => [channel.id, channel]));

    for (const entry of entries) {
        const match = findDefinition(entry);
        if (!match) continue;

        const channel = byId.get(match.definition.id);

        if (!channel.candidates.some(c => c.url === entry.url)) {
            channel.candidates.push({
                url: entry.url,
                source: entry.source,
                score: match.score
            });
        }
    }

    for (const channel of result) {
        // Dəqiq uyğunluqlar varsa onları saxla, yoxdursa regional/qismən olanları
        const exact = channel.candidates.filter(c => c.score % 10 === 0);
        const list = exact.length ? exact : channel.candidates;

        // Əvvəl uyğunluq dərəcəsi, sonra https ünvanlar
        list.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;
            return Number(isHttpUrl(a.url)) - Number(isHttpUrl(b.url));
        });

        const extras = (EXTRA_STREAMS[channel.id] || [])
            .filter(Boolean)
            .map(url => ({ url, source: "Additional public source", score: -1 }));

        const merged = [...extras, ...list];
        const seen = new Set();

        for (const item of merged) {
            if (seen.has(item.url)) continue;
            seen.add(item.url);

            channel.urls.push(item.url);
            channel.sources.push(item.source);
        }
    }

    return result;
}


/* ============================================
   BUILD PLAY SOURCES
   https səhifədə http:// ünvanlar üçün:
     1) https:// variantı (yalnız domenli ünvanlar, IP deyil)
     2) PROXY_URL varsa, proxy ilə orijinal ünvan
============================================ */

function buildPlaySources(channel) {
    const sources = [];
    const seen = new Set();

    function add(url, mode) {
        const key = mode + "|" + url;
        if (seen.has(key)) return;
        seen.add(key);
        sources.push({ url, mode });
    }

    // Əvvəlcə birbaşa işləyən ünvanlar
    for (const url of channel.urls) {
        if (!IS_HTTPS || !isHttpUrl(url)) {
            add(url, "direct");
        }
    }

    // Sonra http ünvanların https variantı (yalnız https səhifədə, IP olmayanlar)
    if (IS_HTTPS) {
        for (const url of channel.urls) {
            if (isHttpUrl(url) && !isIpHost(url)) {
                add(upgradeToHttps(url), "upgrade");
            }
        }
    }

    // Ən sonda proxy ehtiyat variantı
    if (PROXY_URL) {
        for (const url of channel.urls) {
            if (IS_HTTPS && isHttpUrl(url)) {
                add(url, "proxy");
            }
        }
    }

    return sources;
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
        c => buildPlaySources(c).length > 0
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

        const playable = buildPlaySources(channel).length;

        if (currentChannel?.id === channel.id) {
            button.classList.add("active");
        }

        if (!playable) {
            button.classList.add("channel-unavailable");
        }

        const name = document.createElement("span");
        name.className = "channel-name";
        name.textContent = channel.name;

        const details = document.createElement("span");
        details.className = "channel-country";

        if (playable) {
            details.textContent = `${playable} yayım ünvanı`;
        } else if (channel.urls.length) {
            details.textContent = "Yalnız http ünvan (HTTPS-də açılmır)";
        } else {
            details.textContent = "Yayım ünvanı tapılmadı";
        }

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
    currentSources = buildPlaySources(channel);
    sourcePosition = 0;

    stopPlayer();

    nowPlaying.textContent = channel.name;

    placeholder.style.display = "none";
    video.style.display = "block";

    retryButton.hidden = true;
    mosfilmLink.hidden = true;

    setConnected(false);
    setInfo("Connecting to " + channel.name);

    if (!currentSources.length) {
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

    if (sourcePosition >= currentSources.length) {
        showUnavailable(session);
        return;
    }

    const source = currentSources[sourcePosition];

    console.log(
        `Trying ${sourcePosition + 1}/${currentSources.length} [${source.mode}]:`,
        source.url
    );

    showStatus(
        `Yayım yoxlanılır (${sourcePosition + 1}/${currentSources.length})...`
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
        startHls(source, session);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        startNative(source, session);
    } else {
        clearTimers();
        showStatus("Brauzer HLS formatını dəstəkləmir.", "error");
    }
}


/* ============================================
   HLS.JS
   Loader bütün sorğuları (manifest + seqmentlər) tutur:
     upgrade -> http:// -> https://
     proxy   -> PROXY_URL üzərindən
============================================ */

function createLoader(mode) {
    const BaseLoader = Hls.DefaultConfig.loader;

    return class CustomLoader extends BaseLoader {
        load(context, config, callbacks) {
            if (mode === "upgrade" && isHttpUrl(context.url)) {
                context.url = upgradeToHttps(context.url);
            } else if (mode === "proxy") {
                context.url = proxify(context.url);
            } else if (IS_HTTPS && isHttpUrl(context.url) && !isIpHost(context.url)) {
                // direct rejimdə belə, içəridən gələn http:// seqmentləri düzəlt
                context.url = upgradeToHttps(context.url);
            }

            super.load(context, config, callbacks);
        }
    };
}

function startHls(source, session) {
    const config = {
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
        fragLoadingRetryDelay: 500,

        loader: createLoader(source.mode)
    };

    const player = new Hls(config);

    currentHls = player;

    player.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (session !== playbackId) return;

        player.loadSource(source.url);
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
            url: source.url,
            mode: source.mode,
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
   NATIVE HLS (Safari / iOS)
   Qeyd: native rejimdə seqmentləri dəyişmək mümkün deyil
============================================ */

function startNative(source, session) {
    video.src = source.mode === "proxy" ? proxify(source.url) : source.url;

    const onLoaded = () => {
        if (session !== playbackId) return;

        video.removeEventListener("error", onError);
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
        "Bu kanal üçün işlək yayım ünvanı tapılmadı (http bloku, region bloku və ya CORS ola bilər).",
        "error"
    );

    setConnected(false);
    setInfo("Stream unavailable");

    retryButton.hidden = false;

    if (currentChannel && currentChannel.id === "mosfilm") {
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
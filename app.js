"use strict";

/* ============================================
   TV KINO - CONFIGURATION
============================================ */

const API_CHANNELS = "https://iptv-org.github.io/api/channels.json";
const API_STREAMS  = "https://iptv-org.github.io/api/streams.json";

const PLAYLISTS = [
    { name: "Russia",     country: "RU", url: "https://iptv-org.github.io/iptv/countries/ru.m3u" },
    { name: "Azerbaijan", country: "AZ", url: "https://iptv-org.github.io/iptv/countries/az.m3u" },
    { name: "English",    country: null, url: "https://iptv-org.github.io/iptv/languages/eng.m3u" }
];

/*
    Öz HTTPS proxy-ləriniz (VPS, Worker və s.). Format:
    ["https://proxy.sizin-domen.com/?url="]
    http://IP yayımlar və region bloku üçün əsas həll budur.
*/
const OWN_PROXIES = [];

// Ortaq pulsuz proxy-lər — son ehtiyat, etibarsızdır
const USE_PUBLIC_PROXIES = true;

const PUBLIC_PROXIES = [
    { name: "corsproxy",  build: u => "https://corsproxy.io/?url=" + encodeURIComponent(u) },
    { name: "allorigins", build: u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u) }
];

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
        countries: ["RU"],
        official: "https://www.mosfilm.ru/cinema/"
    },
    {
        id: "russia24",
        name: "Россия 24",
        aliases: ["russia-24", "russia 24", "rossiya 24", "россия-24", "россия 24"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "russia1",
        name: "Россия 1",
        aliases: ["russia-1", "russia 1", "rossiya 1", "rossija 1", "россия-1", "россия 1"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "perviy",
        name: "Первый канал",
        aliases: ["channel one russia", "channel one", "perviy kanal", "pervyj kanal", "pervy kanal", "первый канал", "первый", "1tv"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "ntv",
        name: "НТВ",
        aliases: ["ntv", "нтв"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "ren",
        name: "РЕН ТВ",
        aliases: ["ren tv", "rentv", "рен тв", "рен-тв"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "sts",
        name: "СТС",
        aliases: ["sts", "ctc", "стс"],
        category: "movie",
        countries: ["RU"]
    },
    {
        id: "tnt",
        name: "ТНТ",
        aliases: ["tnt", "тнт"],
        category: "movie",
        countries: ["RU"]
    },
    {
        id: "mir",
        name: "МИР",
        aliases: ["mir", "mir tv", "мир"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "zvezda",
        name: "Звезда",
        aliases: ["zvezda", "звезда"],
        category: "news",
        countries: ["RU"]
    },
    {
        id: "culture",
        name: "Россия Культура",
        aliases: ["russia-k", "russia k", "russia kultura", "rossiya kultura", "kultura", "россия-к", "россия к", "россия культура", "культура"],
        category: "movie",
        countries: ["RU"]
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
        category: "kids",
        countries: ["RU"]
    },
    {
        id: "muztv",
        name: "Муз-ТВ",
        aliases: ["muz-tv", "muz tv", "muztv", "муз-тв", "муз тв"],
        category: "music",
        countries: ["RU"]
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

// "Yalnız işləyən kanallar" checkbox-u (id: workingOnly, yoxdursa səhifədəki ilk checkbox)
const workingOnlyInput =
    document.getElementById("workingOnly") ||
    document.querySelector('input[type="checkbox"]');


/* ============================================
   STATE
============================================ */

let channels = [];

let currentChannel = null;
let currentHls = null;
let currentSources = [];
let currentSource = null;

let currentCategory = "all";
let currentSearch = "";
let workingOnly = false;

let playbackId = 0;
let sourcePosition = 0;

let startupTimer = null;

const START_TIMEOUT = 9000;
const MAX_URLS_PER_CHANNEL = 10;
const PROXY_URL_LIMIT = 4;
const FAIL_TTL = 6 * 60 * 60 * 1000; // uğursuz kanal 6 saat gizlənir

const IS_HTTPS = location.protocol === "https:";

let DEF_INDEX = [];


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

function destroyHls() {
    if (currentHls) {
        try { currentHls.destroy(); } catch (e) { /* ignore */ }
        currentHls = null;
    }
}

function stopPlayer() {
    clearTimers();
    destroyHls();

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

function isIpHost(url) {
    try {
        return /^\d{1,3}(\.\d{1,3}){3}$/.test(new URL(url).hostname);
    } catch (e) {
        return false;
    }
}

function isProxyMode(mode) {
    return mode.startsWith("own") || mode.startsWith("pub");
}

function modeLabel(mode) {
    if (mode === "direct") return "birbaşa";
    if (mode === "upgrade") return "https";
    if (mode.startsWith("own")) return "öz proxy";
    return "ortaq proxy";
}

function transformUrl(mode, url) {
    if (mode.startsWith("own")) {
        return OWN_PROXIES[Number(mode.slice(3))] + encodeURIComponent(url);
    }

    if (mode.startsWith("pub")) {
        return PUBLIC_PROXIES[Number(mode.slice(3))].build(url);
    }

    if (IS_HTTPS && isHttpUrl(url) && !isIpHost(url)) {
        return upgradeToHttps(url);
    }

    return url;
}

function storageGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
}

function storageSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
}

function storageRemove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
}

function markFailed(channel) {
    storageSet("tvkino:fail:" + channel.id, String(Date.now()));
}

function markWorking(channel) {
    storageRemove("tvkino:fail:" + channel.id);
}

function recentlyFailed(channel) {
    const value = Number(storageGet("tvkino:fail:" + channel.id));
    return value > 0 && Date.now() - value < FAIL_TTL;
}

// Proxy-siz oynada açıla bilən ünvan varmı?
function hasDirectPlayable(channel) {
    return channel.urls.some(
        url => !IS_HTTPS || !isHttpUrl(url) || !isIpHost(url)
    );
}

function hasOwnProxy() {
    return OWN_PROXIES.length > 0;
}

async function fetchWithTimeout(url, ms, asJson) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), ms);

    try {
        const response = await fetch(url, {
            signal: controller.signal,
            cache: "default"
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        return asJson ? await response.json() : await response.text();

    } finally {
        clearTimeout(timer);
    }
}


/* ============================================
   NAME MATCHING
============================================ */

function buildDefIndex() {
    DEF_INDEX = CHANNEL_DEFINITIONS.map(def => ({
        def,
        aliases: def.aliases.map(normalize)
    }));
}

function stripTags(name) {
    return String(name || "").replace(/[\(\[]([^\)\]]*)[\)\]]/g, (full, inner) =>
        /(\d{3,4}p|geo.?block|not 24\/7|backup)/i.test(inner) ? " " : full
    );
}

function matchName(rawName, country) {
    const clean = normalize(stripTags(rawName));
    if (!clean) return null;

    const geoPenalty = /geo.?block/i.test(rawName) ? 10 : 0;

    let best = null;

    for (const item of DEF_INDEX) {
        const allowed = item.def.countries;

        if (allowed && (!country || !allowed.includes(country))) continue;

        for (const alias of item.aliases) {
            let score = null;

            if (clean === alias) {
                score = 0;
            } else if (clean.startsWith(alias + " ")) {
                score = 1;
            } else if (clean.includes(" " + alias + " ") || clean.endsWith(" " + alias)) {
                score = 2;
            }

            if (score !== null) {
                const total = score + geoPenalty;

                if (!best || total < best.score) {
                    best = { definition: item.def, score: total };
                }
            }
        }
    }

    return best;
}


/* ============================================
   PLAYLIST (M3U) PARSER
============================================ */

function parseM3U(text, source) {
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
                source: source.name,
                country: source.country,
                url: line
            });
        }

        currentName = "";
        currentGroup = "";
    }

    return entries;
}

async function downloadPlaylist(source) {
    const text = await fetchWithTimeout(source.url, 15000, false);

    if (!text.includes("#EXTM3U")) {
        throw new Error("Invalid M3U playlist");
    }

    return parseM3U(text, source);
}


/* ============================================
   IPTV-ORG API
============================================ */

async function loadApiCandidates() {
    const [apiChannels, apiStreams] = await Promise.all([
        fetchWithTimeout(API_CHANNELS, 30000, true),
        fetchWithTimeout(API_STREAMS, 30000, true)
    ]);

    const matched = new Map();

    for (const ch of apiChannels) {
        if (ch.closed || ch.is_nsfw) continue;

        const names = [ch.name, ...(Array.isArray(ch.alt_names) ? ch.alt_names : [])];

        let best = null;

        for (const name of names) {
            const m = matchName(name, ch.country);

            if (m && (!best || m.score < best.score)) {
                best = m;
            }
        }

        if (best) matched.set(ch.id, best);
    }

    const entries = [];

    for (const stream of apiStreams) {
        if (!stream.channel || !stream.url) continue;

        const m = matched.get(stream.channel);
        if (!m) continue;

        entries.push({
            definitionId: m.definition.id,
            url: stream.url,
            score: m.score,
            quality: parseInt(stream.quality, 10) || 0,
            source: "iptv-org API"
        });
    }

    return entries;
}


/* ============================================
   BUILD CHANNEL LIST
============================================ */

function buildChannels(m3uEntries, apiEntries) {
    const result = CHANNEL_DEFINITIONS.map(definition => ({
        ...definition,
        candidates: [],
        urls: [],
        sources: []
    }));

    const byId = new Map(result.map(channel => [channel.id, channel]));

    function addCandidate(id, candidate) {
        const channel = byId.get(id);
        if (!channel) return;

        if (!channel.candidates.some(c => c.url === candidate.url)) {
            channel.candidates.push(candidate);
        }
    }

    for (const entry of apiEntries) {
        addCandidate(entry.definitionId, {
            url: entry.url,
            source: entry.source,
            score: entry.score,
            quality: entry.quality
        });
    }

    for (const entry of m3uEntries) {
        const match = matchName(entry.name + " " + entry.group, entry.country);
        if (!match) continue;

        const nameOnly = matchName(entry.name, entry.country);
        const final = nameOnly && nameOnly.score <= match.score ? nameOnly : match;

        addCandidate(final.definition.id, {
            url: entry.url,
            source: entry.source,
            score: final.score,
            quality: 0
        });
    }

    for (const channel of result) {
        const exact = channel.candidates.filter(c => c.score % 10 === 0);
        const list = exact.length ? exact : channel.candidates;

        list.sort((a, b) => {
            if (a.score !== b.score) return a.score - b.score;

            const httpDiff = Number(isHttpUrl(a.url)) - Number(isHttpUrl(b.url));
            if (httpDiff) return httpDiff;

            return b.quality - a.quality;
        });

        const extras = (EXTRA_STREAMS[channel.id] || [])
            .filter(Boolean)
            .map(url => ({ url, source: "Additional public source", score: -1 }));

        const merged = [...extras, ...list];
        const seen = new Set();

        for (const item of merged) {
            if (seen.has(item.url)) continue;
            if (channel.urls.length >= MAX_URLS_PER_CHANNEL) break;

            seen.add(item.url);

            channel.urls.push(item.url);
            channel.sources.push(item.source);
        }
    }

    return result;
}


/* ============================================
   BUILD PLAY SOURCES
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

    // 1) proxy-siz
    for (const url of channel.urls) {
        if (!IS_HTTPS || !isHttpUrl(url)) {
            add(url, "direct");
        } else if (!isIpHost(url)) {
            add(url, "upgrade");
        }
    }

    // 2) öz proxy-ləriniz əvvəl, sonra ortaq proxy-lər
    const proxyModes = [];

    OWN_PROXIES.forEach((_, i) => proxyModes.push("own" + i));

    if (USE_PUBLIC_PROXIES) {
        PUBLIC_PROXIES.forEach((_, i) => proxyModes.push("pub" + i));
    }

    // Öz proxy varsa, http IP ünvanlar proxy ilə birinci sınansın
    const proxyUrls = channel.urls.slice(0, hasOwnProxy() ? MAX_URLS_PER_CHANNEL : PROXY_URL_LIMIT);

    for (const url of proxyUrls) {
        for (const mode of proxyModes) {
            add(url, mode);
        }
    }

    // Son işləyən mənbəni birinci sına
    try {
        const saved = JSON.parse(storageGet("tvkino:last:" + channel.id) || "null");

        if (saved) {
            const index = sources.findIndex(
                s => s.url === saved.url && s.mode === saved.mode
            );

            if (index > 0) {
                sources.unshift(sources.splice(index, 1)[0]);
            }
        }
    } catch (e) { /* ignore */ }

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

    sourceInfo.textContent = "Loading IPTV database...";

    buildDefIndex();

    const [apiResult, ...playlistResults] = await Promise.allSettled([
        loadApiCandidates(),
        ...PLAYLISTS.map(downloadPlaylist)
    ]);

    let apiEntries = [];
    let apiOk = false;

    if (apiResult.status === "fulfilled") {
        apiEntries = apiResult.value;
        apiOk = true;
        console.log("API streams matched:", apiEntries.length);
    } else {
        console.warn("API failed:", apiResult.reason);
    }

    const m3uEntries = [];
    let playlistOk = 0;

    playlistResults.forEach((result, index) => {
        if (result.status === "fulfilled") {
            playlistOk++;
            m3uEntries.push(...result.value);

            console.log(PLAYLISTS[index].name, "playlist loaded:", result.value.length);
        } else {
            console.warn("Playlist failed:", PLAYLISTS[index].name, result.reason);
        }
    });

    if (!apiOk && playlistOk === 0) {
        throw new Error("Nə API, nə də playlist yüklənmədi");
    }

    channels = buildChannels(m3uEntries, apiEntries);

    const available = channels.filter(c => c.urls.length > 0).length;

    sourceInfo.textContent =
        `API ${apiOk ? "✓" : "✗"} · ${playlistOk}/${PLAYLISTS.length} playlist · ${available} kanal mənbə tapdı`;

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

        let workingMatch = true;

        if (workingOnly) {
            workingMatch =
                channel.urls.length > 0 &&
                !recentlyFailed(channel) &&
                (hasDirectPlayable(channel) || hasOwnProxy());
        }

        return categoryMatch && searchMatch && workingMatch;
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

        const direct = hasDirectPlayable(channel);

        if (!channel.urls.length || (!direct && !hasOwnProxy())) {
            button.classList.add("channel-unavailable");
        }

        const name = document.createElement("span");
        name.className = "channel-name";
        name.textContent = channel.name;

        const details = document.createElement("span");
        details.className = "channel-country";

        if (!channel.urls.length) {
            details.textContent = "Yayım ünvanı tapılmadı";
        } else if (!direct && !hasOwnProxy()) {
            details.textContent = `${channel.urls.length} ünvan · HTTPS proxy lazımdır`;
        } else {
            details.textContent = `${channel.urls.length} yayım ünvanı`;
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
    currentSource = null;
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
    destroyHls();

    if (sourcePosition >= currentSources.length) {
        showUnavailable(session);
        return;
    }

    const source = currentSources[sourcePosition];
    const hlsJsSupported = typeof Hls !== "undefined" && Hls.isSupported();

    if (!hlsJsSupported && isProxyMode(source.mode)) {
        sourcePosition++;
        startNextSource(session);
        return;
    }

    currentSource = source;

    console.log(
        `Trying ${sourcePosition + 1}/${currentSources.length} [${source.mode}]:`,
        source.url
    );

    showStatus(
        `Yayım yoxlanılır (${sourcePosition + 1}/${currentSources.length}) · ${modeLabel(source.mode)}`
    );

    startupTimer = setTimeout(() => {
        if (session !== playbackId) return;

        console.warn("Timeout:", source.mode, source.url);

        sourcePosition++;
        startNextSource(session);
    }, START_TIMEOUT);

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (hlsJsSupported) {
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
============================================ */

function createLoader(mode) {
    const BaseLoader = Hls.DefaultConfig.loader;

    return class CustomLoader extends BaseLoader {
        load(context, config, callbacks) {
            const original = context.url;

            context.url = transformUrl(mode, original);

            const wrapped = {
                ...callbacks,
                onSuccess: (response, stats, ctx, networkDetails) => {
                    if (response) response.url = original;
                    if (ctx) ctx.url = original;

                    callbacks.onSuccess(response, stats, ctx, networkDetails);
                }
            };

            super.load(context, config, wrapped);
        }
    };
}

function startHls(source, session) {
    const player = new Hls({
        enableWorker: true,
        autoStartLoad: true,
        startPosition: -1,

        maxBufferLength: 10,
        maxMaxBufferLength: 20,
        maxBufferSize: 25 * 1000 * 1000,

        lowLatencyMode: false,

        manifestLoadingTimeOut: 7000,
        manifestLoadingMaxRetry: 1,
        manifestLoadingRetryDelay: 400,

        levelLoadingTimeOut: 7000,
        levelLoadingMaxRetry: 1,
        levelLoadingRetryDelay: 400,

        fragLoadingTimeOut: 12000,
        fragLoadingMaxRetry: 1,
        fragLoadingRetryDelay: 400,

        loader: createLoader(source.mode)
    });

    currentHls = player;

    player.on(Hls.Events.MEDIA_ATTACHED, () => {
        if (session !== playbackId) return;

        player.loadSource(source.url);
    });

    player.on(Hls.Events.MANIFEST_PARSED, () => {
        if (session !== playbackId) return;

        console.log("Manifest parsed:", currentChannel.name, `[${source.mode}]`);

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
            code: data.response && data.response.code
        });

        sourcePosition++;
        startNextSource(session);
    });

    player.attachMedia(video);
}


/* ============================================
   NATIVE HLS (Safari / iOS)
============================================ */

function startNative(source, session) {
    video.src = transformUrl(source.mode, source.url);

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

        markWorking(currentChannel);

        if (currentSource) {
            storageSet(
                "tvkino:last:" + currentChannel.id,
                JSON.stringify({ url: currentSource.url, mode: currentSource.mode })
            );
        }
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
    destroyHls();

    const channel = currentChannel;
    const hasUrls = channel && channel.urls.length > 0;

    let message;

    if (!hasUrls) {
        message = "Bu kanal üçün yayım ünvanı tapılmadı.";
    } else if (!hasDirectPlayable(channel) && !hasOwnProxy()) {
        message = "Bu kanalın yayımları yalnız http://IP formatındadır. HTTPS saytda açılması üçün HTTPS proxy lazımdır (OWN_PROXIES).";
    } else {
        message = "Bütün ünvanlar sınandı, açılmadı (region bloku, CORS və ya ölü yayım ola bilər).";
    }

    showStatus(message, "error");

    setConnected(false);
    setInfo("Stream unavailable");

    retryButton.hidden = false;

    if (channel) {
        markFailed(channel);

        if (channel.id === "mosfilm") {
            mosfilmLink.hidden = false;
        }
    }

    if (workingOnly) renderChannels();
}


/* ============================================
   RETRY
============================================ */

retryButton.addEventListener("click", () => {
    if (currentChannel) {
        storageRemove("tvkino:last:" + currentChannel.id);
        markWorking(currentChannel);

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
   SEARCH + WORKING-ONLY FILTER
============================================ */

searchInput.addEventListener("input", () => {
    currentSearch = searchInput.value.trim();
    renderChannels();
});

if (workingOnlyInput) {
    workingOnly = workingOnlyInput.checked;

    workingOnlyInput.addEventListener("change", () => {
        workingOnly = workingOnlyInput.checked;
        renderChannels();
    });
}


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
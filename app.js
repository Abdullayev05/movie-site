"use strict";

/* ============================================
   TV KINO - CHANNEL CONFIGURATION
============================================ */

const PLAYLISTS = [
    { name: "Russia", url: "https://iptv-org.github.io/iptv/countries/ru.m3u" },
    { name: "Belarus", url: "https://iptv-org.github.io/iptv/countries/by.m3u" },
    { name: "Azerbaijan", url: "https://iptv-org.github.io/iptv/countries/az.m3u" }
];


/*
    Additional candidate streams from public IPTV listings.
    Key = channel id. Not guaranteed or represented as official.
*/

const EXTRA_STREAMS = {
   mosfilm: [
        // HTTPS & GitHub / açıq siyahı namizədləri
        "https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv",
        "https://adpnetworkhd-cmd.github.io/iptv/MosfilmGoldCollection.m3u8",
        "https://iptv-org.github.io/iptv/channels/ru.m3u",
        "https://cdn.ntv.ru/mosfilm/playlist.m3u8",
        "https://cdn.ntv.ru/mosfilm_hd/playlist.m3u8",
        "https://s.xittv.net/235/index.m3u8",
        "https://live.smotrim.ru/mosfilm/index.m3u8",
        "https://hls.mosfilm.ru/live/playlist.m3u8",
        "https://stream.mosfilm.ru/hls/index.m3u8",

        // HTTP / Portlu / İctimai IPTV siyahılarındakı namizədlər
        "http://europe3.livetv.az/russia/mosfilm_2023/playlist.m3u8",
        "http://europe3.livetv.az/russia/mosfilm/playlist.m3u8",
        "http://europe2.livetv.az/russia/mosfilm/playlist.m3u8",
        "http://europe1.livetv.az/russia/mosfilm/playlist.m3u8",
        "http://moobl.ru/hls/Mosfilm_hd.m3u8",
        "http://moobl.ru/hls/mosfilm.m3u8",
        "http://185.121.1.163:8083/Mosfilm/index.m3u8",
        "http://185.121.1.163:8083/mosfilm/playlist.m3u8",
        "http://178.217.72.66:8080/mosfilm/index.m3u8",
        "http://178.217.72.66:8080/Mosfilm/index.m3u8",
        "http://178.134.1.158:8081/mosfilm/index.m3u8",
        "http://178.134.1.158:8081/Mosfilm/index.m3u8",
        "http://178.212.71.253:8000/play/121/index.m3u8",
        "http://178.212.71.253:8000/play/121/playlist.m3u8",
        "http://31.222.235.15/mosfilm/index.m3u8",
        "http://31.222.235.15/Mosfilm/index.m3u8",
        "http://31.222.235.15/mosfilm/playlist.m3u8",
        "http://stream.mcquack.net/369/index.m3u8",
        "http://stream.mcquack.net/369/playlist.m3u8",
        "http://hls127.freeott.top:8080/Mosfilm/video.m3u8",
        "http://hls127.freeott.top:8080/mosfilm/index.m3u8",
        "http://188.227.44.167:8080/mosfilm/index.m3u8",
        "http://188.227.44.167:8080/Mosfilm/index.m3u8",
        "http://15.204.53.12:80/Mosfilm/playlist.m3u8",
        "http://15.204.53.12/Mosfilm/index.m3u8",

        // Digər yayıq port/yol kombinasiyaları
        "http://str2.iptvhd.ru:8080/Mosfilm/index.m3u8",
        "http://str2.iptvhd.ru:8080/mosfilm/index.m3u8",
        "http://iptv.prosto.tv:7000/mosfilm/video.m3u8",
        "http://iptv.mega.net.ru:8888/Mosfilm/index.m3u8",
        "http://iptv.mega.net.ru:8888/mosfilm/index.m3u8",
        "http://tv.tuva.ru/mosfilm/index.m3u8",
        "http://31.148.48.15/Mosfilm/index.m3u8",
        "http://31.148.48.15/Mosfilm_HD/index.m3u8",
        "http://195.208.165.10:8080/mosfilm/index.m3u8",
        "http://91.219.193.10:8080/mosfilm/index.m3u8",
        "http://77.247.176.20:8080/mosfilm/index.m3u8",
        "http://95.163.255.10:8080/mosfilm/index.m3u8",
        "http://185.10.209.10:8080/mosfilm/index.m3u8",
        "http://46.173.216.10:8080/mosfilm/index.m3u8",
        "http://94.250.250.10:8080/mosfilm/index.m3u8",
        "http://213.87.132.10:8080/mosfilm/index.m3u8",
        "http://176.59.100.10:8080/mosfilm/index.m3u8",
        "http://109.195.100.10:8080/mosfilm/index.m3u8",
        "http://89.178.100.10:8080/mosfilm/index.m3u8",
        "http://85.143.100.10:8080/mosfilm/index.m3u8",
        "http://83.149.100.10:8080/mosfilm/index.m3u8",
        "http://78.36.100.10:8080/mosfilm/index.m3u8",
        "http://62.117.100.10:8080/mosfilm/index.m3u8",
        "http://45.12.100.10:8080/mosfilm/index.m3u8",
        "http://37.140.100.10:8080/mosfilm/index.m3u8",
        "http://212.192.100.10:8080/mosfilm/index.m3u8",
        "http://194.87.100.10:8080/mosfilm/index.m3u8",
        "http://193.106.100.10:8080/mosfilm/index.m3u8",
        "http://188.130.100.10:8080/mosfilm/index.m3u8",
        "http://185.200.100.10:8080/mosfilm/index.m3u8",
        "http://178.176.100.10:8080/mosfilm/index.m3u8",
        "http://176.192.100.10:8080/mosfilm/index.m3u8",
        "http://158.181.100.10:8080/mosfilm/index.m3u8",
        "http://141.8.100.10:8080/mosfilm/index.m3u8",
        "http://128.72.100.10:8080/mosfilm/index.m3u8",
        "http://92.255.100.10:8080/mosfilm/index.m3u8",
        "http://90.188.100.10:8080/mosfilm/index.m3u8",
        "http://88.201.100.10:8080/mosfilm/index.m3u8",
        "http://84.201.100.10:8080/mosfilm/index.m3u8",
        "http://82.200.100.10:8080/mosfilm/index.m3u8",
        "http://80.249.100.10:8080/mosfilm/index.m3u8",
        "http://79.133.100.10:8080/mosfilm/index.m3u8",
        "http://77.222.100.10:8080/mosfilm/index.m3u8",
        "http://46.149.100.10:8080/mosfilm/index.m3u8",
        "http://31.131.100.10:8080/mosfilm/index.m3u8",
        "http://5.188.100.10:8080/mosfilm/index.m3u8",
        "http://2.60.100.10:8080/mosfilm/index.m3u8",

        // HTTPS proxy üzərindən sınaq variantları
        "https://corsproxy.io/?" + encodeURIComponent("https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv"),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv"),
        "https://corsproxy.io/?" + encodeURIComponent("https://s.xittv.net/235/index.m3u8"),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://s.xittv.net/235/index.m3u8")
    ],


    russia24: [
        "https://live.smotrim.ru/vgtrk/0/russia24-hd/index.m3u8",
        "https://live.smotrim.ru/vgtrk/0/russia24-sd/index.m3u8",
        "https://stream.smotrim.ru/hls2/russia24nl_smotrim/playlist_5.m3u8",
        "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia24-hd/index.m3u8",
        "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia24-sd/index.m3u8",
        "https://fs.uplink.kz/russia24/mono.m3u8?token=onlinetv",
        "http://31.222.235.15/russia24/index.m3u8",
        "http://178.212.71.253:8000/play/4/index.m3u8"
    ],

    russia1: [
        "https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8",
        "https://live.smotrim.ru/vgtrk/0/russia1-sd/index.m3u8",
        "https://dvr-player.smotrim.ru/live/smil:rtrp.smil/playlist.m3u8",
        "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia1-hd/index.m3u8",
        "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia1-sd/index.m3u8",
        "https://fs.uplink.kz/russia1/mono.m3u8?token=onlinetv",
        "http://31.148.48.15/Rossiya_1_HD/index.m3u8",
        "http://31.222.235.15/russia1/index.m3u8",
        "http://178.212.71.253:8000/play/2/index.m3u8",
        "https://corsproxy.io/?" + encodeURIComponent("https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8"),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8")
    ],

    perviy: [
        "https://okkotv-live.cdnvideo.ru/channel/Pervii_Kanal_OTT_HD.m3u8",
        "http://178.212.71.253:8000/play/1/index.m3u8",
        "http://tv.tuva.ru/ort/index.m3u8",
        "https://streaming.thestream.cyou/live/210-req_offset_28000000-req_window_0-1k_v5.m3u8"
    ],

    by2: [],

    ntv: [
        "https://cdn.ntv.ru/ntv-msk_hd/tracks-v1a1/mono.m3u8",
        "https://cdn.ntv.ru/ntv-msk_sd/tracks-v1a1/mono.m3u8",
        "https://cdn.ntv.ru/ntv-msk_hd/index.m3u8",
        "https://cdn.ntv.ru/ntv-msk_sd/index.m3u8",
        "http://cdn.ntv.ru/ntv-msk_hd/tracks-v1a1/playlist.m3u8",
        "http://cdn.ntv.ru/ntv-msk_sd/tracks-v1a1/playlist.m3u8",
        "http://cdn.ntv.ru/ntv-msk_hd/tracks-v1a1/mono.m3u8",
        "http://cdn.ntv.ru/ntv-msk_sd/tracks-v1a1/mono.m3u8",
        "http://178.212.71.253:8000/play/3/index.m3u8",
        "http://31.222.235.15/ntv/index.m3u8",
        "http://188.227.44.167:8080/ntv/index.m3u8"
    ],

    pobeda: [
        "https://pkvc-hls3.cdnvideo.ru/Pobeda/smil:Pobeda.smil/chunklist_b5128000_slru.m3u8",
        "https://pkvc-hls3.cdnvideo.ru/Pobeda/smil:Pobeda.smil/playlist.m3u8",
        "https://fs.uplink.kz/pobeda/mono.m3u8?token=onlinetv",
        "https://cdn4.skygo.mn/live/disk1/Pobeda/HLSv3-FTA/Pobeda.m3u8",
        "https://cdn4.skygo.mn/live/disk1/Pobeda/HLSv3-FTA/Pobeda-1000.m3u8",
        "https://cdn4.skygo.mn/live/disk1/Pobeda/HLSv3-FTA/Pobeda-2000.m3u8",
        "http://178.217.72.66:8080/pobeda/index.m3u8",
        "http://str2.iptvhd.ru:8080/Pobeda/index.m3u8",
        "http://iptv.prosto.tv:7000/ch317/video.m3u8",
        "http://foosb3v5.tvclub.xyz/iptv/QG2UA7TEWDGBEW/2402/index.m3u.m3u8",
        "http://iptv.mega.net.ru:8888/Pobeda/index.m3u8"
    ],

    mir24: [
        "https://cdn-edge.mir24.tv/hls/mir24/index.m3u8",
        "https://mir24tv-sdr.cdnvideo.ru/mir24tv/smil:mir24tv.smil/playlist.m3u8",
        "https://hls-mirtv.cdnvideo.ru/mirtv-parampublish/mir24_2500/playlist.m3u8",
        "https://corsproxy.io/?" + encodeURIComponent("https://cdn-edge.mir24.tv/hls/mir24/index.m3u8"),
        "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://cdn-edge.mir24.tv/hls/mir24/index.m3u8")
    ],
};


/* ============================================
   DESIRED CHANNELS
============================================ */

const CHANNEL_DEFINITIONS = [
    {
        id: "mosfilm",
        name: "Mosfilm. Zolotaya Kolleksiya",
        aliases: [
            "mosfilm",
            "mosfilm gold collection",
            "mosfilm zolotaya kolleksiya",
            "мосфильм",
            "мосфильм золотая коллекция"
        ],
        category: "movie",
        logo: "mosfilm.png",
        official: "https://www.mosfilm.ru/cinema/"
    },
    {
        id: "russia1",
        name: "Россия 1",
        aliases: ["russia-1", "russia 1", "россия-1", "россия 1"],
        category: "news",
        logo: "https://commons.wikimedia.org/wiki/Special:FilePath/Rossiya-1%20Logo.svg"
    },
    {
        id: "russia24",
        name: "Россия 24",
        aliases: ["russia-24", "russia 24", "россия-24", "россия 24"],
        category: "news",
        logo: ""
    },
    {
        id: "ntv",
        name: "НТВ",
        aliases: ["ntv", "нтв"],
        category: "news",
        logo: ""
    },
    {
        id: "mir24",
        name: "МИР 24",
        aliases: ["mir 24", "мир 24", "mir24"],
        category: "news",
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSCwK2v6uK9NVOaqgmhcIIdyFq3srRDnW_ry7WpaJYULQ&s=10"
    },
    {
        id: "zvezda",
        name: "Звезда",
        aliases: ["zvezda", "звезда"],
        category: "news",
        logo: ""
    },
    {
        id: "pobeda",
        name: "Победа",
        aliases: ["pobeda", "победа", "pobeda tv"],
        category: "movie",
        logo: ""
    },
    {
        id: "perviy",
        name: "Первый канал",
        aliases: ["channel one russia", "perviy kanal", "первый канал", "1tv"],
        category: "news",
        logo: "",
        official: "https://www.1tv.ru/live"
    },
    /*Belarus*/
    {
        id: "by1",
        name: "Беларусь 1",
        aliases: ["belarus 1", "беларусь 1"],
        category: "news",
        logo: ""
    },
    {
        id: "by2",
        name: "Беларусь 2",
        aliases: ["belarus 2", "беларусь 2"],
        category: "movie",
        logo: "",
        official: "https://www.tvr.by"
    },
    {
        id: "by3",
        name: "Беларусь 3",
        aliases: ["belarus 3", "беларусь 3"],
        category: "movie",
        logo: ""
    },
    {
        id: "by4",
        name: "Беларусь 4",
        aliases: ["belarus 4", "беларусь 4"],
        category: "movie",
        logo: ""
    },
    {
        id: "by5",
        name: "Беларусь 5",
        aliases: ["belarus 5", "беларусь 5"],
        category: "movie",
        logo: ""
    },
    {
        id: "by24",
        name: "Беларусь 24",
        aliases: ["belarus 24", "беларусь 24"],
        category: "news",
        logo: ""
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
let onlyWorking = false;

let playbackId = 0;
let sourcePosition = 0;

let startupTimer = null;
let retryTimer = null;

const START_TIMEOUT = 12000;
const MAX_CANDIDATES = 25;


/* ============================================
   AD & PROMO BLOCKER HELPERS
============================================ */

const BLOCKED_STREAM_PATTERNS = [
    "cinerama",
    "preroll",
    "midroll",
    "postroll",
    "/ads/",
    "/ad/",
    "adserver",
    "doubleclick",
    "googlesyndication"
];

function isBlockedStreamUrl(url) {
    const lower = String(url || "").toLowerCase();
    return BLOCKED_STREAM_PATTERNS.some(pattern => lower.includes(pattern));
}

function stripAdSegmentsFromManifest(manifestText) {
    if (!manifestText || !manifestText.includes("#EXTM3U")) {
        return manifestText;
    }

    const lines = manifestText.split(/\r?\n/);
    const cleaned = [];
    let skipNextUri = false;

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (!line) {
            cleaned.push(rawLine);
            continue;
        }

        if (
            line.startsWith("#EXT-X-CUE-OUT") ||
            line.startsWith("#EXT-X-DATERANGE") ||
            /AD|PROMO|COMMERCIAL|SPONSOR/i.test(line)
        ) {
            skipNextUri = true;
            continue;
        }

        if (line.startsWith("#EXT-X-CUE-IN")) {
            skipNextUri = false;
            continue;
        }

        if (!line.startsWith("#")) {
            if (skipNextUri || isBlockedStreamUrl(line)) {
                skipNextUri = false;
                continue;
            }
        }

        cleaned.push(rawLine);
    }

    return cleaned.join("\n");
}


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

function createChannelAvatar(channel) {
    const fallback = document.createElement("span");
    fallback.className = "channel-logo-fallback";
    fallback.textContent = channel.name.slice(0, 2).toUpperCase();
    fallback.style.cssText =
        "width:32px;height:32px;border-radius:6px;display:inline-flex;" +
        "align-items:center;justify-content:center;font-size:11px;font-weight:700;" +
        "background:#2a2e37;color:#e6e8ec;flex-shrink:0;margin-right:10px;";

    if (!channel.logo) {
        return fallback;
    }

    const img = document.createElement("img");
    img.className = "channel-logo";
    img.src = channel.logo;
    img.alt = channel.name;
    img.loading = "lazy";
    img.referrerPolicy = "no-referrer";
    img.style.cssText =
        "width:32px;height:32px;border-radius:6px;object-fit:contain;" +
        "background:#ffffff;padding:2px;flex-shrink:0;margin-right:10px;";

    img.addEventListener("error", () => {
        img.replaceWith(fallback);
    }, { once: true });

    return img;
}


/* ============================================
   PLAYLIST PARSER
============================================ */

function parseM3U(text, sourceName) {
    const lines = text.split(/\r?\n/);
    const entries = [];

    let currentName = "";
    let currentGroup = "";
    let currentLogo = "";

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

            const logo = line.match(/tvg-logo="([^"]*)"/i);
            currentLogo = logo ? logo[1].trim() : "";

            continue;
        }

        if (
            line.startsWith("#") ||
            !/^https?:\/\//i.test(line)
        ) {
            continue;
        }

        if (isBlockedStreamUrl(line)) {
            currentName = "";
            currentGroup = "";
            currentLogo = "";
            continue;
        }

        if (currentName) {
            entries.push({
                name: currentName,
                group: currentGroup,
                logo: currentLogo,
                source: sourceName,
                url: line
            });
        }

        currentName = "";
        currentGroup = "";
        currentLogo = "";
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
        logo: definition.logo || "",
        urls: [],
        sources: [],
        status: "unknown"
    }));

    const byId = new Map(
        result.map(channel => [channel.id, channel])
    );

    for (const entry of entries) {
        if (isBlockedStreamUrl(entry.url)) continue;

        const definition = findDefinition(entry);

        if (!definition) continue;

        const channel = byId.get(definition.id);

        if (!definition.logo && !channel.logo && entry.logo && /^https?:\/\//i.test(entry.logo)) {
            channel.logo = entry.logo;
        }

        if (!channel.urls.includes(entry.url)) {
            channel.urls.push(entry.url);
            channel.sources.push(entry.source);
        }
    }

    for (const channel of result) {
        const extra = EXTRA_STREAMS[channel.id];

        if (!extra) continue;

        for (const url of extra) {
            if (isBlockedStreamUrl(url)) continue;

            if (!channel.urls.includes(url)) {
                channel.urls.push(url);
                channel.sources.push("Additional public source");
            }
        }
    }

    for (const channel of result) {
        const items = channel.urls.map((url, i) => ({
            url,
            source: channel.sources[i]
        }));

        items.sort((a, b) => {
            const aHttps = a.url.startsWith("https://") ? 0 : 1;
            const bHttps = b.url.startsWith("https://") ? 0 : 1;
            return aHttps - bHttps;
        });

        channel.urls = items.map(item => item.url);
        channel.sources = items.map(item => item.source);
    }

    return result;
}


/* ============================================
   STREAM HEALTH CHECK
============================================ */

async function probeUrl(url, timeoutMs = 8000) {
    if (isBlockedStreamUrl(url)) return "bad";

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
        const res = await fetch(url, {
            signal: controller.signal,
            cache: "no-store"
        });

        if (!res.ok) return "bad";

        const text = await res.text();

        if (!text.includes("#EXTM3U")) return "bad";

        if (text.includes("#EXT-X-STREAM-INF")) {
            const sub = text
                .split(/\r?\n/)
                .map(line => line.trim())
                .find(line => line && !line.startsWith("#"));

            if (!sub) return "bad";

            const subUrl = new URL(sub, res.url).href;
            if (isBlockedStreamUrl(subUrl)) return "bad";

            const res2 = await fetch(subUrl, {
                signal: controller.signal,
                cache: "no-store"
            });

            if (!res2.ok) return "bad";

            const text2 = await res2.text();

            return text2.includes("#EXTM3U") ? "ok" : "bad";
        }

        return "ok";

    } catch {
        return "unknown";
    } finally {
        clearTimeout(timer);
    }
}

async function verifyChannels(list) {
    const rank = { ok: 0, unknown: 1, bad: 2 };

    await Promise.all(list.map(async channel => {
        const candidates = channel.urls.slice(0, MAX_CANDIDATES);

        const states = await Promise.all(
            candidates.map(url => probeUrl(url))
        );

        const items = candidates
            .map((url, i) => ({
                url,
                source: channel.sources[i],
                state: states[i]
            }))
            .filter(item => item.state !== "bad" && !isBlockedStreamUrl(item.url))
            .sort((a, b) => rank[a.state] - rank[b.state]);

        if (items.length > 0) {
            channel.urls = items.map(item => item.url);
            channel.sources = items.map(item => item.source);
        }

        if (items.some(item => item.state === "ok")) {
            channel.status = "ok";
        } else if (items.length > 0) {
            channel.status = "unknown";
        } else {
            channel.status = channel.urls.length > 0 ? "unknown" : "bad";
        }

        console.log(
            `Health check: ${channel.name} - ${channel.status} (${items.length}/${candidates.length} usable)`
        );

        renderChannels();
    }));
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

    sourceInfo.textContent =
        `${successful}/${PLAYLISTS.length} playlist · ${channels.length} kanal · v9`;

    renderChannels();

    console.log("Channel results:", channels);

    verifyChannels(channels).then(() => {
        const ok = channels.filter(c => c.status === "ok").length;

        sourceInfo.textContent =
            `${successful}/${PLAYLISTS.length} playlist · ${channels.length} kanal · ${ok} təsdiqlənib · v9`;
    });
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

        const workingMatch =
            !onlyWorking || channel.status === "ok";

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

    const dotColors = {
        ok: "#32c879",
        unknown: "#8a8f98",
        bad: "#e53946"
    };

    const dotTitles = {
        ok: "Yayım təsdiqlənib",
        unknown: "Yoxlanılmayıb (yenə də işləyə bilər)",
        bad: "İşlək yayım ünvanı tapılmadı"
    };

    filtered.forEach(channel => {
        const button = document.createElement("button");

        button.className = "channel-item";
        button.type = "button";

        if (currentChannel?.id === channel.id) {
            button.classList.add("active");
        }

        const avatar = createChannelAvatar(channel);

        const name = document.createElement("span");
        name.className = "channel-name";
        name.textContent = channel.name;
        name.style.flex = "1";
        name.style.textAlign = "left";

        const dot = document.createElement("span");
        dot.className = "channel-status-dot";
        dot.title = dotTitles[channel.status] || "";
        dot.style.cssText =
            "display:inline-block;width:8px;height:8px;border-radius:50%;" +
            "margin-left:8px;flex-shrink:0;background:" +
            (dotColors[channel.status] || dotColors.unknown);

        button.appendChild(avatar);
        button.appendChild(name);
        button.appendChild(dot);

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

    const usableUrls = (channel.urls || []).filter(u => !isBlockedStreamUrl(u));

    if (!usableUrls.length) {
        showUnavailable(session);
        return;
    }

    currentChannel.urls = usableUrls;

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

    while (
        sourcePosition < currentChannel.urls.length &&
        isBlockedStreamUrl(currentChannel.urls[sourcePosition])
    ) {
        sourcePosition++;
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
   HLS.JS WITH AD & SEGMENT FILTERING
============================================ */

class AdFilteredLoader extends Hls.DefaultConfig.loader {
    load(context, config, callbacks) {
        if (context?.url && isBlockedStreamUrl(context.url)) {
            if (callbacks?.onError) {
                callbacks.onError({ code: 403, text: "Blocked ad stream" }, context);
            }
            return;
        }

        const originalOnSuccess = callbacks.onSuccess;
        callbacks.onSuccess = (response, stats, ctx, networkDetails) => {
            if (response && typeof response.data === "string" && response.data.includes("#EXTM3U")) {
                response.data = stripAdSegmentsFromManifest(response.data);
            }
            originalOnSuccess(response, stats, ctx, networkDetails);
        };

        super.load(context, config, callbacks);
    }
}

function startHls(url, session) {
    const player = new Hls({
        enableWorker: true,
        autoStartLoad: true,
        startPosition: -1,
        loader: AdFilteredLoader,

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

    if (currentChannel.official) {
        mosfilmLink.href = currentChannel.official;
        mosfilmLink.target = "_blank";
        mosfilmLink.rel = "noopener";
        mosfilmLink.textContent = "Rəsmi saytda izlə";
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
   "ONLY WORKING" CHECKBOX
============================================ */

const onlyWorkingBox =
    document.getElementById("onlyWorking") ||
    document.querySelector('input[type="checkbox"]');

if (onlyWorkingBox) {
    onlyWorkingBox.checked = false;
    onlyWorking = false;

    onlyWorkingBox.addEventListener("change", () => {
        onlyWorking = onlyWorkingBox.checked;
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
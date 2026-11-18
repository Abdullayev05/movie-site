"use strict";

/* ============================================
   TV KINO - CONFIGURATION
============================================ */

/*
    1) PROXY_URL  - öz Cloudflare Worker ünvanın (worker.js faylı).
       Ən etibarlı yol budur. Nümunə: "https://tv-proxy.ad.workers.dev"

    2) PUBLIC_PROXIES_ENABLED - PROXY_URL olmasa belə, http / CORS problemli
       yayımlar üçün açıq (public) proxy-lərdən son çarə kimi istifadə edir.
       Bu proxy-lər pulsuzdur, yavaş ola bilər və istənilən vaxt dayana bilər.
*/
const PROXY_URL = "";
const PUBLIC_PROXIES_ENABLED = true;

const PUBLIC_PROXIES = [
    {
        name: "corsproxy",
        build: u => "https://corsproxy.io/?url=" + encodeURIComponent(u)
    },
    {
        name: "allorigins",
        build: u => "https://api.allorigins.win/raw?url=" + encodeURIComponent(u)
    },
    {
        name: "codetabs",
        build: u => "https://api.codetabs.com/v1/proxy?quest=" + encodeURIComponent(u)
    }
];

const PLAYLISTS = [
    { name: "Russia",     url: "https://iptv-org.github.io/iptv/countries/ru.m3u" },
    { name: "Belarus",    url: "https://iptv-org.github.io/iptv/countries/by.m3u" },
    { name: "Azerbaijan", url: "https://iptv-org.github.io/iptv/countries/az.m3u" },

    // Əlavə mənbələr: МИР 24, НТВ, Россия 1 başqa siyahılarda da ola bilər
    { name: "Russian language", url: "https://iptv-org.github.io/iptv/languages/rus.m3u" },
    { name: "Kazakhstan",       url: "https://iptv-org.github.io/iptv/countries/kz.m3u" },
    { name: "Armenia",          url: "https://iptv-org.github.io/iptv/countries/am.m3u" }
];


/*
    Additional candidate streams from public IPTV listings.
    Key = channel id. Not guaranteed or represented as official.
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
        "https://live.smotrim.ru/vgtrk/0/russia1-hd/index.m3u8",
        "https://vgtrkregion-reg.cdnvideo.ru/vgtrk/0/russia1-hd/index.m3u8"
    ],

    perviy: [
        "https://okkotv-live.cdnvideo.ru/channel/Pervii_Kanal_OTT_HD.m3u8",
        "http://178.212.71.253:8000/play/1/index.m3u8",
        "http://tv.tuva.ru/ort/index.m3u8",
        "https://streaming.thestream.cyou/live/210-req_offset_28000000-req_window_0-1k_v5.m3u8"
    ],

    by2: [],

    // Öz tapdığın МИР 24 .m3u8 linkini bura yaza bilərsən
    mir24: [],

    ntv: [
        "https://cdn.ntv.ru/ntv-msk_hd/tracks-v1a1/playlist.m3u8"
    ],

    pobeda: [
        "https://pkvc-hls.cdnvideo.ru/Pobeda/smil:Pobeda.smil/playlist.m3u8"
    ]
};


/* ============================================
   DESIRED CHANNELS
   exclude: adda bu sözlər olan kanallar bu kanala aid sayılmır
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
        id: "russia1",
        name: "Россия 1",
        aliases: ["russia-1", "russia 1", "россия-1", "россия 1"],
        category: "news"
    },
    {
        id: "russia24",
        name: "Россия 24",
        aliases: ["russia-24", "russia 24", "россия-24", "россия 24"],
        category: "news"
    },
    {
        id: "ntv",
        name: "НТВ",
        aliases: ["ntv", "нтв"],
        exclude: ["mir", "мир", "pravo", "право", "stil", "style", "стиль",
                  "hit", "хит", "serial", "сериал", "plus", "плюс",
                  "life", "лайф", "kino", "кино", "bangla", "bangladesh"],
        category: "news"
    },
    {
        id: "mir24",
        name: "МИР 24",
        aliases: ["mir 24", "мир 24", "mir24"],
        category: "news",
        official: "https://mir24.tv/live"
    },
    {
        id: "zvezda",
        name: "Звезда",
        aliases: ["zvezda", "звезда"],
        category: "news"
    },
    {
        id: "pobeda",
        name: "Победа",
        aliases: ["pobeda", "победа", "pobeda tv"],
        category: "movie"
    },
    {
        id: "perviy",
        name: "Первый канал",
        aliases: ["channel one russia", "perviy kanal", "первый канал", "1tv"],
        category: "news",
        official: "https://www.1tv.ru/live"
    },

    /* Belarus */
    {
        id: "by1",
        name: "Беларусь 1",
        aliases: ["belarus 1", "беларусь 1"],
        category: "news"
    },
    {
        id: "by2",
        name: "Беларусь 2",
        aliases: ["belarus 2", "беларусь 2"],
        category: "movie",
        official: "https://www.tvr.by"
    },
    {
        id: "by3",
        name: "Беларусь 3",
        aliases: ["belarus 3", "беларусь 3"],
        category: "movie"
    },
    {
        id: "by4",
        name: "Беларусь 4",
        aliases: ["belarus 4", "беларусь 4"],
        category: "news"
    },
    {
        id: "by5",
        name: "Беларусь 5",
        aliases: ["belarus 5", "беларусь 5"],
        category: "movie"
    },
    {
        id: "by24",
        name: "Беларусь 24",
        aliases: ["belarus 24", "беларусь 24"],
        category: "news"
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
let currentAttempts = [];      // [{ url, proxy }]
let currentHls = null;

let currentCategory = "all";
let currentSearch = "";
let onlyWorking = false;

let playbackId = 0;
let sourcePosition = 0;

let startupTimer = null;
let retryTimer = null;

const START_TIMEOUT_DIRECT = 12000;
const START_TIMEOUT_PROXY = 14000;
const MAX_CANDIDATES = 15;       // health check üçün
const MAX_ATTEMPTS = 30;         // bir kanal üçün maksimum cəhd
const PUBLIC_PROXY_URLS = 3;     // public proxy ilə yalnız ilk N ünvan sınanır
const IS_HTTPS_PAGE = location.protocol === "https:";

const CUSTOM_KEY = "tvkino_custom_links_v1";

// Proxy siyahısı
const PROXIES = [];

if (PROXY_URL) {
    PROXIES.push({
        name: "worker",
        rewrites: true,   // worker m3u8 daxilini özü yenidən yazır
        build: u => PROXY_URL.replace(/\/+$/, "") + "/?url=" + encodeURIComponent(u)
    });
}

if (PUBLIC_PROXIES_ENABLED) {
    PUBLIC_PROXIES.forEach(p => PROXIES.push({ ...p, rewrites: false }));
}

const WORKER_PROXY = PROXIES.find(p => p.rewrites) || null;
const GENERIC_PROXIES = PROXIES.filter(p => !p.rewrites);


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

function isHttp(url) {
    return /^http:\/\//i.test(url);
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
   CUSTOM LINKS (istifadəçinin öz linkləri, brauzerdə saxlanır)
============================================ */

function loadCustom() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOM_KEY) || "{}") || {};
    } catch {
        return {};
    }
}

function saveCustom(data) {
    try {
        localStorage.setItem(CUSTOM_KEY, JSON.stringify(data));
    } catch {
        /* storage bağlıdır - ignore */
    }
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

    const padded = " " + channelName + " ";

    for (const definition of CHANNEL_DEFINITIONS) {
        if (
            definition.exclude &&
            definition.exclude.some(word =>
                padded.includes(" " + normalize(word) + " ")
            )
        ) {
            continue;
        }

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
   Heç bir ünvan SİLİNMİR. Sıra:
   1) istifadəçinin öz linkləri  2) https  3) http
============================================ */

function buildChannels(entries) {
    const custom = loadCustom();

    const result = CHANNEL_DEFINITIONS.map(definition => ({
        ...definition,
        urls: [],
        sources: [],
        custom: Array.isArray(custom[definition.id]) ? custom[definition.id] : [],
        hasHttp: false,
        status: "unknown"   // ok | unknown | bad
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
        const extra = EXTRA_STREAMS[channel.id];

        if (!extra) continue;

        for (const url of extra) {
            if (!channel.urls.includes(url)) {
                channel.urls.push(url);
                channel.sources.push("Additional public source");
            }
        }
    }

    for (const channel of result) {
        let items = channel.urls
            .map((url, i) => ({ url, source: channel.sources[i] }))
            .filter(item => !channel.custom.includes(item.url));

        // https ünvanlar http-dən əvvəl
        items.sort((a, b) => {
            const aRank = isHttp(a.url) ? 1 : 0;
            const bRank = isHttp(b.url) ? 1 : 0;
            return aRank - bRank;
        });

        const customItems = channel.custom.map(url => ({
            url,
            source: "Custom"
        }));

        items = customItems.concat(items);

        channel.urls = items.map(item => item.url);
        channel.sources = items.map(item => item.source);
        channel.hasHttp = channel.urls.some(isHttp);
    }

    return result;
}


/* ============================================
   STREAM HEALTH CHECK
   Heç nəyi silmir, yalnız sıralayır: ok -> unknown -> bad
   Qaytarır: "ok" | "bad" | "unknown"
============================================ */

async function probeOnce(url, timeoutMs = 8000) {
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

            const res2 = await fetch(new URL(sub, res.url).href, {
                signal: controller.signal,
                cache: "no-store"
            });

            if (!res2.ok) return "bad";

            const text2 = await res2.text();

            return text2.includes("#EXTM3U") ? "ok" : "bad";
        }

        return "ok";

    } catch {
        // CORS, timeout, mixed content və s. - qərar vermirik
        return "unknown";
    } finally {
        clearTimeout(timer);
    }
}

async function probeUrl(url) {
    const direct = await probeOnce(url);

    if (direct === "ok" || !WORKER_PROXY) return direct;

    // Birbaşa alınmadı: öz worker-in ilə yoxla
    const proxied = await probeOnce(WORKER_PROXY.build(url));

    if (proxied === "ok") return "ok";
    if (direct === "bad" && proxied === "bad") return "bad";

    return "unknown";
}

async function verifyChannels(list) {
    const rank = { ok: 0, unknown: 1, bad: 2 };

    await Promise.all(list.map(async channel => {
        const candidates = channel.urls.slice(0, MAX_CANDIDATES);

        const rest = channel.urls
            .slice(MAX_CANDIDATES)
            .map((url, i) => ({
                url,
                source: channel.sources[MAX_CANDIDATES + i],
                state: "unknown",
                custom: false
            }));

        const states = await Promise.all(
            candidates.map(url => probeUrl(url))
        );

        const checked = candidates
            .map((url, i) => ({
                url,
                source: channel.sources[i],
                state: states[i],
                custom: channel.custom.includes(url)
            }))
            .sort((a, b) => {
                if (a.custom !== b.custom) return a.custom ? -1 : 1;
                return rank[a.state] - rank[b.state];
            });

        const items = checked.concat(rest);

        channel.urls = items.map(item => item.url);
        channel.sources = items.map(item => item.source);

        if (items.some(item => item.state === "ok")) {
            channel.status = "ok";
        } else if (items.some(item => item.state === "unknown")) {
            channel.status = "unknown";
        } else if (items.length > 0) {
            channel.status = "bad";
        } else {
            channel.status = "bad";
        }

        console.log(
            `Health check: ${channel.name} - ${channel.status} ` +
            `(${items.length} ünvan)`
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

    // Bütün kanalları DƏRHAL göstər
    channels = buildChannels(entries);

    const proxyNote = WORKER_PROXY
        ? " · worker"
        : (GENERIC_PROXIES.length ? " · public proxy" : "");

    sourceInfo.textContent =
        `${successful}/${PLAYLISTS.length} playlist · ${channels.length} kanal${proxyNote} · v11`;

    renderChannels();

    console.log("Channel results:", channels);

    // Yoxlama arxa fonda gedir, kanalı silmir
    verifyChannels(channels).then(() => {
        const ok = channels.filter(c => c.status === "ok").length;

        sourceInfo.textContent =
            `${successful}/${PLAYLISTS.length} playlist · ${channels.length} kanal · ${ok} təsdiqlənib${proxyNote} · v11`;
    });
}


/* ============================================
   RENDER CHANNELS
============================================ */

function renderChannels() {
    const scrollTop = channelList.scrollTop;

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
        bad: "Yoxlamada cavab alınmadı (yenə də sınanacaq)"
    };

    filtered.forEach(channel => {
        const button = document.createElement("button");

        button.className = "channel-item";
        button.type = "button";

        if (currentChannel?.id === channel.id) {
            button.classList.add("active");
        }

        const name = document.createElement("span");
        name.className = "channel-name";
        name.textContent = channel.name;

        const dot = document.createElement("span");
        dot.className = "channel-status-dot";
        dot.title = dotTitles[channel.status] || "";
        dot.style.cssText =
            "display:inline-block;width:8px;height:8px;border-radius:50%;" +
            "margin-left:8px;flex-shrink:0;background:" +
            (dotColors[channel.status] || dotColors.unknown);

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
    channelList.scrollTop = scrollTop;
}


/* ============================================
   PLAY CHANNEL
============================================ */

/*
    Cəhd sırası:
    1) Birbaşa (http-lər https səhifədə atlanır, çünki bloklanır)
    2) Öz worker proxy-n (varsa) - bütün ünvanlar
    3) Public proxy-lər - yalnız ilk PUBLIC_PROXY_URLS ünvan
*/
function buildAttempts(urls) {
    const attempts = [];

    const push = (url, proxy) => {
        if (attempts.length < MAX_ATTEMPTS) {
            attempts.push({ url, proxy });
        }
    };

    for (const url of urls) {
        const mixed = IS_HTTPS_PAGE && isHttp(url);

        if (!mixed) push(url, null);
    }

    if (WORKER_PROXY) {
        for (const url of urls) push(url, WORKER_PROXY);
    }

    if (GENERIC_PROXIES.length) {
        urls.slice(0, PUBLIC_PROXY_URLS).forEach(url => {
            GENERIC_PROXIES.forEach(proxy => push(url, proxy));
        });
    }

    return attempts;
}

function playChannel(channel) {
    playbackId++;

    const session = playbackId;

    currentChannel = channel;
    currentAttempts = buildAttempts(channel.urls);
    sourcePosition = 0;

    stopPlayer();

    nowPlaying.textContent = channel.name;

    placeholder.style.display = "none";
    video.style.display = "block";

    retryButton.hidden = true;
    mosfilmLink.hidden = true;
    addLinkButton.hidden = false;

    setConnected(false);
    setInfo("Connecting to " + channel.name);

    if (!currentAttempts.length) {
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

    if (sourcePosition >= currentAttempts.length) {
        showUnavailable(session);
        return;
    }

    const attempt = currentAttempts[sourcePosition];
    const proxy = attempt.proxy;

    const hlsSupported = typeof Hls !== "undefined" && Hls.isSupported();
    const nativeSupported = video.canPlayType("application/vnd.apple.mpegurl");

    // Native HLS (Safari) generic proxy ilə işləyə bilmir, keç
    if (proxy && !proxy.rewrites && !hlsSupported) {
        sourcePosition++;
        startNextSource(session);
        return;
    }

    const via = proxy ? "proxy: " + proxy.name : "birbaşa";

    console.log(
        `Trying ${sourcePosition + 1}/${currentAttempts.length} [${via}]:`,
        attempt.url
    );

    showStatus(
        `Yayım yoxlanılır (${sourcePosition + 1}/${currentAttempts.length}, ${via})...`
    );

    startupTimer = setTimeout(() => {
        if (session !== playbackId) return;

        sourcePosition++;
        startNextSource(session);
    }, proxy ? START_TIMEOUT_PROXY : START_TIMEOUT_DIRECT);

    video.pause();
    video.removeAttribute("src");
    video.load();

    if (hlsSupported) {
        if (proxy && proxy.rewrites) {
            startHls(proxy.build(attempt.url), session, null);
        } else {
            startHls(attempt.url, session, proxy);
        }
    } else if (nativeSupported) {
        startNative(proxy ? proxy.build(attempt.url) : attempt.url, session);
    } else {
        clearTimers();
        showStatus("Brauzer HLS formatını dəstəkləmir.", "error");
    }
}


/* ============================================
   HLS.JS
   genericProxy verilərsə, hls.js-in BÜTÜN sorğuları
   (manifest, alt-playlist, seqment, açar) proxy-dən keçir.
============================================ */

function makeProxyLoader(proxy) {
    const BaseLoader = Hls.DefaultConfig.loader;

    return class ProxyLoader extends BaseLoader {
        load(context, config, callbacks) {
            const original = context.url;

            context.url = proxy.build(original);

            const wrapped = Object.assign({}, callbacks, {
                onSuccess: (response, stats, ctx, details) => {
                    // Nisbi linklər orijinal ünvana görə hesablansın
                    if (response) response.url = original;
                    if (ctx) ctx.url = original;

                    callbacks.onSuccess(response, stats, ctx, details);
                }
            });

            super.load(context, config, wrapped);
        }
    };
}

function startHls(url, session, genericProxy) {
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
        fragLoadingRetryDelay: 500
    };

    if (genericProxy) {
        config.loader = makeProxyLoader(genericProxy);
    }

    const player = new Hls(config);

    currentHls = player;

    let mediaRecovered = false;

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

        if (data.type === Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
            mediaRecovered = true;
            player.recoverMediaError();
            return;
        }

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

        video.removeEventListener("error", onError);
        playVideo(session);
    };

    const onError = () => {
        video.removeEventListener("loadedmetadata", onLoaded);

        if (session !== playbackId) return;

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

            if (currentChannel) currentChannel.status = "ok";

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

    let message =
        "Bütün cəhdlər uğursuz oldu. Öz linkini əlavə edə bilərsən (Link əlavə et).";

    if (!currentChannel || !currentChannel.urls.length) {
        message =
            "Bu kanal üçün heç bir ünvan tapılmadı. Öz linkini əlavə edə bilərsən.";
    } else if (!currentAttempts.length) {
        message =
            "Bu kanalın yayımı http-dir, https səhifədə brauzer bloklayır. " +
            "PROXY_URL qurulmalıdır.";
    }

    showStatus(message, "error");

    setConnected(false);
    setInfo("Stream unavailable");

    retryButton.hidden = false;

    if (currentChannel && currentChannel.official) {
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
   "LINK ƏLAVƏ ET" DÜYMƏSİ
   İstənilən kanal üçün öz .m3u8 linkini yaz, brauzerdə yadda qalır.
   Linki silmək üçün pəncərəyə  sil  yaz.
============================================ */

const addLinkButton = document.createElement("button");

addLinkButton.type = "button";
addLinkButton.className = retryButton.className;
addLinkButton.textContent = "Link əlavə et";
addLinkButton.hidden = true;

retryButton.insertAdjacentElement("afterend", addLinkButton);

addLinkButton.addEventListener("click", () => {
    if (!currentChannel) return;

    const input = window.prompt(
        currentChannel.name + " üçün .m3u8 linki yazın\n" +
        "(əlavə etdiyiniz linkləri silmək üçün: sil)"
    );

    if (input === null) return;

    const value = input.trim();
    const store = loadCustom();
    const channel = currentChannel;

    if (value.toLowerCase() === "sil") {
        const old = channel.custom;

        const pairs = channel.urls
            .map((url, i) => ({ url, source: channel.sources[i] }))
            .filter(item => !old.includes(item.url));

        channel.urls = pairs.map(item => item.url);
        channel.sources = pairs.map(item => item.source);
        channel.custom = [];

        delete store[channel.id];
        saveCustom(store);

    } else {
        if (!/^https?:\/\/\S+$/i.test(value)) {
            window.alert("Düzgün http:// və ya https:// linki daxil edin.");
            return;
        }

        const pairs = channel.urls
            .map((url, i) => ({ url, source: channel.sources[i] }))
            .filter(item => item.url !== value);

        pairs.unshift({ url: value, source: "Custom" });

        channel.urls = pairs.map(item => item.url);
        channel.sources = pairs.map(item => item.source);
        channel.custom = [value].concat(
            channel.custom.filter(u => u !== value)
        );

        store[channel.id] = channel.custom;
        saveCustom(store);
    }

    renderChannels();
    playChannel(channel);
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
    onlyWorkingBox.checked = false;   // defolt: hamısı görünsün
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
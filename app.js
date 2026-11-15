
(() => {
  "use strict";

  /* =====================================================
     TVKINO - SMART TV IPTV PLAYER
     Samsung Tizen / LG webOS / Android TV / Browser
  ===================================================== */

  const BASE = "https://iptv-org.github.io/iptv/";

  const MAX_CHANNELS = 100;

  const SOURCES = [
    { id: "ru", url: BASE + "countries/ru.m3u", country: "ru" },
    { id: "by", url: BASE + "countries/by.m3u", country: "by" },
    { id: "az", url: BASE + "countries/az.m3u", country: "az" },
    { id: "tr", url: BASE + "countries/tr.m3u", country: "tr" },
    { id: "ua", url: BASE + "countries/ua.m3u", country: "ua" },
    { id: "rus", url: BASE + "languages/rus.m3u", country: "ru" }
  ];

  const COUNTRY = {
    ru: "Rusiya",
    by: "Belarus",
    az: "Azərbaycan",
    tr: "Türkiyə",
    ua: "Ukrayna"
  };

  const $ = id => document.getElementById(id);

  const el = {
    list: $("channelList"),
    count: $("channelCount"),
    search: $("searchInput"),
    info: $("sourceInfo"),
    video: $("mainVideo"),
    now: $("nowPlaying"),
    ph: $("playerPlaceholder"),
    status: $("playerStatus"),
    statusText: $("statusText"),
    loader: $("statusLoader"),
    dot: $("connectionDot"),
    pinfo: $("playerInfo"),
    retry: $("retryButton"),
    mos: $("mosfilmLink")
  };

  if (!el.list || !el.video || !el.search) {
    console.error("TVKINO: Required HTML elements were not found.");
    return;
  }

  /* =====================================================
     DEVICE DETECTION
  ===================================================== */

  const ua = navigator.userAgent.toLowerCase();

  const DEVICE = {
    samsung: /samsung|smart-tv|tizen/.test(ua),
    lg: /web0s|webos|netcast/.test(ua),
    android: /android/.test(ua),
    tv: /smart-tv|smarttv|tizen|webos|netcast|hbbtv|googletv|android/.test(ua)
  };

  const IS_TV = DEVICE.tv;

  document.body.classList.toggle("smart-tv", IS_TV);

  /* =====================================================
     STORAGE
  ===================================================== */

  const store = {
    get(key, fallback) {
      try {
        const value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {}
    }
  };

  const favs = new Set(store.get("tvkino_favs", []));

  /* =====================================================
     MOSFILM
     This is the user's original Mosfilm stream URL.
  ===================================================== */

  const MOSFILM = [
    {
      name: "Mosfilm International",
      country: "ru",
      category: "movie",
      pinned: true,
      urls: [
        "http://stream.mcquack.net/369/index.m3u8"
      ]
    }
  ];

  /* =====================================================
     PRIORITY CHANNELS
     These names are used to rank channels found in M3U.
     A channel is added only when a stream URL is found.
  ===================================================== */

  const PRIORITY = [
    // Main channels
    ["mosfilm", "мocфильм", "мосфильм"],
    ["россия1", "russia1", "rossiya1"],
    ["россия24", "russia24", "rossiya24"],
    ["первыйканал", "channelone", "1tv"],
    ["нтв", "ntv"],
    ["беларусь24", "belarus24", "belarus24"],
    ["стс", "ctc", "sts"],
    ["звезда", "zvezda"],
    ["победа", "pobeda"],
    ["тнт", "tnt"],
    ["рен тв", "рентв", "rentv"],
    ["пятыйканал", "5канал", "channel5"],
    ["твцентр", "твц", "tvc"],
    ["мир", "mir"],
    ["культура", "russiak", "россияк"],
    ["домашний", "domashniy"],
    ["пятница", "pyatnitsa"],
    ["тв3", "tv3"],
    ["спас", "spas"],
    ["рт", "rt"],
    ["рбк", "rbk"],

    // Russian entertainment and movies
    ["киносвидание", "kinosvidanie"],
    ["киномикс", "kinomix"],
    ["кинопремьера", "kinopremera"],
    ["кинохит", "kinohit"],
    ["мужскоекино", "muzhskoekino"],
    ["русскийбестселлер", "russkiybestseller"],
    ["русскийдетектив", "russkiydetektiv"],
    ["русскийроман", "russkiyroman"],
    ["домкино", "domkino"],
    ["иллюзион", "illusion"],
    ["иллюзион+", "illusionplus"],
    ["сериал", "serial"],
    ["комедия", "komediya"],
    ["родноекино", "rodnoekino"],
    ["премиальноекино", "premiumkino"],

    // News
    ["euronews", "евроньюс"],
    ["rtnews", "rtnews"],
    ["cgtn", "cgtn"],
    ["россия24", "russia24"],
    ["беларусь1", "belarus1"],
    ["беларусь24", "belarus24"],
    ["мир24", "mir24"],
    ["известия", "izvestia"],
    ["life", "лайф"],

    // Kids
    ["карусель", "karusel"],
    ["мульт", "mult"],
    ["детскиймир", "detskiymir"],
    ["мультимузыка", "multimuzika"],
    ["солнце", "solntse"],
    ["disney", "дисней"],
    ["cartoonnetwork"],
    ["nickelodeon"],
    ["nickjr"],
    ["gulli"],

    // Music
    ["музтв", "muztv"],
    ["рутв", "rutv"],
    ["musicbox", "музбокс"],
    ["bridge", "бридж"],
    ["шансон", "shanson"],
    ["songtv"],

    // Sports
    ["матчтв", "matchtv"],
    ["матчигра", "matchigra"],
    ["матчарена", "matcharena"],
    ["матчфутбол", "matchfootball"],
    ["setanta"],
    ["eurosport"],
    ["sport"],
    ["football"],

    // Other well-known channels
    ["сарафан", "sarafan"],
    ["чебурашка", "cheburashka"],
    ["суббота", "subbota"],
    ["ю", "u_tv"],
    ["перец", "perec"],
    ["2x2"],
    ["тнт4", "tnt4"],
    ["супер", "super"],
    ["чепе", "che"],
    ["звездаплюс", "zvezdaplus"],
    ["россияобщественное", "otr"],
    ["общественноетелевидение", "otr"],
    ["союз", "soyuz"],
    ["союзный", "soyuzny"],
    ["беларусь2", "belarus2"],
    ["беларусь3", "belarus3"],
    ["беларусь5", "belarus5"],
    ["онтк", "ont"],
    ["столичное", "stolichnoe"],
    ["азтв", "aztv"],
    ["итв", "itv"],
    ["арб", "arb"],
    ["медиа", "media"],
    ["atv"],
    ["space"],
    ["real"],
    ["xezer", "khazar"],
    ["ictimaitv"],
    ["idman", "idman"],
    ["cbc"],
    ["arb24"],
    ["arbgunesh"],
    ["baku"],
    ["lider"],
    ["kanal"],
    ["trt1"],
    ["trthaber"],
    ["trtworld"],
    ["atvtr"],
    ["showtv"],
    ["kanald"],
    ["startv"],
    ["fox"],
    ["tv8"],
    ["nowtv"],
    ["haber"],
    ["a haber"],
    ["a spor"],
    ["aspor"],
    ["teve2"],
    ["beyaz"],
    ["ntvtr"],
    ["cnn turk"],
    ["haberturk"]
  ];

  /* =====================================================
     HELPERS
  ===================================================== */

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zа-яё0-9]/gi, "");
  }

  function channelKey(channel) {
    return channel.country + "|" + normalize(channel.name);
  }

  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .slice(0, 2)
      .map(word => word[0] || "")
      .join("")
      .toUpperCase();
  }

  function getPriority(channel) {
    const name = normalize(channel.name);

    for (let i = 0; i < PRIORITY.length; i++) {
      const aliases = PRIORITY[i];

      if (aliases.some(alias => name.includes(normalize(alias)))) {
        return i;
      }
    }

    return 9999;
  }

  function mapCategory(value) {
    const text = normalize(value);

    if (/movie|film|cinema|kino|кино|фильм/.test(text)) {
      return "movie";
    }

    if (/news|новост|новин|haber|инфо/.test(text)) {
      return "news";
    }

    if (/sport|спорт|football|футбол|idman/.test(text)) {
      return "sport";
    }

    if (/kid|child|дет|мульт|cartoon/.test(text)) {
      return "kids";
    }

    if (/music|музык|muzik/.test(text)) {
      return "music";
    }

    return "other";
  }

  /* =====================================================
     M3U PARSER
  ===================================================== */

  function parseM3U(text, country) {
    const result = [];
    const lines = text.split(/\r?\n/);

    let currentInfo = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();

      if (!line) continue;

      if (line.startsWith("#EXTINF")) {
        const comma = line.lastIndexOf(",");
        const name = comma >= 0
          ? line.substring(comma + 1).trim()
          : "";

        const logo =
          (line.match(/tvg-logo="([^"]*)"/i) || [])[1] || "";

        const group =
          (line.match(/group-title="([^"]*)"/i) || [])[1] || "";

        const tvgId =
          (line.match(/tvg-id="([^"]*)"/i) || [])[1] || "";

        currentInfo = {
          name: name
            .replace(/\s*\[.*?\]/g, "")
            .replace(/\s*\(.*?\)/g, "")
            .trim(),
          logo,
          group,
          tvgId
        };

        continue;
      }

      if (
        currentInfo &&
        line &&
        !line.startsWith("#") &&
        /^https?:\/\//i.test(line)
      ) {
        result.push({
          name: currentInfo.name,
          logo: currentInfo.logo,
          country,
          category: mapCategory(
            currentInfo.group + " " + currentInfo.name
          ),
          tvgId: currentInfo.tvgId,
          urls: [line],
          pinned: false
        });

        currentInfo = null;
      }
    }

    return result;
  }

  /* =====================================================
     FETCH PLAYLISTS
  ===================================================== */

  async function fetchSource(source) {
    const cacheKey = "tvkino_source_" + source.id;

    try {
      const controller = new AbortController();

      const timeout = setTimeout(() => {
        controller.abort();
      }, 18000);

      let response;

      try {
        response = await fetch(source.url, {
          signal: controller.signal,
          cache: "no-store"
        });
      } finally {
        clearTimeout(timeout);
      }

      if (!response.ok) {
        throw new Error("HTTP " + response.status);
      }

      const text = await response.text();

      if (!text.includes("#EXTM3U")) {
        throw new Error("Invalid M3U playlist");
      }

      store.set(cacheKey, text);

      return parseM3U(text, source.country);

    } catch (error) {
      console.warn(
        "TVKINO source unavailable:",
        source.id,
        error.message
      );

      const cached = store.get(cacheKey, "");

      if (typeof cached === "string" && cached.includes("#EXTM3U")) {
        return parseM3U(cached, source.country);
      }

      return [];
    }
  }

  /* =====================================================
     MERGE DUPLICATE CHANNELS
  ===================================================== */

  function mergeChannels(input) {
    const map = new Map();

    input.forEach(channel => {
      if (!channel.name || !channel.urls || !channel.urls.length) {
        return;
      }

      const key = channelKey(channel);

      if (!map.has(key)) {
        map.set(key, {
          ...channel,
          urls: [...channel.urls]
        });

        return;
      }

      const existing = map.get(key);

      channel.urls.forEach(url => {
        if (!existing.urls.includes(url)) {
          existing.urls.push(url);
        }
      });

      if (!existing.logo && channel.logo) {
        existing.logo = channel.logo;
      }

      if (existing.category === "other" && channel.category !== "other") {
        existing.category = channel.category;
      }
    });

    return [...map.values()];
  }

  /* =====================================================
     SELECT TOP CHANNELS
  ===================================================== */

  function selectTopChannels(input) {
    const sorted = [...input].sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      // Prefer channels with logos.
      if (!!a.logo !== !!b.logo) {
        return a.logo ? -1 : 1;
      }

      // Prefer channels with more than one stream.
      if (a.urls.length !== b.urls.length) {
        return b.urls.length - a.urls.length;
      }

      return a.name.localeCompare(b.name);
    });

    return sorted.slice(0, MAX_CHANNELS);
  }

  /* =====================================================
     PLAYER STATE
  ===================================================== */

  let channels = [];
  let current = null;
  let category = "all";
  let query = "";
  let hls = null;
  let urlIndex = 0;
  let playTimeout = null;
  let generation = 0;

  /* =====================================================
     STATUS
  ===================================================== */

  function setStatus(message, state = "wait", showLoader = false) {
    if (el.status) {
      el.status.classList.toggle("hide", !message);
    }

    if (el.statusText) {
      el.statusText.textContent = message || "";
    }

    if (el.loader) {
      el.loader.classList.toggle("hide", !showLoader);
    }

    if (el.dot) {
      el.dot.className =
        "live-dot" +
        (state === "err" ? " err" :
          state === "wait" ? " wait" : "");
    }

    if (el.pinfo) {
      el.pinfo.textContent =
        state === "ok" ? "Canlı yayım" :
        state === "err" ? "Playback error" :
        state === "wait" ? "Yüklənir..." :
        "Ready to watch";
    }
  }

  /* =====================================================
     DESTROY PLAYER
  ===================================================== */

  function destroyPlayer() {
    clearTimeout(playTimeout);

    if (hls) {
      try {
        hls.destroy();
      } catch {}

      hls = null;
    }

    try {
      el.video.pause();
      el.video.removeAttribute("src");
      el.video.load();
    } catch {}
  }

  /* =====================================================
     URL MANAGEMENT
  ===================================================== */

  function getAttempts(channel) {
    return [...new Set(
      (channel.urls || []).filter(url => {
        if (!/^https?:\/\//i.test(url)) return false;

        // HTTPS pages cannot play insecure HTTP streams.
        if (
          location.protocol === "https:" &&
          url.startsWith("http:")
        ) {
          return false;
        }

        return true;
      })
    )];
  }

  /* =====================================================
     NATIVE HLS
  ===================================================== */

  function supportsNativeHLS() {
    return !!(
      el.video.canPlayType("application/vnd.apple.mpegurl") ||
      el.video.canPlayType("application/x-mpegURL")
    );
  }

  /* =====================================================
     HLS.JS LOADER
  ===================================================== */

  let hlsLoadPromise = null;

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(true);
    }

    if (hlsLoadPromise) {
      return hlsLoadPromise;
    }

    hlsLoadPromise = new Promise(resolve => {
      const script = document.createElement("script");

      script.src =
        "https://cdn.jsdelivr.net/npm/hls.js@latest/dist/hls.min.js";

      script.onload = () => resolve(!!window.Hls);

      script.onerror = () => resolve(false);

      document.head.appendChild(script);
    });

    return hlsLoadPromise;
  }

  /* =====================================================
     PLAYBACK ERROR
  ===================================================== */

  function playbackError(message, expectedGeneration) {
    if (!current) return;

    if (
      expectedGeneration !== undefined &&
      expectedGeneration !== generation
    ) {
      return;
    }

    const list = getAttempts(current);

    if (urlIndex + 1 < list.length) {
      urlIndex++;
      play(current, urlIndex);
      return;
    }

    destroyPlayer();

    setStatus(
      "Kanal açıla bilmədi: " + message,
      "err",
      false
    );

    if (el.retry) {
      el.retry.hidden = false;
    }
  }

  /* =====================================================
     MAIN PLAY FUNCTION
  ===================================================== */

  async function play(channel, index = 0) {
    if (!channel) return;

    const myGeneration = ++generation;

    current = channel;
    urlIndex = index;

    const urls = getAttempts(channel);
    const url = urls[index];

    if (!url) {
      setStatus(
        "Bu kanal üçün uyğun yayım ünvanı yoxdur.",
        "err"
      );
      return;
    }

    destroyPlayer();

    if (el.now) {
      el.now.textContent = channel.name;
    }

    if (el.ph) {
      el.ph.classList.add("hide");
    }

    if (el.retry) {
      el.retry.hidden = true;
    }

    if (el.mos) {
      const isMosfilm = /mosfilm|мосфильм/i.test(channel.name);
      el.mos.hidden = !isMosfilm;
    }

    setStatus("Kanal yüklənir...", "wait", true);

    render();

    playTimeout = setTimeout(() => {
      if (myGeneration === generation) {
        playbackError("Timeout", myGeneration);
      }
    }, 30000);

    const video = el.video;

    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";

    const isHls =
      /\.m3u8($|\?)/i.test(url) ||
      url.toLowerCase().includes(".m3u8");

    // Use HLS.js on browsers that support Media Source Extensions.
    if (isHls && !supportsNativeHLS()) {
      const available = await loadHlsLibrary();

      if (myGeneration !== generation) return;

      if (
        available &&
        window.Hls &&
        window.Hls.isSupported()
      ) {
        try {
          hls = new Hls({
            enableWorker: false,
            lowLatencyMode: false,
            backBufferLength: 30,
            maxBufferLength: 30,
            manifestLoadingTimeOut: 15000,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 2,
            levelLoadingMaxRetry: 2,
            fragLoadingMaxRetry: 3
          });

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (myGeneration !== generation) return;

            video.play().catch(() => {
              setStatus(
                "Yayımı başlatmaq üçün OK düyməsinə basın.",
                "wait"
              );
            });
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (
              myGeneration !== generation ||
              !data.fatal
            ) {
              return;
            }

            playbackError(
              data.details || "HLS error",
              myGeneration
            );
          });

          hls.loadSource(url);
          hls.attachMedia(video);

          return;

        } catch (error) {
          console.error("HLS.js error:", error);
        }
      }
    }

    // Native HLS is preferred on Smart TVs.
    if (supportsNativeHLS() || !isHls) {
      video.src = url;
      video.load();

      video.play().catch(() => {
        setStatus(
          "Yayımı başlatmaq üçün OK düyməsinə basın.",
          "wait"
        );
      });

      return;
    }

    playbackError("HLS dəstəyi mövcud deyil", myGeneration);
  }

  /* =====================================================
     VIDEO EVENTS
  ===================================================== */

  el.video.addEventListener("playing", () => {
    clearTimeout(playTimeout);

    setStatus("", "ok", false);

    if (el.retry) {
      el.retry.hidden = true;
    }

    render();
  });

  el.video.addEventListener("waiting", () => {
    if (current) {
      setStatus("Buffering...", "wait", true);
    }
  });

  el.video.addEventListener("error", () => {
    if (current && !hls) {
      playbackError("Video error", generation);
    }
  });

  el.video.addEventListener("ended", () => {
    if (current) {
      playbackError("Stream ended", generation);
    }
  });

  /* =====================================================
     CHANNEL FILTERING
  ===================================================== */

  function visibleChannels() {
    return channels
      .filter(channel => {
        const categoryMatch =
          category === "all" ||
          channel.category === category;

        const searchMatch =
          !query ||
          channel.name.toLowerCase().includes(query);

        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }

        const favA = favs.has(channelKey(a)) ? 1 : 0;
        const favB = favs.has(channelKey(b)) ? 1 : 0;

        if (favA !== favB) {
          return favB - favA;
        }

        const pA = getPriority(a);
        const pB = getPriority(b);

        if (pA !== pB) {
          return pA - pB;
        }

        return a.name.localeCompare(b.name);
      });
  }

  /* =====================================================
     RENDER CHANNEL LIST
  ===================================================== */

  function render() {
    const list = visibleChannels();

    if (el.count) {
      el.count.textContent = list.length;
    }

    el.list.innerHTML = "";

    if (!list.length) {
      const empty = document.createElement("div");

      empty.className = "list-empty";
      empty.textContent = "Kanal tapılmadı.";

      el.list.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    let previousGroup = "";

    list.forEach(channel => {
      const group = favs.has(channelKey(channel))
        ? "Sevimlilər"
        : COUNTRY[channel.country] || "Digər";

      if (group !== previousGroup) {
        const title = document.createElement("div");

        title.className = "group-title";
        title.textContent = group;

        fragment.appendChild(title);

        previousGroup = group;
      }

      const button = document.createElement("button");

      button.type = "button";

      button.className =
        "channel-item" +
        (current === channel ? " active" : "");

      button._channel = channel;

      const logo = channel.logo
        ? document.createElement("img")
        : document.createElement("div");

      logo.className = "channel-logo";

      if (channel.logo) {
        logo.src = channel.logo;
        logo.alt = channel.name;
        logo.loading = "lazy";

        logo.onerror = () => {
          const fallback = document.createElement("div");

          fallback.className = "channel-logo";
          fallback.textContent = initials(channel.name);

          logo.replaceWith(fallback);
        };
      } else {
        logo.textContent = initials(channel.name);
      }

      const meta = document.createElement("div");
      meta.className = "channel-meta";

      const name = document.createElement("div");
      name.className = "channel-name";
      name.textContent = channel.name;

      const sub = document.createElement("div");
      sub.className = "channel-sub";
      sub.textContent = COUNTRY[channel.country] || "IPTV";

      meta.append(name, sub);

      const favorite = document.createElement("span");

      favorite.className =
        "fav-btn" +
        (favs.has(channelKey(channel)) ? " on" : "");

      favorite.dataset.favorite = "true";

      favorite.textContent =
        favs.has(channelKey(channel)) ? "★" : "☆";

      button.append(logo, meta, favorite);

      fragment.appendChild(button);
    });

    el.list.appendChild(fragment);
  }

  /* =====================================================
     FAVORITES AND CHANNEL SELECTION
  ===================================================== */

  el.list.addEventListener("click", event => {
    const button = event.target.closest(".channel-item");

    if (!button) return;

    const channel = button._channel;

    if (event.target.closest("[data-favorite]")) {
      const key = channelKey(channel);

      if (favs.has(key)) {
        favs.delete(key);
      } else {
        favs.add(key);
      }

      store.set("tvkino_favs", [...favs]);

      render();
      return;
    }

    play(channel);
  });

  /* =====================================================
     SEARCH
  ===================================================== */

  let searchTimeout;

  el.search.addEventListener("input", () => {
    clearTimeout(searchTimeout);

    searchTimeout = setTimeout(() => {
      query = el.search.value.toLowerCase().trim();
      render();
    }, 150);
  });

  /* =====================================================
     CATEGORY FILTER
  ===================================================== */

  const categoryFilter =
    document.querySelector(".category-filter");

  if (categoryFilter) {
    categoryFilter.addEventListener("click", event => {
      const button = event.target.closest(".cat-btn");

      if (!button) return;

      categoryFilter.querySelectorAll(".cat-btn")
        .forEach(item => {
          item.classList.toggle("active", item === button);
        });

      category = button.dataset.category || "all";

      render();
    });
  }

  /* =====================================================
     RETRY BUTTON
  ===================================================== */

  if (el.retry) {
    el.retry.addEventListener("click", () => {
      if (current) {
        play(current, 0);
      }
    });
  }

  /* =====================================================
     SMART TV REMOTE CONTROL
  ===================================================== */

  function focusFirstChannel() {
    const first = el.list.querySelector(".channel-item");

    if (first) {
      first.focus();
    }
  }

  function channelButtons() {
    return [...el.list.querySelectorAll(".channel-item")];
  }

  function navigateChannels(direction) {
    const buttons = channelButtons();

    if (!buttons.length) return;

    const index = buttons.indexOf(document.activeElement);

    if (index === -1) {
      buttons[0].focus();
      return;
    }

    const next = Math.max(
      0,
      Math.min(buttons.length - 1, index + direction)
    );

    buttons[next].focus();
  }

  function handleRemote(event) {
    const key = event.key;
    const code = event.keyCode;

    const active = document.activeElement;

    const up = key === "ArrowUp" || code === 38;
    const down = key === "ArrowDown" || code === 40;
    const left = key === "ArrowLeft" || code === 37;
    const right = key === "ArrowRight" || code === 39;
    const enter = key === "Enter" || code === 13;

    const back =
      key === "Escape" ||
      key === "Backspace" ||
      code === 10009;

    const playPause =
      key === " " ||
      code === 415 ||
      code === 19;

    if (up || down) {
      if (active && active.classList.contains("channel-item")) {
        event.preventDefault();
        navigateChannels(up ? -1 : 1);
      }

      return;
    }

    if (enter) {
      if (active && active.classList.contains("channel-item")) {
        event.preventDefault();
        active.click();
      }

      return;
    }

    if (playPause) {
      event.preventDefault();

      if (el.video.paused) {
        el.video.play().catch(() => {});
      } else {
        el.video.pause();
      }

      return;
    }

    if (back) {
      if (active === el.search) {
        el.search.blur();
      } else if (active !== document.body) {
        active.blur();
      }

      return;
    }

    if (
      right &&
      active === el.search
    ) {
      event.preventDefault();
      focusFirstChannel();
    }

    if (
      left &&
      active &&
      active.classList.contains("channel-item")
    ) {
      event.preventDefault();
      el.search.focus();
    }
  }

  document.addEventListener("keydown", handleRemote);

  /* =====================================================
     SMART TV FOCUS STYLE
  ===================================================== */

  if (IS_TV) {
    const style = document.createElement("style");

    style.textContent = `
      .smart-tv button:focus,
      .smart-tv input:focus {
        outline: 3px solid #e5b94d !important;
        outline-offset: 4px;
      }

      .smart-tv .channel-item {
        min-height: 70px;
        cursor: pointer;
      }

      .smart-tv .channel-name {
        font-size: 18px;
      }

      .smart-tv .channel-logo {
        width: 55px;
        height: 55px;
        object-fit: contain;
      }

      .smart-tv .channel-item.active {
        border: 2px solid #e5b94d;
      }

      .smart-tv video {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    `;

    document.head.appendChild(style);
  }

  /* =====================================================
     INITIALIZE
  ===================================================== */

  async function initialize() {
    if (el.info) {
      el.info.textContent = "IPTV mənbələrinə qoşulur...";
    }

    setStatus("Kanallar yüklənir...", "wait", true);

    const results = await Promise.all(
      SOURCES.map(fetchSource)
    );

    const parsed = results.flat();

    channels = mergeChannels([
      ...MOSFILM,
      ...parsed
    ]);

    channels = selectTopChannels(channels);

    if (el.info) {
      el.info.textContent =
        "Yüklənmiş kanal sayı: " +
        channels.length +
        " / " +
        MAX_CHANNELS;
    }

    render();

    setStatus("", "ok", false);

    if (IS_TV) {
      setTimeout(focusFirstChannel, 1000);
    }

    console.log("TVKINO channels loaded:", channels.length);
    console.log(
      "Priority channels:",
      channels
        .filter(channel => getPriority(channel) < 20)
        .map(channel => channel.name)
    );
  }

  /* =====================================================
     START
  ===================================================== */

  initialize().catch(error => {
    console.error("TVKINO initialization error:", error);

    if (el.info) {
      el.info.textContent =
        "Kanalları yükləmək mümkün olmadı.";
    }

    setStatus("Playlist yüklənmədi.", "err", false);
  });

})();

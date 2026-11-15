(function () {
  "use strict";

  function boot() {

  /* =====================================================
     TVKINO v5 - fon yoxlaması, işləyən kanal filtri,
     ölü link yaddaşı, ES5 (TV-uyğun)
  ===================================================== */

  var PROXY = ""; // öz proksin: "https://adin.workers.dev/?url="  (tövsiyə olunur)
  var PUBLIC_PROXIES = ["https://corsproxy.io/?url=", "https://api.allorigins.win/raw?url="];

  var ISO = "https://iptv-org.github.io/iptv/";
  var ISO_RAW = "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/";

  var SOURCES = [
    { id: "ru",  country: "ru", urls: [ISO + "countries/ru.m3u", ISO_RAW + "ru.m3u"] },
    { id: "by",  country: "by", urls: [ISO + "countries/by.m3u", ISO_RAW + "by.m3u"] },
    { id: "az",  country: "az", urls: [ISO + "countries/az.m3u", ISO_RAW + "az.m3u"] },
    { id: "tr",  country: "tr", urls: [ISO + "countries/tr.m3u", ISO_RAW + "tr.m3u"] },
    { id: "rus", country: "ru", urls: [ISO + "languages/rus.m3u"] },
    { id: "free", country: "auto", urls: ["https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8"] }
  ];

  var COUNTRY = { ru: "Россия", by: "Беларусь", az: "Азербайджан", tr: "Турция" };
  var CATEGORY_RU = { all: "Все", movie: "Кино", news: "Новости", sport: "Спорт", kids: "Детские", music: "Музыка", other: "Другие" };

  var OK_TTL = 12 * 3600 * 1000;      // işləyən nəticə 12 saat
  var DEAD_TTL = 2 * 3600 * 1000;     // ölü nəticə 2 saat
  var URL_DEAD_TTL = 2 * 3600 * 1000; // 404/410 alan link 2 saat
  var ATTEMPT_TIMEOUT = 10000;        // oynatma cəhdi
  var PROBE_TIMEOUT = 7000;           // fon yoxlaması cəhdi

  /* =====================================================
     ƏSAS KANALLAR
  ===================================================== */

  var DEFS = [
    { n: "Мосфильм", c: "ru", k: "movie", a: ["mosfilm", "мосфильм"],
      u: ["https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv",
          "http://31.222.235.15/mosfilm/index.m3u8",
          "http://stream.mcquack.net/369/index.m3u8"] },
    { n: "Первый канал", c: "ru", k: "other", a: ["channelone", "channelonerussia", "pervyikanal", "perviykanal", "1tv", "первыйканал"] },
    { n: "Россия 1", c: "ru", k: "other", a: ["россия1", "russia1", "rossiya1", "rossija1"] },
    { n: "Россия 24", c: "ru", k: "news", a: ["россия24", "russia24", "rossiya24"] },
    { n: "НТВ", c: "ru", k: "other", a: ["нтв", "ntv", "ntvrussia"] },
    { n: "Матч ТВ", c: "ru", k: "sport", a: ["матчтв", "matchtv", "match", "матч"] },
    { n: "СТС", c: "ru", k: "other", a: ["стс", "sts", "ctc"] },
    { n: "ТНТ", c: "ru", k: "other", a: ["тнт", "tnt"] },
    { n: "РЕН ТВ", c: "ru", k: "other", a: ["рентв", "rentv", "ren"] },
    { n: "Пятый канал", c: "ru", k: "other", a: ["пятыйканал", "5канал", "5kanal", "channel5", "pyatyikanal", "5tv"] },
    { n: "ТВ Центр", c: "ru", k: "other", a: ["твцентр", "твц", "tvc", "tvcenter", "tvcentr"] },
    { n: "Звезда", c: "ru", k: "other", a: ["звезда", "zvezda"] },
    { n: "Мир", c: "ru", k: "other", a: ["мир", "mir", "mirtv"] },
    { n: "Культура", c: "ru", k: "other", a: ["культура", "россияк", "russiak", "kultura", "russiakultura"] },
    { n: "Домашний", c: "ru", k: "other", a: ["домашний", "domashniy", "domashnii"] },
    { n: "Пятница", c: "ru", k: "other", a: ["пятница", "pyatnitsa", "friday"] },
    { n: "ТВ-3", c: "ru", k: "other", a: ["тв3", "tv3"] },
    { n: "ОТР", c: "ru", k: "other", a: ["отр", "otr"] },
    { n: "Карусель", c: "ru", k: "kids", a: ["карусель", "karusel", "karusell"] },
    { n: "Мульт", c: "ru", k: "kids", a: ["мульт", "mult"] },
    { n: "Euronews", c: "ru", k: "news", a: ["euronews", "евроньюс", "euronewsrussian", "euronewsrussia"] },
    { n: "РБК", c: "ru", k: "news", a: ["рбк", "rbc", "rbk"] },
    { n: "Муз-ТВ", c: "ru", k: "music", a: ["музтв", "muztv"] },
    { n: "Ру ТВ", c: "ru", k: "music", a: ["рутв", "rutv"] },
    { n: "Music Box", c: "ru", k: "music", a: ["musicbox", "музбокс", "musicboxru"] },
    { n: "Шансон ТВ", c: "ru", k: "music", a: ["шансонтв", "шансон", "shansontv", "shanson"] },
    { n: "Беларусь 1", c: "by", k: "other", a: ["беларусь1", "belarus1"] },
    { n: "Беларусь 24", c: "by", k: "news", a: ["беларусь24", "belarus24"] },
    { n: "ОНТ", c: "by", k: "other", a: ["онт", "ont"] },
    { n: "AzTV", c: "az", k: "other", a: ["aztv", "azerbaijantv", "azerbaycantv", "aztvaz"] },
    { n: "İctimai TV", c: "az", k: "other", a: ["ictimai", "ictimaitv", "ictimaitelevizya"] },
    { n: "Xəzər TV", c: "az", k: "other", a: ["xezer", "xezertv", "khazar", "khazartv"] },
    { n: "CBC", c: "az", k: "other", a: ["cbc", "cbcaz", "cbctv"] },
    { n: "İdman TV", c: "az", k: "sport", a: ["idman", "idmantv", "idmanazerbaycan"] },
    { n: "ARB", c: "az", k: "other", a: ["arb", "arbtv"] },
    { n: "Space TV", c: "az", k: "other", a: ["space", "spacetv"] },
    { n: "Lider TV", c: "az", k: "other", a: ["lider", "lidertv"] },
    { n: "ATV Azerbaycan", c: "az", k: "other", a: ["atvaz", "atvazerbaycan", "atv"] },
    { n: "TRT 1", c: "tr", k: "other", a: ["trt1"], u: ["https://tv-trt1.medya.trt.com.tr/master.m3u8"] },
    { n: "TRT Haber", c: "tr", k: "news", a: ["trthaber"], u: ["https://tv-trthaber.medya.trt.com.tr/master.m3u8"] },
    { n: "TRT World", c: "tr", k: "news", a: ["trtworld"], u: ["https://tv-trtworld.medya.trt.com.tr/master.m3u8"] },
    { n: "TRT Spor", c: "tr", k: "sport", a: ["trtspor", "trtspor1"], u: ["https://tv-trtspor1.medya.trt.com.tr/master.m3u8"] },
    { n: "TRT Çocuk", c: "tr", k: "kids", a: ["trtcocuk"], u: ["https://tv-trtcocuk.medya.trt.com.tr/master.m3u8"] },
    { n: "Show TV", c: "tr", k: "other", a: ["showtv", "show"] },
    { n: "Star TV", c: "tr", k: "other", a: ["startv", "star"] },
    { n: "ATV", c: "tr", k: "other", a: ["atv", "atvtr", "atvturkiye"] },
    { n: "Kanal D", c: "tr", k: "other", a: ["kanald"] },
    { n: "TV8", c: "tr", k: "other", a: ["tv8"] },
    { n: "NOW", c: "tr", k: "other", a: ["now", "nowtv", "fox", "foxtv"] },
    { n: "Habertürk", c: "tr", k: "news", a: ["haberturk", "haberturktv"] },
    { n: "CNN Türk", c: "tr", k: "news", a: ["cnnturk"] },
    { n: "NTV", c: "tr", k: "news", a: ["ntv", "ntvtr"] },
    { n: "A Haber", c: "tr", k: "news", a: ["ahaber"] },
    { n: "A Spor", c: "tr", k: "sport", a: ["aspor"] },
    { n: "TGRT Haber", c: "tr", k: "news", a: ["tgrthaber", "tgrt"] },
    { n: "Beyaz TV", c: "tr", k: "other", a: ["beyaztv", "beyaz"] }
  ];

  /* =====================================================
     ELEMENTLƏR / YARDIMÇILAR
  ===================================================== */

  function $(id) { return document.getElementById(id); }

  var el = {
    list: $("channelList"), count: $("channelCount"), search: $("searchInput"),
    info: $("sourceInfo"), video: $("mainVideo"), now: $("nowPlaying"),
    ph: $("playerPlaceholder"), status: $("playerStatus"), statusText: $("statusText"),
    loader: $("statusLoader"), dot: $("connectionDot"), pinfo: $("playerInfo"),
    retry: $("retryButton"), mos: $("mosfilmLink")
  };

  if (!el.list || !el.video || !el.search) {
    alert("TVKINO: HTML elementləri tapılmadı (channelList / mainVideo / searchInput).");
    return;
  }

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function toggleClass(node, cls, on) {
    if (!node) return;
    if (on) node.classList.add(cls); else node.classList.remove(cls);
  }
  function matches(node, sel) {
    var f = node.matches || node.webkitMatchesSelector || node.msMatchesSelector;
    return f ? f.call(node, sel) : false;
  }
  function closestEl(node, sel) {
    while (node && node.nodeType === 1) {
      if (matches(node, sel)) return node;
      node = node.parentNode;
    }
    return null;
  }
  function nowMs() { return new Date().getTime(); }
  function two(n) { return n < 10 ? "0" + n : "" + n; }
  function shortUrl(u) { return String(u).replace(/^https?:\/\//, "").substring(0, 48); }

  var ua = navigator.userAgent.toLowerCase();
  var IS_TV = /smart-tv|smarttv|tizen|webos|web0s|netcast|hbbtv|googletv|android|bravia|crkey/.test(ua);
  toggleClass(document.body, "smart-tv", IS_TV);
  var cm = /chrome\/(\d+)/.exec(ua);
  var CHROME_VER = cm ? parseInt(cm[1], 10) : 0;

  var store = {
    get: function (key, fb) {
      try { var v = localStorage.getItem(key); return v === null ? fb : JSON.parse(v); }
      catch (e) { return fb; }
    },
    set: function (key, val) {
      try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
    }
  };

  /* =====================================================
     DEBUG PANEL
  ===================================================== */

  var logs = [], panel = null, panelOn = false;

  function log(msg) {
    var d = new Date();
    logs.push(two(d.getHours()) + ":" + two(d.getMinutes()) + ":" + two(d.getSeconds()) + " " + msg);
    if (logs.length > 80) logs.shift();
    try { console.log("TVKINO", msg); } catch (e) {}
    if (panelOn) drawPanel();
  }

  function envInfo() {
    var d = new Date();
    return [
      "UA: " + navigator.userAgent,
      "Chrome: " + (CHROME_VER || "?") + " | native HLS: " + (supportsNativeHLS() ? "BƏLİ" : "xeyr") + " | MSE: " + (supportsMSE() ? "BƏLİ" : "xeyr"),
      "Səhifə: " + location.protocol + " | Tarix: " + d.getFullYear() + "-" + two(d.getMonth() + 1) + "-" + two(d.getDate()) +
        (d.getFullYear() < 2025 ? "  !!! TV TARİXİ SƏHVDİR !!!" : ""),
      "Hls.js: " + (window.Hls ? "yüklənib" : "yoxdur") + " | Yoxlama: " + scan.done + "/" + scan.total + (scan.running ? " (gedir)" : "")
    ].join("\n");
  }

  function ensurePanel() {
    if (panel) return;
    panel = document.createElement("pre");
    panel.style.cssText =
      "position:fixed;left:0;right:0;bottom:0;max-height:48%;overflow:hidden;margin:0;padding:8px 12px;" +
      "background:rgba(0,0,0,.88);color:#9f9;font:14px/1.35 monospace;z-index:99999;white-space:pre-wrap;" +
      "word-break:break-all;display:none;";
    document.body.appendChild(panel);
  }
  function drawPanel() {
    ensurePanel();
    panel.textContent = envInfo() + "\n--------\n" + logs.slice(-14).join("\n");
  }
  function togglePanel(force) {
    ensurePanel();
    panelOn = (force === undefined) ? !panelOn : !!force;
    panel.style.display = panelOn ? "block" : "none";
    if (panelOn) drawPanel();
  }

  function makeTopButton(text, right, handler) {
    var b = document.createElement("button");
    b.type = "button";
    b.textContent = text;
    b.style.cssText =
      "position:fixed;top:6px;right:" + right + "px;z-index:99998;padding:6px 10px;font-size:13px;opacity:.8;" +
      "background:#222;color:#e5b94d;border:1px solid #555;border-radius:6px;";
    b.addEventListener("click", handler);
    document.body.appendChild(b);
    return b;
  }

  window.onerror = function (msg, src, line) {
    log("JS XƏTA: " + msg + " (" + String(src || "").split("/").pop() + ":" + line + ")");
  };

  function translateStaticUI() {
    try {
      document.documentElement.setAttribute("lang", "ru");
      document.title = "ТВКИНО — Прямой эфир";
      each(document.querySelectorAll(".cat-btn"), function (btn) {
        var c = btn.getAttribute("data-category");
        if (c && CATEGORY_RU[c]) btn.textContent = CATEGORY_RU[c];
      });
      el.search.setAttribute("placeholder", "Поиск канала...");
      if (el.retry && !el.retry.children.length) el.retry.textContent = "Повторить";
    } catch (e) {}
  }

  /* =====================================================
     SEVİMLİLƏR / SAĞLAMLIQ YADDAŞI
  ===================================================== */

  var favs = {};
  (store.get("tvkino_favs", []) || []).forEach(function (k) { favs[k] = true; });
  function saveFavs() { store.set("tvkino_favs", Object.keys(favs)); }

  var health = store.get("tvkino_health5", {}) || {};   // kanal -> {st, best, t, n}
  var deadUrls = store.get("tvkino_dead5", {}) || {};   // link -> vaxt

  function setHealth(ch, st, best) {
    ch.st = st;
    ch.best = best || null;
    health[ch.id] = { st: st, best: best || null, t: nowMs(), n: ch.urls.length };
    store.set("tvkino_health5", health);
  }
  function isUrlDead(u) { var t = deadUrls[u]; return !!(t && nowMs() - t < URL_DEAD_TTL); }
  function markUrlDead(u) { deadUrls[u] = nowMs(); store.set("tvkino_dead5", deadUrls); }

  /* =====================================================
     NORMALLAŞDIRMA / KANAL BAZASI
  ===================================================== */

  function normalize(value) {
    var s = String(value || "").toLowerCase()
      .replace(/ə/g, "e").replace(/ı/g, "i").replace(/ё/g, "е");
    try { if (s.normalize) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
    s = s.replace(/[^a-zа-я0-9]/g, "");
    return s.replace(/(fhd|uhd|hd|sd|4k|1080p|720p|480p|360p)$/, "");
  }

  function initials(name) {
    return String(name || "").split(/\s+/).slice(0, 2)
      .map(function (w) { return w.charAt(0) || ""; }).join("").toUpperCase();
  }

  function groupCountry(g) {
    g = String(g || "").toLowerCase();
    if (g.indexOf("russia") !== -1 || g.indexOf("росси") !== -1) return "ru";
    if (g.indexOf("belarus") !== -1 || g.indexOf("беларус") !== -1) return "by";
    if (g.indexOf("azerbaij") !== -1 || g.indexOf("azərbay") !== -1) return "az";
    if (g.indexOf("turk") !== -1 || g.indexOf("türk") !== -1) return "tr";
    return "";
  }

  var channels = DEFS.map(function (d, i) {
    return { id: d.c + ":" + i, name: d.n, country: d.c, category: d.k, logo: "",
             urls: (d.u || []).slice(), order: i, st: "", best: null };
  });

  var aliasIndex = {};
  DEFS.forEach(function (d, i) {
    d.a.concat([d.n]).forEach(function (a) {
      var key = d.c + "|" + normalize(a);
      if (!aliasIndex[key]) aliasIndex[key] = channels[i];
    });
  });

  function applyHealth() {
    channels.forEach(function (ch) {
      var h = health[ch.id];
      if (!h) return;
      var age = nowMs() - h.t;
      if (h.st === "ok" && age < OK_TTL) { ch.st = "ok"; ch.best = h.best; }
      else if (h.st === "dead" && age < DEAD_TTL) { ch.st = "dead"; }
    });
  }

  function addToChannel(ch, url, logo) {
    if (!/^https?:\/\//i.test(url)) return;
    if (ch.urls.indexOf(url) === -1 && ch.urls.length < 10) ch.urls.push(url);
    if (!ch.logo && logo) ch.logo = logo;
  }

  /* =====================================================
     M3U PARSER + XHR
  ===================================================== */

  function parseM3U(text, country) {
    var lines = text.split(/\r?\n/), info = null, added = 0;
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;
      if (line.indexOf("#EXTINF") === 0) {
        var comma = line.lastIndexOf(",");
        info = {
          name: (comma >= 0 ? line.substring(comma + 1) : "").replace(/\s*\[.*?\]/g, "").replace(/\s*\(.*?\)/g, "").trim(),
          logo: (line.match(/tvg-logo="([^"]*)"/i) || [])[1] || "",
          group: (line.match(/group-title="([^"]*)"/i) || [])[1] || ""
        };
        continue;
      }
      if (line.charAt(0) === "#") continue;
      if (info && /^https?:\/\//i.test(line)) {
        var cc = country === "auto" ? groupCountry(info.group) : country;
        if (cc) {
          var ch = aliasIndex[cc + "|" + normalize(info.name)];
          if (ch) { addToChannel(ch, line, info.logo); added++; }
        }
        info = null;
      }
    }
    return added;
  }

  function httpGet(url, timeoutMs, cb) {
    var finished = false;
    function done(err, text) { if (finished) return; finished = true; cb(err, text); }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = timeoutMs;
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) done(null, xhr.responseText);
        else done(new Error("HTTP " + xhr.status));
      };
      xhr.onerror = function () { done(new Error("şəbəkə/CORS/sertifikat")); };
      xhr.ontimeout = function () { done(new Error("vaxt bitdi")); };
      xhr.send();
    } catch (e) { done(e); }
  }

  function fetchSource(source, cb) {
    var cacheKey = "tvkino_src_" + source.id;
    var tries = source.urls.slice();
    (PROXY ? [PROXY].concat(PUBLIC_PROXIES) : PUBLIC_PROXIES).forEach(function (p) {
      tries.push(p + encodeURIComponent(source.urls[0]));
    });
    var idx = 0;

    function useCache() {
      var cached = store.get(cacheKey, "");
      if (typeof cached === "string" && cached.indexOf("#EXTM3U") !== -1) {
        log("Playlist " + source.id + ": keşdən");
        parseM3U(cached, source.country);
        cb(true);
      } else { log("Playlist " + source.id + ": YÜKLƏNMƏDİ"); cb(false); }
    }
    function next() {
      if (idx >= tries.length) { useCache(); return; }
      var url = tries[idx++];
      httpGet(url, 12000, function (err, text) {
        if (err || !text || text.indexOf("#EXTM3U") === -1) { next(); return; }
        if (text.length < 900000) store.set(cacheKey, text);
        var n = parseM3U(text, source.country);
        log("Playlist " + source.id + " OK (+" + n + ") <- " + shortUrl(url));
        cb(true);
      });
    }
    next();
  }

  /* =====================================================
     QABİLİYYƏTLƏR / ATTEMPTS
  ===================================================== */

  function supportsNativeHLS() {
    try {
      return !!(el.video.canPlayType("application/vnd.apple.mpegurl") ||
                el.video.canPlayType("application/x-mpegURL"));
    } catch (e) { return false; }
  }
  function supportsMSE() { return !!(window.MediaSource || window.WebKitMediaSource); }

  // probe=true: yalnız birbaşa cəhdlər + öz proksin (ictimai proksi yoxlamaya daxil deyil)
  function getAttempts(ch, probe) {
    var direct = [], proxied = [], seen = {};
    var httpsPage = location.protocol === "https:";
    var native = supportsNativeHLS(), mse = supportsMSE();

    function add(arr, u, p, mode) {
      var k = mode + "|" + p + "|" + u;
      if (seen[k]) return;
      seen[k] = true;
      arr.push({ u: u, p: p, mode: mode });
    }
    function isHls(u) { return /m3u8/i.test(u); }
    function mixed(u) { return httpsPage && /^http:/i.test(u); }

    var urls = ch.urls.filter(function (u) { return !isUrlDead(u); });
    if (!urls.length) urls = ch.urls.slice();
    urls.sort(function (a, b) {
      return (/^https:/i.test(a) ? 0 : 1) - (/^https:/i.test(b) ? 0 : 1);
    });

    urls.forEach(function (u) {
      var hlsU = isHls(u);
      if (!mixed(u)) {
        if (!hlsU) add(direct, u, "", "native");
        else {
          if (native) add(direct, u, "", "native");
          if (mse) add(direct, u, "", "hlsjs");
          if (!native && !mse) add(direct, u, "", "native");
        }
      }
      if (hlsU && mse) {
        if (PROXY) add(proxied, u, PROXY, "hlsjs");
        if (!probe) PUBLIC_PROXIES.forEach(function (p) { add(proxied, u, p, "hlsjs"); });
      }
    });

    var out = direct.slice(0, 12).concat(proxied.slice(0, 6));

    // əvvəl işləyən üsul ən öndə
    if (ch.best && ch.best.u && ch.urls.indexOf(ch.best.u) !== -1 && !isUrlDead(ch.best.u)) {
      var b = ch.best, key = b.mode + "|" + (b.p || "") + "|" + b.u;
      out = out.filter(function (a) { return (a.mode + "|" + a.p + "|" + a.u) !== key; });
      out.unshift({ u: b.u, p: b.p || "", mode: b.mode });
    }
    return out;
  }

  /* =====================================================
     hls.js YÜKLƏYİCİ + KONFİQ
  ===================================================== */

  var hlsCbs = null, hlsLoading = false;

  function loadScript(src, cb) {
    var s = document.createElement("script"), done = false;
    function fin(ok) { if (done) return; done = true; cb(ok); }
    s.onload = function () { fin(!!window.Hls); };
    s.onerror = function () { fin(false); };
    s.src = src;
    document.head.appendChild(s);
  }

  function loadHlsLibrary(cb) {
    if (window.Hls) { cb(true); return; }
    if (!hlsCbs) hlsCbs = [];
    hlsCbs.push(cb);
    if (hlsLoading) return;
    hlsLoading = true;

    var old = CHROME_VER && CHROME_VER < 66;
    var urls = old
      ? ["https://cdn.jsdelivr.net/npm/hls.js@0.14.17/dist/hls.min.js",
         "https://cdnjs.cloudflare.com/ajax/libs/hls.js/0.14.17/hls.min.js"]
      : ["https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js",
         "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js"];
    var i = 0;

    function finish(ok) {
      hlsLoading = false;
      var cbs = hlsCbs; hlsCbs = null;
      cbs.forEach(function (f) { f(ok); });
    }
    function next() {
      if (i >= urls.length) { log("hls.js YÜKLƏNMƏDİ"); finish(false); return; }
      var u = urls[i++];
      loadScript(u, function (ok) {
        if (ok) { log("hls.js yükləndi"); finish(true); } else next();
      });
    }
    next();
  }

  function hlsConfig(att) {
    var cfg = {
      enableWorker: false, lowLatencyMode: false,
      backBufferLength: 30, maxBufferLength: 30,
      manifestLoadingTimeOut: 8000, levelLoadingTimeOut: 8000, fragLoadingTimeOut: 15000,
      manifestLoadingMaxRetry: 0, levelLoadingMaxRetry: 1, fragLoadingMaxRetry: 2
    };
    if (att.p) {
      var proxy = att.p;
      cfg.xhrSetup = function (xhr, reqUrl) {
        xhr.open("GET", proxy + encodeURIComponent(reqUrl), true);
      };
    }
    return cfg;
  }

  function errCode(data) {
    return data && data.response && typeof data.response.code === "number" ? data.response.code : 0;
  }

  /* =====================================================
     OYNATMA
  ===================================================== */

  var current = null, category = "all", query = "";
  var hls = null, urlIndex = 0, playTimeout = null, generation = 0;
  var currentMode = "", mediaRecovered = false;
  var curAttempts = [];
  var onlyOk = !!store.get("tvkino_onlyok", false);

  function setStatus(message, state, showLoader) {
    state = state || "wait";
    toggleClass(el.status, "hide", !message);
    if (el.statusText) el.statusText.textContent = message || "";
    toggleClass(el.loader, "hide", !showLoader);
    if (el.dot) el.dot.className = "live-dot" + (state === "err" ? " err" : state === "wait" ? " wait" : "");
    if (el.pinfo) {
      el.pinfo.textContent =
        state === "ok" ? "Прямой эфир" :
        state === "err" ? "Ошибка воспроизведения" :
        state === "wait" ? "Загрузка..." : "Готово к просмотру";
    }
  }

  function showRetry(show) { if (el.retry) el.retry.hidden = !show; }

  function destroyPlayer() {
    clearTimeout(playTimeout);
    currentMode = "";
    if (hls) { try { hls.destroy(); } catch (e) {} hls = null; }
    try {
      el.video.pause();
      el.video.removeAttribute("src");
      el.video.load();
    } catch (e) {}
  }

  function tryPlay() {
    var p;
    try { p = el.video.play(); } catch (e) { log("play() xəta: " + e.message); return; }
    if (p && p.catch) {
      p.catch(function (e) {
        log("play() rədd: " + (e && e.name));
        setStatus("Нажмите OK, чтобы запустить трансляцию.", "wait", false);
      });
    }
  }

  // deadUrl=true -> bu linkin qalan rejimlərini atla (404/410)
  function playbackError(message, gen, deadUrl) {
    if (!current) return;
    if (gen !== undefined && gen !== generation) return;

    log("✗ cəhd " + (urlIndex + 1) + ": " + message);

    var next = urlIndex + 1;
    if (deadUrl && curAttempts[urlIndex]) {
      var bad = curAttempts[urlIndex].u;
      markUrlDead(bad);
      while (next < curAttempts.length && curAttempts[next].u === bad) next++;
    }

    if (next < curAttempts.length) { play(current, next); return; }

    destroyPlayer();
    setHealth(current, "dead");
    setStatus("Канал недоступен (ссылка не работает или геоблок). Выберите другой канал.", "err", false);
    showRetry(true);
    updateActive();
    scheduleRender();
    togglePanel(true);
  }

  function play(channel, index) {
    index = index || 0;
    if (!channel) return;

    var myGen = ++generation;
    current = channel;
    if (index === 0) curAttempts = getAttempts(channel, false);
    urlIndex = index;
    mediaRecovered = false;

    var attempt = curAttempts[index];

    destroyPlayer();

    if (el.now) el.now.textContent = channel.name;
    if (el.ph) el.ph.classList.add("hide");
    showRetry(false);
    if (el.mos) el.mos.hidden = !/мосфильм/i.test(channel.name);
    updateActive();

    if (!attempt) {
      setHealth(channel, "dead");
      setStatus("Для этого канала нет доступного адреса.", "err", false);
      showRetry(true);
      scheduleRender();
      return;
    }

    currentMode = attempt.mode;
    log("▶ " + channel.name + " [" + (index + 1) + "/" + curAttempts.length + "] " + attempt.mode +
        (attempt.p ? "+proksi" : "") + " " + shortUrl(attempt.u));
    setStatus("Загрузка: " + channel.name + " (" + (index + 1) + "/" + curAttempts.length + ")", "wait", true);

    playTimeout = setTimeout(function () {
      if (myGen === generation) playbackError("vaxt bitdi", myGen, false);
    }, ATTEMPT_TIMEOUT);

    var video = el.video;
    video.autoplay = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";

    if (attempt.mode === "hlsjs") {
      loadHlsLibrary(function (ok) {
        if (myGen !== generation) return;
        if (!ok || !window.Hls || !window.Hls.isSupported()) {
          playbackError("HLS dəstəklənmir", myGen, false);
          return;
        }
        try {
          hls = new window.Hls(hlsConfig(attempt));

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (myGen !== generation) return;
            tryPlay();
          });
          hls.on(window.Hls.Events.ERROR, function (evt, data) {
            if (myGen !== generation || !data) return;
            var code = errCode(data);
            if (!data.fatal) return;
            log("hls FATAL " + data.type + "/" + data.details + (code ? " [" + code + "]" : ""));
            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
              mediaRecovered = true;
              try { hls.recoverMediaError(); return; } catch (e) {}
            }
            playbackError(data.details + (code ? " " + code : ""), myGen, code === 404 || code === 410);
          });

          hls.loadSource(attempt.u);
          hls.attachMedia(video);
        } catch (err) {
          playbackError("hls istisna", myGen, false);
        }
      });
      return;
    }

    video.src = attempt.u;
    try { video.load(); } catch (e) {}
    tryPlay();
  }

  el.video.addEventListener("playing", function () {
    clearTimeout(playTimeout);
    setStatus("", "ok", false);
    showRetry(false);
    if (current && curAttempts[urlIndex]) {
      var a = curAttempts[urlIndex];
      var b = current.best;
      if (current.st !== "ok" || !b || b.u !== a.u || b.mode !== a.mode || (b.p || "") !== a.p) {
        setHealth(current, "ok", a);
        scheduleRender();
      }
      log("✓ OYNAYIR: " + current.name);
    }
    updateActive();
    if (panelOn) setTimeout(function () { togglePanel(false); }, 3000);
  });

  el.video.addEventListener("waiting", function () {
    if (current) setStatus("Буферизация...", "wait", true);
  });

  el.video.addEventListener("error", function () {
    if (!current || currentMode !== "native") return;
    if (!el.video.getAttribute("src")) return;
    var code = el.video.error ? el.video.error.code : "?";
    playbackError("video xətası kod " + code, generation, false);
  });

  el.video.addEventListener("ended", function () {
    if (current) playbackError("yayım bitdi", generation, false);
  });

  /* =====================================================
     FON YOXLAMASI (kanal canlıdırmı?)
  ===================================================== */

  var scan = { running: false, queue: [], total: 0, done: 0, workers: 0 };

  function makeProbeVideo() {
    var v = document.createElement("video");
    v.muted = true;
    v.setAttribute("muted", "");
    v.setAttribute("playsinline", "");
    v.preload = "auto";
    v.style.cssText = "position:absolute;width:2px;height:2px;opacity:0;pointer-events:none;left:-10px;top:-10px;";
    document.body.appendChild(v);
    return v;
  }

  function probeAttempt(att, pv, cb) {
    var done = false, timer = null, h = null, manifestOk = false;

    function cleanup() {
      if (h) { try { h.destroy(); } catch (e) {} h = null; }
      if (att.mode === "native") {
        pv.onloadedmetadata = null; pv.onerror = null;
        try { pv.pause(); pv.removeAttribute("src"); pv.load(); } catch (e) {}
      }
    }
    function fin(ok, code) {
      if (done) return;
      done = true;
      clearTimeout(timer);
      cleanup();
      cb(ok, code);
    }

    timer = setTimeout(function () {
      // manifest açıldısa, level gec gəlsə də canlı sayırıq
      fin(manifestOk, "timeout");
    }, PROBE_TIMEOUT);

    if (att.mode === "hlsjs") {
      loadHlsLibrary(function (ok) {
        if (done) return;
        if (!ok || !window.Hls || !window.Hls.isSupported()) { fin(false, "nohls"); return; }
        try {
          h = new window.Hls(hlsConfig(att));
          h.on(window.Hls.Events.MANIFEST_PARSED, function () { manifestOk = true; });
          h.on(window.Hls.Events.LEVEL_LOADED, function () { fin(true, 0); });
          h.on(window.Hls.Events.ERROR, function (e, d) {
            if (d && d.fatal) fin(false, errCode(d));
          });
          h.loadSource(att.u);
        } catch (e) { fin(false, "exc"); }
      });
      return;
    }

    pv.onloadedmetadata = function () { fin(true, 0); };
    pv.onerror = function () { if (pv.getAttribute("src")) fin(false, "native"); };
    pv.src = att.u;
    try { pv.load(); } catch (e) {}
  }

  function probeChannel(ch, pv, cb) {
    var atts = getAttempts(ch, true).slice(0, 10);
    var i = 0;
    (function step() {
      if (i >= atts.length) { setHealth(ch, "dead"); cb(); return; }
      var a = atts[i++];
      probeAttempt(a, pv, function (ok, code) {
        if (ok) { setHealth(ch, "ok", a); cb(); return; }
        if (code === 404 || code === 410) {
          markUrlDead(a.u);
          while (i < atts.length && atts[i].u === a.u) i++;
        }
        step();
      });
    })();
  }

  function needsScan(ch) {
    if (!ch.urls.length) return false;
    if (ch.st === "ok") return false;
    var h = health[ch.id];
    if (ch.st === "dead" && h && h.n >= ch.urls.length) return false;
    return true;
  }

  function startScan(force) {
    if (scan.running) return;
    var q = channels.filter(function (ch) {
      if (ch === current && ch.st === "ok") return false;
      return force ? ch.urls.length > 0 : needsScan(ch);
    });
    if (!q.length) { updateInfo(); return; }

    scan.queue = q;
    scan.total = q.length;
    scan.done = 0;
    scan.running = true;
    scan.workers = 0;
    log("Yoxlama başladı: " + q.length + " kanal");

    var n = IS_TV ? 1 : 2;
    for (var i = 0; i < n; i++) scanWorker();
  }

  function scanWorker() {
    scan.workers++;
    var pv = makeProbeVideo();
    (function next() {
      var ch = scan.queue.shift();
      if (!ch) {
        scan.workers--;
        try { pv.parentNode.removeChild(pv); } catch (e) {}
        if (scan.workers === 0) {
          scan.running = false;
          var okc = channels.filter(function (c) { return c.st === "ok"; }).length;
          log("Yoxlama bitdi: işləyən " + okc + "/" + channels.length);
          scheduleRender();
          updateInfo();
        }
        return;
      }
      probeChannel(ch, pv, function () {
        scan.done++;
        scheduleRender();
        updateInfo();
        setTimeout(next, 50);
      });
    })();
  }

  /* =====================================================
     SİYAHI
  ===================================================== */

  function okCount() {
    var n = 0;
    channels.forEach(function (c) { if (c.st === "ok") n++; });
    return n;
  }

  function updateInfo() {
    if (!el.info) return;
    var total = channels.filter(function (c) { return c.urls.length > 0; }).length;
    var txt = "Каналов: " + total + " | Работают: " + okCount();
    if (scan.running) txt += " | Проверка: " + scan.done + "/" + scan.total;
    else if (onlyOk && okCount() === 0) txt += " | Рабочих не найдено — показаны все";
    el.info.textContent = txt;
  }

  function visibleChannels() {
    var useOnly = onlyOk && okCount() > 0;
    return channels.filter(function (ch) {
      if (!ch.urls.length) return false;
      if (useOnly && ch.st !== "ok" && ch !== current) return false;
      var cat = category === "all" || ch.category === category;
      var q = !query || ch.name.toLowerCase().indexOf(query) !== -1;
      return cat && q;
    }).sort(function (a, b) {
      var fa = favs[a.id] ? 0 : 1, fb = favs[b.id] ? 0 : 1;
      if (fa !== fb) return fa - fb;
      var ra = a.st === "ok" ? 0 : a.st === "dead" ? 2 : 1;
      var rb = b.st === "ok" ? 0 : b.st === "dead" ? 2 : 1;
      if (ra !== rb) return ra - rb;
      return a.order - b.order;
    });
  }

  function updateActive() {
    each(el.list.querySelectorAll(".channel-item"), function (b) {
      toggleClass(b, "active", b._channel === current);
    });
  }

  function focusChannel(ch) {
    var btns = el.list.querySelectorAll(".channel-item");
    for (var i = 0; i < btns.length; i++) {
      if (btns[i]._channel === ch) { try { btns[i].focus(); } catch (e) {} return; }
    }
  }

  function render() {
    var list = visibleChannels();
    if (el.count) el.count.textContent = list.length;
    el.list.innerHTML = "";

    if (!list.length) {
      var empty = document.createElement("div");
      empty.className = "list-empty";
      empty.textContent = "Каналы не найдены.";
      el.list.appendChild(empty);
      return;
    }

    var frag = document.createDocumentFragment();
    var prevGroup = "";

    list.forEach(function (ch) {
      var isFav = !!favs[ch.id];
      var group = isFav ? "Избранное" : (COUNTRY[ch.country] || "Другое");

      if (group !== prevGroup) {
        var t = document.createElement("div");
        t.className = "group-title";
        t.textContent = group;
        frag.appendChild(t);
        prevGroup = group;
      }

      var button = document.createElement("button");
      button.type = "button";
      button.className = "channel-item" + (current === ch ? " active" : "");
      button._channel = ch;

      var logo;
      if (ch.logo) {
        logo = document.createElement("img");
        logo.className = "channel-logo";
        logo.src = ch.logo;
        logo.alt = ch.name;
        (function (img, chn) {
          img.onerror = function () {
            var fb = document.createElement("div");
            fb.className = "channel-logo";
            fb.textContent = initials(chn.name);
            if (img.parentNode) img.parentNode.replaceChild(fb, img);
          };
        })(logo, ch);
      } else {
        logo = document.createElement("div");
        logo.className = "channel-logo";
        logo.textContent = initials(ch.name);
      }

      var meta = document.createElement("div");
      meta.className = "channel-meta";
      var name = document.createElement("div");
      name.className = "channel-name";
      name.textContent = ch.name;
      var sub = document.createElement("div");
      sub.className = "channel-sub";
      sub.textContent = (COUNTRY[ch.country] || "IPTV") +
        (ch.st === "ok" ? "  ✓ работает" : ch.st === "dead" ? "  ✗ не отвечает" : "");
      meta.appendChild(name);
      meta.appendChild(sub);

      var fav = document.createElement("span");
      fav.className = "fav-btn" + (isFav ? " on" : "");
      fav.setAttribute("data-favorite", "true");
      fav.textContent = isFav ? "★" : "☆";

      button.appendChild(logo);
      button.appendChild(meta);
      button.appendChild(fav);
      frag.appendChild(button);
    });

    el.list.appendChild(frag);
  }

  // fokusu itirmədən yenidən çək (TV pultu üçün)
  var renderTimer = null;
  function renderKeepFocus() {
    var a = document.activeElement;
    var keep = (a && a._channel) ? a._channel : null;
    var top = el.list.scrollTop;
    render();
    try { el.list.scrollTop = top; } catch (e) {}
    if (keep) focusChannel(keep);
  }
  function scheduleRender() {
    if (renderTimer) return;
    renderTimer = setTimeout(function () {
      renderTimer = null;
      renderKeepFocus();
      updateInfo();
    }, 1200);
  }

  el.list.addEventListener("click", function (event) {
    var button = closestEl(event.target, ".channel-item");
    if (!button) return;
    var ch = button._channel;

    if (closestEl(event.target, "[data-favorite]")) {
      if (favs[ch.id]) delete favs[ch.id]; else favs[ch.id] = true;
      saveFavs();
      render();
      focusChannel(ch);
      return;
    }
    play(ch, 0);
  });

  var searchTimeout;
  el.search.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      query = el.search.value.toLowerCase().trim();
      render();
    }, 150);
  });

  var categoryFilter = document.querySelector(".category-filter");
  if (categoryFilter) {
    categoryFilter.addEventListener("click", function (event) {
      var button = closestEl(event.target, ".cat-btn");
      if (!button) return;
      each(categoryFilter.querySelectorAll(".cat-btn"), function (item) {
        toggleClass(item, "active", item === button);
      });
      category = button.getAttribute("data-category") || "all";
      render();
    });
  }

  if (el.retry) {
    el.retry.addEventListener("click", function () { if (current) play(current, 0); });
  }

  /* ---- "Yalnız işləyən kanallar" qutusu ---- */

  var onlyBox = null;

  function setupOnlyBox() {
    var boxes = document.querySelectorAll("input[type=checkbox]");
    for (var i = 0; i < boxes.length; i++) {
      var b = boxes[i];
      var txt = (b.id || "") + " " + (b.name || "") + " " + (b.parentNode ? b.parentNode.textContent : "");
      if (/işləy|isley|islay|working|only|alive|рабоч/i.test(txt)) { onlyBox = b; break; }
    }
    if (!onlyBox && boxes.length) onlyBox = boxes[0];

    if (!onlyBox) {
      var lab = document.createElement("label");
      lab.style.cssText = "display:block;padding:6px 12px;color:#ccc;font-size:14px;";
      onlyBox = document.createElement("input");
      onlyBox.type = "checkbox";
      lab.appendChild(onlyBox);
      lab.appendChild(document.createTextNode(" Только рабочие каналы"));
      el.list.parentNode.insertBefore(lab, el.list);
    }

    onlyBox.checked = onlyOk;
    onlyBox.addEventListener("change", function () {
      onlyOk = !!onlyBox.checked;
      store.set("tvkino_onlyok", onlyOk);
      render();
      updateInfo();
    });
  }

  /* =====================================================
     PULT
  ===================================================== */

  try {
    if (window.tizen && window.tizen.tvinputdevice) {
      ["MediaPlay", "MediaPause", "MediaPlayPause", "MediaStop", "ChannelUp", "ChannelDown",
       "ColorF0Red", "ColorF2Yellow", "ColorF3Blue", "Info"]
        .forEach(function (k) { try { window.tizen.tvinputdevice.registerKey(k); } catch (e) {} });
    }
  } catch (e) {}

  function focusFirstChannel() {
    var first = el.list.querySelector(".channel-item");
    if (first) first.focus();
  }

  function isFocusable(n) {
    return n && !n.disabled && !n.hidden && n.offsetWidth > 0 && n.offsetHeight > 0;
  }

  function moveFocus(dir) {
    var cur = document.activeElement;
    var all = Array.prototype.filter.call(
      document.querySelectorAll("button, input, a[href], [tabindex='0']"), isFocusable);
    if (!all.length) return false;

    if (!cur || cur === document.body || all.indexOf(cur) === -1) { all[0].focus(); return true; }

    var r = cur.getBoundingClientRect();
    var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var best = null, bestScore = Infinity;

    all.forEach(function (c) {
      if (c === cur) return;
      var rc = c.getBoundingClientRect();
      var x = rc.left + rc.width / 2, y = rc.top + rc.height / 2;
      var p, s;
      if (dir === "left")       { p = cx - x; s = Math.abs(cy - y); }
      else if (dir === "right") { p = x - cx; s = Math.abs(cy - y); }
      else if (dir === "up")    { p = cy - y; s = Math.abs(cx - x); }
      else                      { p = y - cy; s = Math.abs(cx - x); }
      if (p <= 1) return;
      var score = p + s * 3;
      if (score < bestScore) { bestScore = score; best = c; }
    });

    if (best) {
      best.focus();
      try {
        if (best.scrollIntoViewIfNeeded) best.scrollIntoViewIfNeeded(false);
        else best.scrollIntoView(false);
      } catch (e) {}
      return true;
    }
    return false;
  }

  function zap(d) {
    var list = visibleChannels();
    if (!list.length) return;
    var idx = list.indexOf(current);
    var next = list[(idx + d + list.length) % list.length];
    play(next, 0);
    focusChannel(next);
  }

  function toggleFullscreen() {
    var v = el.video;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (isFs) (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      else (v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen).call(v);
    } catch (e) {}
  }

  function togglePause() { if (el.video.paused) tryPlay(); else el.video.pause(); }

  function handleRemote(event) {
    var key = event.key, code = event.keyCode;
    var active = document.activeElement;
    var tag = active ? active.nodeName : "";

    var up = key === "ArrowUp" || code === 38;
    var down = key === "ArrowDown" || code === 40;
    var left = key === "ArrowLeft" || code === 37;
    var right = key === "ArrowRight" || code === 39;
    var enter = key === "Enter" || code === 13;
    var back = key === "Escape" || code === 27 || code === 10009 || code === 461 ||
               (key === "Backspace" && tag !== "INPUT");

    // sarı(405) / mavi(406) / Info(457) / D -> panel ; qırmızı(403) / R -> yenidən yoxla
    if (code === 405 || code === 406 || code === 457 || (code === 68 && tag !== "INPUT")) {
      event.preventDefault(); togglePanel(); return;
    }
    if (code === 403 || (code === 82 && tag !== "INPUT")) {
      event.preventDefault(); startScan(true); return;
    }

    if (code === 415) { event.preventDefault(); tryPlay(); return; }
    if (code === 19 || code === 413) { event.preventDefault(); try { el.video.pause(); } catch (e) {} return; }
    if (code === 10252 || code === 179) { event.preventDefault(); togglePause(); return; }
    if (code === 427) { event.preventDefault(); zap(1); return; }
    if (code === 428) { event.preventDefault(); zap(-1); return; }

    if (key === " " && tag !== "INPUT" && tag !== "BUTTON") {
      event.preventDefault(); togglePause(); return;
    }

    if (back) {
      if (panelOn) { event.preventDefault(); togglePanel(false); return; }
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        event.preventDefault(); toggleFullscreen(); return;
      }
      if (tag === "INPUT" && active.type !== "checkbox") {
        active.blur(); focusFirstChannel(); event.preventDefault();
      }
      return;
    }

    if (enter) {
      if (tag === "BUTTON") { event.preventDefault(); active.click(); }
      else if (tag === "INPUT" && active.type === "checkbox") { event.preventDefault(); active.click(); }
      else if (active === el.video) { event.preventDefault(); toggleFullscreen(); }
      return;
    }

    if (up || down || left || right) {
      if (tag === "INPUT" && active.type !== "checkbox" && (left || right)) {
        try {
          var pos = active.selectionStart, len = active.value.length;
          if (left && pos > 0) return;
          if (right && pos < len) return;
        } catch (e) {}
      }
      var dir = up ? "up" : down ? "down" : left ? "left" : "right";
      if (moveFocus(dir)) event.preventDefault();
    }
  }

  document.addEventListener("keydown", handleRemote);

  if (IS_TV) {
    try { el.video.setAttribute("tabindex", "0"); } catch (e) {}
    var style = document.createElement("style");
    style.textContent =
      ".smart-tv button:focus,.smart-tv input:focus,.smart-tv video:focus{outline:3px solid #e5b94d !important;outline-offset:4px;}" +
      ".smart-tv .channel-item{min-height:70px;cursor:pointer;}" +
      ".smart-tv .channel-name{font-size:18px;}" +
      ".smart-tv .channel-logo{width:55px;height:55px;object-fit:contain;}" +
      ".smart-tv .channel-item.active{border:2px solid #e5b94d;}" +
      ".smart-tv video{width:100%;height:100%;object-fit:contain;}";
    document.head.appendChild(style);
  }

  /* =====================================================
     START
  ===================================================== */

  function initialize() {
    translateStaticUI();
    makeTopButton("Диагностика", 6, function () { togglePanel(); });
    makeTopButton("Проверка", 110, function () { startScan(true); });
    setupOnlyBox();

    log("TVKINO v5 başladı");
    if (new Date().getFullYear() < 2025) {
      log("DİQQƏT: TV tarixi səhvdir! Ayarlarda tarix/saatı avtomatik edin.");
      togglePanel(true);
    }

    applyHealth();
    render();
    updateInfo();
    setStatus("", "ok", false);
    if (IS_TV) setTimeout(focusFirstChannel, 800);

    var pending = SOURCES.length, loaded = 0;

    SOURCES.forEach(function (source) {
      fetchSource(source, function (ok) {
        if (ok) loaded++;
        pending--;
        scheduleRender();
        if (pending === 0) {
          log("Playlistlər: " + loaded + "/" + SOURCES.length);
          if (el.info) el.info.textContent = "Списков загружено: " + loaded + "/" + SOURCES.length;
          setTimeout(function () { startScan(false); }, 800);
        }
      });
    });
  }

  initialize();

  } // end boot

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
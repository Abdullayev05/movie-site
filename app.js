(function () {
  "use strict";

  function boot() {

  /* =====================================================
     TVKINO - SMART TV IPTV PLAYER (ES5, TV-safe)
     Samsung Tizen / LG webOS / Android TV / Browser
  ===================================================== */

  var BASES = [
    "https://iptv-org.github.io/iptv/",
    "https://raw.githubusercontent.com/iptv-org/iptv/master/streams/../"
  ];
  // raw.githubusercontent mirror (playlist fayllari "iptv" repo-da deyil, ona görə ayrıca düzgün yol):
  BASES[1] = "https://raw.githubusercontent.com/iptv-org/iptv/gh-pages/";

  var MAX_CHANNELS = 100;

  // Öz proksin (istəyə bağlı), məs: "https://tvkino.adiniz.workers.dev/?url="
  var PROXY = "";
  var PUBLIC_PROXIES = ["https://corsproxy.io/?url=", "https://api.allorigins.win/raw?url="];

  var SOURCES = [
    { id: "ru",  path: "countries/ru.m3u",  country: "ru" },
    { id: "by",  path: "countries/by.m3u",  country: "by" },
    { id: "az",  path: "countries/az.m3u",  country: "az" },
    { id: "tr",  path: "countries/tr.m3u",  country: "tr" },
    { id: "ua",  path: "countries/ua.m3u",  country: "ua" },
    { id: "rus", path: "languages/rus.m3u", country: "ru" }
  ];

  var COUNTRY = {
    ru: "Россия", by: "Беларусь", az: "Азербайджан", tr: "Турция", ua: "Украина"
  };

  var CATEGORY_RU = {
    all: "Все", movie: "Кино", news: "Новости", sport: "Спорт",
    kids: "Детские", music: "Музыка", other: "Другие"
  };

  var STATIC_RU = {
    "ready to watch": "Готово к просмотру",
    "canlı yayım": "Прямой эфир",
    "canli yayim": "Прямой эфир",
    "yüklənir...": "Загрузка...",
    "xəta": "Ошибка",
    "kanallar": "Каналы",
    "kanal": "Канал",
    "channels": "Каналы",
    "channel": "Канал",
    "live tv": "Прямой эфир",
    "canlı tv": "Прямой эфир",
    "kanal axtar": "Поиск канала",
    "search": "Поиск",
    "search channels": "Поиск каналов",
    "hamısı": "Все",
    "all": "Все",
    "filmlər": "Кино",
    "movies": "Кино",
    "xəbərlər": "Новости",
    "news": "Новости",
    "idman": "Спорт",
    "sport": "Спорт",
    "sports": "Спорт",
    "uşaq": "Детские",
    "kids": "Детские",
    "musiqi": "Музыка",
    "music": "Музыка",
    "digər": "Другие",
    "other": "Другие",
    "yenidən cəhd et": "Повторить",
    "retry": "Повторить",
    "try again": "Повторить",
    "kanal seçin": "Выберите канал",
    "select a channel": "Выберите канал",
    "choose a channel": "Выберите канал",
    "sevimlilər": "Избранное",
    "favorites": "Избранное",
    "mosfilm": "Мосфильм",
    "loading": "Загрузка",
    "loading...": "Загрузка...",
    "now playing": "Сейчас в эфире",
    "playback error": "Ошибка воспроизведения"
  };

  function $(id) { return document.getElementById(id); }

  var el = {
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

  /* ---------- small helpers (old-browser safe) ---------- */

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

  /* =====================================================
     RUSSIAN UI
  ===================================================== */

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

      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);

      nodes.forEach(function (node) {
        var parent = node.parentNode;
        if (!parent) return;
        var tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE") return;
        var raw = node.nodeValue || "";
        var key = raw.trim().toLowerCase();
        if (key && STATIC_RU[key]) node.nodeValue = raw.replace(raw.trim(), STATIC_RU[key]);
      });

      each(document.querySelectorAll("[placeholder],[title],[aria-label]"), function (node) {
        ["placeholder", "title", "aria-label"].forEach(function (attr) {
          var v = node.getAttribute(attr);
          if (!v) return;
          var t = STATIC_RU[v.trim().toLowerCase()];
          if (t) node.setAttribute(attr, t);
        });
      });
    } catch (e) {}
  }

  /* =====================================================
     CHANNEL NAMES -> RUSSIAN
  ===================================================== */

  var NAME_RU = {
    "mosfilm": "Мосфильм", "euronews": "Евроньюс", "cnn": "Си-эн-эн",
    "cnn turk": "Си-эн-эн Тюрк", "cnn international": "Си-эн-эн Интернешнл",
    "bbc": "Би-би-си", "bbc news": "Би-би-си Ньюс", "bbc world news": "Би-би-си Ворлд Ньюс",
    "trt 1": "ТРТ 1", "trt1": "ТРТ 1", "trt haber": "ТРТ Хабер", "trt world": "ТРТ Ворлд",
    "trt spor": "ТРТ Спор", "trt cocuk": "ТРТ Чоджук", "atv": "АТВ", "atv avrupa": "АТВ Авруп��",
    "show tv": "Шоу ТВ", "star tv": "Стар ТВ", "kanal d": "Канал Д", "fox": "Фокс",
    "fox tv": "Фокс ТВ", "now tv": "Нау ТВ", "tv8": "ТВ8", "tv 8": "ТВ8",
    "a haber": "А Хабер", "a spor": "А Спор", "a para": "А Пара",
    "haberturk": "Хабертюрк", "haber turk": "Хабертюрк", "ntv": "НТВ", "teve2": "Теве2",
    "beyaz tv": "Бейаз ТВ", "ht spor": "ХТ Спор", "htspor tv": "ХТ Спор ТВ",
    "bein sports": "Бин Спортс", "idman tv": "Идман ТВ", "idman": "Идман ТВ",
    "cbc sport": "Си-би-си Спорт", "cbc": "Си-би-си", "space tv": "Спейс ТВ",
    "azad azerbaycan": "Азад Азербайджан", "azad azərbaycan": "Азад Азербайджан",
    "azad azerbaijan": "Азад Азербайджан", "azerbaijan tv": "Азербайджан ТВ",
    "aztv": "АзТВ", "az tv": "АзТВ", "xezer tv": "Хазар ТВ", "xəzər tv": "Хазар ТВ",
    "ictimai tv": "Общественное ТВ Азербайджана", "ictimai": "Ичтимаи ТВ",
    "arb": "АРБ", "arb 24": "АРБ 24", "lider tv": "Лидер ТВ", "baku tv": "Баку ТВ",
    "medeniyyet tv": "Медениййят ТВ", "mədəniyyət tv": "Медениййят ТВ",
    "disney channel": "Дисней Ченнел", "cartoon network": "Картун Нетворк",
    "nickelodeon": "Никелодеон", "nick jr": "Ник Джуниор",
    "eurosport": "Евроспорт", "eurosport 1": "Евроспорт 1", "eurosport 2": "Евроспорт 2",
    "setanta sports": "Сетанта Спортс", "rt": "РТ", "rt news": "РТ Ньюс", "rtvi": "РТВИ",
    "cgtn": "СиДжиТиЭн", "france 24": "Франс 24", "dw": "Дойче Велле", "dw tv": "Дойче Велле",
    "sky news": "Скай Ньюс", "al jazeera": "Аль-Джазира",
    "music box": "Мьюзик Бокс", "musicbox": "Мьюзик Бокс", "bridge tv": "Бридж ТВ",
    "ru tv": "Ру ТВ", "muz tv": "Муз ТВ", "tnt": "ТНТ", "sts": "СТС", "ctc": "СТС",
    "ren tv": "РЕН ТВ", "tvc": "ТВЦ", "tv3": "ТВ-3", "tv-3": "ТВ-3", "hbo": "Эйч-би-оу",
    "1tv": "Первый канал", "channel one": "Первый канал", "channel one russia": "Первый канал",
    "russia 1": "Россия 1", "russia 24": "Россия 24", "russia k": "Россия К",
    "belarus 1": "Беларусь 1", "belarus 24": "Беларусь 24", "belarus 2": "Беларусь 2",
    "belarus 3": "Беларусь 3", "belarus 5": "Беларусь 5", "ont": "ОНТ", "stv": "СТВ",
    "inter": "Интер", "1+1": "1+1", "ictv": "ICTV", "stb": "СТБ", "novyi kanal": "Новый канал",
    "5 kanal": "5 канал", "5 channel": "5 канал", "mir": "Мир", "mir 24": "Мир 24",
    "zvezda": "Звезда", "pobeda": "Победа", "karusel": "Карусель", "pyatnitsa": "Пятница",
    "domashniy": "Домашний", "spas": "Спас", "otr": "ОТР", "match tv": "Матч ТВ"
  };

  var TR_MULTI = [
    ["shch", "щ"], ["sch", "щ"], ["sh", "ш"], ["ch", "ч"], ["zh", "ж"],
    ["kh", "х"], ["ts", "ц"], ["yu", "ю"], ["ya", "я"], ["yo", "ё"],
    ["ph", "ф"], ["th", "т"], ["ck", "к"], ["oo", "у"], ["ee", "и"], ["ou", "у"]
  ];

  var TR_SINGLE = {
    a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и",
    j: "дж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "к", r: "р",
    s: "с", t: "т", u: "у", v: "в", w: "в", x: "кс", y: "й", z: "з",
    "ç": "ч", "ş": "ш", "ğ": "г", "ı": "ы", "ö": "о", "ü": "ю", "ə": "э",
    "é": "е", "è": "е", "à": "а", "â": "а", "î": "и", "ô": "о", "û": "у",
    "ñ": "нь", "ä": "э", "ß": "сс"
  };

  function translitWord(word) {
    var src = word.toLowerCase().replace(/i\u0307/g, "i");
    var out = "";
    var i = 0;

    while (i < src.length) {
      var matched = false;
      for (var m = 0; m < TR_MULTI.length; m++) {
        var pair = TR_MULTI[m];
        if (src.substr(i, pair[0].length) === pair[0]) {
          out += pair[1];
          i += pair[0].length;
          matched = true;
          break;
        }
      }
      if (matched) continue;

      var ch = src.charAt(i);
      out += TR_SINGLE[ch] !== undefined ? TR_SINGLE[ch] : ch;
      i++;
    }

    var letters = word.replace(/[^A-Za-zÇŞĞİÖÜƏçşğıöüə]/g, "");
    var allUpper = letters.length >= 2 && letters === letters.toUpperCase();
    if (allUpper) return out.toUpperCase();

    var first = word.charAt(0);
    if (first && first !== first.toLowerCase()) {
      return out.charAt(0).toUpperCase() + out.slice(1);
    }
    return out;
  }

  function toRussianName(name) {
    var base = String(name || "").trim();
    if (!base) return base;

    var key = base.toLowerCase().replace(/\s+/g, " ");
    var stripped = key.replace(/\b(hd|sd|fhd|uhd)\b/g, "").replace(/\s+/g, " ").trim();

    if (NAME_RU[key]) return NAME_RU[key];
    if (NAME_RU[stripped]) return NAME_RU[stripped] + (/\bhd\b/i.test(key) ? " HD" : "");

    if (/[\u0400-\u04FF]/.test(base)) return base;

    return base.split(/(\s+)/).map(function (part) {
      if (!part.trim()) return part;
      if (/^(hd|sd|fhd|uhd)$/i.test(part)) return part.toUpperCase();
      if (!/[A-Za-zÇŞĞİÖÜƏçşğıöüəéèàâîôûñäß]/.test(part)) return part;
      return part.replace(/[A-Za-zÇŞĞİÖÜƏçşğıöüəéèàâîôûñäß]+/g, function (w) {
        return translitWord(w);
      });
    }).join("");
  }

  function displayName(channel) {
    if (!channel._ru) channel._ru = toRussianName(channel.name);
    return channel._ru;
  }

  /* =====================================================
     DEVICE DETECTION
  ===================================================== */

  var ua = navigator.userAgent.toLowerCase();

  var DEVICE = {
    samsung: /samsung|smart-tv|tizen/.test(ua),
    lg: /web0s|webos|netcast/.test(ua),
    android: /android/.test(ua),
    tv: /smart-tv|smarttv|tizen|webos|web0s|netcast|hbbtv|googletv|android|bravia|crkey/.test(ua)
  };

  var IS_TV = DEVICE.tv;
  toggleClass(document.body, "smart-tv", IS_TV);

  var chromeMatch = /chrome\/(\d+)/.exec(ua);
  var CHROME_VER = chromeMatch ? parseInt(chromeMatch[1], 10) : 0;

  /* =====================================================
     STORAGE
  ===================================================== */

  var store = {
    get: function (key, fallback) {
      try {
        var value = localStorage.getItem(key);
        return value === null ? fallback : JSON.parse(value);
      } catch (e) { return fallback; }
    },
    set: function (key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }
  };

  var favs = {};
  (store.get("tvkino_favs", []) || []).forEach(function (k) { favs[k] = true; });

  function saveFavs() { store.set("tvkino_favs", Object.keys(favs)); }

  /* =====================================================
     MOSFILM
     (Loqoları qaytarmaq istəyirsənsə, köhnə koddakı iki uzun
      base64 sətrini LOGO_GOLD və LOGO_MOS dəyişənlərinə yaz.)
  ===================================================== */

  var LOGO_GOLD = "";
  var LOGO_MOS = "";

  var MOSFILM = [
    {
      name: "Мосфильм", country: "ru", category: "movie", logo: LOGO_MOS, pinned: true,
      urls: ["https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv"]
    },
    {
      name: "Мосфильм. Золотая коллекция", country: "ru", category: "movie", logo: LOGO_GOLD, pinned: true,
      urls: ["http://31.222.235.15/mosfilm/index.m3u8"]
    },
    {
      name: "Мосфильм Интернешнл", country: "ru", category: "movie", logo: "", pinned: true,
      urls: ["http://stream.mcquack.net/369/index.m3u8"]
    }
  ];

  /* =====================================================
     PRIORITY CHANNELS
  ===================================================== */

  var PRIORITY = [
    ["mosfilm", "мocфильм", "мосфильм"],
    ["россия1", "russia1", "rossiya1"],
    ["россия24", "russia24", "rossiya24"],
    ["первыйканал", "channelone", "1tv"],
    ["нтв", "ntv"],
    ["беларусь24", "belarus24"],
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
    ["euronews", "евроньюс"],
    ["rtnews", "rtnews"],
    ["cgtn", "cgtn"],
    ["беларусь1", "belarus1"],
    ["мир24", "mir24"],
    ["известия", "izvestia"],
    ["life", "лайф"],
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
    ["музтв", "muztv"],
    ["рутв", "rutv"],
    ["musicbox", "музбокс"],
    ["bridge", "бридж"],
    ["шансон", "shanson"],
    ["songtv"],
    ["матчтв", "matchtv"],
    ["матчигра", "matchigra"],
    ["матчарена", "matcharena"],
    ["матчфутбол", "matchfootball"],
    ["setanta"],
    ["eurosport"],
    ["sport"],
    ["football"],
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
    var s = String(value || "").toLowerCase();
    try { if (s.normalize) s = s.normalize("NFD").replace(/[\u0300-\u036f]/g, ""); } catch (e) {}
    return s.replace(/[^a-zа-яё0-9]/gi, "");
  }

  function channelKey(channel) {
    return channel.country + "|" + normalize(channel.name);
  }

  function initials(name) {
    return String(name || "")
      .split(/\s+/)
      .slice(0, 2)
      .map(function (w) { return w.charAt(0) || ""; })
      .join("")
      .toUpperCase();
  }

  var PRIORITY_NORM = PRIORITY.map(function (aliases) {
    return aliases.map(normalize);
  });

  function getPriority(channel) {
    if (channel._prio !== undefined) return channel._prio;
    var name = normalize(channel.name);
    var result = 9999;
    for (var i = 0; i < PRIORITY_NORM.length && result === 9999; i++) {
      var aliases = PRIORITY_NORM[i];
      for (var j = 0; j < aliases.length; j++) {
        if (aliases[j] && name.indexOf(aliases[j]) !== -1) { result = i; break; }
      }
    }
    channel._prio = result;
    return result;
  }

  function mapCategory(value) {
    var text = normalize(value);
    if (/movie|film|cinema|kino|кино|фильм/.test(text)) return "movie";
    if (/news|новост|новин|haber|инфо/.test(text)) return "news";
    if (/sport|спорт|football|футбол|idman/.test(text)) return "sport";
    if (/kid|child|дет|мульт|cartoon/.test(text)) return "kids";
    if (/music|музык|muzik/.test(text)) return "music";
    return "other";
  }

  /* =====================================================
     M3U PARSER
  ===================================================== */

  function parseM3U(text, country) {
    var result = [];
    var lines = text.split(/\r?\n/);
    var currentInfo = null;

    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line) continue;

      if (line.indexOf("#EXTINF") === 0) {
        var comma = line.lastIndexOf(",");
        var name = comma >= 0 ? line.substring(comma + 1).trim() : "";
        var logo = (line.match(/tvg-logo="([^"]*)"/i) || [])[1] || "";
        var group = (line.match(/group-title="([^"]*)"/i) || [])[1] || "";
        var tvgId = (line.match(/tvg-id="([^"]*)"/i) || [])[1] || "";

        currentInfo = {
          name: name.replace(/\s*\[.*?\]/g, "").replace(/\s*\(.*?\)/g, "").trim(),
          logo: logo, group: group, tvgId: tvgId
        };
        continue;
      }

      if (currentInfo && line.charAt(0) !== "#" && /^https?:\/\//i.test(line)) {
        result.push({
          name: currentInfo.name,
          logo: currentInfo.logo,
          country: country,
          category: mapCategory(currentInfo.group + " " + currentInfo.name),
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
     FETCH PLAYLISTS (XMLHttpRequest, no AbortController)
  ===================================================== */

  function httpGet(url, timeoutMs, cb) {
    var finished = false;
    function done(err, text) {
      if (finished) return;
      finished = true;
      cb(err, text);
    }
    try {
      var xhr = new XMLHttpRequest();
      xhr.open("GET", url, true);
      xhr.timeout = timeoutMs;
      xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300) done(null, xhr.responseText);
        else done(new Error("HTTP " + xhr.status));
      };
      xhr.onerror = function () { done(new Error("network error")); };
      xhr.ontimeout = function () { done(new Error("timeout")); };
      xhr.send();
    } catch (e) {
      done(e);
    }
  }

  function fetchSource(source, cb) {
    var cacheKey = "tvkino_source_" + source.id;
    var idx = 0;

    function useCache() {
      var cached = store.get(cacheKey, "");
      if (typeof cached === "string" && cached.indexOf("#EXTM3U") !== -1) {
        cb(parseM3U(cached, source.country));
      } else {
        cb([]);
      }
    }

    function tryNext() {
      if (idx >= BASES.length) { useCache(); return; }
      var url = BASES[idx++] + source.path;

      httpGet(url, 18000, function (err, text) {
        if (err || !text || text.indexOf("#EXTM3U") === -1) {
          console.warn("TVKINO source unavailable:", source.id, err ? err.message : "invalid");
          tryNext();
          return;
        }
        store.set(cacheKey, text);
        cb(parseM3U(text, source.country));
      });
    }

    tryNext();
  }

  /* =====================================================
     MERGE / SELECT
  ===================================================== */

  function mergeChannels(input) {
    var map = {};
    var order = [];

    input.forEach(function (channel) {
      if (!channel.name || !channel.urls || !channel.urls.length) return;

      var key = channelKey(channel);

      if (!map[key]) {
        var copy = {};
        for (var p in channel) if (Object.prototype.hasOwnProperty.call(channel, p)) copy[p] = channel[p];
        copy.urls = channel.urls.slice();
        map[key] = copy;
        order.push(key);
        return;
      }

      var existing = map[key];
      channel.urls.forEach(function (url) {
        if (existing.urls.indexOf(url) === -1) existing.urls.push(url);
      });
      if (!existing.logo && channel.logo) existing.logo = channel.logo;
      if (existing.category === "other" && channel.category !== "other") {
        existing.category = channel.category;
      }
    });

    return order.map(function (k) { return map[k]; });
  }

  function selectTopChannels(input) {
    var sorted = input.slice().sort(function (a, b) {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

      var pa = getPriority(a), pb = getPriority(b);
      if (pa !== pb) return pa - pb;

      if (!!a.logo !== !!b.logo) return a.logo ? -1 : 1;
      if (a.urls.length !== b.urls.length) return b.urls.length - a.urls.length;
      return a.name.localeCompare(b.name);
    });
    return sorted.slice(0, MAX_CHANNELS);
  }

  /* =====================================================
     PLAYER STATE
  ===================================================== */

  var channels = [];
  var current = null;
  var category = "all";
  var query = "";
  var hls = null;
  var urlIndex = 0;
  var playTimeout = null;
  var generation = 0;
  var currentMode = "";
  var mediaRecovered = false;

  /* =====================================================
     STATUS
  ===================================================== */

  function setStatus(message, state, showLoader) {
    state = state || "wait";

    toggleClass(el.status, "hide", !message);
    if (el.statusText) el.statusText.textContent = message || "";
    toggleClass(el.loader, "hide", !showLoader);

    if (el.dot) {
      el.dot.className = "live-dot" + (state === "err" ? " err" : state === "wait" ? " wait" : "");
    }

    if (el.pinfo) {
      el.pinfo.textContent =
        state === "ok" ? "Прямой эфир" :
        state === "err" ? "Ошибка воспроизведения" :
        state === "wait" ? "Загрузка..." : "Готово к просмотру";
    }
  }

  /* =====================================================
     DESTROY PLAYER
  ===================================================== */

  function destroyPlayer() {
    clearTimeout(playTimeout);
    currentMode = "";

    if (hls) {
      try { hls.destroy(); } catch (e) {}
      hls = null;
    }

    try {
      el.video.pause();
      el.video.removeAttribute("src");
      el.video.load();
    } catch (e) {}
  }

  /* =====================================================
     CAPABILITIES
  ===================================================== */

  function supportsNativeHLS() {
    try {
      return !!(
        el.video.canPlayType("application/vnd.apple.mpegurl") ||
        el.video.canPlayType("application/x-mpegURL")
      );
    } catch (e) { return false; }
  }

  function supportsMSE() {
    return !!(window.MediaSource || window.WebKitMediaSource);
  }

  /* =====================================================
     ATTEMPTS: native first (TV), then hls.js, then proxies
  ===================================================== */

  function getAttempts(channel) {
    var out = [];
    var seen = {};
    var httpsPage = location.protocol === "https:";
    var native = supportsNativeHLS();
    var mse = supportsMSE();

    function add(u, p, mode) {
      var k = mode + "|" + (p || "") + "|" + u;
      if (seen[k]) return;
      seen[k] = true;
      out.push({ u: u, p: p || "", mode: mode });
    }

    (channel.urls || []).forEach(function (u) {
      if (!/^https?:\/\//i.test(u)) return;

      var isHls = u.toLowerCase().indexOf("m3u8") !== -1;
      var blocked = httpsPage && /^http:/i.test(u);

      if (!blocked) {
        if (isHls) {
          if (native) add(u, "", "native");
          if (mse) add(u, "", "hlsjs");
          if (!native && !mse) add(u, "", "native");
        } else {
          add(u, "", "native");
        }
      }

      if (isHls && mse) {
        if (PROXY) add(u, PROXY, "hlsjs");
        if (channel.pinned || blocked) {
          PUBLIC_PROXIES.forEach(function (p) { add(u, p, "hlsjs"); });
        }
      }
    });

    return out;
  }

  /* =====================================================
     HLS.JS LOADER (old TV -> 0.14.17, new -> 1.5.17)
  ===================================================== */

  var hlsLoadCallbacks = null;
  var hlsLoading = false;

  function loadScript(src, cb) {
    var s = document.createElement("script");
    var finished = false;
    function done(ok) { if (finished) return; finished = true; cb(ok); }
    s.onload = function () { done(!!window.Hls); };
    s.onerror = function () { done(false); };
    s.src = src;
    document.head.appendChild(s);
  }

  function loadHlsLibrary(cb) {
    if (window.Hls) { cb(true); return; }

    if (!hlsLoadCallbacks) hlsLoadCallbacks = [];
    hlsLoadCallbacks.push(cb);
    if (hlsLoading) return;
    hlsLoading = true;

    var old = CHROME_VER && CHROME_VER < 66;
    var urls = old
      ? ["https://cdn.jsdelivr.net/npm/hls.js@0.14.17/dist/hls.min.js",
         "https://cdnjs.cloudflare.com/ajax/libs/hls.js/0.14.17/hls.min.js"]
      : ["https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js",
         "https://cdnjs.cloudflare.com/ajax/libs/hls.js/1.5.17/hls.min.js"];

    var i = 0;
    function next() {
      if (i >= urls.length) {
        hlsLoading = false;
        var cbs = hlsLoadCallbacks; hlsLoadCallbacks = null;
        cbs.forEach(function (f) { f(false); });
        return;
      }
      loadScript(urls[i++], function (ok) {
        if (ok) {
          hlsLoading = false;
          var cbs2 = hlsLoadCallbacks; hlsLoadCallbacks = null;
          cbs2.forEach(function (f) { f(true); });
        } else {
          next();
        }
      });
    }
    next();
  }

  /* =====================================================
     PLAYBACK ERROR
  ===================================================== */

  function showRetry(show) {
    if (el.retry) el.retry.hidden = !show;
  }

  function playbackError(message, expectedGeneration) {
    if (!current) return;
    if (expectedGeneration !== undefined && expectedGeneration !== generation) return;

    var list = getAttempts(current);

    if (urlIndex + 1 < list.length) {
      play(current, urlIndex + 1);
      return;
    }

    destroyPlayer();
    setStatus("Не удалось открыть канал: " + message, "err", false);
    showRetry(true);
  }

  function tryPlay() {
    var p;
    try { p = el.video.play(); } catch (e) { return; }
    if (p && p.catch) {
      p.catch(function () {
        setStatus("Нажмите OK, чтобы запустить трансляцию.", "wait", false);
      });
    }
  }

  /* =====================================================
     MAIN PLAY FUNCTION
  ===================================================== */

  function play(channel, index) {
    index = index || 0;
    if (!channel) return;

    var myGen = ++generation;
    current = channel;
    urlIndex = index;
    mediaRecovered = false;

    var attempts = getAttempts(channel);
    var attempt = attempts[index];

    if (!attempt) {
      setStatus("Для этого канала нет подходящего адреса трансляции.", "err", false);
      showRetry(true);
      return;
    }

    var url = attempt.u;
    var proxy = attempt.p;

    destroyPlayer();
    currentMode = attempt.mode;

    if (el.now) el.now.textContent = displayName(channel);
    if (el.ph) el.ph.classList.add("hide");
    showRetry(false);

    if (el.mos) {
      el.mos.hidden = !/mosfilm|мосфильм/i.test(channel.name);
    }

    setStatus("Загрузка канала... (" + (index + 1) + "/" + attempts.length + ")", "wait", true);
    updateActive();

    playTimeout = setTimeout(function () {
      if (myGen === generation) playbackError("превышено время ожидания", myGen);
    }, 18000);

    var video = el.video;
    video.autoplay = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";

    if (attempt.mode === "hlsjs") {
      loadHlsLibrary(function (ok) {
        if (myGen !== generation) return;

        if (!ok || !window.Hls || !window.Hls.isSupported()) {
          playbackError("HLS не поддерживается", myGen);
          return;
        }

        try {
          var cfg = {
            enableWorker: false,
            lowLatencyMode: false,
            backBufferLength: 30,
            maxBufferLength: 30,
            manifestLoadingTimeOut: 15000,
            levelLoadingTimeOut: 15000,
            fragLoadingTimeOut: 20000,
            manifestLoadingMaxRetry: 1,
            levelLoadingMaxRetry: 2,
            fragLoadingMaxRetry: 3
          };

          if (proxy) {
            cfg.xhrSetup = function (xhr, reqUrl) {
              xhr.open("GET", proxy + encodeURIComponent(reqUrl), true);
            };
          }

          hls = new window.Hls(cfg);

          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (myGen !== generation) return;
            tryPlay();
          });

          hls.on(window.Hls.Events.ERROR, function (evt, data) {
            if (myGen !== generation || !data || !data.fatal) return;

            if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR && !mediaRecovered) {
              mediaRecovered = true;
              try { hls.recoverMediaError(); return; } catch (e) {}
            }
            playbackError("ошибка HLS", myGen);
          });

          hls.loadSource(url);
          hls.attachMedia(video);
        } catch (error) {
          console.error("HLS.js error:", error);
          playbackError("ошибка HLS", myGen);
        }
      });
      return;
    }

    // Native playback (Smart TV HLS or plain video file)
    video.src = url;
    try { video.load(); } catch (e) {}
    tryPlay();
  }

  /* =====================================================
     VIDEO EVENTS
  ===================================================== */

  el.video.addEventListener("playing", function () {
    clearTimeout(playTimeout);
    setStatus("", "ok", false);
    showRetry(false);
    updateActive();
  });

  el.video.addEventListener("waiting", function () {
    if (current) setStatus("Буферизация...", "wait", true);
  });

  el.video.addEventListener("error", function () {
    // Ignore bogus errors caused by removeAttribute("src") + load()
    if (!current || currentMode !== "native") return;
    if (!el.video.getAttribute("src")) return;
    playbackError("ошибка видео", generation);
  });

  el.video.addEventListener("ended", function () {
    if (current) playbackError("трансляция завершена", generation);
  });

  /* =====================================================
     FILTERING
  ===================================================== */

  function visibleChannels() {
    return channels
      .filter(function (channel) {
        var categoryMatch = category === "all" || channel.category === category;
        var searchMatch =
          !query ||
          channel.name.toLowerCase().indexOf(query) !== -1 ||
          displayName(channel).toLowerCase().indexOf(query) !== -1;
        return categoryMatch && searchMatch;
      })
      .sort(function (a, b) {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;

        var fa = favs[channelKey(a)] ? 1 : 0;
        var fb = favs[channelKey(b)] ? 1 : 0;
        if (fa !== fb) return fb - fa;

        var pa = getPriority(a), pb = getPriority(b);
        if (pa !== pb) return pa - pb;

        return displayName(a).localeCompare(displayName(b), "ru");
      });
  }

  /* =====================================================
     RENDER
  ===================================================== */

  function updateActive() {
    each(el.list.querySelectorAll(".channel-item"), function (b) {
      toggleClass(b, "active", b._channel === current);
    });
  }

  function focusChannel(channel) {
    var btns = el.list.querySelectorAll(".channel-item");
    for (var i = 0; i < btns.length; i++) {
      if (btns[i]._channel === channel) {
        try { btns[i].focus(); } catch (e) {}
        return;
      }
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

    var fragment = document.createDocumentFragment();
    var previousGroup = "";

    list.forEach(function (channel) {
      var isFav = !!favs[channelKey(channel)];
      var group = isFav ? "Избранное" : (COUNTRY[channel.country] || "Другое");

      if (group !== previousGroup) {
        var title = document.createElement("div");
        title.className = "group-title";
        title.textContent = group;
        fragment.appendChild(title);
        previousGroup = group;
      }

      var shownName = displayName(channel);

      var button = document.createElement("button");
      button.type = "button";
      button.className = "channel-item" + (current === channel ? " active" : "");
      button._channel = channel;

      var logo;
      if (channel.logo) {
        logo = document.createElement("img");
        logo.className = "channel-logo";
        logo.src = channel.logo;
        logo.alt = shownName;
        (function (imgEl) {
          imgEl.onerror = function () {
            var fallback = document.createElement("div");
            fallback.className = "channel-logo";
            fallback.textContent = initials(shownName);
            if (imgEl.parentNode) imgEl.parentNode.replaceChild(fallback, imgEl);
          };
        })(logo);
      } else {
        logo = document.createElement("div");
        logo.className = "channel-logo";
        logo.textContent = initials(shownName);
      }

      var meta = document.createElement("div");
      meta.className = "channel-meta";

      var name = document.createElement("div");
      name.className = "channel-name";
      name.textContent = shownName;

      var sub = document.createElement("div");
      sub.className = "channel-sub";
      sub.textContent = COUNTRY[channel.country] || "IPTV";

      meta.appendChild(name);
      meta.appendChild(sub);

      var favorite = document.createElement("span");
      favorite.className = "fav-btn" + (isFav ? " on" : "");
      favorite.setAttribute("data-favorite", "true");
      favorite.textContent = isFav ? "★" : "☆";

      button.appendChild(logo);
      button.appendChild(meta);
      button.appendChild(favorite);
      fragment.appendChild(button);
    });

    el.list.appendChild(fragment);
  }

  /* =====================================================
     CLICKS: select channel / favorite
  ===================================================== */

  el.list.addEventListener("click", function (event) {
    var button = closestEl(event.target, ".channel-item");
    if (!button) return;

    var channel = button._channel;

    if (closestEl(event.target, "[data-favorite]")) {
      var key = channelKey(channel);
      if (favs[key]) delete favs[key]; else favs[key] = true;
      saveFavs();
      render();
      focusChannel(channel);
      return;
    }

    play(channel);
  });

  /* =====================================================
     SEARCH
  ===================================================== */

  var searchTimeout;

  el.search.addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(function () {
      query = el.search.value.toLowerCase().trim();
      render();
    }, 150);
  });

  /* =====================================================
     CATEGORY FILTER
  ===================================================== */

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

  /* =====================================================
     RETRY
  ===================================================== */

  if (el.retry) {
    el.retry.addEventListener("click", function () {
      if (current) play(current, 0);
    });
  }

  /* =====================================================
     SMART TV REMOTE (spatial navigation)
  ===================================================== */

  // Tizen: register media / channel keys
  try {
    if (window.tizen && window.tizen.tvinputdevice) {
      ["MediaPlay", "MediaPause", "MediaPlayPause", "MediaStop",
       "ChannelUp", "ChannelDown"].forEach(function (k) {
        try { window.tizen.tvinputdevice.registerKey(k); } catch (e) {}
      });
    }
  } catch (e) {}

  function focusFirstChannel() {
    var first = el.list.querySelector(".channel-item");
    if (first) first.focus();
  }

  function isFocusable(node) {
    if (!node || node.disabled || node.hidden) return false;
    if (node.offsetWidth <= 0 || node.offsetHeight <= 0) return false;
    return true;
  }

  function moveFocus(dir) {
    var cur = document.activeElement;
    var all = Array.prototype.filter.call(
      document.querySelectorAll("button, input, a[href], [tabindex='0']"),
      isFocusable
    );

    if (!all.length) return false;

    if (!cur || cur === document.body || all.indexOf(cur) === -1) {
      all[0].focus();
      return true;
    }

    var r = cur.getBoundingClientRect();
    var cx = r.left + r.width / 2;
    var cy = r.top + r.height / 2;

    var best = null, bestScore = Infinity;

    all.forEach(function (c) {
      if (c === cur) return;
      var rc = c.getBoundingClientRect();
      var ccx = rc.left + rc.width / 2;
      var ccy = rc.top + rc.height / 2;
      var primary, secondary;

      if (dir === "left")       { primary = cx - ccx; secondary = Math.abs(cy - ccy); }
      else if (dir === "right") { primary = ccx - cx; secondary = Math.abs(cy - ccy); }
      else if (dir === "up")    { primary = cy - ccy; secondary = Math.abs(cx - ccx); }
      else                      { primary = ccy - cy; secondary = Math.abs(cx - ccx); }

      if (primary <= 1) return;

      var score = primary + secondary * 3;
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

  function zap(direction) {
    var list = visibleChannels();
    if (!list.length) return;
    var idx = list.indexOf(current);
    var next = list[(idx + direction + list.length) % list.length];
    play(next);
    focusChannel(next);
  }

  function toggleFullscreen() {
    var v = el.video;
    var isFs = document.fullscreenElement || document.webkitFullscreenElement;
    try {
      if (isFs) {
        (document.exitFullscreen || document.webkitExitFullscreen).call(document);
      } else {
        (v.requestFullscreen || v.webkitRequestFullscreen || v.webkitEnterFullscreen).call(v);
      }
    } catch (e) {}
  }

  function handleRemote(event) {
    var key = event.key;
    var code = event.keyCode;
    var active = document.activeElement;
    var tag = active ? active.nodeName : "";

    var up = key === "ArrowUp" || code === 38;
    var down = key === "ArrowDown" || code === 40;
    var left = key === "ArrowLeft" || code === 37;
    var right = key === "ArrowRight" || code === 39;
    var enter = key === "Enter" || code === 13;
    var back = key === "Escape" || key === "Backspace" || code === 10009 || code === 461 || code === 27;

    // Media keys
    if (code === 415 || code === 10252 && el.video.paused) {
      event.preventDefault(); tryPlay(); return;
    }
    if (code === 19 || code === 413) {
      event.preventDefault(); try { el.video.pause(); } catch (e) {} return;
    }
    if (code === 10252 || code === 179) {
      event.preventDefault();
      if (el.video.paused) tryPlay(); else el.video.pause();
      return;
    }
    if (code === 427) { event.preventDefault(); zap(1); return; }
    if (code === 428) { event.preventDefault(); zap(-1); return; }

    if (key === " " && tag !== "INPUT" && tag !== "BUTTON") {
      event.preventDefault();
      if (el.video.paused) tryPlay(); else el.video.pause();
      return;
    }

    if (back) {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        event.preventDefault(); toggleFullscreen(); return;
      }
      if (tag === "INPUT") {
        // let Backspace edit text; only Escape/Back leaves the field
        if (key === "Backspace" && code !== 10009 && code !== 461) return;
        active.blur();
        focusFirstChannel();
        event.preventDefault();
      }
      return;
    }

    if (enter) {
      if (tag === "BUTTON") {
        event.preventDefault();
        active.click();
      } else if (active === el.video) {
        event.preventDefault();
        toggleFullscreen();
      }
      return;
    }

    if (up || down || left || right) {
      if (tag === "INPUT" && (left || right)) {
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

  /* =====================================================
     SMART TV FOCUS STYLE
  ===================================================== */

  if (IS_TV) {
    try { el.video.setAttribute("tabindex", "0"); } catch (e) {}

    var style = document.createElement("style");
    style.textContent =
      ".smart-tv button:focus,.smart-tv input:focus,.smart-tv video:focus{" +
        "outline:3px solid #e5b94d !important;outline-offset:4px;}" +
      ".smart-tv .channel-item{min-height:70px;cursor:pointer;}" +
      ".smart-tv .channel-name{font-size:18px;}" +
      ".smart-tv .channel-logo{width:55px;height:55px;object-fit:contain;}" +
      ".smart-tv .channel-item.active{border:2px solid #e5b94d;}" +
      ".smart-tv video{width:100%;height:100%;object-fit:contain;}";
    document.head.appendChild(style);
  }

  /* =====================================================
     INITIALIZE
  ===================================================== */

  function initialize() {
    translateStaticUI();

    if (el.info) el.info.textContent = "Подключение к источникам IPTV...";
    setStatus("Загрузка каналов...", "wait", true);

    var results = new Array(SOURCES.length);
    var pending = SOURCES.length;

    SOURCES.forEach(function (source, i) {
      fetchSource(source, function (list) {
        results[i] = list || [];
        pending--;
        if (pending === 0) finish();
      });
    });

    function finish() {
      try {
        var parsed = [].concat.apply([], results).filter(function (c) {
          return !/мосфильм|mosfilm/i.test(c.name);
        });

        channels = mergeChannels(MOSFILM.concat(parsed));
        channels = selectTopChannels(channels);

        if (el.info) {
          el.info.textContent = "Загружено каналов: " + channels.length + " / " + MAX_CHANNELS;
        }

        render();
        setStatus("", "ok", false);
        translateStaticUI();

        if (IS_TV) setTimeout(focusFirstChannel, 1000);
      } catch (error) {
        console.error("TVKINO initialization error:", error);
        if (el.info) el.info.textContent = "Не удалось загрузить каналы.";
        setStatus("Плейлист не загружен.", "err", false);
      }
    }
  }

  initialize();

  } // end boot

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
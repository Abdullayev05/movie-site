(() => {
  "use strict";

  /* =====================================================
     TVKINO - SMART TV IPTV PLAYER (всё на русском)
     Samsung Tizen / LG webOS / Android TV / Browser
  ===================================================== */

  const BASE = "https://iptv-org.github.io/iptv/";

  const MAX_CHANNELS = 100;

  // Your own proxy (optional), e.g. "https://tvkino.adiniz.workers.dev/?url="
  const PROXY = "";
  // Free public CORS proxies, used as backup for Mosfilm only.
  const PUBLIC_PROXIES = ["https://corsproxy.io/?url=", "https://api.allorigins.win/raw?url="];

  const SOURCES = [
    { id: "ru", url: BASE + "countries/ru.m3u", country: "ru" },
    { id: "by", url: BASE + "countries/by.m3u", country: "by" },
    { id: "az", url: BASE + "countries/az.m3u", country: "az" },
    { id: "tr", url: BASE + "countries/tr.m3u", country: "tr" },
    { id: "ua", url: BASE + "countries/ua.m3u", country: "ua" },
    { id: "rus", url: BASE + "languages/rus.m3u", country: "ru" }
  ];

  const COUNTRY = {
    ru: "Россия",
    by: "Беларусь",
    az: "Азербайджан",
    tr: "Турция",
    ua: "Украина"
  };

  const CATEGORY_RU = {
    all: "Все",
    movie: "Кино",
    news: "Новости",
    sport: "Спорт",
    kids: "Детские",
    music: "Музыка",
    other: "Другие"
  };

  // Static texts that may exist in index.html (exact match, case-insensitive) -> Russian
  const STATIC_RU = {
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
     RUSSIAN UI (page language, title, static texts)
  ===================================================== */

  function translateStaticUI() {
    try {
      document.documentElement.setAttribute("lang", "ru");
      document.title = "ТВКИНО — Прямой эфир";

      // Category buttons
      Array.prototype.forEach.call(document.querySelectorAll(".cat-btn"), btn => {
        const c = btn.getAttribute("data-category");
        if (c && CATEGORY_RU[c]) btn.textContent = CATEGORY_RU[c];
      });

      // Search placeholder
      el.search.setAttribute("placeholder", "Поиск канала...");

      // Retry button text
      if (el.retry && !el.retry.children.length) {
        el.retry.textContent = "Повторить";
      }

      // Walk all text nodes and translate known phrases
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      const nodes = [];
      let n;
      while ((n = walker.nextNode())) nodes.push(n);

      nodes.forEach(node => {
        const parent = node.parentNode;
        if (!parent) return;
        const tag = parent.nodeName;
        if (tag === "SCRIPT" || tag === "STYLE") return;
        const raw = node.nodeValue || "";
        const key = raw.trim().toLowerCase();
        if (key && STATIC_RU[key]) {
          node.nodeValue = raw.replace(raw.trim(), STATIC_RU[key]);
        }
      });

      // Title / placeholder / aria attributes
      Array.prototype.forEach.call(
        document.querySelectorAll("[placeholder],[title],[aria-label]"),
        node => {
          ["placeholder", "title", "aria-label"].forEach(attr => {
            const v = node.getAttribute(attr);
            if (!v) return;
            const t = STATIC_RU[v.trim().toLowerCase()];
            if (t) node.setAttribute(attr, t);
          });
        }
      );
    } catch (e) {}
  }

  /* =====================================================
     CHANNEL NAMES -> RUSSIAN (dictionary + transliteration)
  ===================================================== */

  const NAME_RU = {
    "mosfilm": "Мосфильм",
    "euronews": "Евроньюс",
    "cnn": "Си-эн-эн",
    "cnn turk": "Си-эн-эн Тюрк",
    "cnn international": "Си-эн-эн Интернешнл",
    "bbc": "Би-би-си",
    "bbc news": "Би-би-си Ньюс",
    "bbc world news": "Би-би-си Ворлд Ньюс",
    "trt 1": "ТРТ 1",
    "trt1": "ТРТ 1",
    "trt haber": "ТРТ Хабер",
    "trt world": "ТРТ Ворлд",
    "trt spor": "ТРТ Спор",
    "trt cocuk": "ТРТ Чоджук",
    "atv": "АТВ",
    "atv avrupa": "АТВ Авруп��",
    "show tv": "Шоу ТВ",
    "star tv": "Стар ТВ",
    "kanal d": "Канал Д",
    "fox": "Фокс",
    "fox tv": "Фокс ТВ",
    "now tv": "Нау ТВ",
    "tv8": "ТВ8",
    "tv 8": "ТВ8",
    "a haber": "А Хабер",
    "a spor": "А Спор",
    "a para": "А Пара",
    "haberturk": "Хабертюрк",
    "haber turk": "Хабертюрк",
    "ntv": "НТВ",
    "teve2": "Теве2",
    "beyaz tv": "Бейаз ТВ",
    "ht spor": "ХТ Спор",
    "htspor tv": "ХТ Спор ТВ",
    "bein sports": "Бин Спортс",
    "idman tv": "Идман ТВ",
    "idman": "Идман ТВ",
    "cbc sport": "Си-би-си Спорт",
    "cbc": "Си-би-си",
    "space tv": "Спейс ТВ",
    "azad azerbaycan": "Азад Азербайджан",
    "azad azərbaycan": "Азад Азербайджан",
    "azad azerbaijan": "Азад Азербайджан",
    "azerbaijan tv": "Азербайджан ТВ",
    "aztv": "АзТВ",
    "az tv": "АзТВ",
    "xezer tv": "Хазар ТВ",
    "xəzər tv": "Хазар ТВ",
    "ictimai tv": "Общественное ТВ Азербайджана",
    "ictimai": "Ичтимаи ТВ",
    "arb": "АРБ",
    "arb 24": "АРБ 24",
    "lider tv": "Лидер ТВ",
    "baku tv": "Баку ТВ",
    "medeniyyet tv": "Медениййят ТВ",
    "mədəniyyət tv": "Медениййят ТВ",
    "disney channel": "Дисней Ченнел",
    "cartoon network": "Картун Нетворк",
    "nickelodeon": "Никелодеон",
    "nick jr": "Ник Джуниор",
    "eurosport": "Евроспорт",
    "eurosport 1": "Евроспорт 1",
    "eurosport 2": "Евроспорт 2",
    "setanta sports": "Сетанта Спортс",
    "rt": "РТ",
    "rt news": "РТ Ньюс",
    "rtvi": "РТВИ",
    "cgtn": "СиДжиТиЭн",
    "france 24": "Франс 24",
    "dw": "Дойче Велле",
    "dw tv": "Дойче Велле",
    "sky news": "Скай Ньюс",
    "al jazeera": "Аль-Джазира",
    "music box": "Мьюзик Бокс",
    "musicbox": "Мьюзик Бокс",
    "bridge tv": "Бридж ТВ",
    "ru tv": "Ру ТВ",
    "muz tv": "Муз ТВ",
    "tnt": "ТНТ",
    "sts": "СТС",
    "ctc": "СТС",
    "ren tv": "РЕН ТВ",
    "tvc": "ТВЦ",
    "tv3": "ТВ-3",
    "tv-3": "ТВ-3",
    "hbo": "Эйч-би-оу",
    "1tv": "Первый канал",
    "channel one": "Первый канал",
    "channel one russia": "Первый канал",
    "russia 1": "Россия 1",
    "russia 24": "Россия 24",
    "russia k": "Россия К",
    "belarus 1": "Беларусь 1",
    "belarus 24": "Беларусь 24",
    "belarus 2": "Беларусь 2",
    "belarus 3": "Беларусь 3",
    "belarus 5": "Беларусь 5",
    "ont": "ОНТ",
    "stv": "СТВ",
    "inter": "Интер",
    "1+1": "1+1",
    "ictv": "ICTV",
    "stb": "СТБ",
    "novyi kanal": "Новый канал",
    "5 kanal": "5 канал",
    "5 channel": "5 канал",
    "mir": "Мир",
    "mir 24": "Мир 24",
    "zvezda": "Звезда",
    "pobeda": "Победа",
    "karusel": "Карусель",
    "pyatnitsa": "Пятница",
    "domashniy": "Домашний",
    "spas": "Спас",
    "otr": "ОТР",
    "match tv": "Матч ТВ"
  };

  const TR_MULTI = [
    ["shch", "щ"], ["sch", "щ"], ["sh", "ш"], ["ch", "ч"], ["zh", "ж"],
    ["kh", "х"], ["ts", "ц"], ["yu", "ю"], ["ya", "я"], ["yo", "ё"],
    ["ph", "ф"], ["th", "т"], ["ck", "к"], ["oo", "у"], ["ee", "и"], ["ou", "у"]
  ];

  const TR_SINGLE = {
    a: "а", b: "б", c: "к", d: "д", e: "е", f: "ф", g: "г", h: "х", i: "и",
    j: "дж", k: "к", l: "л", m: "м", n: "н", o: "о", p: "п", q: "к", r: "р",
    s: "с", t: "т", u: "у", v: "в", w: "в", x: "кс", y: "й", z: "з",
    "ç": "ч", "ş": "ш", "ğ": "г", "ı": "ы", "ö": "о", "ü": "ю", "ə": "э",
    "é": "е", "è": "е", "à": "а", "â": "а", "î": "и", "ô": "о", "û": "у",
    "ñ": "нь", "ä": "э", "ß": "сс"
  };

  function translitWord(word) {
    let src = word.toLowerCase().replace(/i̇/g, "i");
    let out = "";
    let i = 0;

    while (i < src.length) {
      let matched = false;

      for (let m = 0; m < TR_MULTI.length; m++) {
        const pair = TR_MULTI[m];
        if (src.substr(i, pair[0].length) === pair[0]) {
          out += pair[1];
          i += pair[0].length;
          matched = true;
          break;
        }
      }

      if (matched) continue;

      const ch = src.charAt(i);
      out += TR_SINGLE[ch] !== undefined ? TR_SINGLE[ch] : ch;
      i++;
    }

    const letters = word.replace(/[^A-Za-zÇŞĞİÖÜƏçşğıöüə]/g, "");
    const allUpper = letters.length >= 2 && letters === letters.toUpperCase();

    if (allUpper) return out.toUpperCase();

    const first = word.charAt(0);
    if (first && first !== first.toLowerCase()) {
      return out.charAt(0).toUpperCase() + out.slice(1);
    }

    return out;
  }

  function toRussianName(name) {
    const base = String(name || "").trim();

    if (!base) return base;

    const key = base.toLowerCase().replace(/\s+/g, " ");
    const stripped = key.replace(/\b(hd|sd|fhd|uhd)\b/g, "").replace(/\s+/g, " ").trim();

    if (NAME_RU[key]) return NAME_RU[key];
    if (NAME_RU[stripped]) return NAME_RU[stripped] + (/\bhd\b/i.test(key) ? " HD" : "");

    // Already Cyrillic: keep as is
    if (/[\u0400-\u04FF]/.test(base)) return base;

    // Transliterate word by word, keep digits and symbols
    return base.split(/(\s+)/).map(part => {
      if (!part.trim()) return part;
      if (/^(hd|sd|fhd|uhd)$/i.test(part)) return part.toUpperCase();
      if (!/[A-Za-zÇŞĞİÖÜƏçşğıöüəéèàâîôûñäß]/.test(part)) return part;
      return part.replace(/[A-Za-zÇŞĞİÖÜƏçşğıöüəéèàâîôûñäß]+/g, w => translitWord(w));
    }).join("");
  }

  function displayName(channel) {
    if (!channel._ru) channel._ru = toRussianName(channel.name);
    return channel._ru;
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
      } catch (e) {
        return fallback;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {}
    }
  };

  const favs = new Set(store.get("tvkino_favs", []));

  /* =====================================================
     MOSFILM (3 channels, each with its own link)
  ===================================================== */

  const LOGO_GOLD = "data:image/png;base64,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";
  const LOGO_MOS = "data:image/jpeg;base64,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";

  const MOSFILM = [
    {
      name: "Мосфильм",
      country: "ru",
      category: "movie",
      logo: LOGO_MOS,
      pinned: true,
      urls: ["https://fs.uplink.kz/mosfilm/mono.m3u8?token=onlinetv"]
    },
    {
      name: "Мосфильм. Золотая коллекция",
      country: "ru",
      category: "movie",
      logo: LOGO_GOLD,
      pinned: true,
      urls: ["http://31.222.235.15/mosfilm/index.m3u8"]
    },
    {
      name: "Мосфильм Интернешнл",
      country: "ru",
      category: "movie",
      logo: "",
      pinned: true,
      urls: ["http://stream.mcquack.net/369/index.m3u8"]
    }
  ];

  /* =====================================================
     PRIORITY CHANNELS
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
          logo: logo,
          group: group,
          tvgId: tvgId
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
          country: country,
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
        map.set(key, Object.assign({}, channel, {
          urls: channel.urls.slice()
        }));

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

    return Array.from(map.values());
  }

  /* =====================================================
     SELECT TOP CHANNELS
  ===================================================== */

  function selectTopChannels(input) {
    const sorted = input.slice().sort((a, b) => {
      if (a.pinned !== b.pinned) {
        return a.pinned ? -1 : 1;
      }

      const priorityA = getPriority(a);
      const priorityB = getPriority(b);

      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      if (!!a.logo !== !!b.logo) {
        return a.logo ? -1 : 1;
      }

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

  function setStatus(message, state, showLoader) {
    state = state || "wait";

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
        state === "ok" ? "Прямой эфир" :
        state === "err" ? "Ошибка воспроизведения" :
        state === "wait" ? "Загрузка..." :
        "Готово к просмотру";
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
      } catch (e) {}

      hls = null;
    }

    try {
      el.video.pause();
      el.video.removeAttribute("src");
      el.video.load();
    } catch (e) {}
  }

  /* =====================================================
     ATTEMPTS (direct link + proxies)
  ===================================================== */

  function getAttempts(channel) {
    const out = [];
    const seen = new Set();
    const httpsPage = location.protocol === "https:";

    function add(u, p) {
      const k = (p || "") + "|" + u;
      if (seen.has(k)) return;
      seen.add(k);
      out.push({ u: u, p: p || "" });
    }

    (channel.urls || []).forEach(u => {
      if (!/^https?:\/\//i.test(u)) return;

      const blocked = httpsPage && /^http:/i.test(u);

      if (!blocked) add(u, "");
      if (PROXY) add(u, PROXY);
      if (channel.pinned) {
        PUBLIC_PROXIES.forEach(p => add(u, p));
      }
    });

    return out;
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
        "https://cdn.jsdelivr.net/npm/hls.js@1.5.17/dist/hls.min.js";

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
      "Не удалось открыть канал: " + message,
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

  async function play(channel, index) {
    index = index || 0;

    if (!channel) return;

    const myGeneration = ++generation;

    current = channel;
    urlIndex = index;

    const attempts = getAttempts(channel);
    const attempt = attempts[index];

    if (!attempt) {
      setStatus(
        "Для этого канала нет подходящего адреса трансляции.",
        "err",
        false
      );

      if (el.retry) {
        el.retry.hidden = false;
      }

      return;
    }

    const url = attempt.u;
    const proxy = attempt.p;

    destroyPlayer();

    if (el.now) {
      el.now.textContent = displayName(channel);
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

    setStatus(
      "Загрузка канала... (" + (index + 1) + "/" + attempts.length + ")",
      "wait",
      true
    );

    render();

    playTimeout = setTimeout(() => {
      if (myGeneration === generation) {
        playbackError("превышено время ожидания", myGeneration);
      }
    }, 20000);

    const video = el.video;

    video.autoplay = true;
    video.playsInline = true;
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.preload = "auto";

    const isHls = url.toLowerCase().includes(".m3u8");

    // hls.js is used when the browser has no native HLS, or when a proxy is needed.
    if (isHls && (!supportsNativeHLS() || proxy)) {
      const available = await loadHlsLibrary();

      if (myGeneration !== generation) return;

      if (
        available &&
        window.Hls &&
        window.Hls.isSupported()
      ) {
        try {
          const cfg = {
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
            cfg.loader = class extends Hls.DefaultConfig.loader {
              load(ctx, conf, cb) {
                const orig = ctx.url;
                const ok = cb.onSuccess;
                ctx.url = proxy + encodeURIComponent(orig);
                cb.onSuccess = function (res, stats, c2, net) {
                  res.url = orig;
                  c2.url = orig;
                  ok(res, stats, c2, net);
                };
                super.load(ctx, conf, cb);
              }
            };
          }

          hls = new Hls(cfg);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (myGeneration !== generation) return;

            const p = video.play();

            if (p && p.catch) {
              p.catch(() => {
                setStatus(
                  "Нажмите OK, чтобы запустить трансляцию.",
                  "wait",
                  false
                );
              });
            }
          });

          hls.on(Hls.Events.ERROR, (_, data) => {
            if (
              myGeneration !== generation ||
              !data.fatal
            ) {
              return;
            }

            playbackError(
              "ошибка HLS",
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

    // Native HLS (Smart TVs) or a plain video file.
    if (supportsNativeHLS() || !isHls) {
      video.src = proxy ? proxy + encodeURIComponent(url) : url;
      video.load();

      const p2 = video.play();

      if (p2 && p2.catch) {
        p2.catch(() => {
          setStatus(
            "Нажмите OK, чтобы запустить трансляцию.",
            "wait",
            false
          );
        });
      }

      return;
    }

    playbackError("HLS не поддерживается", myGeneration);
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
      setStatus("Буферизация...", "wait", true);
    }
  });

  el.video.addEventListener("error", () => {
    if (current && !hls) {
      playbackError("ошибка видео", generation);
    }
  });

  el.video.addEventListener("ended", () => {
    if (current) {
      playbackError("трансляция завершена", generation);
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
          channel.name.toLowerCase().includes(query) ||
          displayName(channel).toLowerCase().includes(query);

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

        return displayName(a).localeCompare(displayName(b), "ru");
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
      empty.textContent = "Каналы не найдены.";

      el.list.appendChild(empty);
      return;
    }

    const fragment = document.createDocumentFragment();

    let previousGroup = "";

    list.forEach(channel => {
      const group = favs.has(channelKey(channel))
        ? "Избранное"
        : COUNTRY[channel.country] || "Другое";

      if (group !== previousGroup) {
        const title = document.createElement("div");

        title.className = "group-title";
        title.textContent = group;

        fragment.appendChild(title);

        previousGroup = group;
      }

      const shownName = displayName(channel);

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
        logo.alt = shownName;
        logo.loading = "lazy";

        logo.onerror = () => {
          const fallback = document.createElement("div");

          fallback.className = "channel-logo";
          fallback.textContent = initials(shownName);

          logo.replaceWith(fallback);
        };
      } else {
        logo.textContent = initials(shownName);
      }

      const meta = document.createElement("div");
      meta.className = "channel-meta";

      const name = document.createElement("div");
      name.className = "channel-name";
      name.textContent = shownName;

      const sub = document.createElement("div");
      sub.className = "channel-sub";
      sub.textContent = COUNTRY[channel.country] || "IPTV";

      meta.appendChild(name);
      meta.appendChild(sub);

      const favorite = document.createElement("span");

      favorite.className =
        "fav-btn" +
        (favs.has(channelKey(channel)) ? " on" : "");

      favorite.dataset.favorite = "true";

      favorite.textContent =
        favs.has(channelKey(channel)) ? "★" : "☆";

      button.appendChild(logo);
      button.appendChild(meta);
      button.appendChild(favorite);

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

      store.set("tvkino_favs", Array.from(favs));

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

      Array.prototype.forEach.call(
        categoryFilter.querySelectorAll(".cat-btn"),
        item => {
          item.classList.toggle("active", item === button);
        }
      );

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
    return Array.from(el.list.querySelectorAll(".channel-item"));
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
      if (active === el.search) return;

      event.preventDefault();

      if (el.video.paused) {
        const p = el.video.play();
        if (p && p.catch) p.catch(() => {});
      } else {
        el.video.pause();
      }

      return;
    }

    if (back) {
      if (active === el.search) {
        el.search.blur();
      } else if (active && active !== document.body) {
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
    translateStaticUI();

    if (el.info) {
      el.info.textContent = "Подключение к источникам IPTV...";
    }

    setStatus("Загрузка каналов...", "wait", true);

    const results = await Promise.all(
      SOURCES.map(fetchSource)
    );

    // Mosfilm comes only from the 3 channels defined above.
    const parsed = [].concat.apply([], results)
      .filter(c => !/мосфильм|mosfilm/i.test(c.name));

    channels = mergeChannels(MOSFILM.concat(parsed));

    channels = selectTopChannels(channels);

    if (el.info) {
      el.info.textContent =
        "Загружено каналов: " +
        channels.length +
        " / " +
        MAX_CHANNELS;
    }

    render();

    setStatus("", "ok", false);

    translateStaticUI();

    if (IS_TV) {
      setTimeout(focusFirstChannel, 1000);
    }
  }

  /* =====================================================
     START
  ===================================================== */

  initialize().catch(error => {
    console.error("TVKINO initialization error:", error);

    if (el.info) {
      el.info.textContent =
        "Не удалось загрузить каналы.";
    }

    setStatus("Плейлист не загружен.", "err", false);
  });

})();
const channelListEl = document.getElementById('channelList');
const videoBoxEl = document.getElementById('videoBox');
const nowPlayingEl = document.getElementById('nowPlaying');

// İstədiyin ölkəni buradan dəyişə bilərsən: ru.m3u (Rusiya), ua.m3u (Ukrayna), by.m3u (Belarus)
const playlistUrl = 'https://iptv-org.github.io/iptv/countries/ru.m3u';

async function fetchChannels() {
    try {
        nowPlayingEl.innerText = "Kanallar yüklənir...";
        const response = await fetch(playlistUrl);
        const data = await response.text();
        
        parseM3U(data);
    } catch (error) {
        console.error("Kanalları yükləmək mümkün olmadı:", error);
        nowPlayingEl.innerText = "Kanalları yükləmək alınmadı (CORS və ya şəbəkə xətası)";
    }
}

// M3U faylını oxuyub nömrələndirən və ayıran funksiya
function parseM3U(data) {
    const lines = data.split('\n');
    let channels = [];
    let currentName = "";

    for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
            let parts = line.split(',');
            if (parts.length > 1) {
                currentName = parts.slice(1).join(',').trim();
            }
        } else if (line && !line.startsWith('#')) {
            if (currentName && line.startsWith('http')) {
                channels.push({
                    name: currentName,
                    url: line
                });
                currentName = "";
            }
        }
    }

    renderChannels(channels);
}

// Kanalları nömrə ilə birlikdə ekrana (sol menyuya) yerləşdirmək
function renderChannels(channels) {
    channelListEl.innerHTML = '';
    
    if (channels.length === 0) {
        nowPlayingEl.innerText = "Heç bir kanal tapılmadı.";
        return;
    }

    nowPlayingEl.innerText = `${channels.length} kanal tapıldı. Kanal seçin.`;

    channels.forEach((channel, index) => {
        const item = document.createElement('div');
        item.className = 'channel-item';
        item.setAttribute('tabindex', '0'); // TV pultu ilə idarə üçün

        // Sıra nömrəsi və kanal adı strukturu
        item.innerHTML = `
            <span class="channel-number">${index + 1}.</span>
            <span class="channel-name">${channel.name}</span>
        `;
        
        item.onclick = () => playChannel(channel);
        item.onkeydown = (e) => {
            if (e.key === 'Enter') {
                playChannel(channel);
            }
        };

        channelListEl.appendChild(item);
    });
}

// Seçilən kanalı pleyerdə oxutmaq
function playChannel(channel) {
    nowPlayingEl.innerText = "Oxunur: " + channel.name;
    videoBoxEl.innerHTML = ''; 

    const video = document.createElement('video');
    video.controls = true;
    video.autoplay = true;
    videoBoxEl.appendChild(video);

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(channel.url);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function() {
            video.play().catch(e => console.log("Oynatma xətası:", e));
        });
        hls.on(Hls.Events.ERROR, function(event, data) {
            if (data.fatal) {
                console.warn("Bu kanalın axını işləmir və ya qorunur:", channel.name);
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = channel.url;
        video.addEventListener('loadedmetadata', function() {
            video.play();
        });
    }
}

// Proqram işə düşən kimi kanalları çək
fetchChannels();
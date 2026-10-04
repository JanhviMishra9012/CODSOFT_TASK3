const tracks = [
  { title:"Middle Of The Night",   artist:"Elle Duhe",     src:"song1.mp3",art:"🌇" }, 
  { title:"Espresso", artist:"Sabrina Carpenter",      src:"song2.mp3", art:"🌇" },
  { title:"Black Swan",     artist:"BTS",     src:"song3.mp3", art:"🌆" },
  { title:"Kill This Love",     artist:"Blackpink",   src:"song4.mp3", art:"📻" },
  { title:"Sawadeekha",    artist:"Lisa",     src:"song5.mp3", art:"🔮" },
  { title:"AntiFragile",    artist:"Le Sserafim",     src:"song5.mp3", art:"🔮" },
  { title:"Not Shy",    artist:"ITZY",     src:"song5.mp3", art:"🔮" },
  { title:"Rover",    artist:"Kai",     src:"song5.mp3", art:"🔮" },
  { title:"Like Jennie",    artist:"Jennie",     src:"song5.mp3", art:"🔮" },
  { title:"Run",    artist:"BTS",     src:"song5.mp3", art:"🔮" },
  { title:"Side To Side",    artist:"Ariana Grande",     src:"song5.mp3", art:"🔮" },
  { title:"Count On Me",    artist:"Bruno Mars",     src:"song5.mp3", art:"🔮" },
  { title:"APT",    artist:"Bruno Mars, Rose",     src:"song5.mp3", art:"🔮" },
  { title:"New Women",    artist:"Lisa, Rosalia",     src:"song5.mp3", art:"🔮" }
];

let favorites = new Set();
let currentIndex = 0; 
let isPlaying = false;
let isShuffled = false;
let repeatMode = 0; // 0=off,1=all,2=one
let autoplayNext = true;

const audio = document.getElementById('audio');
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const artWrap = document.getElementById('artWrap');
const curTime = document.getElementById('curTime');
const durTime = document.getElementById('durTime');
const progressFill = document.getElementById('progressFill');
const seek = document.getElementById('seek');
const volume = document.getElementById('volume');
const muteBtn = document.getElementById('muteBtn');
const volIcon = document.getElementById('volIcon');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
const favBtn = document.getElementById('favBtn');
const playlistEl = document.getElementById('playlistEl');
const autoplayToggle = document.getElementById('autoplayToggle');
const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const themeLabel = document.getElementById('themeLabel');

const ICON_PLAY = '<path d="M8 5v14l11-7z"/>';
const ICON_PAUSE = '<path d="M6 5h4v14H6zm8 0h4v14h-4z"/>';
const ICON_VOL = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>';
const ICON_MUTE = '<path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.42.05-.63zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.94 8.94 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.94 8.94 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z"/>';
const ICON_SUN = '<path d="M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0-5h0v2h0V2zm0 18v2h0v-2h0zM4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"/>';
const ICON_MOON = '<path d="M12 3a9 9 0 1 0 9 9c0-.46-.04-.92-.1-1.36a5.4 5.4 0 0 1-7.54-7.54c-.44-.06-.9-.1-1.36-.1z"/>';

function fmtTime(s){
  if(!isFinite(s)) return "0:00";
  const m = Math.floor(s/60), sec = Math.floor(s%60);
  return `${m}:${sec.toString().padStart(2,'0')}`;
}

function renderPlaylist(){
  playlistEl.innerHTML = "";
  tracks.forEach((t,i)=>{
    const row = document.createElement('div');
    row.className = 'track' + (i===currentIndex ? ' active':'');
    row.innerHTML = `
      <div class="track-art">${t.art}</div>
      <div class="track-info">
        <div class="t-title">${t.title}</div>
        <div class="t-artist">${t.artist}</div>
      </div>
      <span class="t-dur">--:--</span>
      <button class="t-fav ${favorites.has(i)?'active':''}" data-i="${i}">
        <svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.3-8.1C1 10.3 1.8 6.9 4.9 5.6c2-.85 4 .05 5.1 1.7 1.1-1.65 3.1-2.55 5.1-1.7 3.1 1.3 3.9 4.7 2.2 7.3C18.7 16.65 12 21 12 21z"/></svg>
      </button>`;
    row.addEventListener('click', (e)=>{
      if(e.target.closest('.t-fav')) return;
      loadTrack(i); playAudio();
    });
    row.querySelector('.t-fav').addEventListener('click', (e)=>{
      e.stopPropagation();
      toggleFavorite(i);
    });
    playlistEl.appendChild(row);
  });
}

function toggleFavorite(i){
  if(favorites.has(i)) favorites.delete(i); else favorites.add(i);
  renderPlaylist();
  if(i===currentIndex) favBtn.classList.toggle('active', favorites.has(i));
}

function loadTrack(i){
  currentIndex = i;
  const t = tracks[i];
  audio.src = t.src;
  trackTitle.textContent = t.title;
  trackArtist.textContent = t.artist;
  favBtn.classList.toggle('active', favorites.has(i));
  renderPlaylist();
}

function playAudio(){
  audio.play().catch(()=>{ /* no valid source loaded yet */ });
  isPlaying = true;
  playIcon.innerHTML = ICON_PAUSE;
  artWrap.classList.add('playing');
}
function pauseAudio(){
  audio.pause();
  isPlaying = false;
  playIcon.innerHTML = ICON_PLAY;
  artWrap.classList.remove('playing');
}
function togglePlay(){ isPlaying ? pauseAudio() : playAudio(); }

function nextTrack(auto){
  let i = isShuffled ? Math.floor(Math.random()*tracks.length) : (currentIndex+1)%tracks.length;
  loadTrack(i);
  if(!auto || autoplayNext) playAudio();
}
function prevTrack(){
  if(audio.currentTime > 3){ audio.currentTime = 0; return; }
  let i = isShuffled ? Math.floor(Math.random()*tracks.length) : (currentIndex-1+tracks.length)%tracks.length;
  loadTrack(i); playAudio();
}

audio.addEventListener('timeupdate', ()=>{
  if(audio.duration){
    const pct = (audio.currentTime/audio.duration)*100;
    progressFill.style.width = pct+"%";
    seek.value = pct;
  }
  curTime.textContent = fmtTime(audio.currentTime);
});
audio.addEventListener('loadedmetadata', ()=>{ durTime.textContent = fmtTime(audio.duration); });
audio.addEventListener('ended', ()=>{
  if(repeatMode===2){ audio.currentTime=0; playAudio(); return; }
  if(!autoplayNext){ pauseAudio(); return; }
  if(repeatMode===1 || currentIndex < tracks.length-1){ nextTrack(true); }
  else { pauseAudio(); }
});

seek.addEventListener('input', ()=>{
  if(audio.duration) audio.currentTime = (seek.value/100)*audio.duration;
});

volume.addEventListener('input', ()=>{
  audio.volume = volume.value;
  audio.muted = false;
  volIcon.innerHTML = volume.value == 0 ? ICON_MUTE : ICON_VOL;
});
muteBtn.addEventListener('click', ()=>{
  audio.muted = !audio.muted;
  volIcon.innerHTML = audio.muted ? ICON_MUTE : ICON_VOL;
});

shuffleBtn.addEventListener('click', ()=>{
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
});
repeatBtn.addEventListener('click', ()=>{
  repeatMode = (repeatMode+1)%3;
  repeatBtn.classList.toggle('active', repeatMode!==0);
  repeatBtn.title = repeatMode===0 ? "Repeat off" : repeatMode===1 ? "Repeat all" : "Repeat one";
});
favBtn.addEventListener('click', ()=> toggleFavorite(currentIndex));
autoplayToggle.addEventListener('change', ()=>{ autoplayNext = autoplayToggle.checked; });

playBtn.addEventListener('click', togglePlay);
document.getElementById('nextBtn').addEventListener('click', ()=>nextTrack(false));
document.getElementById('prevBtn').addEventListener('click', prevTrack);

// Theme handling (persists per-browser via localStorage)
function applyTheme(mode){
  document.documentElement.setAttribute('data-theme', mode);
  themeIcon.innerHTML = mode === 'light' ? ICON_SUN : ICON_MOON;
  themeLabel.textContent = mode === 'light' ? 'Light' : 'Dark';
  try{ localStorage.setItem('musicPlayerTheme', mode); }catch(e){}
}
themeToggle.addEventListener('click', ()=>{
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  applyTheme(current === 'light' ? 'dark' : 'light');
});
(function initTheme(){
  let saved = null;
  try{ saved = localStorage.getItem('musicPlayerTheme'); }catch(e){}
  if(saved){ applyTheme(saved); }
  else{
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    applyTheme(prefersLight ? 'light' : 'dark');
  }
})();

audio.volume = volume.value;
loadTrack(0);

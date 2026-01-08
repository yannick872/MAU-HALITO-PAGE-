// Configurações - ALTERE AQUI O TEMPO DO BOTÃO
const CTA_SHOW_TIME = 60; // Tempo em segundos para mostrar o botão CTA
const CHECKOUT_URL = 'https://pay.lojou.app/p/LuD6c'; // Link do checkout

// Elementos
const video = document.getElementById('vsl-video');
const playOverlay = document.getElementById('play-overlay');
const playButton = document.getElementById('play-button');
const playPauseBtn = document.getElementById('play-pause');
const volumeBtn = document.getElementById('volume-btn');
const progressBar = document.getElementById('progress-bar');
const progressFill = document.getElementById('progress-fill');
const timeDisplay = document.getElementById('time-display');
const ctaSection = document.getElementById('cta-section');
const ctaButton = document.getElementById('cta-button');

// Estado
let ctaShown = false;

// Atualizar link do checkout
ctaButton.href = CHECKOUT_URL;

// Formatar tempo
function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Iniciar vídeo
function startVideo() {
    video.play();
    playOverlay.classList.add('hidden');
}

// Play/Pause toggle
function togglePlayPause() {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
}

// Atualizar ícones de play/pause
function updatePlayPauseIcon() {
    const iconPlay = playPauseBtn.querySelector('.icon-play');
    const iconPause = playPauseBtn.querySelector('.icon-pause');

    if (video.paused) {
        iconPlay.style.display = 'block';
        iconPause.style.display = 'none';
    } else {
        iconPlay.style.display = 'none';
        iconPause.style.display = 'block';
    }
}

// Toggle mute
function toggleMute() {
    video.muted = !video.muted;
    updateMuteIcon();
}

// Atualizar ícone de volume
function updateMuteIcon() {
    const iconVolume = volumeBtn.querySelector('.icon-volume');
    const iconMuted = volumeBtn.querySelector('.icon-muted');

    if (video.muted) {
        iconVolume.style.display = 'none';
        iconMuted.style.display = 'block';
    } else {
        iconVolume.style.display = 'block';
        iconMuted.style.display = 'none';
    }
}

// Atualizar progresso
function updateProgress() {
    const progress = (video.currentTime / video.duration) * 100;
    progressFill.style.width = `${progress}%`;
    timeDisplay.textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`;

    // Mostrar CTA após o tempo definido
    if (video.currentTime >= CTA_SHOW_TIME && !ctaShown) {
        ctaSection.style.display = 'block';
        ctaShown = true;
    }
}

// Seek no vídeo
function seekVideo(e) {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
}

// Event Listeners
playOverlay.addEventListener('click', startVideo);
playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startVideo();
});

video.addEventListener('click', togglePlayPause);
video.addEventListener('play', updatePlayPauseIcon);
video.addEventListener('pause', updatePlayPauseIcon);
video.addEventListener('timeupdate', updateProgress);
video.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = `0:00 / ${formatTime(video.duration)}`;
});

playPauseBtn.addEventListener('click', togglePlayPause);
volumeBtn.addEventListener('click', toggleMute);
progressBar.addEventListener('click', seekVideo);

// Tocar vídeo ao clicar na área (mobile)
video.addEventListener('touchstart', (e) => {
    if (playOverlay.classList.contains('hidden')) {
        togglePlayPause();
    }
});

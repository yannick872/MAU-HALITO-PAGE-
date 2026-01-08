// Configurações - ALTERE AQUI O TEMPO DO BOTÃO
const CTA_SHOW_TIME = 188; // Tempo em segundos para mostrar o botão CTA (3:08)
const CHECKOUT_URL = 'https://pay.lojou.app/p/LuD6c'; // Link do checkout

// Elementos
const video = document.getElementById('vsl-video');
const playOverlay = document.getElementById('play-overlay');
const playButton = document.getElementById('play-button');
const ctaSection = document.getElementById('cta-section');
const ctaButton = document.getElementById('cta-button');

// Estado
let ctaShown = false;

// Atualizar link do checkout
ctaButton.href = CHECKOUT_URL;

// Iniciar vídeo
function startVideo() {
    video.play();
    playOverlay.classList.add('hidden');
}

// Atualizar progresso e mostrar CTA
function updateProgress() {
    // Mostrar CTA após o tempo definido
    if (video.currentTime >= CTA_SHOW_TIME && !ctaShown) {
        ctaSection.style.display = 'block';
        ctaShown = true;
    }
}

// Event Listeners
playOverlay.addEventListener('click', startVideo);
playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startVideo();
});

video.addEventListener('timeupdate', updateProgress);

// Tocar/pausar ao clicar no vídeo
video.addEventListener('click', () => {
    if (video.paused) {
        video.play();
    } else {
        video.pause();
    }
});

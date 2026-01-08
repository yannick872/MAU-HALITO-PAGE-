// Configurações
const CTA_SHOW_TIME = 188; // 3:08
const CHECKOUT_URL = 'https://pay.lojou.app/p/LuD6c';

// Elementos
const video = document.getElementById('vsl-video');
const playOverlay = document.getElementById('play-overlay');
const playButton = document.getElementById('play-button');
const ctaSection = document.getElementById('cta-section');
const ctaButton = document.getElementById('cta-button');

// Elementos de Retomada
const resumeOverlay = document.getElementById('resume-overlay');
const btnContinue = document.getElementById('resume-continue');
const btnRestart = document.getElementById('resume-restart');

// Estado
let ctaShown = false;

// Configurar CTA
ctaButton.href = CHECKOUT_URL;

// --- Lógica de Persistência (Salvar Progresso) ---

// Verificar se há progresso salvo ao carregar
function checkSavedProgress() {
    const savedTime = localStorage.getItem('vslTime');

    if (savedTime && parseFloat(savedTime) > 5) { // Só mostra se assistiu mais de 5s
        // Mostra overlay de retomada
        playOverlay.classList.add('hidden'); // Esconde play normal
        resumeOverlay.style.display = 'flex'; // Mostra resume
    } else {
        // Comportamento padrão (Play Overlay visível)
    }
}

// Salvar progresso a cada 1 segundo
setInterval(() => {
    if (!video.paused && video.currentTime > 0) {
        localStorage.setItem('vslTime', video.currentTime);
    }
}, 1000);

// --- Controles de Retomada ---

btnContinue.addEventListener('click', (e) => {
    e.stopPropagation();
    const savedTime = localStorage.getItem('vslTime');
    if (savedTime) {
        video.currentTime = parseFloat(savedTime);
    }
    resumeOverlay.style.display = 'none';
    video.play();

    // Verifica se CTA já deve aparecer
    if (video.currentTime >= CTA_SHOW_TIME) {
        ctaSection.style.display = 'block';
        ctaShown = true;
    }
});

btnRestart.addEventListener('click', (e) => {
    e.stopPropagation();
    video.currentTime = 0;
    localStorage.removeItem('vslTime');
    resumeOverlay.style.display = 'none';
    video.play();
    ctaSection.style.display = 'none';
    ctaShown = false;
});


// --- Controles Padrão ---

function startVideo() {
    video.play();
    playOverlay.classList.add('hidden');
}

// Listener de progresso para CTA
video.addEventListener('timeupdate', () => {
    if (video.currentTime >= CTA_SHOW_TIME && !ctaShown) {
        ctaSection.style.display = 'block';
        ctaShown = true;
    }
});

playOverlay.addEventListener('click', startVideo);
playButton.addEventListener('click', (e) => {
    e.stopPropagation();
    startVideo();
});

// Bloquear pausa ao clicar (Apenas play se estiver pausado)
video.addEventListener('click', (e) => {
    if (video.paused) {
        video.play();
    }
    // Se estiver tocando, não faz nada (não pausa)
    e.preventDefault();
});

// Inicialização
checkSavedProgress();

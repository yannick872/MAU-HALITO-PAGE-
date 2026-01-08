// --- Configuração do Pixel e CAPI ---
const PIXEL_ID = '882812227628158';

// Inicializa Pixel
!function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ?
        n.callMethod.apply(n, arguments) : n.queue.push(arguments)
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s)
}(window, document, 'script',
    'https://connect.facebook.net/en_US/fbevents.js');

fbq('init', PIXEL_ID);

// --- Helpers CAPI ---
function generateEventId() {
    return 'evt_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

async function sendEvent(eventName, eventId, customData = {}) {
    // 1. Dispara no Browser (Pixel)
    fbq('track', eventName, customData, { eventID: eventId });

    // 2. Dispara no Server (CAPI)
    try {
        const fbp = document.cookie.split('; ').find(row => row.startsWith('_fbp='))?.split('=')[1];
        const fbc = document.cookie.split('; ').find(row => row.startsWith('_fbc='))?.split('=')[1];

        await fetch('/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_name: eventName,
                event_id: eventId,
                event_source_url: window.location.href,
                user_data: { fbp, fbc },
                custom_data: customData
            })
        });
        console.log(`[Tracking] ${eventName} sent (Browser + CAPI)`);
    } catch (e) {
        console.error('[Tracking] CAPI Error:', e);
    }
}

// --- Eventos Automáticos ---

// 1. PageView (Imediato)
const pvId = generateEventId();
sendEvent('PageView', pvId);

// 2. Monitoramento de Vídeo (VSL)
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('vsl-video');
    if (!video) return;

    let hasViewedContent = false;
    let progressMarkers = { 25: false, 50: false, 75: false, 100: false };

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const percent = (video.currentTime / video.duration) * 100;

            // ViewContent (Consideramos visualização após 3 segundos de vídeo)
            if (video.currentTime > 3 && !hasViewedContent) {
                hasViewedContent = true;
                sendEvent('ViewContent', generateEventId(), { content_name: 'VSL Main Video' });
            }

            // Marcos de Progresso (Custom Events)
            if (percent > 25 && !progressMarkers[25]) {
                progressMarkers[25] = true;
                // Exemplo: VideoView25% como custom event se desejado, ou apenas sinal interno
            }
        }
    });

    // 3. InitiateCheckout (Botão de Compra)
    // Monitora cliques em qualquer link que pareça de checkout ou o botão CTA específico
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.cta-button, .checkout-link, a[href*="pay"], a[href*="checkout"]');
        if (btn) {
            sendEvent('InitiateCheckout', generateEventId(), {
                content_name: 'Protocolo Hálito Renovado',
                value: 197.00,
                currency: 'MZN'
            });
        }
    });
});

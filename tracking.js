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

// --- 2. TimeOnPage (Engajamento Temporal) ---
let secondsActive = 0;
let leadFired = false;

setInterval(() => {
    secondsActive += 10;
    // Dispara eventos a cada 30 segundos, até 5 minutos (300s)
    if (secondsActive > 0 && secondsActive % 30 === 0 && secondsActive <= 300) {
        sendEvent('TimeOnPage', generateEventId(), {
            seconds_active: secondsActive,
            content_name: 'Sales Page Timer'
        });
    }

    // LEAD: Dispara após 2 minutos na página (se ainda não disparou)
    if (secondsActive >= 120 && !leadFired) {
        leadFired = true;
        sendEvent('Lead', generateEventId(), {
            lead_type: 'time_on_page',
            seconds_active: secondsActive,
            content_name: 'VSL Engaged Visitor'
        });
    }
}, 10000);


// --- 3. Monitoramento de Vídeo (VSL Avançado) ---
document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('vsl-video');
    if (!video) return;

    let hasViewedContent = false;
    // Marcos de progresso para funil de vídeo
    let markers = { 10: false, 25: false, 50: false, 75: false, 95: false };

    video.addEventListener('timeupdate', () => {
        if (video.duration) {
            const pct = (video.currentTime / video.duration) * 100;

            // ViewContent: Conta como visualização real após 5 segundos
            if (video.currentTime > 5 && !hasViewedContent) {
                hasViewedContent = true;
                sendEvent('ViewContent', generateEventId(), {
                    content_name: 'VSL Main Video',
                    content_category: 'Video Sales Letter'
                });
            }

            // VideoProgress: Dispara nos marcos definidos
            Object.keys(markers).forEach(mark => {
                if (pct >= mark && !markers[mark]) {
                    markers[mark] = true;
                    sendEvent('VideoProgress', generateEventId(), {
                        percentage: mark,
                        video_current_time: Math.floor(video.currentTime),
                        content_name: 'VSL Main Video'
                    });

                    // LEAD via Vídeo: Quem viu 75%+ é lead quente
                    if (mark == 75 && !leadFired) {
                        leadFired = true;
                        sendEvent('Lead', generateEventId(), {
                            lead_type: 'video_75_percent',
                            video_current_time: Math.floor(video.currentTime),
                            content_name: 'Hot VSL Lead'
                        });
                    }
                }
            });
        }
    });

    // Rastreia Play inicial
    video.addEventListener('play', () => {
        // Opcional: Evitar flood se o usuário der play/pause várias vezes
    }, { once: true });

    // --- 4. InitiateCheckout (Botão de Compra) ---
    // Monitora cliques no CTA e Links de pagamento
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.cta-button, .checkout-link, a[href*="pay"], a[href*="checkout"]');
        if (btn) {
            sendEvent('InitiateCheckout', generateEventId(), {
                content_name: 'Protocolo Hálito Renovado',
                value: 197.00,
                currency: 'MZN',
                content_type: 'product'
            });
        }
    });
});

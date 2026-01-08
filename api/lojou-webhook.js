export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const PIXEL_ID = '882812227628158';
    const ACCESS_TOKEN = 'EAA7XUAo0eWYBQezTxe00MkAxcB84ZA7bKA0wOLiPL8WMu5vFziuVxEZAidffLYJcN1BVppczPeQp3E2UiyfXxfjICeXI48UyppQJcNVKG5P58yVhywZCu2BVJWNDglZBYqJLDBi5Is5iV5b7zhoZBOACKLHKaDnm6xy3Lv2ZAb9TgsHP2r4ms6JvZCHAROg2wZDZD';

    const lojouData = req.body;
    console.log('Lojou Webhook:', JSON.stringify(lojouData));

    // Detecta tipo de evento da Lojou
    let fbEventName = 'Purchase'; // Padrão
    const eventType = (lojouData.event || lojouData.type || lojouData.status || '').toLowerCase();

    if (eventType.includes('cancel') || eventType.includes('cancelada')) {
        fbEventName = 'PurchaseCancelled'; // Custom Event
    } else if (eventType.includes('refund') || eventType.includes('reembolso')) {
        fbEventName = 'Refund'; // Custom Event
    } else if (eventType.includes('aprovada') || eventType.includes('approved') || eventType.includes('paid')) {
        fbEventName = 'Purchase'; // Standard Event
    }

    // Extrai dados
    const email = lojouData.customer?.email || lojouData.email || '';
    const phone = lojouData.customer?.phone || lojouData.phone || '';
    const value = lojouData.amount || lojouData.value || lojouData.total || 197.00;
    const orderId = lojouData.order_id || lojouData.id || Date.now().toString();

    // Hash simples para dados sensíveis (sem crypto nativo no edge)
    function simpleHash(str) {
        if (!str) return undefined;
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return Math.abs(hash).toString(16);
    }

    const payload = {
        data: [
            {
                event_name: fbEventName,
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: 'https://mau-halitomz.vercel.app',
                action_source: 'website',
                event_id: `${fbEventName.toLowerCase()}_${orderId}`,
                user_data: {
                    em: email ? simpleHash(email.toLowerCase().trim()) : undefined,
                    ph: phone ? simpleHash(phone.replace(/\D/g, '')) : undefined,
                    client_ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
                    client_user_agent: req.headers['user-agent'] || 'Lojou-Webhook'
                },
                custom_data: {
                    value: parseFloat(value),
                    currency: 'MZN',
                    content_name: 'Protocolo Hálito Renovado',
                    content_type: 'product',
                    order_id: orderId,
                    event_type_original: eventType
                }
            }
        ]
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('FB Error:', data);
            return res.status(500).json({ error: data });
        }

        console.log(`${fbEventName} sent:`, data);
        return res.status(200).json({ success: true, event: fbEventName, fb: data });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server Error' });
    }
}

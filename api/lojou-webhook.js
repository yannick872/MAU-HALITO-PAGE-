export default async function handler(req, res) {
    // Aceita POST da Lojou
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Credenciais Facebook
    const PIXEL_ID = '882812227628158';
    const ACCESS_TOKEN = 'EAA7XUAo0eWYBQezTxe00MkAxcB84ZA7bKA0wOLiPL8WMu5vFziuVxEZAidffLYJcN1BVppczPeQp3E2UiyfXxfjICeXI48UyppQJcNVKG5P58yVhywZCu2BVJWNDglZBYqJLDBi5Is5iV5b7zhoZBOACKLHKaDnm6xy3Lv2ZAb9TgsHP2r4ms6JvZCHAROg2wZDZD';

    // Dados recebidos da Lojou (estrutura pode variar)
    const lojouData = req.body;

    console.log('Lojou Webhook Received:', JSON.stringify(lojouData));

    // Extrai informações relevantes (adapte conforme estrutura real da Lojou)
    const email = lojouData.customer?.email || lojouData.email || '';
    const phone = lojouData.customer?.phone || lojouData.phone || '';
    const value = lojouData.amount || lojouData.value || lojouData.total || 197.00;
    const orderId = lojouData.order_id || lojouData.id || Date.now().toString();

    // Monta payload para Facebook CAPI
    const payload = {
        data: [
            {
                event_name: 'Purchase',
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: 'https://mau-halitomz.vercel.app',
                action_source: 'website',
                event_id: `purchase_${orderId}`,
                user_data: {
                    em: email ? require('crypto').createHash('sha256').update(email.toLowerCase().trim()).digest('hex') : undefined,
                    ph: phone ? require('crypto').createHash('sha256').update(phone.replace(/\D/g, '')).digest('hex') : undefined,
                    client_ip_address: req.headers['x-forwarded-for'] || req.socket?.remoteAddress,
                    client_user_agent: req.headers['user-agent']
                },
                custom_data: {
                    value: parseFloat(value),
                    currency: 'MZN',
                    content_name: 'Protocolo Hálito Renovado',
                    content_type: 'product',
                    order_id: orderId
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
            console.error('Facebook API Error:', data);
            return res.status(500).json({ error: data, lojou_received: true });
        }

        console.log('Purchase Event Sent to Facebook:', data);
        return res.status(200).json({ success: true, fb_response: data });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error', lojou_received: true });
    }
}

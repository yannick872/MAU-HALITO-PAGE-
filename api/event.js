export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { event_name, event_source_url, user_data, custom_data, action_source, event_id } = req.body;

    const PIXEL_ID = '882812227628158';
    const ACCESS_TOKEN = 'EAA7XUAo0eWYBQezTxe00MkAxcB84ZA7bKA0wOLiPL8WMu5vFziuVxEZAidffLYJcN1BVppczPeQp3E2UiyfXxfjICeXI48UyppQJcNVKG5P58yVhywZCu2BVJWNDglZBYqJLDBi5Is5iV5b7zhoZBOACKLHKaDnm6xy3Lv2ZAb9TgsHP2r4ms6JvZCHAROg2wZDZD';

    const payload = {
        data: [
            {
                event_name: event_name,
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: event_source_url,
                action_source: action_source || 'website',
                event_id: event_id,
                user_data: {
                    ...user_data,
                    client_user_agent: req.headers['user-agent'],
                    client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress
                },
                custom_data: custom_data
            }
        ]
    };

    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Facebook API Error:', data);
            return res.status(500).json({ error: data });
        }

        return res.status(200).json({ success: true, fb_response: data });

    } catch (error) {
        console.error('Server Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}

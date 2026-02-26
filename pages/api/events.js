// pages/api/events.js — deploy to Vercel (Pages Router)
export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const body = await req.json();
  const headers = { 'Content-Type': 'application/json' };

  // Pass through url_verification unchanged (required by Feishu)
  if (body.type === 'url_verification') {
    return new Response(JSON.stringify({ challenge: body.challenge }), {
      status: 200,
      headers,
    });
  }

  // Proxy all other events to your local server
  try {
    const localRes = await fetch('http://localhost:8080/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const localBody = await localRes.text();
    return new Response(localBody, {
      status: localRes.status,
      headers,
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Local server unreachable' }), {
      status: 502,
      headers,
    });
  }
}

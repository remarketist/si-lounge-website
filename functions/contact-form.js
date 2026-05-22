// Cloudflare Pages Function — handles Si-Lounge contact form
// Sends submissions to georgiana@si-lounge.ro via MailChannels API (free on Cloudflare Workers/Pages)

export async function onRequest(context) {
  if (context.request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const formData = await context.request.formData();

    const firstName = formData.get('first-name') || '';
    const lastName = formData.get('last-name') || '';
    const name = (firstName + ' ' + lastName).trim() || 'Not provided';
    const email = formData.get('email') || 'Not provided';
    const phone = formData.get('phone') || 'Not provided';
    const eventType = formData.get('event-type') || 'Not specified';
    const guests = formData.get('guests') || 'Not specified';
    const date = formData.get('date') || 'Not specified';
    const message = formData.get('message') || 'None';

    const emailBody = [
      'New Contact Form Submission from Si-Lounge Website',
      '',
      'Name: ' + name,
      'Email: ' + email,
      'Phone: ' + phone,
      'Event Type: ' + eventType,
      'Expected Guests: ' + guests,
      'Preferred Date: ' + date,
      '',
      'Message:',
      message
    ].join('\n');

    const mailRequest = {
      personalizations: [
        { to: [{ email: 'georgiana@si-lounge.ro' }] }
      ],
      from: { email: 'noreply@si-lounge.ro', name: 'Si-Lounge Website' },
      subject: 'New Inquiry from ' + name,
      content: [{ type: 'text/plain', value: emailBody }]
    };

    const response = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(mailRequest)
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('MailChannels error:', response.status, text);
      return new Response('Email sending failed. Please email us directly at georgiana@si-lounge.ro', { status: 500 });
    }

    return new Response(
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sent — Si-Lounge</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9f7f3;color:#1a1714;padding:2rem}.card{text-align:center;max-width:480px}h1{font-size:1.8rem;margin-bottom:0.5rem;font-weight:300}p{color:#6b6964;margin-bottom:2rem}a{color:#9a6e2e;text-decoration:underline}.check{font-size:3rem;margin-bottom:1rem}</style></head><body><div class="card"><div class="check">✓</div><h1>Thank you for reaching out!</h1><p>We\'ve received your message and will get back to you within 24 hours.</p><a href="/">← Back to Si-Lounge</a></div></body></html>',
      { status: 200, headers: { 'content-type': 'text/html' } }
    );

  } catch (err) {
    console.error('Function error:', err.message);
    return new Response('Something went wrong. Please email us directly at georgiana@si-lounge.ro', { status: 500 });
  }
}

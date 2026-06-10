require('dotenv').config();
const express = require('express');
const app     = express();
const PORT    = process.env.PORT || 3000;
const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL;

app.use(express.json());

// Health check — fixes "Cannot GET /" on Render
app.get('/', (req, res) => {
  res.json({ status: 'Webinar Tracker running', time: new Date().toISOString() });
});

// User taps their WhatsApp link
app.get('/join/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const response = await fetch(APPS_SCRIPT_URL, {
      method:   'POST',
      headers:  { 'Content-Type': 'application/json' },
      body:     JSON.stringify({ action: 'join', token }),
      redirect: 'follow',
    });

    const data = await response.json();

    if (data.error || !data.meetUrl) {
      return res.status(404).send('Link not found or expired.');
    }

    console.log(`[JOIN] ${data.name} (${data.phone}) — ${data.session}`);
    return res.redirect(data.meetUrl);

  } catch (err) {
    console.error('[ERROR]', err.message);
    return res.status(500).send('Something went wrong. Please try again.');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

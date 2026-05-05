const express            = require('express');
const router             = express.Router();
const db                 = require('../db');
const { pushAttendance } = require('../services/attendance');

// GET /join?token=xxx — Show confirmation page
router.get('/join', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing token');

  try {
    const result = await db.query(`
      SELECT t.*, w.room_name, w.topic, w.host_name, w.scheduled_at
      FROM "Webinar_On_App".webinar_tokens t
      JOIN "Webinar_On_App".webinars w ON t.webinar_id = w.id
      WHERE t.token = $1
    `, [token]);

    if (!result.rows.length) return res.status(404).send('Invalid or expired link');

    const row = result.rows[0];

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Join Webinar — Genius</title>
        <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: 'Syne', sans-serif; background: #07101C; color: #E8F0FE; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 24px; }
          .card { background: #0D1B2A; border: 1px solid rgba(255,255,255,0.07); border-radius: 20px; padding: 36px 32px; max-width: 420px; width: 100%; }
          .tag { font-family: 'DM Mono', monospace; font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: #00D4FF; margin-bottom: 20px; }
          .name { font-size: 28px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 4px; }
          .sub { font-size: 13px; color: #5A7090; margin-bottom: 24px; font-family: 'DM Mono', monospace; }
          .divider { height: 1px; background: rgba(255,255,255,0.06); margin-bottom: 20px; }
          .info-row { display: flex; justify-content: space-between; font-size: 12px; padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
          .info-row:last-child { border-bottom: none; }
          .info-k { color: #5A7090; }
          .info-v { font-weight: 700; font-family: 'DM Mono', monospace; font-size: 11px; color: #00D4FF; }
          .btn { display: block; width: 100%; padding: 16px; background: #00D4FF; color: #07101C; border: none; border-radius: 12px; font-size: 16px; font-weight: 800; cursor: pointer; font-family: 'Syne', sans-serif; margin-top: 24px; text-align: center; text-decoration: none; transition: opacity 0.2s; }
          .btn:hover { opacity: 0.9; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="tag">Genius Webinar — You are invited</div>
          <div class="name">${row.student_name}</div>
          <div class="sub">${row.parent_phone}</div>
          <div class="divider"></div>
          <div class="info-row"><span class="info-k">Topic</span><span class="info-v">${row.topic}</span></div>
          <div class="info-row"><span class="info-k">Host</span><span class="info-v">${row.host_name}</span></div>
          <div class="info-row"><span class="info-k">Scheduled</span><span class="info-v">${new Date(row.scheduled_at).toLocaleString()}</span></div>
          <div class="info-row"><span class="info-k">Room</span><span class="info-v">${row.room_name}</span></div>
          <a class="btn" href="/enter?token=${token}">🎥 Enter Meeting Now</a>
        </div>
      </body>
      </html>
    `);
  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

// GET /enter?token=xxx — Step 2: mark attended + redirect to Jitsi
router.get('/enter', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Missing token');

  try {
    const result = await db.query(`
      SELECT t.*, w.room_name
      FROM "Webinar_On_App".webinar_tokens t
      JOIN "Webinar_On_App".webinars w ON t.webinar_id = w.id
      WHERE t.token = $1
    `, [token]);

    if (!result.rows.length) return res.status(404).send('Invalid or expired link');

    const row = result.rows[0];

    if (!row.joined) {
      await db.query(`
        UPDATE "Webinar_On_App".webinar_tokens
        SET joined = TRUE, join_time = NOW()
        WHERE token = $1
      `, [token]);

      pushAttendance(row).catch(console.error);
    }

    const jitsiUrl = `https://meet.jit.si/${row.room_name}#userInfo.displayName="${encodeURIComponent(row.student_name)}"`;
    res.redirect(jitsiUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;
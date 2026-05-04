const express = require('express');
const router  = express.Router();
const db      = require('../db');

// POST /api/webinars — Create a new webinar
router.post('/', async (req, res) => {
  const { topic, host_name, scheduled_at, grade, school_ids } = req.body;

  const id        = 'WEB_' + Date.now().toString(36).toUpperCase();
  const room_name = 'GeniusWBR_' + id + '_' + Math.random().toString(36).substr(2, 6);

  try {
    await db.query(`
      INSERT INTO "Webinar_On_App".webinars (id, topic, host_name, scheduled_at, room_name)
      VALUES ($1, $2, $3, $4, $5)
    `, [id, topic, host_name, scheduled_at, room_name]);

    const jitsi_link = `https://meet.jit.si/${room_name}`;
    res.status(201).json({ webinar_id: id, room_name, jitsi_link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create webinar' });
  }
});

// GET /api/webinars — List all webinars
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT * FROM "Webinar_On_App".webinars ORDER BY scheduled_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch webinars' });
  }
});

module.exports = router;
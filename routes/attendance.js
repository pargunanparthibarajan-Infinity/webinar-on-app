const express = require('express');
const router  = express.Router();
const db      = require('../db');

// GET /api/webinars/:webinar_id/attendance — Live dashboard data
router.get('/:webinar_id/attendance', async (req, res) => {
  const { webinar_id } = req.params;

  try {
    const result = await db.query(`
      SELECT
        t.student_name,
        t.parent_phone,
        t.token,
        t.joined,
        t.join_time,
        t.lsq_pushed,
        a.event_type,
        a.created_at AS event_time
      FROM "Webinar_On_App".webinar_tokens t
      LEFT JOIN "Webinar_On_App".attendance_events a ON t.token = a.token
      WHERE t.webinar_id = $1
      ORDER BY t.join_time DESC NULLS LAST
    `, [webinar_id]);

    const rows      = result.rows;
    const joined    = rows.filter(r => r.joined).length;
    const lsq       = rows.filter(r => r.lsq_pushed).length;

    res.json({
      total:      rows.length,
      joined,
      not_joined: rows.length - joined,
      lsq_pushed: lsq,
      attendees:  rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
});

module.exports = router;

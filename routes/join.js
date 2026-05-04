const express             = require('express');
const router              = express.Router();
const db                  = require('../db');
const { pushAttendance }  = require('../services/attendance');

// GET /join?token=xxx — Core join route
router.get('/', async (req, res) => {
  const { token } = req.query;

  if (!token) return res.status(400).send('Missing token');

  try {
    const result = await db.query(`
      SELECT t.*, w.room_name, w.topic
      FROM "Webinar_On_App".webinar_tokens t
      JOIN "Webinar_On_App".webinars w ON t.webinar_id = w.id
      WHERE t.token = $1
    `, [token]);

    if (!result.rows.length) {
      return res.status(404).send('Invalid or expired link');
    }

    const row = result.rows[0];

    // First time join — mark attended
    if (!row.joined) {
      await db.query(`
        UPDATE "Webinar_On_App".webinar_tokens
        SET joined = TRUE, join_time = NOW()
        WHERE token = $1
      `, [token]);

      // Push attendance to DB async — don't block redirect
      pushAttendance(row).catch(console.error);
    }

    // Redirect to Jitsi with name pre-filled
    const jitsiUrl = `https://meet.jit.si/${row.room_name}#userInfo.displayName="${encodeURIComponent(row.student_name)}"`;
    res.redirect(jitsiUrl);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
});

module.exports = router;

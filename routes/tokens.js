const express = require('express');
const router  = express.Router();
const db      = require('../db');
const { v4: uuidv4 } = require('uuid');

// POST /api/webinars/:webinar_id/tokens/generate
router.post('/:webinar_id/tokens/generate', async (req, res) => {
  const { webinar_id }          = req.params;
  const { grade, school_ids }   = req.body;

  try {
    // Pull students from Genius DB
    const students = await db.query(`
      SELECT student_id, student_name, parent_phone
      FROM students
      WHERE grade = $1 AND school_id = ANY($2)
    `, [grade, school_ids]);

    const tokens = [];

    for (const student of students.rows) {
      const token = 'gns_' + uuidv4().replace(/-/g, '').substr(0, 16);
      const link  = `${process.env.BASE_URL}/join?token=${token}`;

      await db.query(`
        INSERT INTO "Webinar_On_App".webinar_tokens
        (token, webinar_id, student_id, student_name, parent_phone)
        VALUES ($1, $2, $3, $4, $5)
      `, [token, webinar_id, student.student_id, student.student_name, student.parent_phone]);

      tokens.push({
        token,
        student_name: student.student_name,
        parent_phone: student.parent_phone,
        link
      });
    }

    res.status(201).json({ generated: tokens.length, tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate tokens' });
  }
});

// GET /api/webinars/:webinar_id/tokens — List tokens for a webinar
router.get('/:webinar_id/tokens', async (req, res) => {
  const { webinar_id } = req.params;

  try {
    const result = await db.query(`
      SELECT token, student_name, parent_phone, joined, join_time, lsq_pushed
      FROM "Webinar_On_App".webinar_tokens
      WHERE webinar_id = $1
      ORDER BY created_at ASC
    `, [webinar_id]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch tokens' });
  }
});

module.exports = router;

const db = require('../db');

// Push attendance event back into Postgres
async function pushAttendance(row) {
  await db.query(`
    INSERT INTO "Webinar_On_App".attendance_events
    (token, student_id, parent_phone, webinar_id, event_type, join_time, source)
    VALUES ($1, $2, $3, $4, 'WEBINAR_ATTENDED', NOW(), 'WEBINAR_TOKEN')
  `, [
    row.token,
    row.student_id,
    row.parent_phone,
    row.webinar_id
  ]);

  await db.query(`
    UPDATE "Webinar_On_App".webinar_tokens
    SET lsq_pushed = TRUE
    WHERE token = $1
  `, [row.token]);

  console.log(`Attendance pushed for token: ${row.token}`);
}

module.exports = { pushAttendance };

-- Run this first in pgAdmin or psql

CREATE SCHEMA IF NOT EXISTS "Webinar_On_App";

CREATE TABLE "Webinar_On_App".webinars (
  id           VARCHAR(20)  PRIMARY KEY,
  topic        VARCHAR(255),
  host_name    VARCHAR(100),
  scheduled_at TIMESTAMP,
  room_name    VARCHAR(100),
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "Webinar_On_App".webinar_tokens (
  token        VARCHAR(32)  PRIMARY KEY,
  webinar_id   VARCHAR(20)  REFERENCES "Webinar_On_App".webinars(id),
  student_id   VARCHAR(50),
  student_name VARCHAR(100),
  parent_phone VARCHAR(15),
  joined       BOOLEAN      DEFAULT FALSE,
  join_time    TIMESTAMP    NULL,
  left_time    TIMESTAMP    NULL,
  lsq_pushed   BOOLEAN      DEFAULT FALSE,
  created_at   TIMESTAMP    DEFAULT NOW()
);

CREATE TABLE "Webinar_On_App".attendance_events (
  id           SERIAL PRIMARY KEY,
  token        VARCHAR(32)  REFERENCES "Webinar_On_App".webinar_tokens(token),
  student_id   VARCHAR(50),
  parent_phone VARCHAR(15),
  webinar_id   VARCHAR(20),
  event_type   VARCHAR(50)  DEFAULT 'WEBINAR_ATTENDED',
  join_time    TIMESTAMP,
  source       VARCHAR(50)  DEFAULT 'WEBINAR_TOKEN',
  created_at   TIMESTAMP    DEFAULT NOW()
);

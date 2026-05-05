const express = require('express');
require('dotenv').config();

const webinarsRouter   = require('./routes/webinars');
const tokensRouter     = require('./routes/tokens');
const joinRouter       = require('./routes/join');
const attendanceRouter = require('./routes/attendance');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/webinars', webinarsRouter);
app.use('/api/webinars', tokensRouter);
app.use('/api/webinars', attendanceRouter);
app.use('/', joinRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
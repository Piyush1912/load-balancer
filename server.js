const express = require('express');
const os = require('os');
const { Pool } = require('pg');

const app = express();
const port = 8080;

const pool = new Pool({
    user: process.env.DB_USER || 'admin',
    host: process.env.DB_HOST || 'database-service',
    database: process.env.DB_NAME || 'my_app_db',
    password: process.env.DB_PASSWORD || 'supersecretpassword',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    connectionTimeoutMillis: 3000,
});

app.get('/', async (req, res) => {
    const serverName = os.hostname();
    const environment = process.env.ENVIRONMENT || process.env.environment || "Unknown Environment";
    let dbStatus = "Checking...";
    let dbTime = "";
    let dbError = "";

    try {
        const result = await pool.query('SELECT NOW()');
        dbStatus = "Connected";
        dbTime = result.rows[0].now;
    } catch (err) {
        dbStatus = "Disconnected";
        dbError = err.message;
    }

    res.send(`
            <div style="font-family: sans-serif; text-align: center; margin-top: 50px;">
                <h1>Hello from the Load Balanced App!</h1>
                <h2>You are talking to Server ID: <span style="color: blue;">${serverName}</span></h2>
                <p><strong>Current Environment:</strong> ${environment}</p>
                <p><strong>Database Connection:</strong> <span style="color: ${dbStatus === 'Connected' ? 'green' : 'red'}; font-weight: bold;">${dbStatus}</span></p>
                ${dbTime ? `<p><strong>Database Time:</strong> ${dbTime}</p>` : ''}
                ${dbError ? `<p style="color: red; font-size: 0.9em;"><strong>Error:</strong> ${dbError}</p>` : ''}
            </div>
        `);
});

app.listen(port, () => {
    console.log(`Test app is listening on port ${port}`);
});
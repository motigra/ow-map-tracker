const express = require('express');
const bodyParser = require('body-parser');
const ip = require("ip");
const config = require("../config.json");
const maps = require('../maps.json').sort();
const DB = require('./db');
const QRCode = require('qrcode');
const stats = require('./stats');

(async () => {

    console.log(`Starting up... ${new Date().toISOString()}`);

    const db = new DB(config.dbFilePath);
    await db.load();

    const app = express();

    app.use(express.static('./public'));
    app.use(bodyParser.json());

    // List maps
    app.get('/maps', (req, res) => {
        res.contentType('application/json');
        res.send(maps);
    });

    // List all records
    app.get('/records', (req, res) => {
        res.send(db.list());
    });

    // List 5 most recent records
    app.get('/records/recent', (req, res) => {
        res.send(db.list().slice(db.size - 6));
    });

    // Get analytics and stats data
    app.get('/stats', (req, res) => {
        try {
            const dataWithSessions = stats.calculateSessions(db.list());
            const data = stats.getGeneralStats(dataWithSessions);
            res.send(data);
        }
        catch (e) {
            console.error(e);
            res.sendStatus(500);
        }
    });

    // Add a new record
    app.post('/records', async (req, res) => {
        try {
            req.body.timestamp = new Date(req.body.timestamp);
            await db.add(req.body);
            res.sendStatus(200);
        }
        catch (e) {
            console.error(e);
            res.sendStatus(400);
        }
    });

    app.listen(config.port, () => {
        console.log(`Example app listening at http://${ip.address()}:${config.port}`);
        QRCode.toString(`http://${ip.address()}:${config.port}`, { type:'terminal' }, function (err, url) {
            console.log(url);
        });
    });

})();

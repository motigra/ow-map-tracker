const express = require('express');
const bodyParser = require('body-parser');
const ip = require("ip");
const config = require("./config.json");
const maps = require('./maps.json').sort();
const DB = require('./db');
const QRCode = require('qrcode');
 
(async () => {

    console.log(`Starting up... ${new Date().toISOString()}`);

    const db = new DB(config.dbFilePath);

    await db.load();

    const app = express();

    app.use(express.static('./public'));
    app.use(bodyParser.json());

    app.get('/maps', (req, res) => {
        res.contentType('application/json');
        res.send(maps);
    });

    app.get('/records', (req, res) => {
        res.send(db.list());
    });

    app.get('/records/recent', (req, res) => {
        res.send(db.list().slice(db.size - 6));
    });

    app.get('/stats', (req, res) => {
        const dataWithSessions = calculateSessions(db.list());
        const stats = getGeneralStats(dataWithSessions);
        res.send(stats);
    });

    app.post('/records', async (req, res) => {
        
        try {
            req.body.timestamp = new Date(req.body.timestamp);
            //console.log(req.body);
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

function getGeneralStats(dataWithSessions) {

    const stats = {};

    const sessions = distinct(dataWithSessions.map(r => r.session));
    const maps = distinct(dataWithSessions.map(r => r.map));

    stats.allRecordsCount = dataWithSessions.length;
    stats.allSessionsCount = sessions.length;
    stats.allMapsCount = maps.length;

    stats.maps = [];
    
    maps.forEach(m => {
        
        const records = dataWithSessions.filter(r => r.map == m);

        stats.maps.push({
            map: m,
            recordsCount: records.length,
            sessionsCount: distinct(records.map(r => r.session)).length
        });
        
    });

    stats.maps = stats.maps.sort((a, b) => { return b.recordsCount - a.recordsCount });

    return stats;

}

function distinct(array) {
    return array.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}

function calculateSessions(data) {

    const sorted = data.sort((a, b) => { return a-b });

    let session = 1, last = null;

    const withSessions = sorted.map(r => {

        if(last && (r.timestamp - last > (1000*60*60))) {
            session++;
        }

        r.session = session;
        last = r.timestamp;
        return r;

    });

    return withSessions;

}

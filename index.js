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

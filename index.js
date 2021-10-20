const fs = require('fs').promises;
const express = require('express');

const config = {
    dbFilePath: './db.csv',
    port: 3000
};

const maps = [
    'Blizzard World',
    'Busan',
    'Dorado',
    'Eichenwalde',
    'Hanamura',
    'Havana',
    'Hollywood',
    'Horizon',
    'Ilios',
    'Junkertown',
    'Kings Row',
    'Lijiang Tower',
    'Nepal',
    'Numbani',
    'Rialto',
    'Volskaya',
    'Watchpoint',
    'Oasis',
    'Paris',
    'Route 66'
].sort();

class DB {

    constructor() {
        this.ready = false;
        this._cache = [];
    }

    async load() {
        const raw = await fs.readFile(config.dbFilePath, { encoding: 'utf8' });
        this._cache = raw.split('\n').slice(1).filter(r => {
            return r && r.trim().length > 0;
        }).map(r => {
            const cells = r.split(',');
            return { timestamp: new Date(cells[0].trim()), map: cells[1].trim() };
        });
        this.ready = true;
    }

    list() {
        return this._cache;
    }

    async add(record) {
        this._cache.push(record);
        await fs.appendFile(config.dbFilePath, `\n${record.timestamp.toISOString()},${record.map}`, { encoding: 'utf8' });
    }
}

const db = new DB();

(async () => {

    console.log(`Starting up... ${new Date().toISOString()}`);

    await ensureDbFileExists();

    await db.load();

    console.table(db.list());

    const app = express();

    app.use(express.static('./public'));

    app.get('/maps', (req, res) => {
        res.contentType('application/json');
        res.send(maps);
    });

    app.get('/records', (req, res) => {
        res.send(db.list());
    });

    app.listen(config.port, () => {
        console.log(`Example app listening at http://localhost:${config.port}`);
    });

})();


async function ensureDbFileExists() {
    console.log('Ensuring DB file exists');
    try {
        await fs.access(config.dbFilePath);
        console.log(`Found DB file at ${config.dbFilePath}`);
    }
    catch (e) {
        await fs.writeFile(config.dbFilePath, 'date,map', { encoding: 'utf8' });
        console.log(`Created new DB file at ${config.dbFilePath}`);
    }
}
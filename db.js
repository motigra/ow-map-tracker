/**
 * Simple CSV-based database
 * -------------------------
 * 
 * Author: Moti Granovsky, 2021
 * 
 * Used to store the date/map key-value-pairs to a csv file,
 * while keeping an in-memory cache of that data while the app is running.
 */

const fs = require('fs').promises;

class DB {

    constructor(dbFilePath) {
        this.ready = false;
        this._dbFilePath = dbFilePath;
        this._cache = [];
    }

    async load() {
        await ensureDbFileExists(this._dbFilePath);
        const raw = await fs.readFile(this._dbFilePath, { encoding: 'utf8' });
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
        await fs.appendFile(this._dbFilePath, `\n${record.timestamp.toISOString()},${record.map}`, { encoding: 'utf8' });
    }
}

async function ensureDbFileExists(dbFilePath) {
    //console.log('Ensuring DB file exists');
    try {
        await fs.access(dbFilePath);
        //console.log(`Found DB file at ${dbFilePath}`);
    }
    catch (e) {
        await fs.writeFile(dbFilePath, 'date,map', { encoding: 'utf8' });
        //console.log(`Created new DB file at ${dbFilePath}`);
    }
}

module.exports = DB;

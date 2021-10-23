/**
 * Stats/Analytics Module
 * ----------------------
 * 
 * Author: Moti Granovsky, 2021
 * 
 * Used to analyze the data in various ways
 */

 function distinct(array) {
    return array.filter((value, index, self) => {
        return self.indexOf(value) === index;
    });
}

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

module.exports = {
    getGeneralStats,
    calculateSessions
}

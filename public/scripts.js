console.log('client application is running');

document.addEventListener('DOMContentLoaded', async (event) => {
    const maps = await get('/maps');
    console.log(maps);
    renderButtons(maps);
    await getRecent();
    hideOverlay();

    const lockSwitch = document.getElementById('lockSwitch');
    lockSwitch.addEventListener('change', (event) => {
        if (event.currentTarget.checked) {
            lockButtons();
        }
        else {
            unlockButtons();
        }
    });

    const statsSwitch = document.getElementById('statsSwitch');
    statsSwitch.addEventListener('change', async (event) => {
        if (event.currentTarget.checked) {
            showOverlay();
            const stats = await get('/stats');
            renderStats(stats);
            statsMode();
            hideOverlay();
        }
        else {
            showOverlay();
            logMode();
            hideOverlay();
        }
    });

});

function renderStats(stats) {

    const totalRecordsElement = document.getElementById('totalRecords');
    const totalSessionsElement = document.getElementById('totalSessions');
    const totalMapsElement = document.getElementById('totalMaps');
    const mapStatsElement = document.getElementById('mapStats');

    totalRecordsElement.innerText = stats.allRecordsCount;
    totalSessionsElement.innerText = stats.allSessionsCount;
    totalMapsElement.innerText = stats.allMapsCount;

    mapStatsElement.innerHTML = '';

    stats.maps.forEach(m => {
        const row = document.createElement('tr');
        row.setAttribute('class', 'stats-table-row');
        row.innerHTML = `<td>${m.map}</td><td>${m.recordsCount}</td><td>${m.sessionsCount}</td>`;
        mapStatsElement.appendChild(row);
    });
}

async function getRecent() {
    const recent = await get('/records/recent');
    recent.forEach(r => {
        r.timestamp = new Date(r.timestamp);
    });
    recent.reverse();
    console.log(recent);

    const container = document.getElementById('recentContainer');
    container.innerHTML = '';
    recent.forEach(r => {
        const row = document.createElement('tr');
        row.setAttribute('class', 'recent-row');
        row.innerHTML = `<td>${r.map}</td><td>${r.timestamp.toLocaleString()}</td>`;
        container.appendChild(row);
    });
}

function lockButtons() {
    Array.prototype.forEach.call(document.getElementsByClassName('button'), b => { b.disabled = true });
}

function unlockButtons() {
    Array.prototype.forEach.call(document.getElementsByClassName('button'), b => { b.disabled = false });
}

function showOverlay() {
    document.getElementById('overlay').style.display = 'block';
}

function hideOverlay() {
    document.getElementById('overlay').style.display = 'none';
    document.getElementById('status-ok').style.display = 'none';
    document.getElementById('status-error').style.display = 'none';
}

function showStatusOk() {
    document.getElementById('status-ok').style.display = 'inline-block';
}

function showStatusError() {
    document.getElementById('status-error').style.display = 'inline-block';
}

function statsMode() {
    document.getElementById('buttonsSection').style.display = 'none';
    document.getElementById('recentSection').style.display = 'none';
    document.getElementById('statsSection').style.display = 'block';
}

function logMode() {
    document.getElementById('buttonsSection').style.display = 'block';
    document.getElementById('recentSection').style.display = 'block';
    document.getElementById('statsSection').style.display = 'none';
}

async function buttonHandler(map) {
    showOverlay();
    console.log(`clicked on ${map}`);
    try {
        const record = { map, timestamp: new Date() };
        await post('/records', record);
        showStatusOk();
        console.log('record saved!');
        await getRecent();
    }
    catch (e) {
        console.error('failed to save record');
        console.error(e);
        showStatusError();
    }
    setTimeout(() => {
        hideOverlay();
    }, 5000);
}

function renderButtons(maps) {
    const container = document.getElementById('buttonContainer');
    container.innerHTML = '';
    maps.forEach(m => {
        const button = document.createElement('input');
        button.setAttribute('type', 'button');
        button.setAttribute('class', 'button');
        button.setAttribute('value', m);
        button.onclick = () => { buttonHandler(m); };
        const div = document.createElement('div');
        div.appendChild(button);
        container.appendChild(div);
    });
}

function get(url) {
    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        oReq.onload = (ev) => {
            try {
                resolve(JSON.parse(oReq.responseText));
            }
            catch (e) {
                reject(e);
            }
        };
        oReq.open("GET", url);
        oReq.send();
    });
}

function post(url, body) {
    return new Promise((resolve, reject) => {
        var oReq = new XMLHttpRequest();
        oReq.onload = (ev) => {
            try {
                console.log(oReq.response);
                resolve();
            }
            catch (e) {
                reject (e);
            }
        };
        oReq.open("POST", url);
        oReq.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        oReq.send(JSON.stringify(body));
    });
}

import * as xhr from './xhr.js';
import { generateRow } from './table.js';

console.log('client application is running');

document.addEventListener('DOMContentLoaded', async (event) => {
    
    await renderButtons();
    await renderRecent();
    hideOverlay();

    const lockSwitch = document.getElementById('lockSwitch');
    lockSwitch.addEventListener('change', (event) => {
        toggleLock(event.currentTarget.checked)
    });

    const statsSwitch = document.getElementById('statsSwitch');
    statsSwitch.addEventListener('change', async (event) => {
        if (event.currentTarget.checked) {
            showOverlay();
            renderStats();
            hideOverlay();
        }
        toggleMode(event.currentTarget.checked);
    });

});

/* Renderers */

async function renderButtons() {

    const maps = await xhr.get('/maps');

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

async function renderStats() {

    const stats = await xhr.get('/stats');

    const totalRecordsElement = document.getElementById('totalRecords');
    const totalSessionsElement = document.getElementById('totalSessions');
    const totalMapsElement = document.getElementById('totalMaps');
    const mapStatsElement = document.getElementById('mapStats');

    totalRecordsElement.innerText = stats.allRecordsCount;
    totalSessionsElement.innerText = stats.allSessionsCount;
    totalMapsElement.innerText = stats.allMapsCount;

    mapStatsElement.innerHTML = '';

    stats.maps.forEach(m => {
        m.recordsPercent = Math.round(m.recordsCount / stats.allRecordsCount * 100);
        m.sessionsPercent = Math.round(m.sessionsCount / stats.allSessionsCount * 100);
        generateRow([m.map, `${m.recordsCount} (${m.recordsPercent}%)`, `${m.sessionsCount} (${m.sessionsPercent}%)`], mapStatsElement);
    });
}

async function renderRecent() {
    const recent = await xhr.get('/records/recent');
    recent.forEach(r => {
        r.timestamp = new Date(r.timestamp);
    });
    recent.reverse();
    console.log(recent);

    const container = document.getElementById('recentContainer');
    container.innerHTML = '';
    recent.forEach(r => {
        generateRow([r.map, r.timestamp.toLocaleString()], container);
    });
}

/* Overlay */

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

/* Toggles */

function toggleLock(lock) {
    Array.prototype.forEach.call(document.getElementsByClassName('button'), b => { b.disabled = lock });
}

function toggleMode(stats) {
    document.getElementById('buttonsSection').style.display = stats ? 'none' : 'block';
    document.getElementById('recentSection').style.display = stats ? 'none' : 'block';
    document.getElementById('statsSection').style.display = stats ? 'block' : 'none';
}

/* Event handlers */

async function buttonHandler(map) {
    showOverlay();
    console.log(`clicked on ${map}`);
    try {
        const record = { map, timestamp: new Date() };
        await xhr.post('/records', record);
        showStatusOk();
        console.log('record saved!');
        await renderRecent();
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

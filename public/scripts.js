console.log('client application is running');

document.addEventListener('DOMContentLoaded', async (event) => {
    const maps = await get('/maps');
    console.log(maps);
    renderButtons(maps);
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
});

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
}

async function buttonHandler(map) {
    showOverlay();
    console.log(`clicked on ${map}`);
    try {
        const record = { map, timestamp: new Date() };
        await post('/records', record);
        console.log('record saved!');
        setTimeout(() => {
            hideOverlay();
        }, 5000);
    }
    catch (e) {
        console.error('failed to save record');
        console.error(e);
        hideOverlay();
    }
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

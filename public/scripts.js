console.log('client application is running');

document.addEventListener('DOMContentLoaded', async (event) => {

    const maps = await get('/maps');

    console.log(maps);

    renderButtons(maps);
    
});

function buttonHandler(map) {
    console.log(`clicked on ${map}`);
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
        }
        oReq.open("GET", url);
        oReq.send();
    });
}
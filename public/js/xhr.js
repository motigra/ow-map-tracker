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

export { get, post };

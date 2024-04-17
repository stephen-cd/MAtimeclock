const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const log = require('electron-log');
const cron = require('cron');

// configurable variables here////////////////////
const dbUpdateTime = '0 0 17 * * *';
const manualUpdate = false;
const host = 'http://127.0.0.1:8000/update-db/';
//////////////////////////////////////////////////

const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('db.sqlite3');

async function getAllEmployees() {
    let statement = 'SELECT * FROM timeclock_employee';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function getAllJobs() {
    let statement = 'SELECT * FROM timeclock_job';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function getAllHours() {
    let statement = 'SELECT * FROM timeclock_hours';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function prepareDataForUpdate() {
    return Promise.all([await getAllEmployees(), await getAllJobs(), await getAllHours()]);
}

async function updateWebServer() {
    return new Promise(async (resolve, reject) => {
        let csrf_token;
        const get = await fetch(host, {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Accept': 'text/html; charset=utf-8'
            }
        })
        if (get.ok) {
            get.text().then((response) => {
                csrf_token = response
                prepareDataForUpdate().then(async (res) => {
                    const post = await fetch(host, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8;',
                            'X-CSRFToken': csrf_token,
                        },
                        body: JSON.stringify(res)
                    })
                    if (post.ok) resolve('success');
                    else reject(post.status);
                })
            })
        }
        else reject(get.status);
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        log.error(err);
    })
}

function setUpdateJob() {
    if (!manualUpdate) {
        new cron.CronJob (
            dbUpdateTime,
            updateWebServer,
            console.log('job initiated'),
            true,
            'America/New_York'
        );
    }
}

app.whenReady().then(() => {
    const myWindow = new BrowserWindow({
        width: 800,
        height: 512,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
    });
    myWindow.loadFile('templates/index.html');
    myWindow.setMenuBarVisibility(false);
    log.initialize();
    log.transports.file.resolvePathFn = () => path.join(__dirname, '/logs/main.log');
    setUpdateJob();
})

ipcMain.on('manual-update', (e, arg) => {
    e.sender.send('manual-update-reply', [manualUpdate, host]);
})
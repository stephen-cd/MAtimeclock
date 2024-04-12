const { app, BrowserWindow } = require('electron');
const log = require('electron-log');
const path = require('path');

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
    const log = require('electron-log');
    log.initialize();
    log.transports.file.resolvePathFn = () => path.join(__dirname, '/logs/main.log');
})
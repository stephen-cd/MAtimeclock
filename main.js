const { app, BrowserWindow } = require('electron');
const path = require('path');
const log = require('electron-log');

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
})
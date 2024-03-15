const { app, BrowserWindow } = require('electron');

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
})
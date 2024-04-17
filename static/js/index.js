const { ipcRenderer } = require('electron')
import { getEmployees, getClockedInEmployees, forceClockOut, updateWebServer } from "./transactions.js";
const dns = require('dns');

dns.resolve('www.google.com', (err) => {
    if (err) {
        new window.Notification('Warning', { body: 'Offline - Internet connection required to sync to web server.' });
    }
})

ipcRenderer.send('manual-update', []);
ipcRenderer.on('manual-update-reply', (e, args) => {
    sessionStorage['manualUpdate'] = args[0];
    sessionStorage['host'] = args[1];
})

if (sessionStorage['manualUpdate'] == 'true') updateWebServer();

let employeeList;
// Retrieve the employees
await getEmployees().then((res) => {
    employeeList = res;
});

if (employeeList.length == 0) {
    window.location.href = '../templates/manager-add-employee.html';
}

let pin = document.getElementById('pin');
let enter = document.getElementById('enter');
let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let admins = employeeList.filter(employee => employee['manager']);
let employees = employeeList.filter(employee => !employee['manager']);
let adminPins = admins.map(admin => admin['pin']);
let employeePins = employees.map(employee => employee['pin']);
let backspace = document.getElementById('backspace');
let currentlyClockedInEmployees = document.getElementById('currently-clocked-in-employees');
sessionStorage.setItem('backToMO', 'false');

function currentMsToTime(ms) {
    let totalSeconds = Math.floor(ms / 1000);
    var seconds = Math.floor((ms / 1000) % 60);
    var minutes = Math.floor((ms / (1000 * 60)) % 60);
    var hours = Math.floor((ms / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return [hours, minutes, seconds, totalSeconds];
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    }
    else{
        return valString;
    }
}

// Retrieve clocked in employees
await getClockedInEmployees().then((res) => {
    // Append clocked in employees to Currently Clocked In section
    res.forEach(employee => {
        let forceClockedOutEmployees = [];
        let date = employee['date'];
        let startTime = employee['start_time'];
        let currentTime = new Date();
        let startTimeDate = new Date(`${date}T${startTime}`);
        if (currentTime.getDate() != startTimeDate.getDate()) {
            forceClockOut(employee['pin'], employee['start_time'].substring(0, employee['start_time'].length - 3)).then((res) => {
                forceClockedOutEmployees.push(res);
            })
        }
        let row = document.createElement('li');
        let name = document.createElement('span');
        let job = document.createElement('span');
        let first_initial = `${employee['first_name'][0].toUpperCase()}`;
        let last_name  = employee['last_name'];
        if (last_name.length > 14) last_name = last_name.substring(0, 15);
        name.innerText = `${first_initial}. ${last_name}`;
        let jobId = employee['job_id'];
        job.innerText = `${jobId}`;
        let timer = document.createElement('span');
        let hours = document.createElement('span');
        let minutes = document.createElement('span');
        row.appendChild(name);
        row.appendChild(job);
        timer.appendChild(hours);
        timer.appendChild(minutes);
        row.appendChild(timer);
        currentlyClockedInEmployees.appendChild(row);
        let elapsedTime = new Date(currentTime - startTimeDate).getTime();
        elapsedTime = currentMsToTime(elapsedTime);
        hours.innerText = elapsedTime[0];
        minutes.innerText = elapsedTime[1];
        let totalSeconds = elapsedTime[3];
        hours.appendChild(document.createTextNode(':'));
        setInterval(() => {
            ++totalSeconds;
            minutes.innerHTML = pad(parseInt(totalSeconds/60) % 60);
            hours.innerHTML = `${pad(parseInt(totalSeconds/3600))}:`;
        }, 1000)
    })
})

// Add event listeners to each keypad button to append corresponding number to pin value when pressed
keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (pin.style.outline) pin.style.outline = '';
        pin.value = pin.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    pin.value = pin.value.substring(0, pin.value.length - 1);
})

// When Enter is clicked
enter.addEventListener('click', () => {
    // Invalid PIN
    if (!adminPins.includes(pin.value) && !employeePins.includes(pin.value)) {
        enter.style.backgroundColor = 'crimson';
        enter.innerText = 'Invalid';
        enter.disabled = true;
        setTimeout(() => {
            enter.style.backgroundColor = '#13c296';
            enter.innerText = 'Enter';
            pin.value = '';
            enter.disabled = false;
        }, 1000);
    }

    // Admin PIN detected
    else if (adminPins.includes(pin.value)) {
        let user = employeeList.filter(employee => employee['pin'] == pin.value)[0];
        sessionStorage.setItem('first_name', user['first_name']);
        sessionStorage.setItem('pin', user['pin']);
        sessionStorage.setItem('manager', user['manager']);
        enter.parentElement.href = '../templates/manager.html';
    }

    // Employee PIN detected
    else if (employeePins.includes(pin.value)) {
        let user = employeeList.filter(employee => employee['pin'] == pin.value)[0];
        sessionStorage.setItem('first_name', user['first_name']);
        sessionStorage.setItem('pin', user['pin']);
        sessionStorage.setItem('manager', user['manager']);
        enter.parentElement.href = '../templates/timeclock.html';
    }
})
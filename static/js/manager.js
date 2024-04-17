import { getJobs } from "./transactions.js";
import { manualUpdate } from "../../config.js";

let timeClock = document.getElementById('time-clock');
let managerOptions1 = document.getElementById('manager-options-1');
let back = document.getElementById('back');
let managerOptions2 = document.getElementById('manager-options-2');
let goToMO2 = document.getElementById('go-to-MO2');
let managerName = sessionStorage['first_name'];
let welcomeMessage = document.getElementById('welcome-message');
let editJobs = document.getElementById('manager-edit-job');
let jobs;
let activeJobs;
let logout = document.getElementById('home');

manualUpdate ? (logout.innerText = 'Log Out & Save', logout.style.width = '200px') : 'Log Out';

if (sessionStorage.getItem('backToMO') == 'true') {
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
}
else {
    managerOptions1.style.display = 'flex';
    managerOptions2.style.display = 'none';
    back.hidden = true;
}

getJobs().then((res) => {
    jobs = res.map(job => job['job_id']);
    activeJobs = res.filter(job => job['status'] == 'active').map(job => job['job_id']);
})

welcomeMessage.innerText = `Welcome Manager - ${managerName}`;

back.addEventListener('click', () => {
    managerOptions1.style.display = 'flex';
    managerOptions2.style.display = 'none';
    back.hidden = true;
});

timeClock.addEventListener('click', () => {
    if (activeJobs.length == 0) {
        timeClock.parentElement.removeAttribute('href');
        timeClock.style.backgroundColor = 'red';
        timeClock.innerText = 'No Active Jobs';
        setTimeout(() => {
            timeClock.style.backgroundColor = '#13c296';
            timeClock.innerText = 'Time Clock';
        }, 1000);
        return;
    }
    timeClock.parentElement.setAttribute('href', 'timeclock.html');
})

goToMO2.addEventListener('click', () => {
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
})

editJobs.addEventListener('click', () => {
    if (jobs.length == 0) {
        editJobs.parentElement.removeAttribute('href');
        editJobs.style.backgroundColor = 'red';
        editJobs.innerText = 'No Jobs';
        setTimeout(() => {
            editJobs.style.backgroundColor = '#13c296';
            editJobs.innerText = 'Edit Job';
        }, 1000);
        return;
    }
    editJobs.parentElement.setAttribute('href', 'manager-edit-job.html');
})
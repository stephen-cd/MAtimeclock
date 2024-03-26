import { getJobs } from "./transactions.js";

let timeClock = document.getElementById('time-clock');
let managerOptions1 = document.getElementById('manager-options-1');
let back = document.getElementById('back');
let managerOptions2 = document.getElementById('manager-options-2');
let goToMO2 = document.getElementById('go-to-MO2');
let managerName = sessionStorage['first_name'];
let welcomeMessage = document.getElementById('welcome-message');
let editJobs = document.getElementById('manager-edit-job');

if (sessionStorage.getItem('backToMO') == 'true') {
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
}

getJobs().then((res) => {
    sessionStorage['jobs'] = res.map(job => job['job_id']);
})

welcomeMessage.innerText = `Welcome Manager - ${managerName}`;

back.addEventListener('click', () => {
    managerOptions1.style.display = 'flex';
    managerOptions2.style.display = 'none';
    back.hidden = true;
});

timeClock.addEventListener('click', () => {
    back.parentElement.href = 'manager.html';
})

goToMO2.addEventListener('click', () => {
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
})

editJobs.addEventListener('click', () => {
    if (sessionStorage['jobs'].length == 0) {
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
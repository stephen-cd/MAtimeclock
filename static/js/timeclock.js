import { getJobs, clockIn, checkIfClockedIn, clockOut } from './transactions.js';

let welcomeHolder = document.getElementById('welcome-holder');
let welcomeMessage = document.getElementById('welcome-message');
let clockIntoJob = document.getElementById('clock-into-job');
let clockOutBtn = document.getElementById('clock-out');
let clockIntoJobsHolder = document.getElementById('clock-into-jobs-holder');
let clockIntoJobs = document.getElementById('clock-into-jobs');
let clockInBtn = document.getElementById('clock-in');
let successHolder = document.getElementById('success-holder');
let successMessage = document.getElementById('success-message');
let selectedJob;
let clockedIn;
let clockedInJob;
let workSessionId;
let logout = document.getElementById('logout');
let back = document.getElementById('back');

if (sessionStorage['manager'] == '1') {
    let backToTimeClock = () => {
        clockIntoJobsHolder.style.display = 'none';
        welcomeHolder.style.display = 'flex';
        back.removeEventListener('click', backToTimeClockInstance);
        setTimeout(() => {
            back.parentElement.setAttribute('href', 'manager.html');
        }, 200);
    }
    let backToTimeClockInstance = backToTimeClock;
    back.style.display = 'block';
    clockIntoJob.addEventListener('click', () => {
        back.parentElement.removeAttribute('href');
        back.addEventListener('click', backToTimeClockInstance);
    })
}

logout.addEventListener('click', () => {
    sessionStorage.clear();
    window.location.href = '../templates/index.html';
})

checkIfClockedIn(sessionStorage['pin']).then((res) => {
    if (res.length > 0) { clockedIn = true; clockedInJob = res[0]['job_id']; workSessionId = res[0]['id'] }
    else if (res.length == 0) clockedIn = false;

    if (clockedIn) {
        clockOutBtn.style.display = 'block';
        welcomeMessage.innerText = `Hi ${sessionStorage['first_name']}, you are currently working on Job ${clockedInJob}. Would you like to clock out?`;
        clockOutBtn.addEventListener('click', () => {
            clockOut(workSessionId);
            welcomeHolder.style.display = 'none';
            clockIntoJobsHolder.style.display = 'none';
            successHolder.style.display = 'flex';
            successMessage.innerHTML = `You have clocked out of <span id="success-subject">Job ${clockedInJob}</span>.<br><br>Logging out...`;
            setTimeout(() => {
                successHolder.style.display = '';
                window.location.href = '../templates/index.html';
            }, 3000);
        })
    }
    else if (!clockedIn) {
        clockIntoJob.style.display = 'block';
        welcomeMessage.innerText = `Hi ${sessionStorage['first_name']}, you are not currently working on any job. Would you like to clock in?`;
        clockIntoJob.addEventListener('click', () => {
            welcomeHolder.style.display = 'none';
            clockIntoJobsHolder.style.display = 'flex';
            getJobs().then((res) => {
                let numberOfJobs = res.length;
                numberOfJobs == 1 ? clockIntoJobs.setAttribute('size', '2') : clockIntoJobs.setAttribute('size', numberOfJobs);
                res.forEach(job => {
                    let option = document.createElement('option');
                    option.setAttribute('value', job['job_id']);
                    option.innerText = job['job_id'];
                    clockIntoJobs.appendChild(option);
                })
            })
        })
        
        clockIntoJobs.addEventListener('change', () => {
            if (clockIntoJobs.style.border) clockIntoJobs.style.border = '';
            selectedJob = clockIntoJobs.value;
        })
        
        clockInBtn.addEventListener('click', () => {
            clockIn(sessionStorage['pin'], selectedJob);
            clockIntoJobsHolder.style.display = 'none';
            successHolder.style.display = 'flex';
            successMessage.innerHTML = `You are now clocked in for <span id="success-subject">Job ${selectedJob}</span>.<br><br>Logging out...`;
            setTimeout(() => {
                successHolder.style.display = '';
                window.location.href = '../templates/index.html';
            }, 3000);
        })
    }
})
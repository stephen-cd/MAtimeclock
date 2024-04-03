import { addJob, getJobs } from "./transactions.js";

let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let job = document.getElementById('job');
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let enter = document.getElementById('enter');
let backspace = document.getElementById('backspace');
let mainBody = document.getElementById('main-body')
let jobs;

sessionStorage['backToMO'] = 'true';

getJobs().then((res) => {
    jobs = res.map(job => job['job_id']);
})

keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (job.style.outline) job.style.outline = '';
        job.value = job.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    job.value = job.value.substring(0, job.value.length - 1);
})

enter.addEventListener('click', () => {
    if (!job.value) {
        job.style.outline = '2px solid red';
        return;
    }
    if (jobs.includes(job.value)) {
        job.value = '';
        job.placeholder = 'Job ID is currently in use';
        job.style.outline = '2px solid red';
        setTimeout(() => {
            job.placeholder = 'ID for new job';
            job.style.outline = '';
        }, 2000);
        return;
    }
    addJob(job.value);
    successMessage.innerHTML = `<span id='success-subject'>Job ${job.value}</span> added successfully.`;
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
})
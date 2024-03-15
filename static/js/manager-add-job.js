import { addJob } from "./transactions.js";

let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let job = document.getElementById('job');
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let enter = document.getElementById('enter');
let backspace = document.getElementById('backspace');
let mainBody = document.getElementById('main-body')

keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (job.style.border) job.style.border = '';
        job.value = job.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    job.value = job.value.substring(0, job.value.length - 1);
})

enter.addEventListener('click', () => {
    if (!job.value) {
        job.style.border = '2px solid red';
        return;
    }
    addJob(job.value);
    successMessage.innerHTML = `Job <span id='success-subject'>${job.value}</span> added successfully.`;
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
})
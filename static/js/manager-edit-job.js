import { getJobs, editJobId, editJobStatus, removeJob } from "./transactions.js";

let jobDict = {};
let backspace = document.getElementById('backspace');
sessionStorage.setItem('backToMO', 'true');
let numberOfJobs;
let selectJob = document.getElementById('select-job');
let mainBody = document.getElementById('main-body');
let jobSelectNext = document.getElementById('job-select-next');
let editingJob = document.getElementById('editing-job');
let selectJobHolder = document.getElementById('select-job-holder');
let editJobOptions = document.getElementById('edit-job-options');
let jobId;
let status;
let selectedID;
let editJobIdEnter = document.getElementById('edit-job-id');
let keypadHolder = document.getElementById('keypad-holder');
let changeJobId = document.getElementById('change-job-id');
let completeOrReopenJob = document.getElementById('complete-or-reopen-job');
let removeJobBtn = document.getElementById('remove-job');
let completeOrReopenJobHolder = document.getElementById('complete-or-reopen-job-holder');
let removeJobHolder = document.getElementById('remove-job-holder');
let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let job = document.getElementById('job');
let backToJob = document.getElementById('back-to-job');
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let completeOrReopenJobEnter = document.getElementById('complete-or-reopen-job-enter');
let removeJobEnter = document.getElementById('remove-job-enter');
let editAnotherJob = document.getElementById('edit-another-job');

await getJobs().then((res) => {
    numberOfJobs = res.length;
    // if (numberOfJobs == 0) {
    //     mainBody.style.display = 'none';
    //     noJobs.style.display = 'flex';
    //     setTimeout(() => {
    //         window.location.href = '../templates/manager.html';
    //     }, 2000);
    // }
    numberOfJobs > 1 ? selectJob.setAttribute('size', numberOfJobs) : selectJob.setAttribute('size', 2)
    res.forEach(job => {
        let jobEntry = {};
        jobEntry['jobId'] = job['job_id'];
        jobEntry['status'] = job['status'];
        jobDict[job['id']] = jobEntry;
        let option = document.createElement('option');
        option.setAttribute('value', job['id']);
        option.innerText = `${job['job_id']} ${job['status']}`;
        selectJob.appendChild(option);
    })
})

let backToJobSelect = () => {
    selectJobHolder.style.display = 'flex';
    editJobOptions.style.display = 'none';
    back.removeEventListener('click', backToJobSelectInstance);
    // back.removeEventListener('click', resetNameInstance);
    sessionStorage.setItem('backToMO', 'true');
    setTimeout(() => { back.parentElement.setAttribute('href', 'manager.html'); }, 200);
}

let backToJobOptions = (currentPage) => {
    editJobOptions.style.display = 'flex';
    currentPage.style.display = 'none';
    if (currentPage == keypadHolder) job.value = jobId;
    back.removeEventListener('click', backToJobOptionsInstance);
    back.addEventListener('click', backToJobSelect);
}

let backToJobSelectInstance = backToJobSelect;
let backToJobOptionsInstance = backToJobOptions;

jobSelectNext.addEventListener('click', () => {
    selectJobHolder.style.display = 'none';
    editJobOptions.style.display = 'flex';
    let options = [...document.querySelectorAll('option')];
    selectedID = options.filter(option => option.selected)[0].value;
    jobId = jobDict[selectedID]['jobId'];
    status = jobDict[selectedID]['status'];
    editingJob.innerText = `Editing Job: ${jobId}`;
    if (status == 'active') {
        completeOrReopenJob.innerText = 'Complete Job';
        completeOrReopenJobHolder.firstElementChild.innerHTML = `Change status of job ${jobId} to complete?`;
        completeOrReopenJobEnter.innerText = 'Complete'
    }
    else if (status == 'complete') {
        completeOrReopenJob.innerText = 'Reopen Job';
        completeOrReopenJobHolder.firstElementChild.innerHTML = `Change status of job ${jobId} to active?`;
        completeOrReopenJobEnter.innerText = 'Reopen'
    }
    removeJobHolder.firstElementChild.innerHTML = `Remove job ${jobId} from job list?<br>Work session data will be retained.`;
    back.addEventListener('click', backToJobSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
    job.value = jobId;
})

changeJobId.addEventListener('click', () => {
    editJobOptions.style.display = 'none';
    keypadHolder.style.display = 'flex';
    back.removeEventListener('click', backToJobSelectInstance)
    back.addEventListener('click', () => { backToJobOptions(keypadHolder) });
})

completeOrReopenJob.addEventListener('click', () => {
    editJobOptions.style.display = 'none';
    completeOrReopenJobHolder.style.display = 'flex';
    back.removeEventListener('click', backToJobSelectInstance)
    back.addEventListener('click', () => { backToJobOptions(completeOrReopenJobHolder) });
})

removeJobBtn.addEventListener('click', () => {
    editJobOptions.style.display = 'none';
    removeJobHolder.style.display = 'flex';
    back.removeEventListener('click', backToJobSelectInstance)
    back.addEventListener('click', () => { backToJobOptions(removeJobHolder) });
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

editJobIdEnter.addEventListener('click', () => {
    if (!job.value || jobId == job.value) {
        job.style.outline = '2px solid red';
        return;
    }
    editJobId(selectedID, jobId, job.value);
    successMessage.innerHTML = `Job ID changed from <span id='success-subject'>${jobId}</span> to <span id='success-subject'>${job.value}</span> successfully.`;
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
    jobId = job.value;
    completeOrReopenJobHolder.firstElementChild.firstElementChild.innerText = jobId;
    removeJobHolder.firstElementChild.firstElementChild.innerText = jobId;
    backToJob.style.display = 'block';
    editAnotherJob.style.display = 'block';
})

completeOrReopenJobEnter.addEventListener('click', () => {
    if (status == 'active') {
        editJobStatus(selectedID, 'complete');
        successMessage.innerHTML = `Job <span id='success-subject'>${jobId}</span> marked as complete successfully.`;
        status = 'complete'
        completeOrReopenJob.innerText = 'Reopen Job';
        completeOrReopenJobHolder.firstElementChild.innerHTML = `Change status of job ${jobId} to active?`;
        completeOrReopenJobEnter.innerText = 'Reopen';
        let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
        selectJobOption.innerText = `${jobId} ${status}`;
        jobDict[selectedID]['status'] = status;
    }
    else if (status == 'complete') {
        editJobStatus(selectedID, 'active');
        successMessage.innerHTML = `Job <span id='success-subject'>${jobId}</span> marked as active successfully.`;
        status = 'active';
        completeOrReopenJob.innerText = 'Complete Job'
        completeOrReopenJobHolder.firstElementChild.innerHTML = `Change status of job ${jobId} to complete?`;
        completeOrReopenJobEnter.innerText = 'Complete';
        let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
        selectJobOption.innerText = `${jobId} ${status}`;
        jobDict[selectedID]['status'] = status;
    }
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
    backToJob.style.display = 'block';
    editAnotherJob.style.display = 'block';
})

removeJobEnter.addEventListener('click', () => {
    removeJob(selectedID);
    successMessage.innerHTML = `Job <span id='success-subject'>${jobId}</span> removed successfully.`;
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
    backToJob.style.display = 'none';
    let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
    selectJobOption.remove();
    if ([...selectJob.children].length == 0) {
        editAnotherJob.style.display = 'none'
    }
    delete jobDict[selectedID];
})

job.addEventListener('input', () => {
    if (job.style.outline) job.style.outline = '';
})

backToJob.addEventListener('click', () => {
    successBody.style.display = 'none';
    mainBody.style.display = '';
    editJobOptions.style.display = 'flex';
    jobId = job.value;
    editingJob.innerText = `Editing Job: ${jobId}`;
    job.value = jobId;
    back.removeEventListener('click', backToJobOptionsInstance);
    back.addEventListener('click', backToJobSelect);
})


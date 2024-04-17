import { getJobs, editJobId, editJobStatus, removeJob, checkForInProgressWorkSessions, getJobWorkSessionCount } from "./transactions.js";

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
let completeOrReopenMessage = document.getElementById('complete-or-reopen-message');
let removeMessage = document.getElementById('remove-message');
let jobIds;
let removeJobDetails = document.getElementById('remove-job-details');
let logout = document.getElementById('home');

sessionStorage['manualUpdate'] == 'true' && sessionStorage['manager'] == '1' ? (logout.innerText = 'Log Out & Save', logout.style.width = '200px') : 'Log Out';

let sessionsActive = () => {
    removeJobBtn.innerText = 'Sessions Active';
    setTimeout(() => {
        removeJobBtn.innerText = 'Remove Job';
    }, 1000);
    removeJobBtn.removeEventListener('click', sessionsActiveInstance);
}

let noSessionsActive = async () => {
    await getJobWorkSessionCount(jobId).then((count) => {
        editJobOptions.style.display = 'none';
        removeJobHolder.style.display = 'flex';
        back.removeEventListener('click', backToJobSelectInstance)
        back.addEventListener('click', backToJobOptionsFromRemoveJobHolder);
        removeMessage.innerText = `Remove job ${jobId} from job list?`;
        if (count['COUNT(*)'] != 0) removeJobDetails.innerText = `A total of ${count['COUNT(*)']} work sessions will be deleted.`;
        else removeJobDetails.innerText = 'No work sessions are recorded for this job.';
    })
}

let removeJobSubmit = () => {
    removeJob(jobId).then((res) => {
        if ([...selectJob.children].length != 0) successMessage.innerHTML = `<span id='success-subject'>Job ${jobId}</span> removed successfully.`;
        else successMessage.innerHTML = `<span id='success-subject'>Job ${jobId}</span> removed successfully.<br>No jobs remaining.`;
        successMessage.innerHTML = `<span id='success-subject'>Job ${jobId}</span> removed successfully.`;
        mainBody.style.display = 'none';
        successBody.style.display = 'flex';
        backToJob.style.display = 'none';
        let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
        selectJobOption.remove();
        if ([...selectJob.children].length == 0) {
            editAnotherJob.style.display = 'none';
        }
        delete jobDict[selectedID];
    }).catch((err) => {
        removeJobEnter.innerText = 'Error';
        setTimeout(() => {
            removeJobEnter.innerText = 'Remove';
        }, 2000);
    });
}

let sessionsActiveInstance = sessionsActive;
let noSessionsActiveInstance = noSessionsActive;
let removeJobSubmitInstance = removeJobSubmit;

async function appendJobs() {
    if (selectJob.hasChildNodes()) [...selectJob.children].forEach(job => job.remove());
    await getJobs().then((res) => {
        res = res.sort((a, b) => {
            return a['job_id'] - b['job_id'] || a['job_id'].length - b['job_id'].length;
        })
        numberOfJobs = res.length;
        numberOfJobs > 1 ? selectJob.setAttribute('size', numberOfJobs) : selectJob.setAttribute('size', 2);
        jobIds = res.map(job => job['job_id']);
        res.forEach(job => {
            let jobEntry = {};
            jobEntry['jobId'] = job['job_id'];
            jobEntry['status'] = job['status'];
            let option = document.createElement('option');
            option.setAttribute('value', res.indexOf(job));
            jobDict[res.indexOf(job)] = jobEntry;
            option.innerText = `${job['job_id']} ${job['status']}`;
            selectJob.appendChild(option);
        })
    })
}

appendJobs();

let backToJobSelect = () => {
    selectJobHolder.style.display = 'flex';
    editJobOptions.style.display = 'none';
    back.removeEventListener('click', backToJobSelectInstance);
    sessionStorage.setItem('backToMO', 'true');
    setTimeout(() => { back.parentElement.setAttribute('href', 'manager.html'); }, 200);
    removeJobBtn.removeEventListener('click', noSessionsActiveInstance);
    removeJobEnter.removeEventListener('click', removeJobSubmitInstance);
    [...selectJob.children].forEach(job => job.remove());
    appendJobs();
}

let backToJobOptions = (currentPage) => {
    editJobOptions.style.display = 'flex';
    currentPage.style.display = 'none';
    if (currentPage == keypadHolder) {
        job.value = jobId;
        if (job.style.outline) job.style.outline = '';
    }
    back.removeEventListener('click', () => { backToJobOptions(currentPage) });
    back.addEventListener('click', backToJobSelect);
}

let backToJobSelectInstance = backToJobSelect;
let backToJobOptionsInstance = backToJobOptions;
let backToJobOptionsFromKeypadHolderInstance = () => { backToJobOptions(keypadHolder) };
let backToJobOptionsFromCompleteOrReopenJobHolderInstance = () => { backToJobOptions(completeOrReopenJobHolder) };
let backToJobOptionsFromRemoveJobHolder = () => { backToJobOptions(removeJobHolder) };

selectJob.addEventListener('change', () => {
    if (selectJob.style.outline) selectJob.style.outline = '';
})

jobSelectNext.addEventListener('click', async () => {
    let options = [...document.querySelectorAll('option')];
    selectedID = options.filter(option => option.selected);

    if (selectedID.length == 0) 
        return selectJob.style.outline = '2px solid red';

    selectedID = selectedID[0].value;
    selectJobHolder.style.display = 'none';
    editJobOptions.style.display = 'flex';
    jobId = jobDict[selectedID]['jobId'];
    status = jobDict[selectedID]['status'];
    editingJob.innerText = `Editing Job: ${jobId}`;
    if (status == 'active') {
        completeOrReopenJob.innerText = 'Complete Job';
        completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to complete?`;
        completeOrReopenJobEnter.innerText = 'Complete'
    }
    else if (status == 'complete') {
        completeOrReopenJob.innerText = 'Reopen Job';
        completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to active?`;
        completeOrReopenJobEnter.innerText = 'Reopen'
    }
    back.addEventListener('click', backToJobSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
    job.value = jobId;

    await checkForInProgressWorkSessions(jobId).then((res) => {
        if (res.filter(session => session['job_id'] == jobId).length != 0) {
            removeJobBtn.addEventListener('click', sessionsActiveInstance);
        }
        else {
            removeJobBtn.addEventListener('click', noSessionsActiveInstance);
            removeJobEnter.addEventListener('click', removeJobSubmitInstance);
        }
    })
})

changeJobId.addEventListener('click', () => {
    editJobOptions.style.display = 'none';
    keypadHolder.style.display = 'flex';
    back.removeEventListener('click', backToJobSelectInstance)
    back.addEventListener('click', backToJobOptionsFromKeypadHolderInstance);
})

completeOrReopenJob.addEventListener('click', () => {
    editJobOptions.style.display = 'none';
    completeOrReopenJobHolder.style.display = 'flex';
    back.removeEventListener('click', backToJobSelectInstance)
    back.addEventListener('click', backToJobOptionsFromCompleteOrReopenJobHolderInstance);
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
    if (!job.value) {
        job.style.outline = '2px solid red';
        return;
    }
    if (jobId == job.value) {
        job.value = '';
        job.placeholder = 'Job ID is the same';
        job.style.outline = '2px solid red';
        setTimeout(() => {
            job.style.outline = '';
            job.value = jobId;
        }, 2000);
        return;
    }
    if (jobIds.includes(job.value)) {
        job.value = '';
        job.placeholder = 'Job ID is currently in use';
        job.style.outline = '2px solid red';
        setTimeout(() => {
            job.placeholder = 'New ID for job';
            job.style.outline = '';
        }, 2000);
        return;
    }
    editJobId(jobId, job.value)
     .then((res) => {
        successMessage.innerHTML = `Job ID changed from <span id='success-subject'>${jobId}</span> to <span id='success-subject'>${job.value}</span> successfully.`;
        mainBody.style.display = 'none';
        successBody.style.display = 'flex';
        jobDict[selectedID]['jobId'] = job.value;
        jobId = job.value;
        backToJob.style.display = 'block';
        editAnotherJob.style.display = 'block';
        if (status == 'active') {
            completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to complete?`;
        }
        else if (status == 'complete') {
            completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to active?`;
        }
        editingJob.innerText = `Editing Job: ${jobId}`;
        keypadHolder.style.display = 'none';
        let selectedOption = [...selectJob.querySelectorAll('option')].filter(option => option.selected)[0];
        selectedOption.innerText = `${jobId} ${status}`;
     }).catch((err) => {
        editJobIdEnter.style.backgroundColor = 'red';
        editJobIdEnter.innerText = 'Error';
        setTimeout(() => {
            editJobIdEnter.style.backgroundColor = '#13c296';
            editJobIdEnter.innerText = 'Save';
        }, 2000);
     });
})

completeOrReopenJobEnter.addEventListener('click', () => {
    if (status == 'active') {
        editJobStatus(jobId, 'complete')
         .then((res) => {
            successMessage.innerHTML = `<span id='success-subject'>Job ${jobId}</span> marked as complete successfully.`;
            status = 'complete'
            completeOrReopenJob.innerText = 'Reopen Job';
            completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to active?`;
            completeOrReopenJobEnter.innerText = 'Reopen';
            let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
            selectJobOption.innerText = `${jobId} ${status}`;
            jobDict[selectedID]['status'] = status;
         }).catch((err) => {
            completeOrReopenJobEnter.style.backgroundColor = 'red';
            completeOrReopenJobEnter.innerText = 'Error';
            setTimeout(() => {
                completeOrReopenJobEnter.style.backgroundColor = '#13c296';
                completeOrReopenJobEnter.innerText = 'Complete';
            }, 2000);
         });
    }
    else if (status == 'complete') {
        editJobStatus(jobId, 'active')
         .then((res) => {
            successMessage.innerHTML = `<span id='success-subject'>Job ${jobId}</span> marked as active successfully.`;
            status = 'active';
            completeOrReopenJob.innerText = 'Complete Job'
            completeOrReopenMessage.innerHTML = `Change status of job ${jobId} to complete?`;
            completeOrReopenJobEnter.innerText = 'Complete';
            let selectJobOption = [...selectJob.children].filter(option => option.innerText.includes(jobId))[0];
            selectJobOption.innerText = `${jobId} ${status}`;
            jobDict[selectedID]['status'] = status;
         }).catch((err) => {
            completeOrReopenJobEnter.style.backgroundColor = 'red';
            completeOrReopenJobEnter.innerText = 'Error';
            setTimeout(() => {
                completeOrReopenJobEnter.style.backgroundColor = '#13c296';
                completeOrReopenJobEnter.innerText = 'Reopen';
            }, 2000);
         });
    }
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
    backToJob.style.display = 'block';
    editAnotherJob.style.display = 'block';
})

job.addEventListener('input', () => {
    if (job.style.outline) job.style.outline = '';
})

backToJob.addEventListener('click', () => {
    successBody.style.display = 'none';
    mainBody.style.display = '';
    editJobOptions.style.display = 'flex';
    back.removeEventListener('click', backToJobOptionsInstance);
    back.addEventListener('click', backToJobSelect);
    completeOrReopenJobHolder.style.display = '';
})
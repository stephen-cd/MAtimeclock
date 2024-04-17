import { getEmployees, getEmployeeWorkSessions, getJobs, addWorkSession, editWorkSession, deleteWorkSession } from "./transactions.js";
import { manualUpdate } from "../../config.js";

const datepicker = require('js-datepicker');

let empDict = {};
let selectEmployeeHolder = document.getElementById('select-employee-holder');
let selectEmployee = document.getElementById('select-employee');
let selectEmployeeNext = document.getElementById('emp-select-next');
let datePickerHolder = document.getElementById('date-picker-holder');
let datePicker = document.getElementById('date-picker');
let datePickerNext = document.getElementById('date-select-next');
let workSessionHolder = document.getElementById('work-session-holder');
let ctx = document.getElementById('myChart');
let numberOfEmps;
let back = document.getElementById('back');
let selectedID;
let firstName;
let lastName;
let addWorkSessionBtn = document.getElementById('add-work-session');
let addWorkSessionHolder = document.getElementById('add-work-session-holder');
let addSessionStart = document.getElementById('add-session-start');
let addSessionEnd = document.getElementById('add-session-end');
let addSessionSubmit = document.getElementById('add-session-submit');
let addSessionJobId = document.getElementById('add-session-job-id');
let errorAdd = document.querySelector('[error-add]');
let errorEdit = document.querySelector('[error-edit]');
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let mainBody = document.getElementById('main-body');
let successAddAnotherSession = document.getElementById('success-add-another-session');
let successBackToSessionsAdd = document.getElementById('success-back-to-sessions-add');
let graph;
let editWorkSessionHolder = document.getElementById('edit-work-session-holder');
let editSessionJobId = document.getElementById('edit-session-job-id');
let editSessionStart = document.getElementById('edit-session-start');
let editSessionEnd = document.getElementById('edit-session-end');
let editSessionSubmit = document.getElementById('edit-session-submit');
let workSessionId;
let successBackToSessionsEdit = document.getElementById('success-back-to-sessions-edit');
let successSessionsAdd = document.getElementById('success-sessions-add');
let successSessionsEdit = document.getElementById('success-sessions-edit');
let titleDate;
let datePickerHidden = document.getElementById('date-picker-hidden');
let deleteSessionBtn = document.getElementById('delete-session');
let deleteWorkSessionHolder = document.getElementById('delete-work-session-holder');
let deleteSessionDate = document.getElementById('delete-session-date');
let deleteSessionEmp = document.getElementById('delete-session-emp');
let deleteSessionJobHours = document.getElementById('delete-session-job-hours');
let deleteSessionSubmit = document.getElementById('delete-session-submit');
let selectWorkSession = document.getElementById('select-work-session');
let editWorkSessionBtn = document.getElementById('edit-work-session');
let sessions;
let originalSessionStart;
let originalSessionEnd;
let originalJob;
let sessionRanges;
let logout = document.getElementById('home');

manualUpdate ? (logout.innerText = 'Log Out & Save', logout.style.width = '200px') : 'Log Out';

const picker = datepicker('#date-picker', {
    maxDate: new Date(),
    onSelect: (instance, date) => {
        if (datePicker.style.outline) datePicker.style.outline = '';
        if (date) {
            let month = (date.getMonth() + 1 < 10 ? '0' : '') + (date.getMonth() + 1);
            let day = (date.getDate() < 10 ? '0' : '') + date.getDate();
            let year = date.getFullYear();
            datePicker.value = `${month}/${day}/${year}`;
            datePickerHidden.value = `${year}-${month}-${day}`;
        }
    }
});

async function appendAllJobs(jobIdInput, label='') {
    return new Promise((resolve) => {
        getJobs().then((res) => {
            res.forEach(job => {
                let option = document.createElement('option');
                option.setAttribute('value', job['job_id']);
                option.innerText = job['job_id'];
                jobIdInput.appendChild(option);
                if (label && option.innerText == label) option.setAttribute('selected', 'true');
            })
            resolve([...jobIdInput.children]);
        })
        // getPastJobs().then((res) => {
        //     let currentJobs = [...jobIdInput.children].map(option => option.innerText);
        //     let pastJobs = [];
        //     res.forEach(job => {
        //         if (!currentJobs.includes(job['job_id']) && !pastJobs.includes(job['job_id'])) {
        //             let option = document.createElement('option');
        //             option.innerText = job['job_id'];
        //             jobIdInput.appendChild(option);
        //             if (label && option.innerText == label) option.setAttribute('selected', 'true');
        //             pastJobs.push(job['job_id']);
        //         }
        //     })
        // })
    }).then((options) => {
        return options;
    })
}

function createChart(selectedID, date) {
    // After picking the date, get the relevant employee work sessions based on selected employee and date
    // and build the chart with the data.
    getEmployeeWorkSessions(selectedID, date).then((res) => {
        sessions = res;
        sessionRanges = sessions.map(session => [session['start_time'], session['end_time']]);
        let dateRanges = [];
        let completedDateRanges = [];
        let inProgressDateRanges = [];
        let currentTime = new Date();
        if (selectWorkSession.hasChildNodes()) [...selectWorkSession.children].forEach(child => child.remove());
        res = res.sort((a, b) => {
            return new Date(`${datePickerHidden.value}T${a['start_time']}`) - new Date(`${datePickerHidden.value}T${b['start_time']}`);
        })
        res.forEach(session => {
            let sessionDict = {};
            sessionDict['x'] = [new Date(`${date}T${session['start_time']}`), new Date(`${date}T${session['end_time']}`)];
            sessionDict['y'] = `${session['job_id']}`;
            dateRanges.push(sessionDict);
            let option = document.createElement('option');
            option.setAttribute('value', session['id'])
            let startTime = new Date(`${datePickerHidden.value}T${session['start_time']}`);
            startTime = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            if (session['end_time']) {
                let endTime = new Date(`${datePickerHidden.value}T${session['end_time']}`);
                endTime = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
                option.innerText = `Job ${session['job_id']}: ${startTime} - ${endTime}`;
            }
            else {
                option.innerText = `Job ${session['job_id']}: ${startTime} - Ongoing`;
            }
            selectWorkSession.appendChild(option);
        })
        completedDateRanges = dateRanges.filter(dict => !isNaN(dict['x'][1].valueOf()));
        inProgressDateRanges = dateRanges.filter(dict => isNaN(dict['x'][1].valueOf()));
        inProgressDateRanges.forEach(dict => dict['x'][1] = currentTime);

        const data = {
            datasets: [{
                label: `Completed`,
                data: completedDateRanges,
                backgroundColor: 'rgba(19, 194, 150)',
                borderColor: 'rgba(255, 255, 255, 0.75)',
                borderWidth: 1,
                borderSkipped: false,
            },
            {
                label: `In Progress`,
                data: inProgressDateRanges,
                backgroundColor: 'rgba(252, 202, 3)',
                borderColor: 'rgba(255, 255, 255, 0.75)',
                borderWidth: 1,
                borderSkipped: false,
            }]
        }

        titleDate = date.split('-');

        const config = {
            type: 'bar',
            data,
            options: {
                aspectRatio: 3,
                barPercentage: 0.5,
                plugins: {
                    legend: {
                        labels : {
                            color: 'white'
                        }
                    },
                    title: {
                        display: true,
                        text: `Work Sessions for ${firstName} ${lastName} on ${titleDate[1]}/${titleDate[2]}/${titleDate[0]}`,
                        color: 'white',
                        font: {
                            size: '24px'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: ((tooltipItem, data) => {
                                let start = tooltipItem['raw']['x'][0];
                                let start_hour = (start.getHours() < 10 ? '0' : '') + start.getHours();
                                let start_min = (start.getMinutes() < 10 ? '0' : '') + start.getMinutes();
                                let end = tooltipItem['raw']['x'][1];
                                let end_hour = (end.getHours() < 10 ? '0' : '') + end.getHours();
                                let end_min = (end.getMinutes() < 10 ? '0' : '') + end.getMinutes();
                                return `${start_hour}:${start_min} - ${end_hour}:${end_min}`;
                            })
                        }
                    },
                },
                indexAxis: 'y',
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            parser: 'HH:mm:ss',
                            unit: 'hour'
                        },
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.25)',
                        },
                        min: new Date(`${date}T06:00:00`),
                        max: new Date(`${date}T20:00:00`),
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'white',
                        },
                        grid: {
                            color: 'rgba(255,255,255,0.25)',
                        },
                    }
                }
            }
        };

        graph = new Chart(ctx, config);

        sessions.forEach(session => {
            let option = document.createElement('option');
        })

        ctx.addEventListener('click', (e) => {
            let points = graph.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const slabel = graph.data.datasets[firstPoint.datasetIndex].label;
                const value = graph.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                const label = value['y'];
                back.style.position = '';
                back.style.zIndex = '';
                ctx.style.marginTop = '50px;'
                back.removeEventListener('click', backToDateSelectInstance);
                back.addEventListener('click', backToChartFromEditSession);
                if ([...editSessionJobId.children].length == 0) {
                    appendAllJobs(editSessionJobId, label).then((options) => {
                        let selectedJob = options.filter(job => job.value == label)[0];
                        selectedJob.selected = 'true';
                        let otherJobs = options.filter(job => job.value != label);
                        otherJobs.forEach(job => job.removeAttribute('selected'));
                        originalJob = label;
                        let start_time = value['x'][0];
                        let end_time = value['x'][1];
                        let start_hour = (start_time.getHours() < 10 ? '0' : '') + start_time.getHours();
                        let start_min = (start_time.getMinutes() < 10 ? '0' : '') + start_time.getMinutes();
                        originalSessionStart = `${start_hour}:${start_min}`;
                        workSessionId = sessions.filter(dict => dict['start_time'] == `${start_hour}:${start_min}`)[0]['id'];
                        editSessionStart.setAttribute('value', `${start_hour}:${start_min}`);
                        if (slabel == 'Completed') {
                            let end_hour = (end_time.getHours() < 10 ? '0' : '') + end_time.getHours();
                            let end_min = (end_time.getMinutes() < 10 ? '0' : '') + end_time.getMinutes();
                            editSessionEnd.value = `${end_hour}:${end_min}`;
                            originalSessionEnd = `${end_hour}:${end_min}`;
                        }
                        else {
                            editSessionEnd.value = '';
                            originalSessionEnd = 'Ongoing';
                        }
                    });
                }
                else {
                    let selectedJob = [...editSessionJobId.children].filter(job => job.value == label)[0];
                    selectedJob.selected = 'true';
                    let otherJobs = [...editSessionJobId.children].filter(job => job.value != label);
                    otherJobs.forEach(job => job.removeAttribute('selected'));
                    originalJob = label;
                    let start_time = value['x'][0];
                    let end_time = value['x'][1];
                    let start_hour = (start_time.getHours() < 10 ? '0' : '') + start_time.getHours();
                    let start_min = (start_time.getMinutes() < 10 ? '0' : '') + start_time.getMinutes();
                    originalSessionStart = `${start_hour}:${start_min}`;
                    workSessionId = sessions.filter(dict => dict['start_time'] == `${start_hour}:${start_min}`)[0]['id'];
                    editSessionStart.setAttribute('value', `${start_hour}:${start_min}`);
                    if (slabel == 'Completed') {
                        let end_hour = (end_time.getHours() < 10 ? '0' : '') + end_time.getHours();
                        let end_min = (end_time.getMinutes() < 10 ? '0' : '') + end_time.getMinutes();
                        editSessionEnd.value = `${end_hour}:${end_min}`;
                        originalSessionEnd = `${end_hour}:${end_min}`;
                    }
                    else {
                        editSessionEnd.value = '';
                        originalSessionEnd = 'Ongoing';
                    }
                }
                workSessionHolder.style.display = 'none';
                editWorkSessionHolder.style.display = 'flex';
            }
        })
    });
}

await getEmployees().then((res) => {
    numberOfEmps = res.length;
    if (numberOfEmps == 0) {
        mainBody.style.display = 'none';
        noEmps.style.display = 'flex';
        setTimeout(() => {
            window.location.href = '../templates/manager.html';
        }, 2000);
    }
    numberOfEmps > 1 ? selectEmployee.setAttribute('size', numberOfEmps) : selectEmployee.setAttribute('size', 2)
    res.forEach(employee => {
        let empEntry = {};
        empEntry['firstName'] = employee['first_name'];
        empEntry['lastName'] = employee['last_name'];
        empDict[employee['pin']] = empEntry;
        let option = document.createElement('option');
        option.setAttribute('value', employee['pin']);
        option.innerText = `${employee['first_name']} ${employee['last_name']}`;
        selectEmployee.appendChild(option);
    })
})

let backToEmpSelect = () => {
    datePickerHolder.style.display = '';
    selectEmployeeHolder.style.display = 'flex';
    back.removeEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'true');
    setTimeout(() => { back.parentElement.setAttribute('href', 'manager.html'); }, 200);
    back.style.position = '';
    back.style.zIndex = '';
}

let backToDateSelect = () => {
    let ctxHolder = ctx.parentElement;
    ctx.remove();
    ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    ctxHolder.appendChild(ctx);
    workSessionHolder.style.display = '';
    datePickerHolder.style.display = 'flex';
    back.removeEventListener('click', backToDateSelectInstance);
    back.addEventListener('click', backToEmpSelectInstance);
    back.style.position = '';
    back.style.zIndex = '';
}

let backToChart = (currentPage) => {
    ctx = document.getElementById('myChart');
    currentPage.style.display = '';
    workSessionHolder.style.display = 'block';
    back.style.position = 'relative';
    back.style.zIndex = '1';
    ctx.style.marginTop = '0';
    currentPage = currentPage == addWorkSessionHolder ? backToChartFromAddSession : backToChartFromEditSession;
    back.removeEventListener('click', currentPage);
    back.addEventListener('click', backToDateSelectInstance);
    if (currentPage == addWorkSessionHolder) {
        if (addSessionJobId.style.outline) addSessionJobId.style.outline = '';
        if (addSessionStart.style.outline) addSessionStart.style.outline = '';
        if (addSessionEnd.style.outline) addSessionEnd.style.outline = '';
    }
    if (currentPage == editWorkSessionHolder) {
        if (editSessionJobId.style.outline) editSessionJobId.style.outline = '';
        if (editSessionStart.style.outline) editSessionStart.style.outline = '';
        if (editSessionStart.style.outline) editSessionEnd.style.outline = '';
    }
}

let backToEditSession = () => {
    deleteWorkSessionHolder.style.display = 'none';
    editWorkSessionHolder.style.display = 'flex';
    mainBody.style.display = 'block';
    successSessionsEdit.style.display = 'none';
    back.removeEventListener('click', backToEditSessionInstance);
    back.addEventListener('click', backToChartFromEditSession);
}

let backToEmpSelectInstance = backToEmpSelect;
let backToDateSelectInstance = backToDateSelect;
let backToChartFromAddSession = () => { backToChart(addWorkSessionHolder) };
let backToChartFromEditSession = () => { backToChart(editWorkSessionHolder) };
let backToEditSessionInstance = backToEditSession;

selectEmployee.addEventListener('change', () => {
    if (selectEmployee.style.outline) selectEmployee.style.outline = '';
})

selectEmployeeNext.addEventListener('click', () => {
    let options = [...document.querySelectorAll('option')];
    if (options.filter(option => option.selected).length == 0) return selectEmployee.style.outline = '2px solid red';
    selectEmployeeHolder.style.display = 'none';
    datePickerHolder.style.display = 'flex';
    selectedID = options.filter(option => option.selected)[0].value;
    firstName = empDict[selectedID]['firstName'];
    lastName = empDict[selectedID]['lastName'];
    back.addEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
})

datePickerNext.addEventListener('click', () => {
    if (!datePicker.value) return datePicker.style.outline = '2px solid red';
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToDateSelectInstance);
    createChart(selectedID, datePickerHidden.value);
    datePickerHolder.style.display = 'none';
    workSessionHolder.style.display = 'block';
    back.style.position = 'relative';
})

addWorkSessionBtn.addEventListener('click', () => {
    back.style.position = '';
    ctx.style.marginTop = '50px;'
    back.removeEventListener('click', backToDateSelectInstance);
    back.addEventListener('click', backToChartFromAddSession);
    if ([...addSessionJobId.children].length == 0) {
        appendAllJobs(addSessionJobId);
    }
    else {
        let selectedJob = [...addSessionJobId.children].filter(session => session.selected)[0];
        selectedJob.selected = false;
    }
    workSessionHolder.style.display = 'none';
    addWorkSessionHolder.style.display = 'flex';
    addSessionStart.value = '08:00';
    addSessionEnd.value = '';
})

editWorkSessionBtn.addEventListener('click', () => {
    let selectedSession = [...selectWorkSession.children].filter(session => session.selected);
    if (selectedSession.length == 0) {
        selectWorkSession.style.outline = '2px solid red';
        setTimeout(() => {
            selectWorkSession.style.outline = '';
        }, 1000);
        return;
    }
    selectedSession = sessions.filter(session => session['id'] == selectedSession[0].value)[0];
    workSessionId = selectedSession['id']
    workSessionHolder.style.display = 'none';
    editWorkSessionHolder.style.display = 'flex';
    if ([...editSessionJobId.children].length == 0) {
        appendAllJobs(editSessionJobId, selectedSession['job_id']).then((options) => {
            let selectedJob = options.filter(job => job.value == selectedSession['job_id'])[0];
            selectedJob.selected = 'true';
            let otherJobs = options.filter(job => job.value != selectedJob.value);
            otherJobs.forEach(job => job.removeAttribute('selected'));
            originalJob = selectedJob.innerText;
            let start_time = new Date(`${datePickerHidden.value}T${selectedSession['start_time']}`);
            let end_time = new Date(`${datePickerHidden.value}T${selectedSession['end_time']}`);
            let start_hour = (start_time.getHours() < 10 ? '0' : '') + start_time.getHours();
            let start_min = (start_time.getMinutes() < 10 ? '0' : '') + start_time.getMinutes();
            editSessionStart.setAttribute('value', `${start_hour}:${start_min}`);
            originalSessionStart = `${start_hour}:${start_min}`;
            if (selectedSession['end_time']) {
                let end_hour = (end_time.getHours() < 10 ? '0' : '') + end_time.getHours();
                let end_min = (end_time.getMinutes() < 10 ? '0' : '') + end_time.getMinutes();
                editSessionEnd.value = `${end_hour}:${end_min}`;
                originalSessionEnd = `${end_hour}:${end_min}`;
            }
            else {
                editSessionEnd.value = '';
                originalSessionEnd = 'Ongoing';
            }
        });
    }
    else {
        let selectedJob = [...editSessionJobId.children].filter(job => job.value == selectedSession['job_id'])[0];
        selectedJob.selected = 'true';
        let otherJobs = [...editSessionJobId.children].filter(job => job.value != selectedJob.value);
        otherJobs.forEach(job => job.removeAttribute('selected'));
        originalJob = selectedJob.innerText;
        let start_time = new Date(`${datePickerHidden.value}T${selectedSession['start_time']}`);
        let end_time = new Date(`${datePickerHidden.value}T${selectedSession['end_time']}`);
        let start_hour = (start_time.getHours() < 10 ? '0' : '') + start_time.getHours();
        let start_min = (start_time.getMinutes() < 10 ? '0' : '') + start_time.getMinutes();
        originalSessionStart = `${start_hour}:${start_min}`;
        editSessionStart.setAttribute('value', `${start_hour}:${start_min}`);
        if (selectedSession['end_time']) {
            let end_hour = (end_time.getHours() < 10 ? '0' : '') + end_time.getHours();
            let end_min = (end_time.getMinutes() < 10 ? '0' : '') + end_time.getMinutes();
            editSessionEnd.value = `${end_hour}:${end_min}`;
            originalSessionEnd = `${end_hour}:${end_min}`;
        }
        else {
            editSessionEnd.value = '';
            originalSessionEnd = 'Ongoing';
        }
    }
    back.removeEventListener('click', backToDateSelectInstance);
    back.addEventListener('click', backToChartFromEditSession);
    back.style.position = '';
});


selectWorkSession.addEventListener('change', () => {
    if (selectWorkSession.style.outline) selectWorkSession.style.outline = '';
})

addSessionStart.addEventListener('click', () => {
    addSessionStart.showPicker();
})

addSessionEnd.addEventListener('click', () => {
    addSessionEnd.showPicker();
})

addSessionJobId.addEventListener('change', () => {
    if (addSessionJobId.style.outline) addSessionJobId.style.outline = '';
})

addSessionStart.addEventListener('change', () => {
    if (addSessionStart.style.outline) addSessionStart.style.outline = '';
})

addSessionEnd.addEventListener('change', () => {
    if (addSessionEnd.style.outline) addSessionEnd.style.outline = '';
})

addSessionSubmit.addEventListener('click', () => {
    // Check that all inputs are filled
    if (!addSessionJobId.value || !addSessionStart.value) {
        if (!addSessionJobId.value) addSessionJobId.style.outline = '2px solid red';
        if (!addSessionStart.value) addSessionStart.style.outline = '2px solid red';
        return
    }

    // Check that time range is valid
    let startTimeDB = addSessionStart.value;
    let endTimeDB = addSessionEnd.value;
    let startTime = new Date(`${datePickerHidden.value}T${startTimeDB}`);
    let endTime = endTimeDB != '' ? new Date(`${datePickerHidden.value}T${endTimeDB}`) : '';
    let currentTime = new Date();
    if (startTime >= currentTime) {
        errorAdd.style.display = 'block';
        errorAdd.innerText = 'Start time has not occurred yet';
        setTimeout(() => {
            errorAdd.style.display = '';
            errorAdd.innerText = '';
        }, 2000);
        return;
    }
    if (endTime && endTime >= currentTime) {
        errorAdd.style.display = 'block';
        errorAdd.innerText = 'End time has not occurred yet';
        setTimeout(() => {
            errorAdd.style.display = '';
            errorAdd.innerText = '';
        }, 2000);
        return
    }
    if (endTime && startTime >= endTime) {
        errorAdd.style.display = 'block';
        errorAdd.innerText = 'Invalid time range';
        setTimeout(() => {
            errorAdd.style.display = '';
            errorAdd.innerText = '';
        }, 2000);
        return
    }
    if (sessionRanges.some(sessionRange => {
        let sessionRangeStart = new Date(`${datePickerHidden.value}T${sessionRange[0]}`);
        let sessionRangeEnd = new Date(`${datePickerHidden.value}T${sessionRange[1]}`)
        if (!endTime) {
            if (sessionRangeStart < currentTime && sessionRangeEnd > startTime) return true;
        }
        else {
            if (sessionRangeStart < endTime && sessionRangeEnd > startTime) return true;
        }}) 
    ) {
        errorAdd.style.display = 'block';
        errorAdd.innerText = 'Session overlaps with existing session(s)';
        setTimeout(() => {
            errorAdd.style.display = '';
            errorAdd.innerText = '';
        }, 2000);
        return
    }

    // Add the session
    addWorkSession(selectedID, datePickerHidden.value, addSessionJobId.value, startTimeDB, endTimeDB)
     .then((res) => {
        mainBody.style.display = 'none';
        addWorkSessionHolder.style.display = '';
        successBody.style.display = 'flex';
        successSessionsAdd.style.display = 'flex';
        successSessionsEdit.style.display = 'none';
        successMessage.innerHTML = `Session for <span id="success-subject">Job ${addSessionJobId.value}</span> on <span id="success-subject">${titleDate[1]}/${titleDate[2]}/${titleDate[0]}</span> for <span id="success-subject">${firstName} ${lastName}</span> added successfully`;
     }).catch((err) => {
        addSessionSubmit.style.backgroundColor = 'red';
        addSessionSubmit.innerText = 'Error';
        setTimeout(() => {
            addSessionSubmit.style.backgroundColor = '#13c296';
            addSessionSubmit.innerText = 'Enter';
        }, 2000);
     })
})

successAddAnotherSession.addEventListener('click', () => {
    mainBody.style.display = '';
    addWorkSessionHolder.style.display = 'flex';
    successBody.style.display = 'none';
    successSessionsAdd.style.display = 'flex';
    successMessage.innerHTML = '';
})

successBackToSessionsAdd.addEventListener('click', () => {
    addWorkSessionHolder.style.display = '';
    let ctxHolder = ctx.parentElement;
    ctx.remove();
    ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    ctxHolder.appendChild(ctx);
    createChart(selectedID, datePickerHidden.value);
    back.removeEventListener('click', backToChartFromAddSession)
    back.addEventListener('click', backToDateSelectInstance);
    mainBody.style.display = '';
    workSessionHolder.style.display = 'block';
    successBody.style.display = 'none';
    successSessionsAdd.style.display = 'none';
    successMessage.innerHTML = '';
    ctx.setAttribute('style', 'display: block; box-sizing: border-box; height: 262px; width: 786px; margin-top: 50px;');
})

editSessionStart.addEventListener('click', () => {
    editSessionStart.showPicker();
})

editSessionEnd.addEventListener('click', () => {
    editSessionEnd.showPicker();
})

editSessionJobId.addEventListener('change', () => {
    if (editSessionJobId.style.outline) editSessionJobId.style.outline = '';
})

editSessionStart.addEventListener('change', () => {
    if (editSessionStart.style.outline) editSessionStart.style.outline = '';
})

editSessionEnd.addEventListener('change', () => {
    if (editSessionEnd.style.outline) editSessionEnd.style.outline = '';
})

editSessionSubmit.addEventListener('click', () => {
    // Check that all inputs are filled
    if (!editSessionJobId.value || !editSessionStart.value) {
        if (!editSessionJobId.value) editSessionJobId.style.outline = '2px solid red';
        if (!editSessionStart.value) editSessionStart.style.outline = '2px solid red';
        return
    }

    // Check that time range is valid
    let startTimeDB = editSessionStart.value;
    let endTimeDB = editSessionEnd.value;
    let startTime = new Date(`${datePickerHidden.value}T${startTimeDB}`);
    let endTime = new Date(`${datePickerHidden.value}T${endTimeDB}`);
    let currentTime = new Date();
    let sessionRangesExceptCurrent = sessionRanges.filter(session => session[0] != startTimeDB && session[1] != endTimeDB)
    if (startTime >= currentTime) {
        errorEdit.style.display = 'block';
        errorEdit.innerText = 'Start time has not occurred yet';
        setTimeout(() => {
            errorEdit.style.display = '';
            errorEdit.innerText = '';
        }, 2000);
        return
    }
    if (endTime >= currentTime) {
        errorEdit.style.display = 'block';
        errorEdit.innerText = 'End time has not occurred yet';
        setTimeout(() => {
            errorEdit.style.display = '';
            errorEdit.innerText = '';
        }, 2000);
        return
    }
    if (startTime >= endTime) {
        errorEdit.style.display = 'block';
        errorEdit.innerText = 'Invalid time range';
        setTimeout(() => {
            errorEdit.style.display = '';
            errorEdit.innerText = '';
        }, 2000);
        return
    }
    if (sessionRangesExceptCurrent.some(sessionRange => {
        let sessionRangeStart = new Date(`${datePickerHidden.value}T${sessionRange[0]}`);
        let sessionRangeEnd = new Date(`${datePickerHidden.value}T${sessionRange[1]}`)
        if (!endTime) {
            if (sessionRangeStart < currentTime && sessionRangeEnd > startTime) return true;
        }
        else {
            if (sessionRangeStart < endTime && sessionRangeEnd > startTime) return true;
        }}) 
    ) {
        errorEdit.style.display = 'block';
        errorEdit.innerText = 'Session overlaps with existing session(s)';
        setTimeout(() => {
            errorEdit.style.display = '';
            errorEdit.innerText = '';
        }, 2000);
        return
    }

    // Edit the session
    editWorkSession(workSessionId, editSessionJobId.value, startTimeDB, endTimeDB)
     .then((res) => {
        mainBody.style.display = 'none';
        addWorkSessionHolder.style.display = '';
        successBody.style.display = 'flex';
        successSessionsAdd.style.display = 'none';
        successSessionsEdit.style.display = 'flex';
        successMessage.innerHTML = `Session for <span id="success-subject">Job ${editSessionJobId.value}</span> on <span id="success-subject">${titleDate[1]}/${titleDate[2]}/${titleDate[0]}</span> for <span id="success-subject">${firstName} ${lastName}</span> edited successfully`;
     }).catch((err) => {
        editSessionSubmit.style.backgroundColor = 'red';
        editSessionSubmit.innerText = 'Error';
        setTimeout(() => {
            editSessionSubmit.style.backgroundColor = '#13c296';
            editSessionSubmit.innerText = 'Save';
        }, 2000);
     })
})

successBackToSessionsEdit.addEventListener('click', () => {
    editWorkSessionHolder.style.display = '';
    let ctxHolder = ctx.parentElement;
    ctx.remove();
    ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    ctxHolder.appendChild(ctx);
    createChart(selectedID, datePickerHidden.value);
    back.removeEventListener('click', backToChartFromEditSession)
    back.addEventListener('click', backToDateSelectInstance);
    mainBody.style.display = '';
    workSessionHolder.style.display = 'block';
    successBody.style.display = 'none';
    successSessionsEdit.style.display = 'none';
    successMessage.innerHTML = '';
    back.style.position = 'relative';
    ctx.style.marginTop = '0';
    ctx.setAttribute('style', 'display: block; box-sizing: border-box; height: 262px; width: 786px; margin-top: 0;');
})

deleteSessionBtn.addEventListener('click', () => {
    editWorkSessionHolder.style.display = 'none';
    deleteWorkSessionHolder.style.display = 'flex';
    deleteSessionDate.innerText = `${titleDate[1]}/${titleDate[2]}/${titleDate[0]}`;
    deleteSessionEmp.innerText = `${firstName} ${lastName}`;
    let startTime = new Date(`${datePickerHidden.value}T${originalSessionStart}`);
    startTime = startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let endTime;
    if (editSessionEnd.value) {
        endTime = new Date(`${datePickerHidden.value}T${originalSessionEnd}`);
        endTime = endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    }
    else {
        endTime = 'Ongoing';
    }
    deleteSessionJobHours.innerText = `Job ${originalJob}: ${startTime} - ${endTime}`;
    back.removeEventListener('click', backToChartFromEditSession);
    back.addEventListener('click', backToEditSessionInstance);
})

deleteSessionSubmit.addEventListener('click', () => {
    deleteWorkSession(workSessionId)
     .then((res) => {
        deleteWorkSessionHolder.style.display = 'none';
        successBody.style.display = 'flex';
        successMessage.innerHTML = 'Work session deleted successfully';
        mainBody.style.display = 'none';
        successSessionsEdit.style.display = 'flex';
        back.removeEventListener('click', backToEditSessionInstance);
        successSessionsAdd.style.display = 'none';
     }).catch((err) => {
        deleteSessionSubmit.innerText = 'Error';
        setTimeout(() => {
            deleteSessionSubmit.innerText = 'Delete';
        }, 2000);
     })
})
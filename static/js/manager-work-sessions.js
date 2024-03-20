import { getEmployeeNames, getEmployeeWorkSessions, getJobs, addWorkSession, editWorkSession } from "./transactions.js";

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
let date;
let addWorkSessionBtn = document.getElementById('add-work-session');
let addWorkSessionHolder = document.getElementById('add-work-session-holder');
let addSessionStart = document.getElementById('add-session-start');
let addSessionEnd = document.getElementById('add-session-end');
let addSessionSubmit = document.getElementById('add-session-submit');
let addSessionJobId = document.getElementById('add-session-job-id');
let errorMessage = document.getElementById('error-message');
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

function createChart(selectedID, date) {
    // After picking the date, get the relevant employee work sessions based on selected employee and date
    // and build the chart with the data.
    getEmployeeWorkSessions(selectedID, date).then((res) => {
        let dateRanges = [];
        res.forEach(session => {
            let sessionDict = {};
            sessionDict['x'] = [new Date(`${date}T${session['start_time']}`), new Date(`${date}T${session['end_time']}`)];
            sessionDict['y'] = `${session['job_id']}`;
            dateRanges.push(sessionDict);
            workSessionId = session['id'];
        })
        
        const data = {
            datasets: [{
                label: `Completed`,
                data: dateRanges,
                borderWidth: 1
            // },
            // {
            //     label: `In Progress`,
            //     data: inProgressRanges,
            //     backgroundColor: 'rgba(255,206,86,1,0.75)',
            //     borderColor: 'rgba(255,206,86,1)',
            //     borderWidth: 1
            }]
        }

        let titleDate = date.split('-');

        const config = {
            type: 'bar',
            data,
            options: {
                aspectRatio: 3,
                barPercentage: 0.2,
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
                                let start_min = (start.getMinutes() < 10 ? '0' : '') + start.getMinutes();
                                let end = tooltipItem['raw']['x'][1];
                                let end_min = (end.getMinutes() < 10 ? '0' : '') + end.getMinutes();
                                return `${start.getHours()}:${start_min} - ${end.getHours()}:${end_min}`;
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

        ctx.addEventListener('click', (e) => {
            let points = graph.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = graph.data.labels[firstPoint.index];
                const slabel = graph.data.datasets[firstPoint.datasetIndex].label;
                const value = graph.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                console.log(label, slabel, value);
                back.style.position = '';
                back.style.zIndex = '';
                ctx.style.marginTop = '50px;'
                back.removeEventListener('click', backToDateSelectInstance);
                back.addEventListener('click', () => { backToChart(editWorkSessionHolder) });
                if ([...editSessionJobId.children].length == 0) {
                    getJobs().then((res) => {
                        workSessionHolder.style.display = 'none';
                        editWorkSessionHolder.style.display = 'flex';
                        res.forEach(job => {
                            let option = document.createElement('option');
                            option.setAttribute('value', job['id']);
                            option.innerText = job['job_id'];
                            editSessionJobId.appendChild(option);
                            if (option.innerText == label) option.setAttribute('selected', 'true');
                        })
                    })
                }
                else {
                    workSessionHolder.style.display = 'none';
                    editWorkSessionHolder.style.display = 'flex';
                }
                let start_time = value['x'][0];
                let end_time = value['x'][1];
                let start_min = (start_time.getMinutes() < 10 ? '0' : '') + start_time.getMinutes();
                let end_min = (end_time.getMinutes() < 10 ? '0' : '') + end_time.getMinutes();
                editSessionStart.setAttribute('value', `${start_time.getHours()}:${start_min}`);
                editSessionEnd.setAttribute('value', `${end_time.getHours()}:${end_min}`);
            }
        })
    });
}

await getEmployeeNames().then((res) => {
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
        empDict[employee['uuid']] = empEntry;
        let option = document.createElement('option');
        option.setAttribute('value', employee['uuid']);
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
}

let backToDateSelect = () => {
    let ctxHolder = ctx.parentElement;
    ctx.remove();
    ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    ctxHolder.appendChild(ctx);
    workSessionHolder.style.display = '';
    datePickerHolder.style.display = 'flex';
    ctx.style.marginTop = '0';
    back.removeEventListener('click', backToDateSelectInstance);
    back.addEventListener('click', backToEmpSelectInstance);
}

let backToChart = (currentPage) => {
    ctx = document.getElementById('myChart');
    console.log(ctx)
    currentPage.style.display = '';
    workSessionHolder.style.display = 'flex';
    back.style.position = 'relative';
    back.style.zIndex = '1';
    ctx.style.marginTop = '0';
    back.removeEventListener('click', backToChartInstance);
    back.addEventListener('click', backToDateSelectInstance);
}

let backToEmpSelectInstance = backToEmpSelect;
let backToDateSelectInstance = backToDateSelect;
let backToChartInstance = backToChart;

selectEmployee.addEventListener('change', () => {
    if (selectEmployee.style.border) selectEmployee.style.border = '';
})

selectEmployeeNext.addEventListener('click', () => {
    let options = [...document.querySelectorAll('option')];
    if (options.filter(option => option.selected).length == 0) return selectEmployee.style.border = '2px solid red';
    selectEmployeeHolder.style.display = 'none';
    datePickerHolder.style.display = 'flex';
    selectedID = options.filter(option => option.selected)[0].value;
    firstName = empDict[selectedID]['firstName'];
    lastName = empDict[selectedID]['lastName'];
    back.addEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
})

datePicker.addEventListener('change', () => {
    if (datePicker.style.border) datePicker.style.border = '';
    date = datePicker.value;
})

datePicker.addEventListener('click', () => {
    datePicker.showPicker();
})

datePickerNext.addEventListener('click', () => {
    if (!datePicker.value) return datePicker.style.border = '2px solid red';
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToDateSelectInstance);
    createChart(selectedID, date);
    datePickerHolder.style.display = 'none';
    workSessionHolder.style.display = 'block';
})

addWorkSessionBtn.addEventListener('click', () => {
    back.style.position = '';
    back.style.zIndex = '';
    ctx.style.marginTop = '50px;'
    back.removeEventListener('click', backToDateSelectInstance);
    back.addEventListener('click', () => { backToChart(addWorkSessionHolder) });
    if ([...addSessionJobId.children].length == 0) {
        getJobs().then((res) => {
            workSessionHolder.style.display = 'none';
            addWorkSessionHolder.style.display = 'flex';
            res.forEach(job => {
                let option = document.createElement('option');
                option.setAttribute('value', job['id']);
                option.innerText = job['job_id'];
                addSessionJobId.appendChild(option);
            })
        })
    }
    else {
        workSessionHolder.style.display = 'none';
        addWorkSessionHolder.style.display = 'flex';
    }
})

addSessionStart.addEventListener('click', () => {
    addSessionStart.showPicker();
})

addSessionEnd.addEventListener('click', () => {
    addSessionEnd.showPicker();
})

addSessionJobId.addEventListener('change', () => {
    if (addSessionJobId.style.border) addSessionJobId.style.border = '';
})

addSessionStart.addEventListener('change', () => {
    if (addSessionStart.style.border) addSessionStart.style.border = '';
})

addSessionEnd.addEventListener('change', () => {
    if (addSessionEnd.style.border) addSessionEnd.style.border = '';
})

addSessionSubmit.addEventListener('click', () => {
    // Check that all inputs are filled
    if (!addSessionJobId.value || !addSessionStart.value || !addSessionEnd.value) {
        if (!addSessionJobId.value) addSessionJobId.style.border = '2px solid red';
        if (!addSessionStart.value) addSessionStart.style.border = '2px solid red';
        if (!addSessionEnd.value) addSessionEnd.style.border = '2px solid red';
        return
    }

    // Check that time range is valid
    let startTimeDB = `${addSessionStart.value}:00`;
    let endTimeDB= `${addSessionEnd.value}:00`;
    let startTime = new Date(`${date}T${startTimeDB}`);
    let endTime = new Date(`${date}T${endTimeDB}`);
    if (startTime >= endTime) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Invalid time range';
        setTimeout(() => {
            errorMessage.style.display = '';
            errorMessage.innerText = '';
        }, 2000);
        return
    }

    // Add the session
    if (!addWorkSession(selectedID, date, addSessionJobId.innerText, startTimeDB, endTimeDB)) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Error';
        setTimeout(() => {
            errorMessage.style.display = '';
            errorMessage.innerText = '';
        }, 2000);
    }
    mainBody.style.display = 'none';
    addWorkSessionHolder.style.display = '';
    successBody.style.display = 'flex';
    successSessionsAdd.style.display = 'flex';
    successMessage.innerHTML = `Session for Job <span id="success-subject">${addSessionJobId.innerText}</span> on <span id="success-subject">${date}</span> for <span id="success-subject">${firstName} ${lastName}</span> added successfully`;
})

successAddAnotherSession.addEventListener('click', () => {
    mainBody.style.display = '';
    addWorkSessionHolder.style.display = 'flex';
    successBody.style.display = 'none';
    successSessionsAdd.style.display = 'flex';
    successMessage.innerHTML = '';
})

successBackToSessionsAdd.addEventListener('click', () => {
    back.removeEventListener('click', () => { backToChartInstance(currentPage) })
    back.addEventListener('click', backToDateSelectInstance);
    mainBody.style.display = '';
    workSessionHolder.style.display = 'flex';
    successBody.style.display = 'none';
    successSessionsAdd.style.display = 'flex';
    successMessage.innerHTML = '';
    back.style.position = 'relative';
    back.style.zIndex = '1';
    ctx.style.marginTop = '0';
})

editSessionStart.addEventListener('click', () => {
    editSessionStart.showPicker();
})

editSessionEnd.addEventListener('click', () => {
    editSessionEnd.showPicker();
})

editSessionJobId.addEventListener('change', () => {
    if (editSessionJobId.style.border) editSessionJobId.style.border = '';
})

editSessionStart.addEventListener('change', () => {
    if (editSessionStart.style.border) editSessionStart.style.border = '';
})

editSessionEnd.addEventListener('change', () => {
    if (editSessionEnd.style.border) editSessionEnd.style.border = '';
})

editSessionSubmit.addEventListener('click', () => {
    // Check that all inputs are filled
    if (!editSessionJobId.value || !editSessionStart.value || !editSessionEnd.value) {
        if (!editSessionJobId.value) editSessionJobId.style.border = '2px solid red';
        if (!editSessionStart.value) editSessionStart.style.border = '2px solid red';
        if (!editSessionEnd.value) editSessionEnd.style.border = '2px solid red';
        return
    }

    // Check that time range is valid
    let startTimeDB = `${editSessionStart.value}:00`;
    let endTimeDB= `${editSessionEnd.value}:00`;
    let startTime = new Date(`${date}T${startTimeDB}`);
    let endTime = new Date(`${date}T${endTimeDB}`);
    if (startTime >= endTime) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Invalid time range';
        setTimeout(() => {
            errorMessage.style.display = '';
            errorMessage.innerText = '';
        }, 2000);
        return
    }

    // Edit the session
    if (!editWorkSession(workSessionId, editSessionJobId.innerText, startTimeDB, endTimeDB)) {
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Error';
        setTimeout(() => {
            errorMessage.style.display = '';
            errorMessage.innerText = '';
        }, 2000);
    }
    mainBody.style.display = 'none';
    addWorkSessionHolder.style.display = '';
    successBody.style.display = 'flex';
    successSessionsAdd.style.display = 'none';
    successSessionsEdit.style.display = 'flex';
    successMessage.innerHTML = `Session for Job <span id="success-subject">${editSessionJobId.innerText}</span> on <span id="success-subject">${date}</span> for <span id="success-subject">${firstName} ${lastName}</span> edited successfully`;
})

successBackToSessionsEdit.addEventListener('click', () => {
    editWorkSessionHolder.style.display = '';
    let ctxHolder = ctx.parentElement;
    ctx.remove();
    ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    ctxHolder.appendChild(ctx);
    createChart(selectedID, date);
    back.removeEventListener('click', () => { backToChartInstance(currentPage) })
    back.addEventListener('click', backToDateSelectInstance);
    mainBody.style.display = '';
    workSessionHolder.style.display = 'flex';
    successBody.style.display = 'none';
    successSessionsEdit.style.display = 'none';
    successMessage.innerHTML = '';
    back.style.position = 'relative';
    back.style.zIndex = '1';
    ctx.style.marginTop = '0';
    ctx.setAttribute('style', 'display: block; box-sizing: border-box; height: 262px; width: 786px; margin-top: 0;');
})
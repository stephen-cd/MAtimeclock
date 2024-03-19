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
    selectEmployeeHolder.style.display = 'flex';
    datePickerHolder.style.display = 'none';
    back.removeEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'true');
    setTimeout(() => { back.parentElement.setAttribute('href', 'manager.html'); }, 200);
}

let backToEmpSelectInstance = backToEmpSelect;

selectEmployeeNext.addEventListener('click', () => {
    selectEmployeeHolder.style.display = 'none';
    datePickerHolder.style.display = 'flex';
    let options = [...document.querySelectorAll('option')];
    selectedID = options.filter(option => option.selected)[0].value;
    firstName = empDict[selectedID]['firstName'];
    lastName = empDict[selectedID]['lastName'];
    back.addEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
})

datePicker.addEventListener('change', () => {
    date = datePicker.value;
})

datePicker.addEventListener('click', () => {
    datePicker.showPicker();
})

datePickerNext.addEventListener('click', () => {
    // After picking the date, get the relevant employee work sessions based on selected employee and date
    // and build the chart with the data.
    getEmployeeWorkSessions(selectedID, date).then((res) => {
        let graph;
        // let dateRanges = res.map(session => [ [session['start_time'], session['end_time']] ])
        let dateRanges = [];
        res.forEach(session => {
            let sessionDict = {};
            sessionDict['x'] = [new Date(`${date}T${session['start_time']}`), new Date(`${date}T${session['end_time']}`)];
            sessionDict['y'] = `${session['job_id']}`;
            dateRanges.push(sessionDict);
        })
        console.log(dateRanges)
        // let jobs = res.map(session => session['job_id'])
        
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
                        text: `Work Sessions for ${firstName} ${lastName} on ${date}`,
                        color: 'white',
                        fontSize: '20px',
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

        graph = new Chart(document.getElementById('myChart').getContext('2d'), config)

        ctx.addEventListener('click', (e) => {
            let points = graph.getElementsAtEventForMode(e, 'nearest', { intersect: true }, true);
            if (points.length) {
                const firstPoint = points[0];
                const label = graph.data.labels[firstPoint.index];
                const slabel = graph.data.datasets[firstPoint.datasetIndex].label;
                const value = graph.data.datasets[firstPoint.datasetIndex].data[firstPoint.index];
                console.log(label, slabel, value);
              }
        })
    });
    datePickerHolder.style.display = 'none';
    workSessionHolder.style.display = 'block';
})

addWorkSessionBtn.addEventListener('click', () => {
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
    if (!addSessionJobId.value || !addSessionStart.value || !addSessionEnd.value) {
        if (!addSessionJobId.value) addSessionJobId.style.border = '2px solid red';
        if (!addSessionStart.value) addSessionStart.style.border = '2px solid red';
        if (!addSessionEnd.value) addSessionEnd.style.border = '2px solid red';
        return
    }
    let startTime = new Date(`${date}T${addSessionStart.value}:00`);
    let endTime = new Date(`${date}T${addSessionEnd.value}:00`);
    if (startTime >= endTime) {
        addSessionStart.style.border = '2px solid red';
        addSessionEnd.style.border = '2px solid red';
        errorMessage.style.display = 'block';
        errorMessage.innerText = 'Invalid time range';
        setTimeout(() => {
            errorMessage.style.display = '';
            errorMessage.innerText = '';
        }, 2000);
    }
})
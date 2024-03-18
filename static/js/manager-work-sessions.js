import { getEmployeeNames, getEmployeeWorkSessions } from "./transactions.js";

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

datePickerNext.addEventListener('click', () => {
    console.log(selectedID, date)
    getEmployeeWorkSessions(selectedID, date).then((res) => {
        console.log(res);
        let dateRanges = res.map(session => [ { x: [new Date(session['start_time']), new Date(session['end_time'])], y: session['job_id'] } ])
        console.log(dateRanges)
        const ctx = document.getElementById('myChart');     
        new Chart(ctx, {
            type: 'bar',
            data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
            datasets: [{
                label: `Work Sessions for ${firstName} ${lastName} on ${date}`,
                data: dateRanges,
                borderWidth: 1
            }]
            },
            options: {
                barPercentage: 1,
                categoryPercentage: 1,
                indexAxis: 'y',
                aspectRatio: 10,
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'hour'
                        },
                        min: new Date(`${date}T06:00:00`),
                        max: new Date(`${date}T20:00:00`)
                    },
                    y: {
                        beginAtZero: true,
                        stacked: true
                    }
                }
            }
        });
    });
    datePickerHolder.style.display = 'none';
    workSessionHolder.style.display = 'block';
})
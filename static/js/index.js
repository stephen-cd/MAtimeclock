import { insertTimeRecords, deleteRecords, getEmployeeNames } from "./transactions.js";

let pin = document.getElementById('pin');
let enter = document.getElementById('enter');
let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let employeeList;
await getEmployeeNames().then((res) => {
    employeeList = res;
});
let admins = employeeList.filter(employee => employee['manager']);
let employees = employeeList.filter(employee => !employee['manager']);
let adminPins = admins.map(admin => admin['pin']);
let employeePins = employees.map(employee => employee['pin']);
console.log(admins, employees)
let backspace = document.getElementById('backspace');
sessionStorage.setItem('backToMO', 'false');

// deleteRecords()
// insertTimeRecords()

// Add event listeners to each keypad button to append corresponding number to pin value when pressed
keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (pin.style.border) pin.style.border = '';
        pin.value = pin.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    pin.value = pin.value.substring(0, pin.value.length - 1);
})

// When Enter is clicked
enter.addEventListener('click', () => {
    // Invalid PIN
    if (!adminPins.includes(pin.value) && !employeePins.includes(pin.value)) {
        enter.style.backgroundColor = 'crimson';
        enter.innerText = 'Invalid';
        enter.disabled = true;
        setTimeout(() => {
            enter.style.backgroundColor = '#13c296';
            enter.innerText = 'Enter';
            pin.value = '';
            enter.disabled = false;
        }, 1000);
    }

    // Admin PIN detected
    else if (admins.includes(pin.value)) {
        enter.parentElement.href = 'manager.html';
    }

    // Employee PIN detected
    else if (employeePins.includes(pin.value)) {
        enter.parentElement.href = 'employee.html';
    }
})
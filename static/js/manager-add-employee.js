import { addEmployee, getEmployees } from './transactions.js';

let firstName = document.getElementById('first-name');
let lastName = document.getElementById('last-name');
let next = document.getElementById('next');
let enter = document.getElementById('enter');
let addEmployeeInputs = document.getElementById('add-employee-inputs');
let keypadHolder = document.getElementById('keypad-holder');
let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let pin = document.getElementById('pin');
let empPin;
let pinEnter = document.getElementById('pin-enter');
let pinsDoNotMatch = document.getElementById('pins-do-not-match');
let back = document.getElementById('back');
let manager = false;
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let mainBody = document.getElementById('main-body');
let backspace = document.getElementById('backspace');
window.sessionStorage['backToMO'] = true;
let pins;

getEmployees().then((res) => {
    pins = res.map(employee => employee['pin']);
})

let backToNames = () => {
    addEmployeeInputs.style.display = 'flex';
    keypadHolder.style.display = 'none';
    setTimeout(() => {
        back.parentElement.setAttribute('href', 'manager.html');
    }, 200);
    back.removeEventListener('click', backToNamesInstance);
    window.sessionStorage['backToMO'] = true;
    if (pin.style.outline) pin.style.outline = '';
    if (empPin) {
        empPin = '';
        pin.value = '';
        pin.placeholder = 'Enter PIN for new emp.';
    }
}


let backToNamesInstance = backToNames;

firstName.addEventListener('input', () => {
    if (firstName.style.outline) firstName.style.outline = '';
})

lastName.addEventListener('input', () => {
    if (lastName.style.outline) lastName.style.outline = '';
})

next.addEventListener('click', () => {
    if (!firstName.value || !lastName.value) {
        if (!firstName.value) firstName.style.outline = '2px solid red';
        if (!lastName.value) lastName.style.outline = '2px solid red';
        return;
    }
    addEmployeeInputs.style.display = 'none';
    keypadHolder.style.display = 'block';
    back.parentElement.removeAttribute('href');
    back.addEventListener('click', backToNamesInstance);
    window.sessionStorage['backToMO'] = 'false';
})

keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (pin.style.outline) pin.style.outline = '';
        pin.value = pin.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    pin.value = pin.value.substring(0, pin.value.length - 1);
})

enter.addEventListener('click', () => {
    if (!pin.value) {
        pin.style.outline = '2px solid red';
        return;
    }
    if (pins.includes(pin.value)) {
        pin.style.outline = '2px solid red';
        return;
    }
    if (empPin) {
        if (empPin != pin.value) {
            pinEnter.style.display = 'none';
            pinsDoNotMatch.style.display = 'block';
            setTimeout(() => {
                pinEnter.style.display = 'flex';
                pinsDoNotMatch.style.display = 'none';
                pin.placeholder = 'Enter PIN for new emp.';
                pin.value = '';
                empPin = '';
                back.parentElement.href = 'manager.html';
            }, 2000);
            return;
        }
        addEmployee(firstName.value, lastName.value, empPin, manager);
        successMessage.innerHTML = `Employee <span id='success-subject'>${firstName.value} ${lastName.value}</span> added successfully.`;
        mainBody.style.display = 'none';
        successBody.style.display = 'flex';
    }
    if (!empPin) {
        empPin = pin.value;
        pin.value = '';
        pin.placeholder = 'Confirm PIN for new emp.';
    }
})
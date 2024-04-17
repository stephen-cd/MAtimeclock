import { addEmployee, getEmployees } from './transactions.js';

let employeeAmount;
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
let back = document.getElementById('back');
let manager = false;
let successBody = document.getElementById('success-body');
let successMessage = document.getElementById('success-message');
let mainBody = document.getElementById('main-body');
let backspace = document.getElementById('backspace');
window.sessionStorage['backToMO'] = true;
let pins;
let managerCheckbox = document.getElementById('manager-checkbox');
let logout = document.getElementById('home');
let addOtherEmps = document.getElementById('add-other-emps');
let returnToMenu = document.getElementById('return-to-menu');
let firstEmployee = document.getElementById('first-employee');

sessionStorage['manualUpdate'] == 'true' && sessionStorage['manager'] == '1' ? (logout.innerText = 'Log Out & Save', logout.style.width = '200px') : 'Log Out';

getEmployees().then((res) => {
    if (res.length == 0) {
        employeeAmount = 0;
        managerCheckbox.checked = true;
        managerCheckbox.setAttribute('onclick', 'return false');
        back.style.display = 'none';
        logout.style.display = 'none';
        back.addEventListener('click', () => {
            back.style.display = 'none';
        })
        next.addEventListener('click', () => {
            back.style.display = 'block';
        })
        manager = true;
        firstEmployee.innerText = 'Add a manager to begin';
    }
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

if (!managerCheckbox.checked) {
    managerCheckbox.addEventListener('change', () => {
        if (managerCheckbox.checked) {
            manager = true;
        }
    })
}

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
    if (!empPin) {
        if (!pin.value) {
            pin.style.outline = '2px solid red';
            return;
        }
        if (pins && pins.includes(pin.value)) {
            pin.value = '';
            pin.placeholder = 'Please use another PIN';
            pin.style.outline = '2px solid red';
            setTimeout(() => {
                pin.placeholder = 'Enter PIN for new emp.';
                pin.style.outline = '';
            }, 2000);
            return;
        }
    }
    
    if (empPin) {
        if (empPin != pin.value) {
            pin.value = '';
            pin.placeholder = 'PINs do not match';
            pin.style.outline = '2px solid red';
            setTimeout(() => {
                pinEnter.style.display = 'flex';
                pin.placeholder = 'Enter PIN for new emp.';
                pin.value = '';
                empPin = '';
                pin.style.outline = '';
            }, 2000);
            return;
        }
        addEmployee(firstName.value, lastName.value, empPin, manager)
         .then((res) => {
            if (employeeAmount != 0) {
                successMessage.innerHTML = `Employee <span id='success-subject'>${firstName.value} ${lastName.value}</span> added successfully.`;
                mainBody.style.display = 'none';
                successBody.style.display = 'flex';
            }
            else {
                successMessage.innerHTML = `Manager <span id='success-subject'>${firstName.value} ${lastName.value}</span> added successfully.<br><br>Redirecting to home...`;
                mainBody.style.display = 'none';
                successBody.style.display = 'flex';
                addOtherEmps.style.display = 'none';
                returnToMenu.style.display = 'none';
                setTimeout(() => {
                    window.location.href = '../templates/index.html';
                }, 3000);
            }
        }).catch((err) => {
            enter.style.backgroundColor = 'red';
            enter.innerText = 'Error';
            setTimeout(() => {
                enter.style.backgroundColor = '#13c296';
                enter.innerText = 'Enter';
            }, 2000);
        })
    }
    if (!empPin) {
        empPin = pin.value;
        pin.value = '';
        pin.placeholder = 'Confirm PIN for new emp.';
    }
})
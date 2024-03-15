import { getEmployeeNames, editEmployeeName, editEmployeePin } from "./transactions.js";

let empDict = {};
let selectEmployeeHolder = document.getElementById('select-employee-holder');
let selectEmployee = document.getElementById('select-employee');
let empSelectNext = document.getElementById('emp-select-next');
let editEmpOptions = document.getElementById('edit-employee-options');
let back = document.getElementById('back');
let editingEmp = document.getElementById('editing-employee');
let editName = document.getElementById('edit-name');
let editPin = document.getElementById('edit-pin');
let nameInputs = document.getElementById('edit-employee-name-inputs');
let firstNameInput = document.getElementById('first-name');
let lastNameInput = document.getElementById('last-name');
let editNameEnter = document.getElementById('edit-name-enter');
let firstName;
let lastName;
let selectedID;
let mainBody = document.getElementById('main-body');
let successMessage = document.getElementById('success-message');
let successBody = document.getElementById('success-body');
let keypadHolder = document.getElementById('keypad-holder');
let keypadButtons = [...document.getElementsByClassName('keypad-button')];
let editPinEnter = document.getElementById('enter');
let pin = document.getElementById('pin');
let label = document.getElementById('pin-label');
let empPin;
let pinEnter = document.getElementById('pin-enter');
let pinsDoNotMatch = document.getElementById('pins-do-not-match');
let successChangePin = document.getElementById('success-change-pin');
let successChangeName = document.getElementById('success-change-name');
let numberOfEmps;
let backspace = document.getElementById('backspace');
sessionStorage.setItem('backToMO', 'true');

await getEmployeeNames().then((res) => {
    numberOfEmps = res.length;
    selectEmployee.setAttribute('size', numberOfEmps);
    res.forEach(employee => {
        let empEntry = {};
        empEntry['firstName'] = employee['first_name'];
        empEntry['lastName'] = employee['last_name'];
        empDict[employee['id']] = empEntry;
        let option = document.createElement('option');
        option.setAttribute('value', employee['id']);
        option.innerText = `${employee['first_name']} ${employee['last_name']}`;
        selectEmployee.appendChild(option);
    })
})

let backToEmpSelect = () => {
    selectEmployeeHolder.style.display = 'flex';
    editEmpOptions.style.display = 'none';
    back.removeEventListener('click', backToEmpSelectInstance);
    back.removeEventListener('click', resetNameInstance);
    sessionStorage.setItem('backToMO', 'true');
    setTimeout(() => { back.parentElement.setAttribute('href', 'manager.html'); }, 200);
}

let backToEditEmpOptions = () => {
    editEmpOptions.style.display = 'flex';
    nameInputs.style.display = 'none';
    back.removeEventListener('click', backToEditEmpOptionsInstance);
    back.addEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', resetNameInstance);
}

let resetName = () => {
    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
}

let backToEmpSelectInstance = backToEmpSelect;
let backToEditEmpOptionsInstance = backToEditEmpOptions;
let resetNameInstance = resetName;

empSelectNext.addEventListener('click', () => {
    selectEmployeeHolder.style.display = 'none';
    editEmpOptions.style.display = 'flex';
    let options = [...document.querySelectorAll('option')];
    selectedID = options.filter(option => option.selected)[0].value;
    firstName = empDict[selectedID]['firstName'];
    lastName = empDict[selectedID]['lastName'];
    editingEmp.innerText = `Editing for: ${firstName} ${lastName}`;
    back.addEventListener('click', backToEmpSelectInstance);
    sessionStorage.setItem('backToMO', 'false');
    back.parentElement.removeAttribute('href');
})

editName.addEventListener('click', () => {
    nameInputs.style.display = 'flex';
    editEmpOptions.style.display = 'none';
    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToEditEmpOptionsInstance);
})

editNameEnter.addEventListener('click', () => {
    editEmployeeName(selectedID, firstNameInput.value, lastNameInput.value);
    successMessage.innerHTML = `Employee name changed from <span id='success-subject'>${firstName} ${lastName}</span> to <span id='success-subject'>${firstNameInput.value} ${lastNameInput.value}</span> successfully.`;
    firstName = firstNameInput.value;
    lastName = lastNameInput.value;
    mainBody.style.display = 'none';
    successBody.style.display = 'flex';
    successChangePin.parentElement.style.display = '';
    successChangeName.parentElement.style.display = 'none';
    sessionStorage.setItem('backToMO', 'false');
})

editPin.addEventListener('click', () => {
    keypadHolder.style.display = 'flex';
    editEmpOptions.style.display = 'none';
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToEditEmpOptionsInstance);
})

keypadButtons.filter(kpb => kpb.id != 'backspace').forEach(kpb => {
    kpb.addEventListener('click', () => {
        if (pin.style.border) pin.style.border = '';
        pin.value = pin.value + kpb.innerText;
    })
})

backspace.addEventListener('click', () => {
    pin.value = pin.value.substring(0, pin.value.length - 1);
})

editPinEnter.addEventListener('click', () => {
    if (!pin.value) {
        pin.style.border = '2px solid red';
        return;
    }
    if (empPin) {
        if (empPin != pin.value) {
            pinEnter.style.display = 'none';
            pinsDoNotMatch.style.display = 'block';
            setTimeout(() => {
                pinEnter.style.display = 'flex';
                pinsDoNotMatch.style.display = 'none';
                label.innerText = 'Emp. PIN:';
                pin.value = '';
                empPin = '';
                back.parentElement.href = 'manager.html';
            }, 2000);
            return;
        }
        editEmployeePin(selectedID, empPin);
        successMessage.innerHTML = `PIN for <span id='success-subject'>${firstName} ${lastName}</span> changed successfully.`;
        mainBody.style.display = 'none';
        successBody.style.display = 'flex';
        successChangePin.parentElement.style.display = 'none';
        successChangeName.parentElement.style.display = '';
    }
    if (!empPin) {
        empPin = pin.value;
        pin.value = '';
        label.innerText = 'Confirm:';
        back.removeEventListener('click', backToNamesInstance);
        back.addEventListener('click', backToPINInstance);
    }
})

successChangePin.addEventListener('click', () => {
    mainBody.style.display = '';
    keypadHolder.style.display = 'flex';
    nameInputs.style.display = 'none';
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToEditEmpOptionsInstance);
})

successChangeName.addEventListener('click', () => {
    mainBody.style.display = '';
    nameInputs.style.display = 'flex';
    keypadHolder.style.display = 'none';
    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', backToEditEmpOptionsInstance);
})
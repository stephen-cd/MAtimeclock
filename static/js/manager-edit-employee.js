import { getEmployees, editEmployeeName, editEmployeePin } from "./transactions.js";

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
let empPin;
let pinEnter = document.getElementById('pin-enter');
let pinsDoNotMatch = document.getElementById('pins-do-not-match');
let successChangePin = document.getElementById('success-change-pin');
let successChangeName = document.getElementById('success-change-name');
let numberOfEmps;
let backspace = document.getElementById('backspace');
let noEmps = document.getElementById('no-emps');
sessionStorage.setItem('backToMO', 'true');
let pins;
let originalPin;

await getEmployees().then((res) => {
    numberOfEmps = res.length;
    if (numberOfEmps == 0) {
        mainBody.style.display = 'none';
        noEmps.style.display = 'flex';
        setTimeout(() => {
            window.location.href = '../templates/manager.html';
        }, 2000);
    }
    numberOfEmps > 1 ? selectEmployee.setAttribute('size', numberOfEmps) : selectEmployee.setAttribute('size', 2);
    pins = res.map(employee => employee['pin']);
    res.forEach(employee => {
        let empEntry = {};
        empEntry['firstName'] = employee['first_name'];
        empEntry['lastName'] = employee['last_name'];
        empEntry['pin'] = employee['pin'];
        let option = document.createElement('option');
        option.setAttribute('value', res.indexOf(employee));
        empDict[res.indexOf(employee)] = empEntry;
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

let backToEditEmpOptions = (currentPage) => {
    editEmpOptions.style.display = 'flex';
    if (currentPage == nameInputs) {
        nameInputs.style.display = 'none';
        if (firstNameInput.style.outline) firstNameInput.style.outline = '';
        if (lastNameInput.style.outline) lastNameInput.style.outline = '';
    }
    if (currentPage == keypadHolder) {
        keypadHolder.style.display = 'none';
        empPin = '';
        pin.value = '';
        pin.placeholder = 'Enter new PIN for emp.';
        if (pin.style.outline) pin.style.outline = '';
    }
    back.removeEventListener('click', () => { backToEditEmpOptions(currentPage) });
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
    originalPin = empDict[selectedID]['pin'];
})

editName.addEventListener('click', () => {
    nameInputs.style.display = 'flex';
    editEmpOptions.style.display = 'none';
    firstNameInput.value = firstName;
    lastNameInput.value = lastName;
    back.removeEventListener('click', backToEmpSelectInstance);
    back.addEventListener('click', () => { backToEditEmpOptions(nameInputs) });
})

firstNameInput.addEventListener('input', () => {
    if (firstNameInput.style.outline) firstNameInput.style.outline = '';
})

lastNameInput.addEventListener('input', () => {
    if (lastNameInput.style.outline) lastNameInput.style.outline = '';
})

editNameEnter.addEventListener('click', () => {
    if (!firstNameInput.value || !lastNameInput.value) {
        if (!firstNameInput.value) firstNameInput.style.outline = '2px solid red';
        if (!lastNameInput.value) lastNameInput.style.outline = '2px solid red';
        return;
    }
    if (firstName == firstNameInput.value) successMessage.innerText = 'No changes detected.';
    else { editEmployeeName(originalPin, firstNameInput.value, lastNameInput.value);
        successMessage.innerHTML = `Employee name changed from <span id='success-subject'>${firstName} ${lastName}</span> to <span id='success-subject'>${firstNameInput.value} ${lastNameInput.value}</span> successfully.`;
        firstName = firstNameInput.value;
        lastName = lastNameInput.value;
        sessionStorage['first_name'] = firstName;
        sessionStorage['last_name'] = lastName;
        editingEmp.innerText = `Editing for: ${firstName} ${lastName}`;
    }
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
    back.addEventListener('click', () => { backToEditEmpOptions(keypadHolder) });
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

editPinEnter.addEventListener('click', () => {
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
                pin.placeholder = 'Enter new PIN for emp.';
                pin.value = '';
                empPin = '';
                back.parentElement.href = 'manager.html';
            }, 2000);
            return;
        }
        editEmployeePin(originalPin, empPin);
        successMessage.innerHTML = `PIN for <span id='success-subject'>${firstName} ${lastName}</span> changed successfully.`;
        mainBody.style.display = 'none';
        successBody.style.display = 'flex';
        successChangePin.parentElement.style.display = 'none';
        successChangeName.parentElement.style.display = '';
    }
    if (!empPin) {
        empPin = pin.value;
        pin.value = '';
        pin.placeholder = 'Confirm new PIN for emp.';
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
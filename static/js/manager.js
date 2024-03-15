let timeClock = document.getElementById('time-clock');
let managerOptions1 = document.getElementById('manager-options-1');
let back = document.getElementById('back');
let managerOptions2 = document.getElementById('manager-options-2');
let goToMO2 = document.getElementById('go-to-MO2');

back.addEventListener('click', () => {
    managerOptions1.style.display = 'flex';
    managerOptions2.style.display = 'none';
    back.hidden = true;
});

timeClock.addEventListener('click', () => {
    back.parentElement.href = 'manager.html';
})

goToMO2.addEventListener('click', () => {
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
})

console.log(typeof sessionStorage.getItem('backToMO'))

if (sessionStorage.getItem('backToMO') == 'true') {
    console.log('here')
    managerOptions1.style.display = 'none';
    managerOptions2.style.display = 'flex';
    back.hidden = false;
}
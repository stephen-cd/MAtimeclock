// Initialize DB instance
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.sqlite3');

// Select employee records
async function getEmployeeNames() {
    let statement = 'SELECT id, first_name, last_name FROM timeclock_employee ORDER BY first_name';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) return console.log(err.message);
            resolve(rows);
        });
    }).then((rows) => {
        return rows;
    })
}

// Add an employee record to the DB
function addEmployee(firstName, lastName, pin, manager) {
    let statement = `INSERT INTO timeclock_employee (first_name, last_name, pin, manager) VALUES ("${firstName}", "${lastName}", "${pin}", ${manager})`
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Edit an employee name
function editEmployeeName(id, firstName, lastName) {
    let statement = `UPDATE timeclock_employee SET first_name="${firstName}", last_name="${lastName}" WHERE id="${id}"`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Edit an employee pin
function editEmployeePin(id, pin) {
    let statement = `UPDATE timeclock_employee SET pin="${pin}" WHERE id="${id}"`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Add a job
function addJob(job_id) {
    let statement = `INSERT INTO timeclock_job (job_id, status) VALUES ("${job_id}", "active")`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

export { getEmployeeNames, addEmployee, editEmployeeName, editEmployeePin, addJob }
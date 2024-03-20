// Initialize DB instance
const sqlite3 = require('sqlite3').verbose();
let db = new sqlite3.Database('db.sqlite3');

// Select employee records
async function getEmployeeNames() {
    let statement = 'SELECT id, first_name, last_name, pin, uuid, manager FROM timeclock_employee WHERE pin != "" ORDER BY first_name';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) return console.log(err.message);
            resolve(rows);
        });
    }).then((rows) => {
        return rows;
    })
}

// Select job records
async function getJobs() {
    let statement = 'SELECT id, job_id, status FROM timeclock_job ORDER BY job_id';
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
    let statement = `SELECT MAX(rec_id) as max_rec_id FROM timeclock_employee`;
    let uuid = crypto.randomUUID();
    statement = `INSERT INTO timeclock_employee (first_name, last_name, pin, manager, uuid) VALUES ("${firstName}", "${lastName}", "${pin}", ${manager}, "${uuid}")`
    db.run(statement, (err) => { if (err) return console.log(err); });
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

// Edit a job ID
function editJobId(id, job_id) {
    let statement = `UPDATE timeclock_job SET job_id="${job_id}" WHERE id="${id}"`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Edit a job status
function editJobStatus(id, status) {
    let statement = `UPDATE timeclock_job SET status="${status}" WHERE id="${id}"`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Remove a job
function removeJob(id) {
    let statement = `DELETE FROM timeclock_job WHERE id="${id}"`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// For dev, insert dummy time records
function insertTimeRecords() {
    let date = '2024-03-19'
    let start_time = '12:00:00';
    let end_time = '19:00:00';
    let statement = `INSERT INTO timeclock_hours (date, start_time, end_time, uuid, job_id) VALUES ("${date}", "${start_time}", "${end_time}", "cb91e90c-ea98-41b2-884a-30b941a15c5a", "1234-56")`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

function deleteRecords() {
    let statement = 'DELETE FROM timeclock_hours';
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Get employee time records
async function getEmployeeWorkSessions(employeeUuid, date) {
    let statement = `SELECT id, start_time, end_time, job_id FROM timeclock_hours WHERE date="${date}" AND uuid="${employeeUuid}" ORDER BY job_id`;
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) return console.log(err.message);
            resolve(rows);
        });
    }).then((rows) => {
        return rows;
    })
}

// Add work session
function addWorkSession(employeeUuid, date, jobId, startTime, endTime) {
    let statement = `INSERT INTO timeclock_hours (uuid, date, job_id, start_time, end_time) VALUES ("${employeeUuid}", "${date}", "${jobId}", "${startTime}", "${endTime}")`;
    return db.run(statement, (err) => { if (err) console.log(err); return false; });
}

// Edit work session
function editWorkSession(id, jobId, startTime, endTime) {
    let statement = `UPDATE timeclock_hours SET job_id="${jobId}", start_time="${startTime}", end_time="${endTime}" WHERE id="${id}"`;
    console.log(statement)
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Clock in
function clockIn(uuid, jobId) {
    let currentDateTime = new Date();
    let date = `${currentDateTime.getFullYear()}-${currentDateTime.getMonth()}-${currentDateTime.getDay()}`;
    let minutes = (currentDateTime.getMinutes() < 10 ? '0' : '') + currentDateTime.getMinutes();
    let seconds = (currentDateTime.getSeconds() < 10 ? '0' : '') + currentDateTime.getSeconds();
    let time = `${currentDateTime.getHours()}:${minutes}:${seconds}`;
    let statement = `INSERT INTO timeclock_hours (uuid, job_id, date, start_time, end_time) VALUES ("${uuid}", "${jobId}", "${date}", "${time}", '')`
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

// Check if employee is clocked in
async function checkIfClockedIn(uuid) {
    let statement = `SELECT job_id FROM timeclock_hours WHERE uuid="${uuid}" AND end_time=''`;
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) return console.log(err.message);
            resolve(rows);
        });
    }).then((rows) => {
        return rows;
    })
}

// Clock out
function clockOut(id) {
    let currentDateTime = new Date();
    let minutes = (currentDateTime.getMinutes() < 10 ? '0' : '') + currentDateTime.getMinutes();
    let seconds = (currentDateTime.getSeconds() < 10 ? '0' : '') + currentDateTime.getSeconds();
    let time = `${currentDateTime.getHours()}:${minutes}:${seconds}`;
    let statement = `UPDATE timeclock_hours SET end_time="${time}" WHERE id=${id}`;
    db.run(statement, (err) => { if (err) return console.log(err.message); });
}

export { getEmployeeNames, getJobs, addEmployee, editEmployeeName, editEmployeePin, addJob, editJobId, editJobStatus, removeJob, 
         insertTimeRecords, getEmployeeWorkSessions, addWorkSession, editWorkSession, deleteRecords, clockIn, clockOut, checkIfClockedIn }
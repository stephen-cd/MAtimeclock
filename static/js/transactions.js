const log = require('electron-log/main');
const path = require('path');

const tLog = log.create({ logId: 'transactions'});
tLog.transports.file.resolvePathFn = () => path.join(__dirname, '/../logs/transactions.log');

// Initialize DB instance
const sqlite3 = require('sqlite3');
let db = new sqlite3.Database('db.sqlite3');

async function getAllEmployees() {
    let statement = 'SELECT * FROM timeclock_employee';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function getAllJobs() {
    let statement = 'SELECT * FROM timeclock_job';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function getAllHours() {
    let statement = 'SELECT * FROM timeclock_hours';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    }).then((res) => {
        return res;
    })
}

async function prepareDataForUpdate() {
    return Promise.all([await getAllEmployees(), await getAllJobs(), await getAllHours()]);
}

async function updateWebServer() {
    return new Promise(async (resolve, reject) => {
        let csrf_token;
        const get = await fetch(sessionStorage['host'], {
            method: 'GET',
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Accept': 'text/html; charset=utf-8'
            }
        })
        if (get.ok) {
            get.text().then((response) => {
                csrf_token = response
                prepareDataForUpdate().then(async (res) => {
                    const post = await fetch(sessionStorage['host'], {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'text/html; charset=utf-8;',
                            'X-CSRFToken': csrf_token,
                        },
                        body: JSON.stringify(res)
                    })
                    if (post.ok) resolve('success');
                    else reject(post.status);
                })
            })
        }
        else reject(get.status);
    }).then((res) => {
        console.log(res);
    }).catch((err) => {
        log.error(err);
    })
}

// Select employee records
async function getEmployees() {
    let statement = 'SELECT pin, first_name, last_name, manager FROM timeclock_employee WHERE pin != "" ORDER BY first_name';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

// Select job records
async function getJobs() {
    let statement = 'SELECT job_id, status FROM timeclock_job ORDER BY job_id';
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

// Add an employee record to the DB
function addEmployee(firstName, lastName, pin, manager) {
    let statement = `INSERT INTO timeclock_employee (first_name, last_name, pin, manager) VALUES (?, ?, ?, ?)`
    return new Promise((resolve, reject) => {
        db.run(statement, [firstName, lastName, pin, manager], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Edit an employee name
function editEmployeeName(pin, firstName, lastName) {
    let statement = `UPDATE timeclock_employee SET first_name=?, last_name=? WHERE pin=?`;
    return new Promise((resolve, reject) => {
        db.run(statement, [firstName, lastName, pin], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Edit an employee pin
function editEmployeePin(old_pin, new_pin) {
    let statement1 = `UPDATE timeclock_employee SET pin=${new_pin} WHERE pin=${old_pin}`;
    let statement2 = `UPDATE timeclock_hours SET pin=${new_pin} WHERE pin=${old_pin}`;
    let statement = `BEGIN TRANSACTION; ${statement1}; ${statement2}; COMMIT TRANSACTION;`;
    return new Promise((resolve, reject) => {
        db.exec(statement, (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Remove an employee
function removeEmployee(pin) {
    let statement1 = `DELETE FROM timeclock_employee WHERE pin="${pin}"`;
    let statement2 = `DELETE FROM timeclock_hours WHERE pin="${pin}"`;
    let statement = `BEGIN TRANSACTION; ${statement1}; ${statement2}; COMMIT TRANSACTION;`;
    return new Promise((resolve, reject) => {
        db.exec(statement, (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Add a job
function addJob(job_id) {
    let statement = `INSERT INTO timeclock_job (job_id, status) VALUES (?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(statement, [job_id, 'active'], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Edit a job ID
function editJobId(old_job_id, new_job_id) {
    let statement1 = `UPDATE timeclock_job SET job_id="${new_job_id}" WHERE job_id="${old_job_id}"`;
    let statement2 = `UPDATE timeclock_hours SET job_id="${new_job_id}" WHERE job_id="${old_job_id}"`;
    let statement = `BEGIN TRANSACTION; ${statement1}; ${statement2}; COMMIT TRANSACTION;`;
    return new Promise((resolve, reject) => {
        db.exec(statement, (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Edit a job status
function editJobStatus(job_id, status) {
    let statement = `UPDATE timeclock_job SET status=? WHERE job_id=?`;
    return new Promise((resolve, reject) => {
        db.run(statement, [status, job_id], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Remove a job
function removeJob(job_id) {
    let statement1 = `DELETE FROM timeclock_job WHERE job_id="${job_id}"`;
    let statement2 = `DELETE FROM timeclock_hours WHERE job_id="${job_id}"`;
    let statement = `BEGIN TRANSACTION; ${statement1}; ${statement2}; COMMIT TRANSACTION;`;
    return new Promise((resolve, reject) => {
        db.exec(statement, (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Get employee time records
async function getEmployeeWorkSessions(pin, date) {
    let statement = `SELECT id, start_time, end_time, job_id FROM timeclock_hours WHERE date=? AND pin=? ORDER BY job_id`;
    return new Promise((resolve) => {
        db.all(statement, [date, pin], (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

// Add work session
function addWorkSession(pin, date, jobId, startTime, endTime) {
    let statement = `INSERT INTO timeclock_hours (pin, date, job_id, start_time, end_time) VALUES (?, ?, ?, ?, ?)`;
    return new Promise((resolve, reject) => {
        db.run(statement, [pin, date, jobId, startTime, endTime], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Edit work session
function editWorkSession(id, jobId, startTime, endTime) {
    let statement = `UPDATE timeclock_hours SET job_id=?, start_time=?, end_time=? WHERE id=?`;
    return new Promise((resolve, reject) => {
        db.run(statement, [jobId, startTime, endTime, id], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Delete work session
function deleteWorkSession(id) {
    let statement = `DELETE FROM timeclock_hours WHERE id=?`;
    return new Promise((resolve, reject) => {
        db.run(statement, [id], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Clock in
function clockIn(pin, jobId) {
    let currentDateTime = new Date();
    let month = (currentDateTime.getMonth() + 1 < 10 ? '0' : '') + (currentDateTime.getMonth() + 1);
    let day = (currentDateTime.getDate() < 10 ? '0' : '') + currentDateTime.getDate();
    let date = `${currentDateTime.getFullYear()}-${month}-${day}`;
    let hours = (currentDateTime.getHours() < 10 ? '0' : '') + currentDateTime.getHours();
    let minutes = (currentDateTime.getMinutes() < 10 ? '0' : '') + currentDateTime.getMinutes();
    let seconds = (currentDateTime.getSeconds() < 10 ? '0' : '') + currentDateTime.getSeconds();
    let time = `${hours}:${minutes}:${seconds}`;
    let statement = `INSERT INTO timeclock_hours (pin, job_id, date, start_time, end_time) VALUES (?, ?, ?, ?, ?)`
    return new Promise((resolve, reject) => {
        db.run(statement, [pin, jobId, date, time, ''], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Check if employee is clocked in
async function checkIfClockedIn(pin) {
    let statement = `SELECT id, job_id FROM timeclock_hours WHERE pin="${pin}" AND end_time=''`;
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

function getStartTime(id) {
    let statement = `SELECT start_time FROM timeclock_hours WHERE id="${id}"`;
    return new Promise((resolve) => {
        db.get(statement, (err, start_time) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(start_time);
        });
    })
}

// Clock out
function clockOut(id, startTime) {
    if (startTime.length == 8) startTime = startTime.substring(0, startTime.length - 3);
    let currentDateTime = new Date();
    let minutes = (currentDateTime.getMinutes() < 10 ? '0' : '') + currentDateTime.getMinutes();
    let time = `${currentDateTime.getHours()}:${minutes}`;
    let statement = `UPDATE timeclock_hours SET start_time=?, end_time=? WHERE id=?`;
    return new Promise((resolve, reject) => {
        db.run(statement, [startTime, time, id], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(this)
        });
    })
}

// Get clocked in employees
async function getClockedInEmployees() {
    let statement = `SELECT y.job_id, x.first_name, x.last_name, y.date, y.start_time, x.pin FROM timeclock_employee AS x INNER JOIN timeclock_hours AS y ON x.pin = y.pin WHERE y.end_time=''`;
    return new Promise((resolve) => {
        db.all(statement, (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

// If there are work sessions in progress for a job, it shouldn't be able to be removed
async function checkForInProgressWorkSessions(jobId) {
    let statement = `SELECT * from timeclock_hours WHERE job_id=? AND end_time=?`;
    return new Promise((resolve) => {
        db.all(statement, [jobId, ''], (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

async function getEmployeeWorkSessionCount(pin) {
    let statement = `SELECT COUNT(*) FROM timeclock_hours WHERE pin=?`;
    return new Promise((resolve) => {
        db.get(statement, [pin], (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

async function getJobWorkSessionCount(job_id) {
    let statement = `SELECT COUNT(*) FROM timeclock_hours WHERE job_id=?`;
    return new Promise((resolve) => {
        db.get(statement, [job_id], (err, rows) => { 
            if (err) {tLog.error(err); reject(err)};
            resolve(rows);
        });
    })
}

function forceClockOut(pin, startTime) {
    let date = new Date();
    date = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
    let statement = 'UPDATE timeclock_hours SET start_time=?, end_time="23:59" WHERE pin=? AND end_time=? AND date!=?';
    return new Promise((resolve, reject) => {
        db.run(statement, [startTime, pin, '', date], (err) => { 
            if (err) {tLog.error(err); reject(err)}
            else resolve(pin);
        });
    })
}

export { getEmployees, getJobs, addEmployee, editEmployeeName, editEmployeePin, addJob, editJobId, editJobStatus, removeJob, 
         getEmployeeWorkSessions, addWorkSession, editWorkSession, clockIn, clockOut, checkIfClockedIn, getClockedInEmployees,
         checkForInProgressWorkSessions, deleteWorkSession, getEmployeeWorkSessionCount, removeEmployee, getJobWorkSessionCount,
         getStartTime, forceClockOut, updateWebServer }
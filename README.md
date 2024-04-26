<h1>Overview</h1>
<br><br>

By logging in with a PIN and choosing a job, employees can clock in and have their work session tracked. Managers can add/edit employees, jobs, and work sessions. Data is saved to a local SQLite file and is transferred to a web server either manually or periodically. Managers can log into the web server and select a range of dates from which they can generate a report of work session data. The report displays separate tables of the hours worked per employee and the hours worked on each job, giving total hours for each employee and total hours put into each job. Built using Electron for the front-end, Django for the back-end web server, and SQLite for data storage.<br><br>

This is the front-end repository for an application that serves as a time clock as well as an employee management system. The code here pertains to the main user interface for the time clock and employee management system.<br><br>

<h1>Setup</h1>
<br><br>

<h3>Prerequisites</h3><br>


It is recommended that the back-end (MAtimeclock-BE) is configured before the front-end so that the user can easily get a SQLite file with the correct schema.<br><br>

1) After creating an appropriate directory for the application, ensure that electron

Add the sqlite file to the same directory as main.js<br>
npm install<br>
Run with ./node_modules/.bin/electron . --enable-logging=file --log-file='./logs/main.log' --no-sandbox to enable applcation logging to main.log in the project directory.

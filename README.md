<h1>Overview</h1>

An application that serves as a time clock as well as an employee management system. By logging in with a PIN and choosing a job, employees can clock in and have their work session tracked. Managers can add/edit employees, jobs, and work sessions. Data is saved to a local SQLite file and is transferred to a web server either manually or periodically. Managers can log into the web server and select a range of dates from which they can generate a report of work session data. The report displays separate tables of the hours worked per employee and the hours worked on each job, giving total hours for each employee and total hours put into each job. Built using Electron for the front-end, Django for the back-end web server, and SQLite for data storage.

This is the front-end repository, which involves the Electron code for the main user interface.

Note: This application was built to be used with a Raspberry Pi and the official Raspberry Pi touchscreen. It can be used without it, but it has not been adapted for other screen sizes and will start up in a resolution of 800x480.

<h1>Setup</h1>

<h3>Prerequisites</h3>


It is recommended that the back-end (MAtimeclock-BE) is configured before the front-end so that the user can easily get a SQLite file with the correct schema.

1) After creating an appropriate directory for the application, ensure that electron

Add the sqlite file to the same directory as main.js<br>
npm install<br>
Run with ./node_modules/.bin/electron . --enable-logging=file --log-file='./logs/main.log' --no-sandbox to enable applcation logging to main.log in the project directory.

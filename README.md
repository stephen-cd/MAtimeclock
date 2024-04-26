<h1>Overview</h1>

An application that serves as a time clock as well as an employee management system. By logging in with a PIN and choosing a job, employees can clock in and have their work session tracked. Managers can add/edit employees, jobs, and work sessions. Data is saved to a local SQLite file and is transferred to a web server either manually or periodically. Managers can log into the web server and select a range of dates from which they can generate a report of work session data. The report displays separate tables of the hours worked per employee and the hours worked on each job, giving total hours for each employee and total hours put into each job. Built using Electron for the front-end, Django for the back-end web server, and SQLite for data storage.

This is the front-end repository, which involves the Electron code for the main user interface.

Note: This application was built to be used with a Raspberry Pi and the official Raspberry Pi touchscreen. It can be used without it, but it has not been adapted for other screen sizes and will start up in a resolution of 800x480.

<h1>Setup</h1>

<h3>Prerequisites</h3>

The back-end (MAtimeclock-BE) has been configured and a copy of the SQLite database file has been obtained.
Node.js and Electron are installed and a directory has been created for the application. Instructions for this can be found [here](https://www.electronjs.org/docs/latest/tutorial/quick-start). Please follow up until and including setting the start command.

<h3>Steps</h3>

1) Run npm install to install the dependencies.
2) Create a folder in the root directory called logs, then create a main.log and transactions.log in the folder.
3) From the back-end, add a copy of the SQLite file to the root directory.
4) Run npm start the start the application.

<h1>Creating first employee (manager)</h1>

Upon starting the application, the user should be prompted to add a manager, which involves entering a first and last name and a PIN. After submitting, they will be directed to the home page.
From the home screen, a user enters their PIN. If the user is a manager, they can access either the time clock or manager options. Regular employees are automatically directed to the time clock.

<h1>Clocking in and out</h1>

A user clicks Clock into Job and is then presented with a list of active jobs. Once they select a job, they can click Clock In to initiate a work session on that job. They are redirected to the home screen automatically. 
Clocking out follows the same process minus selecting a job.

<h1>Manager Options</h1>

In Manager Options, a manager can add/edit employees, jobs, and work sessions.

<h3>Add/Edit Employee</h3>

To add an employee, a manager enters a first name, last name, whether or not they are a manager, and a PIN (entered and confirmed). PINs must be unique.
Editing employees involves selecting an employee and choosing the action that needs to be taken (change name, change pin, remove employee). 
Change Name brings the manager to the name portion of adding an employee except the fields are pre-populated with the employee info. 
Change PIN brings the manager to a keypad where they can enter and confirm a new PIN. 
Removing an employee also deletes all of their work sessions.

<h3>Add/Edit Job</h3>
To add a job, a manager enters an associated job ID and submits. Job IDs must be unique.<br>
Editing jobs involves selecting a job and choosing the action that needs to be taken (change job ID, complete/reopen, remove job).<br>
Change job ID brings the manager to the same keypad with the current job ID pre-populated.<br>
Complete/reopen will allow the manager to complete or reopen a job. If a job is currently active (jobs are set to active by default when created), the manager will be able to complete the job. If the job is already        complete, they will be able to reopen it. Only active jobs will show up in the list of time clock jobs.<br>
Removing a job also deletes all of the work sessions associated with that job.

<h3>Add/Edit Work Sessions</h3>
When Work Sessions is clicked, an employee must be selected, then a date. The manager will then see a horizontal bar chart displaying an employees work hours for that day, with time (6 AM - 8 PM currently) on the X-axis and jobs on the Y-axis. On this same screen, a manager can either add, edit, or delete a work session. They can also click on a bar to edit a work session if any are present.<br>
Adding a work session involves selecting a job, a start time, and an end time. An end time is not required, and excluding one will result in the employee being clocked in for the selected job from the start time.<br>
Editing a work session involves the same form but with pre-populated data from the session.<br>
Deleting a work session removes it from the database.

<h1>Syncing with the web server</h1>
Manual or automatic syncing with the back-end web server can be configured in main.js by setting manualUpdate to true or false.<br>
If manual (true) is set, then the web server will be synced every time a manager logs out.<br>
If automatic (false) is set, then the web server will be updated at a specified time interval defined in dbUpdateTime. By default, it is set to 5 PM (Eastern time zone).

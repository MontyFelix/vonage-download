const fork = require('child_process').fork;
const moment = require('moment');

let startDate = moment()
let endDateDate = moment(startDate).subtract(1, 'weeks')
console.log(startDate.toISOString(), endDateDate.toISOString())
const ls = fork('app.js', ['--start=2021-09-28T00:01:00Z', '--end=2021-09-28T00:02:00Z']);

ls.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

ls.on('data', (data) => {
    console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
    //check endDateDate to be sameOrAfter date - 545 days
    //check exit code and execute fork('app.js', [with further dates])
    console.log(`child process exited with code ${code}`);
    // possibly on error exit code do a rerun of current dates
});
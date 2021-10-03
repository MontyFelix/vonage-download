const fork = require('child_process').fork;
const moment = require('moment');
const processedDates = require('simple-node-logger').createSimpleLogger('processedDatesLogger.log');

// probably best to substitute with process argv for starting point
let endDate = moment();
const tillDate = moment(endDate).subtract(545, 'days');
let startDate = moment(endDate).subtract(1, 'weeks');

async function* generateWeek() {
    while(endDate.isSameOrAfter(tillDate)) {
        yield await doFork(startDate, endDate);
    }
}

(async function() {
    for await (let week of generateWeek()) {
        processedDates.info(`processed start: ${startDate} - end ${endDate} EXIT with: ${week}`)
        endDate = moment(startDate)
        startDate = moment(startDate).subtract(1, 'weeks');
    }
})()


function doFork(start, end) {
    return new Promise((resolve, reject) => {
        let ls = fork('app.js', [`--start=${start.toISOString()}`, `--end=${end.toISOString()}`]);

        // ls.on('data', (data) => {
        //     console.log(`stdout: ${data}`);
        // });
        
        ls.on('error', (error) => {
            console.log(`stderr: ${error}`);
            reject(error)
        });
        // ls.on('exit', (code) => {
        //     console.log('exit', code)
        // })
        ls.on('close', (code) => {
            console.log(`child process exited with code ${code}`);
            resolve(code);
        });
    })
}
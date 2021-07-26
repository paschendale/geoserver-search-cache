const sqlite3 = require('sqlite3').verbose();
const database = require('/data.db');
const moment = require('moment');
const path = require('path')

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

/* Opening database */
var db = new sqlite3.Database(path.resolve(__dirname,'data.db'), (err) => {
    if (err) {
        return console.error(err.message)
    }

    console.log(logTime() + 'Successfully opened database at ' + path.resolve(__dirname,'data.db'))
});

/* Model Functions */

var resultsLimit = 1000; // Set a limit for 1000 rows on a query

function searchFor(keyword) {

    return new Promise((resolve,reject) => {

        var t0 = new Date().getTime()
    
        console.log(logTime() + 'Searching for keywords: ' + keyword)
    
        db.all("SELECT * FROM cache WHERE "
                +" attribute MATCH '*"
                +keyword
                +"*' COLLATE NOCASE GROUP BY original_id, table_name LIMIT "
                + resultsLimit +";", 
        (err,rows) => {
            
            if (err) { console.error(err); reject();}
    
            var t1 = new Date().getTime()
            console.log(logTime() + rows.length + ' results in ' + (t1 - t0)/1000 + ' seconds.')
            
            resolve(rows) 
    
        })

    })
}

module.exports = {
    searchFor
}
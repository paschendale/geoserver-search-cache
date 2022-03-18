const sqlite3 = require('sqlite3').verbose();
const path = require('path')
const fetch = require('node-fetch');

/* Auxiliary functions */

const moment = require('moment');
const { type } = require('os');

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

function createGeoserverParams(params) {

    paramStringArray = [];

    for (i = 0; i < Object.keys(params).length; i++) {
        paramStringArray.push(Object.keys(params)[i] + '=' + params[Object.keys(params)[i]])

        if (i + 1 == Object.keys(params).length ) {return paramStringArray.join('&')}
    }
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

        /* adicionando masks */
        keyword = '*' + keyword + '*';
        
        /* reformatando a pesquisa para o caso de haverem multiplas keywords a pesquisa ser executada com OR e não com AND */
        if (keyword.split(' ').length > 1) {keyword = keyword.split(' ').join('* OR *')}      

        var t0 = new Date().getTime()
    
        console.log(logTime() + 'Searching for keywords: ' + keyword)
    
        db.all("SELECT * FROM cache WHERE "
                +" attribute MATCH '"
                +keyword
                +"' COLLATE NOCASE GROUP BY original_id, table_name LIMIT "
                + resultsLimit +";", 
        (err,rows) => {
            
            if (err) { console.error(err); reject();}
    
            var t1 = new Date().getTime()
            console.log(logTime() + rows.length + ' results in ' + (t1 - t0)/1000 + ' seconds.')
            
            resolve(rows) 
    
        })

    })
}

function fetchTheseTables(tables,columns,host,headers) {
    return new Promise((resolve,reject) => {

        params = {
            service: 'WFS',
            version: '1.3',
            request: 'GetFeature',
            typeName: tables.join(','),
            outputFormat: 'application/json',
            exceptions: 'application/json',
            srsName: 'EPSG:4326'
        }

        var url =   host + createGeoserverParams(params)
        
        t0 = new Date().getTime()
        
        console.log(logTime() + 'Fetch requisition sent on address: ' + url)
    
        fetch(url,{method: 'GET', headers: headers})
        .then(res => res.json())
        .then(result => {    

            tableForInsert = [];
            
            for (t = 0;t < tables.length;t++) {
                for (f = 0;f < result.features.length;f++) {
                    for (c = 0;c < columns.length;c++)
    
                    if (result.features[f].id.split('.')[0] == tables[t].split(':')[1] &&
                        result.features[f].properties[columns[t][c]] !== undefined) {
                        data = {
                            table_name: result.features[f].id.split('.')[0],
                            column_name: columns[t][c],
                            attribute: result.features[f].properties[columns[t][c]],
                            type: 'text',
                            original_id: f,
                            original_row: result.features[f].properties,
                            original_entry: result.features[f],
                            geometry: result.features[f].geometry
                        }                   
                        tableForInsert.push(data)
                    }
                }

                if (t + 1 == tables.length) {           
                    var t1 = new Date().getTime()
                    console.log(logTime() + 'Fetch requisition completed in '+ (t1 - t0)/1000 + ' seconds.')
                    logCaching(tableForInsert.length,'fetchData',(t1 - t0)/1000,false).then(() => {
                        resolve(tableForInsert)
                    })
                }
            }           
            
        })
        .catch(e => {
            console.log(logTime() + 'Fetch did not complete. Reason: ',e)
            reject(e)
        }) 

    })    
}

function insertData (data) {

    /* Data must contain a array of objects to be inserted on the cache */

    new Promise((resolve,reject) => {

        t0 = new Date().getTime()

        console.log(logTime() + 'Inserting ' + data.length + ' rows on cache database.')
 
        queryString = [];

        for (i = 0;i < data.length; i++) {

            data[i]["attribute"] = (typeof(data[i]["attribute"]) == 'string')? data[i]["attribute"].replaceAll("'","") : data[i]["attribute"]

            row = [
                "'"+data[i]["table_name"]+"'",
                "'"+data[i]["column_name"]+"'",
                "'"+data[i]["attribute"]+"'", 
                "'"+data[i]["type"]+"'",
                data[i]["original_id"],
                "'"+JSON.stringify(data[i]["original_row"]).replaceAll("'","")+"'",
                "'"+JSON.stringify(data[i]["original_entry"]).replaceAll("'","")+"'",
                "'"+JSON.stringify(data[i]["geometry"])+"'"
            ]

            queryString.push('('+row.join()+')')                        
        }

        query = `INSERT INTO cache(
                table_name,
                column_name,
                attribute,
                type,
                original_id,
                original_row,
                original_entry,
                geometry
            ) VALUES ` + queryString.join(',')

        db.run(query,
            e => {
                if (e) {
                    t1 = new Date().getTime();

                    console.log(logTime() + 'Data insertion did not complete. Reason: ', e)
                    logCaching(queryString.length,'errorUpdatingCache' + JSON.stringify(e),(t1 - t0)/1000,false)
                    .then(() => {
                        reject(e)
                    })
                } else {
                    t1 = new Date().getTime();

                    console.log(logTime() + 'Succesfully inserted ' + queryString.length + ' rows into database in '+ (t1 - t0)/1000 + ' seconds.')
                    logCaching(queryString.length,'updatingCache',(t1 - t0)/1000,false)
                    .then(() => {
                        resolve()
                    })
                }
        })     
    })
}

function cacheTheseTables(tables,columns,host,headers) {

    return new Promise((resolve,reject) => {
        fetchTheseTables(tables,columns,host,headers)
        .then(data => insertData(data))
        .then(results => resolve(results))
        .catch(e => {
            reject(e);
            console.log(logTime() + 'Caching failed. Reason: ', e);
        })
    })   
}

function clearCache() {
    
    t0 = new Date().getTime()

    return new Promise((resolve,reject) => {
        db.run('DELETE FROM cache;',(err) => {
            if (err) {
                console.log(logTime() + 'Could not clear database. Reason: ', err)
                reject(err)
            }
            else {
                var t1 = new Date().getTime()
                console.log(logTime() + 'Cache database succesfully cleared.')
                logCaching(0,'clearingCache',(t1 - t0)/1000,true).then(() => {
                    resolve();
                })
            }
        })
    })
}

function logCaching (rowsUpdated,operation,timeSpent,clearedCache) {
    return new Promise((resolve,reject) => {
        db.run(`INSERT INTO history(
            rowsUpdated,
            operation,
            timeSpent,
            clearedCache
        ) VALUES (` + JSON.stringify(rowsUpdated) + ',' + JSON.stringify(operation) + ',' + JSON.stringify(timeSpent) + ',' + JSON.stringify(clearedCache) +');', (err) => {
            if (err) {
                console.log(logTime() + 'Could not save caching statistics on history. Reason: ', err)
                reject(err)
            } else {
                console.log(logTime() + 'Caching statistics succesfully saved on history.')
                resolve();
            }
        })
    })
}

function retrieveHistory (operation = 'any') {

    console.log(operation)

    var query = 'SELECT * FROM history'

    if (operation !== 'clearingCache' && operation !== 'updatingCache' && operation !== 'fetchData') {
        operation = 'any'
    }

    if (operation !== 'any') {query = query + " WHERE operation LIKE '" + operation + "'"}

    return new Promise ((resolve,reject) => {
        db.all(query + ';', (err,rows) => {
            if (err) {
                console.log(logTime() + 'Could not retrieve caching history. Reason: ' + err)
                reject(err);
            } else {
                console.log(logTime() + 'Caching history retrieved for operations: ' + operation)
                resolve(rows);
            }
        })
    })
}

module.exports = {
    cacheTheseTables,
    searchFor,
    clearCache,
    retrieveHistory
}
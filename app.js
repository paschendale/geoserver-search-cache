const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const view = require('./view.js');
const db = require('./model/model.js')

/* Auxiliary functions */

const moment = require('moment');

function logTime() {
    return moment().format('MMMM Do YYYY, h:mm:ss a') + ' | '
}

function decodeURIComponentSafely(uri) {
    try {
        return decodeURIComponent(uri);
    } catch (error) {
        return uri;
    }
}

function Authenticate(token) {
    new Promise((resolve,reject) => {
        if (token == 'test') {
            console.log(logTime() + 'User succesfully authenticated. Request accepted.')
            resolve(200)
        }
        else {
            console.log(logTime() + 'Bad credentials. Request denied.')
            reject(403)
        }
    })
}

/* Initializing App */

const app = new express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(port, () => {
	console.log('Searcher started at http://localhost:' + port)
});

/* Request handlers */

app.get('/',(req,res) => {
    res.send('It works!')
});

app.get('/search/:keyword',(req,res) => {

    db.searchFor(req.params.keyword).then((results) => res.send(results))

});

app.post('/cache',(req,res) => {

    // data = [{"layerName":"Lotes","layer":"ufv:CAD_Lote","queryFields":{"inscricao_lote":{"fieldAlias":"Inscrição do Lote","fieldType":"string"}}},{"layerName":"Edificações","layer":"ufv:CAD_Edificacao","queryFields":{"inscricao":{"fieldAlias":"Inscrição Cadastral","fieldType":"string"}}},{"layerName":"Seções de Logradouro","layer":"ufv:CAD_Secao_Logradouro","queryFields":{"tipo":{"fieldAlias":"Tipo","fieldType":"string"},"nome_logradouro":{"fieldAlias":"Nome","fieldType":"string"},"codigo":{"fieldAlias":"Código","fieldType":"int"},"secao_e":{"fieldAlias":"Seção Esquerda","fieldType":"int"},"secao_d":{"fieldAlias":"Seção Direita","fieldType":"int"}}}]

    // do WebGENTE

    // body = {
    //     "tables": data.map(e => e.layer),
    //     "columns": data.map(e => e.queryFields).map(e => Object.keys(e)),
    //     "host": 'https://maps.genteufv.com.br/geoserver/ufv/wms?',
    //     "headers": 'Basic d2ViZ2VudGU6d2ViZ2VudGU=',
    //     "cleanCache": true
    // }

    /* Passing this JSON through a POST request on /cache gets the job done 
    
            {
        "tables": [
            "ufv:CAD_Lote",
            "ufv:CAD_Edificacao",
            "ufv:CAD_Geocodificacao",
            "ufv:CAD_Secao_Logradouro"
        ],
        "columns": [
            [
            "inscricao_lote"
            ],
            [
            "inscricao"
            ],
            [
            "inscricao",
            "inscricao_anterior",
            "proprietario_",
            "cpf"
            ],
            [
            "tipo",
            "nome_logradouro",
            "codigo",
            "secao_e",
            "secao_d"
            ]
        ],
        "host": "https://maps.genteufv.com.br/geoserver/ufv/wms?",
        "headers": "Basic d2ViZ2VudGU6d2ViZ2VudGU=",
        "cleanCache": true
        }
    
    */

    var tables = req.body.tables;
    var columns = req.body.columns;
    var host = req.body.host;
    var cleanCache = req.body.cleanCache || false;
    /* 
        Base64 encoded user and password.

        'Basic ' + Buffer.from(user + ':' + password).toString('base64')
    */
    var headers = {'authorization': req.body.headers}; 
    
    if (cleanCache) {
        db.clearCache()
        .then(
            () => db.cacheTheseTables(tables,columns,host,headers)
            .then((results) => res.send(results))
            .catch(e => res.send(e))
        )
    }
    else {
        db.cacheTheseTables(tables,columns,host,headers)
        .then((results) => res.send(results))
        .catch(e => res.send(e))
    }
})

app.get('/history',(req,res) => {
    res.send(`Use this route to search for specific caching operations like "clearingCache", "updatingCache" or "fetchData", 
    for example: <a href="/history/fetchData">/history/fetchData</a> or you can search for every operations, for example: <a href="/history/any">/history/any</a>`)
})

app.get('/history/:operation',(req,res) => {
    db.retrieveHistory(req.params.operation)
    .then((results) => {res.send(results)})
    .catch(e => res.send(e))
})
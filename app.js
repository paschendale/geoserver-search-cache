const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const view = require('./view.js');
const db = require('./model/model.js')

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
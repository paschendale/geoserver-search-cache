const view = require('./view.js');
const db = require('./model/model.js')

/* Use this file for the require. E.g.

const searcher = const searcher = require('./your_app/geoserver-search-cache/main.js')

And them:

searcher.searchFor(keyword).then(results => console.log(results))

*/

module.exports = {
    searchFor : db.searchFor
}
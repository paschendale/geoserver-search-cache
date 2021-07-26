Geoserver Search Cache is a third-party app that enables the user to do Full Text Search queries on a cached version of WFS layers. 

To install it just do:

`npm i geoserver-search-cache`

To do a standalone run navigate to the folder node_modules/geoserver-search-cache and run:

`node app.js`

Then, on your browser, access localhost:3001. If everything went okay you should see an 'It works!' message.

To search for results on the cached layer you can access localhost:3001/search/keyword

Try out keywords like: 'Victor' and 'Marotta' and see what happens!



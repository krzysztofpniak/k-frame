const Express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const resolve = path.resolve;

const app = new Express();
const server = new http.Server(app);

app.disable('etag');
app.set('etag', false);

app.use(Express.static(path.join(__dirname, '..', '_book')));

//var favicon = require('serve-favicon');
//app.use(favicon(path.join(__dirname, 'assets/favicon.ico')));

if (process.env.PORT) {
    server.listen(process.env.PORT, (err) => {
        if (err) {
            console.error(err);
        }
        console.info('==> Open http://url:%s in a browser to view the app.', process.env.PORT);
    });
} else {
    console.error('==>     ERROR: No PORT environment variable has been specified');
}
import 'babel-polyfill';
import Express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import {resolve} from 'path';

const app = new Express();
const server = new http.Server(app);

app.disable('etag');
app.set('etag', false);

app.use(Express.static(path.join(__dirname, '..', 'static')));
app.use('/assets', Express.static(path.join(__dirname, 'assets')));

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
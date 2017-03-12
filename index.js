'use strict';

const http = require('http');
const express = require('express');
const fs = require('fs');
const configJson = fs.readFileSync('./config.json');
const config = JSON.parse(configJson);
const bodyParser= require('body-parser')
const pg = require('pg');

//module export
//const firstMod = require('./first-module');
//firstMod.doIt();

const app = express();

app.set('view engine', 'ejs');
app.use('/assets',express.static('assets'));

app.use(bodyParser.urlencoded({extended: true}))

const httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || config.webServer.port,function(err){

    if(err)
    {
        console.log(err.message);
        return;

    }

console.log(`Web Server running on port ${process.env.PORT}` );


});


app.get('/',function(req,res){

    res.render('index');

});

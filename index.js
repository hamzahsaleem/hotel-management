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


// create application/json parser 
var jsonParser = bodyParser.json()
 
// create application/x-www-form-urlencoded parser 
var urlencodedParser = bodyParser.urlencoded({ extended: false })




const httpServer = http.createServer(app);

httpServer.listen(process.env.PORT || config.webServer.port,function(err){

    if(err)
    {
        console.log(err.message);
        return;

    }

console.log(`Web Server running on port ${process.env.PORT}` );


});


app.get('/login', function (request, response) {

response.render('login');

});



app.post('/login', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      client.query('SELECT * FROM "USER" WHERE user_name = \''+ request.body.username+'\' and password = \''+request.body.password+'\'', function(err, result) {
      done();

      //console.log(result.rows[0]);

      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { //response.render('index', {menu: result.rows} );
         
        if(result.rowCount == 1)
            {
                 pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
                client.query('SELECT * FROM "MENU"', function(err, result) {
                done();

                //console.log(result.rows[0]);

                    if (err)
                    { console.error(err); response.send("Error " + err); }
                    else
                    { response.render('edit_menu', {menu: result.rows} ); }
                    });
                });

            } else {

                    return response.redirect("/login");

            }




        }
    });
  });

});




app.get('/', function (request, response) {
//   pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
//       client.query('SELECT * FROM "MENU"', function(err, result) {
//       done();

//       //console.log(result.rows[0]);

//       if (err)
//        { console.error(err); response.send("Error " + err); }
//       else
//        { response.render('index', {menu: result.rows} ); }
//     });
//   });

response.render('test');

});



//add new dish

app.post('/add_item', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      if(!request.body.dish || !request.body.price || !request.body.type)
      {
        response.send("Error in parameters!" );

      } 
      else {
            
            client.query('INSERT INTO "MENU" (dish,price,type) VALUES(\''+request.body.dish+'\','+request.body.price+',\''+request.body.type+'\')' , function(err, result) {
            done();

         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
                pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        
                    client.query('SELECT * FROM "MENU"', function(err, result) {
                    done();

                    //console.log(result.rows[0]);

                        if (err)
                        { console.error(err); response.send("Error " + err); }
                        else
                        { response.render('edit_menu', {menu: result.rows} ); }
                        });
                    });
        
       }
    });
   }
  })

});




//update dish price

app.post('/update_price', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      if(!request.body.dish || !request.body.price )
      {
        response.send("Error in parameters!" + request.body.dish+ request.body.price );

      } 
      else {
            
            client.query('UPDATE "MENU" SET price ='+request.body.price+' WHERE dish =\''+request.body.dish+'\'' , function(err, result) {
            done();

         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
                pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        
                    client.query('SELECT * FROM "MENU"', function(err, result) {
                    done();

                    //console.log(result.rows[0]);

                        if (err)
                        { console.error(err); response.send("Error " + err); }
                        else
                        { response.render('edit_menu', {menu: result.rows} ); }
                        });
                    });
        
       }
    });
   }
  })

});



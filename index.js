'use strict';

const http = require('http');
const express = require('express');
const fs = require('fs');
const configJson = fs.readFileSync('./config.json');
const config = JSON.parse(configJson);
const bodyParser= require('body-parser')
const pg = require('pg');
const session = require('client-sessions');

//module export
//const firstMod = require('./first-module');
//firstMod.doIt();

const app = express();

app.set('view engine', 'ejs');
app.use('/assets',express.static('assets'));

app.use(session({
  cookieName: 'session',
  secret: 'eg[isfd-8yF9-7w2315df{}+Ijsli;;to8',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
  httpOnly: true,
  secure: true,
  ephemeral: true
}));



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
      
      if (err)
       { 
           console.error(err); 
           response.send("Error " + err);
           done();
        }
      else
       { 
         
         client.query('SELECT * FROM "USER" WHERE user_name = \''+ request.body.username+'\' and password = \''+request.body.password+'\'', function(err, result) {
         done();
         
         if(result.rowCount == 1)
            {

                request.session.user = result.rows[0];
                response.render('admin_home', {username: request.session.user.user_name} ); 
               
            } else {

                return response.redirect("/login");

            }
        

        });

        
        }
    });
  });




app.get('/edit_menu', urlencodedParser ,function (request, response) {

    
    if(request.session && request.session.user)
    {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
                client.query('SELECT * FROM "MENU"', function(err, result) {
      done();

      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { 
           var i;
           var deal_list = [];
           for(i=0; i<result.rowCount; i++)
            {
                if(result.rows[i].deal)
                    {
                        deal_list.push(result.rows[i].deal);

                    }        
            }

            deal_list.reverse();

            var noOfDeals = deal_list[0];

            console.log("Deals = "+noOfDeals);
            
            var dealsArray = [];
            var dealsPrices;
            var menu = result.rows;


            for(i=0; i<noOfDeals; i++)
            {
                dealsArray.push([]);

            }


            for(i=0; i<result.rowCount; i++)
            {
                if(result.rows[i].deal)
                    {
                        dealsArray[result.rows[i].deal - 1].push(result.rows[i]);

                    }      
            }

           client.query('SELECT * FROM Deal', function(err, result) {
           done();

           if (err)
            { console.error(err); response.send("Error " + err); }
            else
            {
                dealsPrices = result;
                response.render('edit_menu', {menu: menu, username: request.session.user.user_name, noOfDeals:noOfDeals, dealsArray:dealsArray, dealsPrices:result.rows} );


            }

           });
           
        
        
        
     }
    });

                });




    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }



  
  });







app.get('/', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      client.query('SELECT * FROM "MENU"', function(err, result) {
      done();

      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { 
           var i;
           var deal_list = [];
           for(i=0; i<result.rowCount; i++)
            {
                if(result.rows[i].deal)
                    {
                        deal_list.push(result.rows[i].deal);

                    }        
            }

            deal_list.reverse();

            var noOfDeals = deal_list[0];

            console.log("Deals = "+noOfDeals);
            
            var dealsArray = [];
            var dealsPrices;
            var menu = result.rows;


            for(i=0; i<noOfDeals; i++)
            {
                dealsArray.push([]);

            }


            for(i=0; i<result.rowCount; i++)
            {
                if(result.rows[i].deal)
                    {
                        dealsArray[result.rows[i].deal - 1].push(result.rows[i]);

                    }      
            }

           client.query('SELECT * FROM Deal', function(err, result) {
           done();

           if (err)
            { console.error(err); response.send("Error " + err); }
            else
            {
                dealsPrices = result;
                response.render('index', {menu: menu, noOfDeals:noOfDeals, dealsArray:dealsArray, dealsPrices:result.rows} );


            }

           });
           
        
        
        
     }
    });
  });

//response.render('test');

});
















app.get('/logout', function (request, response) {
    request.session.reset()
    response.render('login');

});




//add new dish

app.post('/add_item', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


     if(request.session && request.session.user)
    {
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
                
                return response.redirect("/edit_menu");
       }
    });
   }
  });


    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }


});


app.post('/update_price_deal', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


     if(request.session && request.session.user)
    {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {
      
      if(!request.body.deal || !request.body.price )
      {
        response.send("Error in parameters!" );

      } 
      else {
            
            client.query('UPDATE Deal SET price ='+request.body.price+' WHERE id ='+request.body.deal , function(err, result) {
            done();

         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
                
                return response.redirect("/edit_menu");
       }
    });
   }
  });


    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }


});



// add a deal
app.post('/add_deal', urlencodedParser ,function (request, response) {

console.log("inside");
if (!request.body) return response.sendStatus(400)

    console.log("inside");
     var dishes = [];

     if(request.session && request.session.user)
    {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {

        
        if(request.body.dish1 && request.body.dish1 != 'none')
        {
            dishes.push(request.body.dish1);
        }
        
        if(request.body.dish2 && request.body.dish2 != 'none')
        {
            dishes.push(request.body.dish2);
        }

        if(request.body.dish3 && request.body.dish3 != 'none')
        {
            dishes.push(request.body.dish3);
        }

        if(request.body.dish4 && request.body.dish4 != 'none')
        {
            dishes.push(request.body.dish4);
        }

        if(request.body.dish5 && request.body.dish5 != 'none')
        {
            dishes.push(request.body.dish5);
        }



      if(!request.body.price || dishes.length<2)
      {
        response.send("Error in parameters!" );

      } 
      else {

            client.query('Insert into Deal(price) Values('+request.body.price+') RETURNING id' , function(err, result) {
            done();

         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
            
            console.log("result = "+ result.rows[0].id);
            console.log("result = "+ result.rowCount);

            var id = result.rows[0].id;
            console.log("id = "+ id);


            var query = 'UPDATE "MENU" SET deal ='+id+' where ';

            var j;

            query = query + 'dish = \''+dishes[0]+'\'';

            for(j=1;j<dishes.length;j++)
            {
                query = query + ' or dish = \''+dishes[j]+'\'';
            }            
            console.log(query);
                
            client.query(query , function(err, result) {
            done();
            
         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
                return response.redirect("/edit_menu");
            }
    
    
    });

                
            }
    });



   }
  });


    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }


});



//delete a deal



app.post('/delete_deal', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)


     if(request.session && request.session.user)
    {
        pg.connect(process.env.DATABASE_URL, function(err, client, done) {

      if(!request.body.deal)
      {
        response.send("Error in parameters!" );

      } 
      else {

            client.query('Delete from Deal where id = '+request.body.deal , function(err, result) {
            done();

         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
            
            var query = 'UPDATE "MENU" SET deal = NULL where deal = '+request.body.deal;
     
            client.query(query , function(err, result) {
            done();
            
         if (err)
            { console.error(err); response.send("Error " + err); }
        else
            { 
                return response.redirect("/edit_menu");
            }
    
    
    });

                
            }
    });



   }
  });


    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }


});





//update dish price

app.post('/update_price', urlencodedParser ,function (request, response) {

if (!request.body) return response.sendStatus(400)

if(request.session && request.session.user)
    {
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
                return response.redirect("/edit_menu");
       }
    });
   }
  });

    }
    else
    {
        request.session.reset();
        return response.redirect("/login");


    }



  
});



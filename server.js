'use strict';

var fs = require('fs');
var express = require('express');
var app = express();

if (!process.env.DISABLE_XORIGIN) {
  app.use(function(req, res, next) {
    var allowedOrigins = ['https://narrow-plane.gomix.me', 'https://www.freecodecamp.com'];
    var origin = req.headers.origin || '*';
    if(!process.env.XORIG_RESTRICT || allowedOrigins.indexOf(origin) > -1){
         console.log(origin);
         res.setHeader('Access-Control-Allow-Origin', origin);
         res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    }
    next();
  });
}

app.use('/public', express.static(process.cwd() + '/public'));

app.route('/_api/package.json')
  .get(function(req, res, next) {
    console.log('requested');
    fs.readFile(__dirname + '/package.json', function(err, data) {
      if(err) return next(err);
      res.type('txt').send(data.toString());
    });
  });
  
app.route('/')
    .get(function(req, res) {
		  res.sendFile(process.cwd() + '/views/index.html');
    })

/*******************************************
*****Request Header Parser Microservice*****
*******************************************/
app.get("/_api/who_am_i/", function (request, response) {
  var ip = request.headers['x-forwarded-for'].substr(0, request.headers['x-forwarded-for'].indexOf(','));
  var lang = request.headers['accept-language'].substr(0, request.headers['accept-language'].indexOf(','));
  var soft = request.headers['user-agent'].substring(request.headers['user-agent'].indexOf('(') + 1, request.headers['user-agent'].indexOf(')'));
  
  var json = {  
    ipaddress: ip,  
    language: lang,
    os: soft
  };
  response.setHeader( 'Content-Type', 'application/json' );
  response.status(200);
  response.send(JSON.stringify(json, null, '  '));
});
/*******************************************
********************************************
*******************************************/

// Respond not found to all the wrong routes
app.use(function(req, res, next){
  res.status(404);
  res.type('txt').send('Not found');
});

// Error Middleware
app.use(function(err, req, res, next) {
  if(err) {
    res.status(err.status || 500)
      .type('txt')
      .send(err.message || 'SERVER ERROR');
  }  
})

app.listen(process.env.PORT, function () {
  console.log('Node.js listening ...');
});


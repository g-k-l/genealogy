var express = require('express');
var app = express();
var http = require('http').Server(app);
var path = require('path')
var root = __dirname;

app.use(express.static(root));

http.listen(7000, function(){
  console.log('Listening at Port 7000');
});

app.route('/').get(function(req,res){
  res.sendFile(root+'/test.html')
});

// app.route('/actual').get(function(req,res){
//   res.sendFile('index.html')
// });

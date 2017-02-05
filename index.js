var config = require('./config');
var express = require('express');
var path = require('path');
var fs = require('fs');
var randomstring = require('randomstring');
var Clarifai = require('clarifai');

var app = express();

var clarifapp = new Clarifai.App(
  'Ee3tsKiM81juIGCz9nVVjjpmfNjARfMTVk0hQVN0',
  '0D9PSEo4vaZEDS1nsThlTrtiwbtHLuF1_wChyCpp'
);

app.get('/', function(req, res) {  
  console.log("test");
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.get('/image/:fileName', function (req, res) {
  res.sendFile(__dirname+'/images/' + req.params.fileName);
})

app.post('/pic', function(req,res){
    var decodedImage = new Buffer(req.query.pic, 'base64');
    var fileName = randomstring.generate();
    fs.writeFile('./images/' + fileName + '.jpg', decodedImage, function(err) {if(err) console.log(err)});
    clarifapp.models.predict(Clarifai.GENERAL_MODEL, 'https://los-altos-hacks-nihaleg.c9users.io/image/' + fileName).then(
    function(response) {
      console.log(response.rawData.outputs[0].dat);
    },
    function(err) {
      console.error(err);
    }
  );
});

app.listen(process.env.PORT, function(err) {
  if(err) {
    return console.error(err);
  }
  console.log('app listening on ' + config.PORT);
})
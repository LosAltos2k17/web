var config = require('./config');
var express = require('express');
var path = require('path');
var fs = require('fs');
var randomstring = require('randomstring');
var Clarifai = require('clarifai');
var firebase = require('firebase');

var NutritionixClient = require('nutritionix');

var app = express();
app.use(express.static('public'));

var clarifapp = new Clarifai.App(
  'Ee3tsKiM81juIGCz9nVVjjpmfNjARfMTVk0hQVN0',
  '0D9PSEo4vaZEDS1nsThlTrtiwbtHLuF1_wChyCpp'
);

var nutritionix = new NutritionixClient({
  appId: 'a205c9e0',
  appKey: 'aa0a60ab51a8792de0fa1321657fca80'
});

firebase.initializeApp({
  databaseURL: "https://glucagon-b50f6.firebaseio.com/",
});


app.get('/', function(req, res) {
  console.log("test");
  res.render(path.join(__dirname, 'views', 'dash.ejs'));
});

app.get('/login', function(req, res) {
  console.log("test");
  res.render(path.join(__dirname, 'views', 'login.ejs'));
});


app.get('/image/:fileName', function(req, res) {
  //res.sendFile(__dirname+'/images/' + req.params.fileName);
  res.sendFile(__dirname + '/pizza.png');
});

app.post('/pic', function(req, res) {
  var decodedImage = new Buffer(req.query.pic, 'base64');
  var fileName = randomstring.generate();
  fs.writeFile('./images/' + fileName + '.jpg', decodedImage, function(err) {
    if (err) console.log(err);
  });
  clarifapp.models.predict(Clarifai.GENERAL_MODEL, 'https://los-altos-hacks-2-nihaleg.c9users.io/image/' + fileName).then(
    function(response) {
      var food = response.rawData.outputs[0].data.concepts[0].name;
      nutritionix.search({
          q: food,
          // use these for paging
          limit: 10,
          offset: 0,
          // controls the basic nutrient returned in search
          search_nutrient: 'calories',
        }).then(function(searchResults) {
          var itemCode = searchResults.results[0].resource_id;
          nutritionix.item({
              id: itemCode
            })
            .then(function(searchResults) {
                console.log(searchResults.label.nutrients.filter(function (element) {//firebase.database().ref('/nihalstuff/').push
                  return element.name == "Sugars" || element.name == "Calories" || element.name == "Cholesterol" || element.name == "Protein"|| element.name == "Sodium";
                }));
              },
              function(err) {
                console.log(err);
              })
            .catch(function(err) {
              console.log(err);
            });
        }, function(err) {
          console.log(err);
        })
        .catch(function(err) {
          console.log(err);
        });



    },
    function(err) {
      console.error(err);
    }
  );
});

app.listen(process.env.PORT, function(err) {
  if (err) {
    return console.error(err);
  }
  console.log('app listening on ' + config.PORT);
})

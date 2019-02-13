var express = require('express');
var router = express.Router();

//var fs = require('fs');

var Client = require('node-rest-client').Client;
var client = new Client();


//https://www.npmjs.com/package/node-html-parser
var HTMLParser = require('node-html-parser');
var request = require('request');


client.registerMethod("search", "http://localhost:3001/posts?q=${codeValue}", "GET");

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('message',{title:"Home", message:"Hello!!"});
});

router.get('/last', function(req, res, next) {
    res.setHeader('Content-Type','application/json');
    res.send(JSON.stringify({message:"ok"}));
});

router.get('/search/:query/:min_price/:max_price'/*+'&min_price=:min_price&max_price=:max_price'*/,function(req,res,next){

    var url = "http://www.revolico.com"
    path = "/vivienda/compra-venta/search.html?q=";
    path += req.params.query;
    path += "&min_price=";
    path += req.params.min_price;
    path += "&max_price=";
    path += req.params.max_price;
    path += "&order=date";

    console.log(url);
    
    res.setHeader('Content-Type','application/json');

    request({ uri: url+path }, function(error, response, body) {
        if(!error){ 
            var root = HTMLParser.parse(body);
            console.log(root.firstChild.firstChild.text);
            return res.send(JSON.stringify(root.firstChild.firstChild.text));
        }else{
            console.log(error.message);
            return res.send(JSON.stringify(error));
        }
    });
});

module.exports = router;
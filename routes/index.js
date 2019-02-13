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

    var url = "https://www.revolico.com"
    path = "/vivienda/search.html?q=";
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
            //console.log(root.structure);

            var listDark = root.querySelectorAll('td.dark');
            var listLight = root.querySelectorAll('td.light');
            //list+=root.querySelectorAll('td.light');
            
            var finalData = [];

            for (let index = 1; index < listDark.length; index++) {
                const element = listDark[index];
                //console.log(element.structure)
                try {
                    var data = {
                        link : url + element.querySelectorAll('a')[0].attributes.href,
                        date : element.querySelectorAll('a')[0].attributes.title,
                        title : title = element.querySelectorAll('a')[0].text.replace('\n','').replace('\n','').trim(),
                        text : element.querySelectorAll('span.textGray')[0].text.replace('\n','')
                    };
                    finalData.push(data);    
                } catch (error) {
                    continue;                    
                }
            }

            for (let index = 0; index < listLight.length; index++) {
                const element = listLight[index];
                //console.log(element.structure)
                try {
                    var data = {
                        link : url + element.querySelectorAll('a')[0].attributes.href,
                        date : element.querySelectorAll('a')[0].attributes.title,
                        title : title = element.querySelectorAll('a')[0].text.replace('\n','').replace('\n','').trim(),
                        text : element.querySelectorAll('span.textGray')[0].text.replace('\n','')
                    };
                    finalData.push(data);    
                } catch (error) {
                    console.log(error.message);
                    continue;                    
                }
            }

            //return res.send(JSON.stringify(finalData));
            return res.send(finalData);
        }else{
            console.log(error.message);
            return res.send(JSON.stringify(error));
        }
    });
});

module.exports = router;
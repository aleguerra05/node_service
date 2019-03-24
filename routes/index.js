var express = require('express');
var router = express.Router();

//var fs = require('fs');

var Client = require('node-rest-client').Client;
var client = new Client();

//https://www.npmjs.com/package/node-html-parser
var HTMLParser = require('node-html-parser');
var request = require('request');


client.registerMethod("search", "http://localhost:3001/posts?q=${codeValue}", "GET");

///---------------botcode
const TelegramBot = require('node-telegram-bot-api');
const token = '813296213:AAFXM1cjeNQc3GHcMA7XmdujEOKlTEa_Xk4';
const bot = new TelegramBot(token, {polling: true});

//bot.on('message', (msg) => {
//    bot.sendMessage(msg.chat.id, 'You say: ' + msg.text);
//});

let texto;

bot.onText(/\/buscar (.+)/, (msg, match) => {
    texto = match[1];
    bot.sendMessage(msg.chat.id,'OK, precio máximo?', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '5 mil',
            callback_data: texto+',0,5000'
          },{
            text: '10 mil',
            callback_data: texto+',5000,10000'
          }
          ,{
            text: '15 mil',
            callback_data: texto+',10000,15000'
          },{
            text: '20 mil',
            callback_data: texto+',15000,20000'
          }
          ,{
            text: '30 mil',
            callback_data: texto+',20000,30000'
          }
        ]]
      }
    });
  });

bot.on("callback_query", (callbackQuery) => {
    const message = callbackQuery.message;
    
    var q = callbackQuery.data.split(',');

    console.log(q);
        
    var url = "https://www.revolico.com"
    path = "/vivienda/search.html?q=";
    path += q[0];
    path += "&min_price=";
    path += q[1];
    path += "&max_price=";
    path += q[2];
    path += "&order=date";

    console.log(url+path);
    
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
                        text : element.querySelectorAll('span.textGray')[0].text.replace('\n',''),
                        photos : element.querySelectorAll('span.formExtraDescB')[0].text.replace('\n','')
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
                        text : element.querySelectorAll('span.textGray')[0].text.replace('\n',''),
                        photos : !!element.querySelectorAll('span.formExtraDescB')[0]?element.querySelectorAll('span.formExtraDescB')[0].text.replace('\n',''):'sin fotos'
                    };
                    finalData.push(data);    
                } catch (error) {
                    console.log(error.message);
                    continue;                    
                }
            }

            //return res.send(JSON.stringify(finalData));
            console.log(message);
            
            var response = "";

            finalData.forEach(element => {
                response+=element.title+'\n'
                response+=element.text+'\n'
                response+=element.photos+'\n'
                response+=element.link+'\n\n'
            });

            response = response.substring(0, 4090);

            bot.sendMessage(message.chat.id, response);
        }else{
            console.log(message);
            console.log(error.message);
            bot.sendMessage(message.chat.id, error.message);
        }
    });

    
});

///---------------botcode




/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('message',{title:"Home", message:"Hello!!"});
});

router.get('/last', function(req, res, next) {
    res.setHeader('Content-Type','application/json');
    res.send(JSON.stringify({message:"ok"}));
});

router.get('/search/:query/:min_price/:max_price',function(req,res,next){

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
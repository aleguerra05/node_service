var express = require('express');
var router = express.Router();
var utils = require('../utils/utils')

//var fs = require('fs');

var Client = require('node-rest-client').Client;
var client = new Client();

var request = require('request');


client.registerMethod("search", "http://localhost:3001/posts?q=${codeValue}", "GET");


//const TelegramBot = require('node-telegram-bot-api');
const token = '813296213:AAHMSH-wVo9od3FsU74sO0I5qnK93BF61SM';
//const bot = new TelegramBot(token, {polling: true});

const Tgfancy = require("tgfancy");
const bot = new Tgfancy(token, {
    // all options to 'tgfancy' MUST be placed under the
    // 'tgfancy' key, as shown below
    polling: true,
    tgfancy: {
        orderedSending : true,  // 'true' to enable!
    },
});

//bot.on('message', (msg) => {
//    bot.sendMessage(msg.chat.id, 'You say: ' + msg.text);
//});

let texto;

bot.on('message', (msg) => {
    texto = msg.text;
    bot.sendMessage(msg.chat.id,'OK, precio máximo?', {
      reply_markup: {
        inline_keyboard: [[
          {
            text: '0-5 mil',
            callback_data: texto+',0,5000,0,10'
          },{
            text: '5-10 mil',
            callback_data: texto+',5000,10000,0,10'
          },{
            text: '10-15 mil',
            callback_data: texto+',10000,15000,0,10'
          },{
            text: '15-20 mil',
            callback_data: texto+',15000,20000,0,10'
          },{
            text: '20-30 mil',
            callback_data: texto+',20000,30000,0,10'
          },{
            text: '30-50 mil',
            callback_data: texto+',30000,50000,0,10'
          }
        ]]
      }
    });
  });

bot.on("callback_query", (callbackQuery) => {
    const message = callbackQuery.message;

    var q = callbackQuery.data.split(',');
        
    var url = "https://www.revolico.com"
    path = "/vivienda/search.html?q=";
    path += q[0];
    path += "&min_price=";
    path += q[1];
    path += "&max_price=";
    path += q[2];
    path += "&order=date";
    console.log(callbackQuery.from.username+": "+url+path);
    
    request({ uri: url+path }, async function(error, response, body) {
        if(!error){ 
            var finalData = await utils.parseResponse(body,url);

            bot.sendMessage(message.chat.id, "Encontrados: "+finalData.length+" articulos.");    

            var count = q[3];
            if (finalData.length<q[4])
                q[4]=finalData.length

            for (let index = q[3]; index < q[4]; index++) {
                const element = finalData[index];
                
                var response = "";
                response+=element.title+'\n'
                response+=element.text+'\n'
                response+=element.photos+'\n'
                response+=element.date+'\n'
                response+=element.link+'\n\n'
                try{
                    if(index!=q[4]-1){
                        bot.sendMessage(message.chat.id, response);
                        element.photoLinks.forEach(element => {
                            bot.sendMessage(message.chat.id, element);
                        });
                        }
                    else{
                        bot.sendMessage(message.chat.id, response)
                        element.photoLinks.forEach(element => {
                            bot.sendMessage(message.chat.id, element);
                        });
                            
                        var top =  parseInt(q[4]) +10;
                        if (top>finalData.length) 
                            top = finalData.length;
                        if(q[4]<finalData.length)
                            bot.sendMessage(message.chat.id,'Mostrando articulos del '+q[3]+'-'+q[4], {
                                reply_markup: {
                                inline_keyboard: [[
                                    {
                                    text: 'Siguiente página: '+q[4]+'-'+top,
                                    callback_data: q[0]+','+q[1]+','+q[2]+','+q[4]+','+top
                                    }
                                ]]
                                }
                            });
                    }
                } catch(error){
                    console.log(error.message)
                }
            }
            
        }else{
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
            var finalData = utils.parseResponse(body,url);
            return res.send(finalData);
        }else{
            console.log(error.message);
            return res.send(JSON.stringify(error));
        }
    });
});

module.exports = router;
var HTMLParser = require('node-html-parser');
var request = require('request');

module.exports = {
    
    downloadPage: function (url) {
        return new Promise((resolve, reject) => {
            request(url, (error, response, body) => {
                if (error) reject(error);
                if (response.statusCode != 200) {
                    reject('Invalid status code <' + response.statusCode + '>');
                }
                resolve(body);
            });
        });
    },

    getPhotos: async function(link){

        const body = await this.downloadPage(link);
        const revo = 'https://www.revolico.com';
        var root = HTMLParser.parse(body);

        photoLinks = [];
        var images = root.querySelectorAll('img');

        for (let index = 1; index < images.length; index++) {
            photoLinks.push(revo+images[index].attributes['data-cfsrc']);
        }
           

        return photoLinks;

        //return [
        //    'https://www.revolico.com/templates/adsterix_backend_template/images/home_logo.png',
        //    'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_92x30dp.png'
        //];
    },

    parseItem: async function(element,url){
       
        var data = {
            link : url + element.querySelectorAll('a')[0].attributes.href,
            date : element.querySelectorAll('a')[0].attributes.title,
            title : title = element.querySelectorAll('a')[0].text.replace('\n','').replace('\n','').trim(),
            text : element.querySelectorAll('span.textGray')[0].text.replace('\n',''),
            photos : !!element.querySelectorAll('span.formExtraDescB')[0]?element.querySelectorAll('span.formExtraDescB')[0].text.replace('\n',''):'sin fotos',
            photoLinks:[]
        };

        if(data.photos!='sin fotos')
            data.photoLinks = await this.getPhotos(data.link);

        return data;    
    },
    
    removeDuplicates: function (list) {
        var obj = {};
    
        for (var i = 0, len=list.length;i<len; i++) {
            obj[list[i]['title']]=list[i];
        }
        list = new Array();
        for(var key in obj)
            list.push(obj[key]);
    
        return list;
    },

    

    parseResponse: async function(body,url){
        var root = HTMLParser.parse(body);
        //console.log(root.structure);

        var listDark = root.querySelectorAll('td.dark');
        var listLight = root.querySelectorAll('td.light');
        //list+=root.querySelectorAll('td.light');
         
        var finalData = [];

        for (let index = 1; index < listDark.length; index++) {
            const element = listDark[index];
            
            try {
                finalData.push(await this.parseItem(element,url))
            } catch (error) {
                console.log(error.message);
                continue;                    
            }
        }

        for (let index = 0; index < listLight.length; index++) {
            const element = listLight[index];
            //console.log(element.structure)
            try {
                finalData.push( await this.parseItem(element,url))
            } catch (error) {
                console.log(error.message);
                continue;                    
            }
        }

        finalData = this.removeDuplicates(finalData);

        return finalData;
    }
  };
var utils = require('../utils/utils')

var assert = require('assert');
describe('Basic Mocha String Test', function () {
 it('should return number of charachters in a string', function () {
        assert.equal("Hello".length, 5);
    });
});

describe('Testing remove duplicates on a arrayListo of objects', function(){
    it('should return a list without duplicates', function () {

        list = new Array();
        list.push({'title':'titile1','age':1});
        list.push({'title':'titile1','age':2});
        list.push({'title':'titile2','age':3});

        listWithoutDuplicates = new Array();
        listWithoutDuplicates.push({'title':'titile1','age':2});
        listWithoutDuplicates.push({'title':'titile2','age':3});
        
        var result = utils.removeDuplicates(list);

        assert.equal(JSON.stringify(result), JSON.stringify(listWithoutDuplicates));
    });
});